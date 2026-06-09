"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "../../components/AppShell";
import { apiFetch } from "../../lib/api";

interface Patient {
  id: string;
  patient_number: string;
  first_name: string;
  last_name: string;
  dob: string | null;
  gender: string;
  phone: string | null;
  email: string | null;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", gender: "UNKNOWN" });

  async function loadPatients() {
    const result = await apiFetch<Patient[]>("/api/patients");
    setPatients(result);
  }

  useEffect(() => {
    loadPatients().catch((err) => setError(err.message));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await apiFetch("/api/patients", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setForm({ firstName: "", lastName: "", phone: "", gender: "UNKNOWN" });
      await loadPatients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create patient");
    }
  }

  return (
    <AppShell>
      <section className="grid columns">
        <div className="panel">
          <h2>Patients</h2>
          {error ? <div className="error">{error}</div> : null}
          <table className="table">
            <thead>
              <tr>
                <th>Patient No.</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.patient_number}</td>
                  <td>
                    {patient.first_name} {patient.last_name}
                  </td>
                  <td>{patient.gender}</td>
                  <td>{patient.phone ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h2>Register Patient</h2>
          <form className="form" onSubmit={submit}>
            <div className="field">
              <label htmlFor="firstName">First name</label>
              <input id="firstName" onChange={(event) => setForm({ ...form, firstName: event.target.value })} required value={form.firstName} />
            </div>
            <div className="field">
              <label htmlFor="lastName">Last name</label>
              <input id="lastName" onChange={(event) => setForm({ ...form, lastName: event.target.value })} required value={form.lastName} />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" onChange={(event) => setForm({ ...form, phone: event.target.value })} value={form.phone} />
            </div>
            <div className="field">
              <label htmlFor="gender">Gender</label>
              <select id="gender" onChange={(event) => setForm({ ...form, gender: event.target.value })} value={form.gender}>
                <option value="UNKNOWN">Unknown</option>
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <button className="button" type="submit">Create patient</button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}

