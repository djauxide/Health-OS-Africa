"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "../../components/AppShell";
import { apiFetch } from "../../lib/api";

interface Patient {
  id: string;
  patient_number: string;
  first_name: string;
  last_name: string;
}

interface Appointment {
  id: string;
  scheduled_start: string;
  status: string;
  reason: string | null;
  patient_number: string;
  first_name: string;
  last_name: string;
}

export default function AppointmentsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ patientId: "", scheduledStart: "", reason: "" });

  async function load() {
    const [loadedPatients, loadedAppointments] = await Promise.all([
      apiFetch<Patient[]>("/api/patients"),
      apiFetch<Appointment[]>("/api/appointments")
    ]);
    setPatients(loadedPatients);
    setAppointments(loadedAppointments);
    setForm((current) => ({ ...current, patientId: current.patientId || loadedPatients[0]?.id || "" }));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await apiFetch("/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          patientId: form.patientId,
          scheduledStart: new Date(form.scheduledStart).toISOString(),
          reason: form.reason
        })
      });
      setForm({ patientId: patients[0]?.id || "", scheduledStart: "", reason: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to book appointment");
    }
  }

  return (
    <AppShell>
      <section className="grid columns">
        <div className="panel">
          <h2>Appointments</h2>
          {error ? <div className="error">{error}</div> : null}
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Patient</th>
                <th>Status</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{new Date(appointment.scheduled_start).toLocaleString()}</td>
                  <td>
                    {appointment.patient_number} - {appointment.first_name} {appointment.last_name}
                  </td>
                  <td>{appointment.status}</td>
                  <td>{appointment.reason ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h2>Book Appointment</h2>
          <form className="form" onSubmit={submit}>
            <div className="field">
              <label htmlFor="patient">Patient</label>
              <select id="patient" onChange={(event) => setForm({ ...form, patientId: event.target.value })} required value={form.patientId}>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.patient_number} - {patient.first_name} {patient.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="scheduledStart">Date and time</label>
              <input
                id="scheduledStart"
                onChange={(event) => setForm({ ...form, scheduledStart: event.target.value })}
                required
                type="datetime-local"
                value={form.scheduledStart}
              />
            </div>
            <div className="field">
              <label htmlFor="reason">Reason</label>
              <input id="reason" onChange={(event) => setForm({ ...form, reason: event.target.value })} value={form.reason} />
            </div>
            <button className="button" type="submit">Book appointment</button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}

