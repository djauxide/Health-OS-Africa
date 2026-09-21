import { Router } from "express";
import { z } from "zod";
import { query, tx } from "../database.js";
import { AppError, ah } from "../errors.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { audit } from "../services/audit.js";
import { suggestPriority } from "../services/triage.js";
import type { AuthenticatedRequest } from "../types.js";

export const visitsRouter = Router();
visitsRouter.use(requireAuth);

const checkInSchema = z.object({ patientId: z.string().uuid(), complaint: z.string().max(500).optional().nullable() });
const boundedInt = (min: number, max: number) => z.number().int().min(min).max(max).optional();
const triageSchema = z.object({
  systolicBp: boundedInt(40, 300),
  diastolicBp: boundedInt(20, 200),
  pulse: boundedInt(20, 250),
  respiratoryRate: boundedInt(4, 80),
  temperatureC: z.number().min(30).max(45).optional(),
  spo2: boundedInt(40, 100),
  priority: z.enum(["ROUTINE", "URGENT", "CRITICAL"]).optional(),
  notes: z.string().max(1000).optional()
});
const consultSchema = z.object({
  subjective: z.string().max(4000).default(""),
  objective: z.string().max(4000).default(""),
  assessment: z.string().min(1).max(2000),
  plan: z.string().max(4000).default(""),
  prescriptions: z.array(z.object({ medicationId: z.string().uuid(), quantity: z.number().int().min(1).max(1000), overrideAllergy: z.boolean().default(false) })).max(20).default([])
});

function visitId(req: AuthenticatedRequest) {
  const id = String(req.params.id);
  if (!z.string().uuid().safeParse(id).success) throw new AppError(404, "VISIT_NOT_FOUND", "Visit not found");
  return id;
}

async function lockVisit(db: any, id: string, user: NonNullable<AuthenticatedRequest["user"]>, expectedStage: string) {
  const result = await db.query("SELECT * FROM visits WHERE id=$1 AND tenant_id=$2 AND clinic_id=$3 FOR UPDATE", [id, user.tenantId, user.clinicId]);
  const visit = result.rows[0];
  if (!visit) throw new AppError(404, "VISIT_NOT_FOUND", "Visit not found");
  if (visit.stage !== expectedStage) throw new AppError(409, "WRONG_STAGE", `Visit is at ${visit.stage}, expected ${expectedStage}`);
  return visit;
}

visitsRouter.get("/", ah(async (req: AuthenticatedRequest, res) => {
  const stage = typeof req.query.stage === "string" ? req.query.stage.toUpperCase() : null;
  const result = await query(
    `SELECT v.id, v.stage, v.priority, v.complaint, v.created_at, p.id AS patient_id, p.patient_number,
            p.first_name, p.last_name, p.allergies
     FROM visits v JOIN patients p ON p.id=v.patient_id
     WHERE v.tenant_id=$1 AND v.clinic_id=$2
       AND (($3::text IS NULL AND v.stage <> 'DONE') OR v.stage=$3)
     ORDER BY CASE v.priority WHEN 'CRITICAL' THEN 0 WHEN 'URGENT' THEN 1 ELSE 2 END, v.created_at`,
    [req.user!.tenantId, req.user!.clinicId, stage]
  );
  res.json({ data: result.rows });
}));

visitsRouter.get("/:id", ah(async (req: AuthenticatedRequest, res) => {
  const id = visitId(req);
  const user = req.user!;
  const visit = (await query(
    `SELECT v.id,v.stage,v.priority,v.complaint,p.id AS patient_id,p.first_name,p.last_name,p.patient_number,p.allergies,p.chronic_conditions
     FROM visits v JOIN patients p ON p.id=v.patient_id WHERE v.id=$1 AND v.tenant_id=$2 AND v.clinic_id=$3`,
    [id, user.tenantId, user.clinicId]
  )).rows[0];
  if (!visit) throw new AppError(404, "VISIT_NOT_FOUND", "Visit not found");
  const [prescriptions, vitals] = await Promise.all([
    query(`SELECT pr.id,pr.quantity,pr.status,m.generic_name,m.strength,m.quantity_on_hand FROM prescriptions pr JOIN medications m ON m.id=pr.medication_id WHERE pr.visit_id=$1 ORDER BY m.generic_name`, [id]),
    query(`SELECT systolic_bp,diastolic_bp,pulse,respiratory_rate,temperature_c,spo2,priority,notes FROM triage_records WHERE visit_id=$1 ORDER BY created_at DESC LIMIT 1`, [id])
  ]);
  res.json({ data: { ...visit, prescriptions: prescriptions.rows, vitals: vitals.rows[0] ?? null } });
}));

visitsRouter.post("/check-in", requireRole(["RECEPTIONIST", "NURSE", "CLINIC_ADMIN"]), ah(async (req: AuthenticatedRequest, res) => {
  const body = checkInSchema.parse(req.body);
  const user = req.user!;
  const patient = await query("SELECT id FROM patients WHERE id=$1 AND tenant_id=$2 AND clinic_id=$3", [body.patientId, user.tenantId, user.clinicId]);
  if (!patient.rows[0]) throw new AppError(404, "PATIENT_NOT_FOUND", "Patient not found");
  try {
    const result = await query<{ id: string }>("INSERT INTO visits (tenant_id,clinic_id,patient_id,complaint) VALUES ($1,$2,$3,$4) RETURNING id", [user.tenantId, user.clinicId, body.patientId, body.complaint ?? null]);
    await audit(user, "PATIENT_CHECKED_IN", "Visit", result.rows[0].id);
    res.status(201).json({ data: { id: result.rows[0].id, stage: "TRIAGE" } });
  } catch (error: any) {
    if (error?.code === "23505") throw new AppError(409, "ALREADY_CHECKED_IN", "Patient already has an active visit");
    throw error;
  }
}));

