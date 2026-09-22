"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../../components/AppShell";
import { apiFetch } from "../../lib/api";

type ConsultationEntry = {
  id: string;
  patient_number: string;
  first_name: string;
  last_name: string;
  complaint: string | null;
  stage: string;
};

const mockDoctors: ConsultationEntry[] = [
  { id: "doc-1", patient_number: "P-007", first_name: "Mpho", last_name: "Mokotedi", complaint: "Upper respiratory symptoms", stage: "CONSULT" },
  { id: "doc-2", patient_number: "P-008", first_name: "Naledi", last_name: "Pretorius", complaint: "Hypertension review", stage: "CONSULT" }
];

export default function DoctorPage() {
  const [patients, setPatients] = useState<ConsultationEntry[]>(mockDoctors);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("healthos-offline-mode");
    if (stored) setIsOffline(stored === "true");

    apiFetch<ConsultationEntry[]>("/api/visits")
      .then((rows) => setPatients(rows.length ? rows : mockDoctors))
      .catch(() => setPatients(mockDoctors));
  }, []);

  useEffect(() => {
    localStorage.setItem("healthos-offline-mode", String(isOffline));
  }, [isOffline]);

  return (
    <AppShell>
      <div className="role-header">
        <div>
          <p className="eyebrow">Role demo</p>
          <h2>Doctor consultation</h2>
        </div>
        <button className="button secondary" type="button" onClick={() => setIsOffline((value) => !value)}>
          {isOffline ? "Switch online" : "Offline mode"}
        </button>
      </div>

      <div className="role-summary">
        <div className="status-box"><h4>Patients</h4><strong>{patients.length}</strong></div>
        <div className="status-box"><h4>Seen today</h4><strong>18</strong></div>
        <div className="status-box"><h4>Drafts</h4><strong>3</strong></div>
        <div className="status-box"><h4>Sync</h4><strong>{isOffline ? "Pending" : "Live"}</strong></div>
      </div>

      <div className="dashboard-grid dashboard-grid-primary">
        <section className="panel">
          <div className="panel-heading">
            <div><p className="eyebrow">Current patient</p><h3>SOAP note</h3></div>
          </div>
          <form className="role-form">
            <div className="field"><label>Patient</label><select defaultValue={patients[0]?.id ?? ""}><option>{patients[0] ? `${patients[0].patient_number} ${patients[0].first_name} ${patients[0].last_name}` : "No patient selected"}</option></select></div>
            <div className="field"><label>Subjective</label><textarea rows={3} defaultValue="Patient reports fever and malaise for 2 days." /></div>
            <div className="field"><label>Objective</label><textarea rows={3} defaultValue="Temp 37.8°C, respiratory rate 22, O2 97% on room air." /></div>
            <div className="field"><label>Assessment</label><textarea rows={3} defaultValue="Likely viral URI; monitor, supportive care, follow-up if no improvement." /></div>
            <div className="field"><label>Plan</label><textarea rows={3} defaultValue="Rest, hydration, review in 48 hours if symptoms worsen." /></div>
            <div className="field"><label>Prescription</label><input defaultValue="Amoxicillin 500mg" /></div>
            <button className="button" type="button">Sign draft notes</button>
            {isOffline ? <div className="notice">Clinical note stored locally and tagged pending sync until reconnect.</div> : null}
          </form>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div><p className="eyebrow">Queue</p><h3>Patients waiting for consultation</h3></div>
          </div>
          <div className="queue-list">
            {patients.map((patient) => (
              <div key={patient.id} className="queue-row selected">
                <span className="chip">{patient.stage}</span>
                <div>
                  <strong>{patient.patient_number} • {patient.first_name} {patient.last_name}</strong>
                  <small>{patient.complaint ?? "No complaint"}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {error ? <div className="notice">{error}</div> : null}
    </AppShell>
  );
}
