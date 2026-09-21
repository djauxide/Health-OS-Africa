import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, describe, it } from "node:test";
import { app } from "../src/app.js";
import { pool } from "../src/database.js";

let base = "";
let server: ReturnType<typeof app.listen>;
const tokens: Record<string, string> = {};

async function call(method: string, path: string, role?: string, body?: unknown) {
  const response = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(role ? { Authorization: `Bearer ${tokens[role]}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  return { status: response.status, body: (await response.json()) as any };
}

before(async () => {
  server = app.listen(0);
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  for (const role of ["admin", "reception", "nurse", "doctor", "pharmacist"]) {
    const result = await call("POST", "/api/auth/login", undefined, { email: `${role}@healthos.test`, password: "HealthOS123!" });
    assert.equal(result.status, 200, `login ${role}`);
    tokens[role] = result.body.data.accessToken;
  }
});

after(async () => {
  server.close();
  await pool.end();
});

const medications = async () => (await call("GET", "/api/pharmacy/medications", "pharmacist")).body.data as any[];
const medication = async (name: string) => (await medications()).find((item) => item.generic_name === name);

async function newVisit(allergies = "", complaint = "Cough and fever") {
  const patient = await call("POST", "/api/patients", "reception", { firstName: "Test", lastName: `Patient${Date.now()}${Math.random()}`, allergies, complaint });
  assert.equal(patient.status, 201);
  const visit = await call("POST", "/api/visits/check-in", "reception", { patientId: patient.body.data.id, complaint });
  assert.equal(visit.status, 201);
  return { patientId: patient.body.data.id as string, visitId: visit.body.data.id as string };
}

describe("access control", () => {
  it("rejects unauthenticated requests", async () => assert.equal((await call("GET", "/api/patients")).status, 401));
  it("enforces role permissions", async () => {
    assert.equal((await call("POST", "/api/patients", "pharmacist", { firstName: "A", lastName: "B" })).status, 403);
    assert.equal((await call("GET", "/api/audit", "nurse")).status, 403);
    assert.equal((await call("GET", "/api/audit", "admin")).status, 200);
  });
  it("returns a client error for malformed visit ids", async () => {
    assert.equal((await call("POST", "/api/visits/not-a-uuid/triage", "nurse", {})).status, 404);
  });
});

describe("clinic journey", () => {
  it("runs check-in through dispense and records the workflow", async () => {
    const { patientId, visitId } = await newVisit("Penicillin");
    const duplicate = await call("POST", "/api/visits/check-in", "reception", { patientId });
    assert.equal(duplicate.status, 409);

    const triage = await call("POST", `/api/visits/${visitId}/triage`, "nurse", { systolicBp: 118, pulse: 104, temperatureC: 38.9, spo2: 96 });
    assert.equal(triage.body.data.priority, "URGENT");

    const amoxicillin = await medication("Amoxicillin");
    const paracetamol = await medication("Paracetamol");
    const blocked = await call("POST", `/api/visits/${visitId}/consult`, "doctor", { assessment: "Chest infection", prescriptions: [{ medicationId: amoxicillin.id, quantity: 10 }] });
    assert.equal(blocked.status, 409);
    assert.equal(blocked.body.error.code, "ALLERGY_CONFLICT");

    const before = paracetamol.quantity_on_hand;
    const consultation = await call("POST", `/api/visits/${visitId}/consult`, "doctor", { assessment: "Viral chest infection", plan: "Symptomatic care", prescriptions: [{ medicationId: paracetamol.id, quantity: 20 }] });
    assert.equal(consultation.body.data.stage, "PHARMACY");

    assert.equal((await call("POST", `/api/visits/${visitId}/dispense`, "doctor")).status, 403);
    const dispense = await call("POST", `/api/visits/${visitId}/dispense`, "pharmacist");
    assert.equal(dispense.body.data.stage, "DONE");
    assert.equal((await medication("Paracetamol")).quantity_on_hand, before - 20);
  });

  it("protects stock from an over-dispense", async () => {
    const { visitId } = await newVisit();
    await call("POST", `/api/visits/${visitId}/triage`, "nurse", { systolicBp: 120 });
    const salbutamol = await medication("Salbutamol");
    await call("POST", `/api/visits/${visitId}/consult`, "doctor", { assessment: "Asthma", prescriptions: [{ medicationId: salbutamol.id, quantity: salbutamol.quantity_on_hand + 5 }] });
    const dispense = await call("POST", `/api/visits/${visitId}/dispense`, "pharmacist");
    assert.equal(dispense.body.error.code, "INSUFFICIENT_STOCK");
  });

  it("enforces visit stage order", async () => {
    const { visitId } = await newVisit();
    assert.equal((await call("POST", `/api/visits/${visitId}/dispense`, "pharmacist")).body.error.code, "WRONG_STAGE");
    assert.equal((await call("POST", `/api/visits/${visitId}/consult`, "doctor", { assessment: "x" })).body.error.code, "WRONG_STAGE");
  });
});

describe("tenant isolation", () => {
  it("cannot access another tenant's patient", async () => {
    const tenant = (await pool.query("INSERT INTO tenants (name) VALUES ('Other tenant') RETURNING id")).rows[0].id;
    const clinic = (await pool.query("INSERT INTO clinics (tenant_id, name) VALUES ($1, 'Other clinic') RETURNING id", [tenant])).rows[0].id;
    const patient = (await pool.query("INSERT INTO patients (tenant_id, clinic_id, patient_number, first_name, last_name) VALUES ($1, $2, 'X-1', 'Other', 'Person') RETURNING id", [tenant, clinic])).rows[0].id;
    assert.equal((await call("GET", `/api/patients/${patient}`, "admin")).status, 404);
    assert.equal((await call("POST", "/api/visits/check-in", "reception", { patientId: patient })).status, 404);
  });
});