visitsRouter.post("/:id/triage", requireRole(["NURSE", "DOCTOR"]), ah(async (req: AuthenticatedRequest, res) => {
  const body = triageSchema.parse(req.body);
  const user = req.user!;
  const result = await tx(async (db) => {
    const visit = await lockVisit(db, visitId(req), user, "TRIAGE");
    const suggested = suggestPriority(body);
    const priority = body.priority ?? suggested;
    await db.query(`INSERT INTO triage_records (tenant_id,clinic_id,patient_id,visit_id,systolic_bp,diastolic_bp,pulse,respiratory_rate,temperature_c,spo2,priority,notes,triaged_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, [user.tenantId,user.clinicId,visit.patient_id,visit.id,body.systolicBp ?? null,body.diastolicBp ?? null,body.pulse ?? null,body.respiratoryRate ?? null,body.temperatureC ?? null,body.spo2 ?? null,priority,body.notes ?? null,user.id]);
    await db.query("UPDATE visits SET stage='CONSULT',priority=$2,updated_at=now() WHERE id=$1", [visit.id, priority]);
    await audit(user, "TRIAGE_RECORDED", "Visit", visit.id, { priority, suggested }, db);
    return { stage: "CONSULT", priority, suggested };
  });
  res.json({ data: result });
}));

visitsRouter.post("/:id/consult", requireRole(["DOCTOR"]), ah(async (req: AuthenticatedRequest, res) => {
  const body = consultSchema.parse(req.body);
  const user = req.user!;
  const result = await tx(async (db) => {
    const visit = await lockVisit(db, visitId(req), user, "CONSULT");
    const patient = (await db.query("SELECT allergies FROM patients WHERE id=$1 AND tenant_id=$2", [visit.patient_id, user.tenantId])).rows[0];
    const consultation = await db.query<{ id: string }>(`INSERT INTO consultations (tenant_id,clinic_id,patient_id,doctor_id,visit_id,subjective,objective,assessment,plan) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`, [user.tenantId,user.clinicId,visit.patient_id,user.id,visit.id,body.subjective,body.objective,body.assessment,body.plan]);
    const allergies = String(patient?.allergies ?? "").toLowerCase();
    for (const item of body.prescriptions) {
      const medication = (await db.query("SELECT id,generic_name,drug_class FROM medications WHERE id=$1 AND tenant_id=$2", [item.medicationId,user.tenantId])).rows[0];
      if (!medication) throw new AppError(404, "MEDICATION_NOT_FOUND", "Medication not found");
      const conflict = [medication.generic_name, medication.drug_class].some((name: string) => name && allergies.includes(name.toLowerCase()));
      if (conflict && !item.overrideAllergy) throw new AppError(409, "ALLERGY_CONFLICT", `${medication.generic_name} conflicts with the recorded allergy`, { medication: medication.generic_name, allergies: patient?.allergies });
      if (conflict) await audit(user, "ALLERGY_OVERRIDE", "Visit", visit.id, { medication: medication.generic_name }, db);
      await db.query("INSERT INTO prescriptions (tenant_id,clinic_id,visit_id,consultation_id,medication_id,quantity) VALUES ($1,$2,$3,$4,$5,$6)", [user.tenantId,user.clinicId,visit.id,consultation.rows[0].id,medication.id,item.quantity]);
    }
    const stage = body.prescriptions.length ? "PHARMACY" : "DONE";
    await db.query("UPDATE visits SET stage=$2,updated_at=now() WHERE id=$1", [visit.id, stage]);
    await audit(user, "CONSULTATION_CREATED", "Visit", visit.id, { diagnosis: body.assessment }, db);
    return { stage };
  });
  res.status(201).json({ data: result });
}));

visitsRouter.post("/:id/dispense", requireRole(["PHARMACIST"]), ah(async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const result = await tx(async (db) => {
    const visit = await lockVisit(db, visitId(req), user, "PHARMACY");
    const items = (await db.query("SELECT id,medication_id,quantity FROM prescriptions WHERE visit_id=$1 AND status='PENDING' ORDER BY medication_id", [visit.id])).rows;
    for (const item of items) {
      const stock = await db.query("UPDATE medications SET quantity_on_hand=quantity_on_hand-$1,updated_at=now() WHERE id=$2 AND tenant_id=$3 AND quantity_on_hand >= $1 RETURNING generic_name", [item.quantity,item.medication_id,user.tenantId]);
      if (!stock.rows[0]) throw new AppError(409, "INSUFFICIENT_STOCK", "Not enough stock to dispense this prescription");
      await db.query("INSERT INTO stock_movements (tenant_id,medication_id,delta,reason,visit_id,user_id) VALUES ($1,$2,$3,'DISPENSED',$4,$5)", [user.tenantId,item.medication_id,-item.quantity,visit.id,user.id]);
      await db.query("UPDATE prescriptions SET status='DISPENSED',dispensed_by=$2,dispensed_at=now() WHERE id=$1", [item.id,user.id]);
    }
    await db.query("UPDATE visits SET stage='DONE',updated_at=now() WHERE id=$1", [visit.id]);
    await audit(user, "MEDICATION_DISPENSED", "Visit", visit.id, { items: items.length }, db);
    return { stage: "DONE", dispensed: items.length };
  });
  res.json({ data: result });
}));
