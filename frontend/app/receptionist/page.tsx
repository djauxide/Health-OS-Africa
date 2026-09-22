"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/AppShell";
import { apiFetch } from "../../lib/api";

type Visit = {
  id: string;
  stage: string;
  complaint: string | null;
  priority: string;
  patient_number: string;
  first_name: string;
  last_name: string;
};

const mockVisits: Visit[] = [
  { id: "v1", stage: "TRIAGE", complaint: "Fever and cough", priority: "CRITICAL", patient_number: "P-001", first_name: "Amina", last_name: "Ndlovu" },
  { id: "v2", stage: "CONSULT", complaint: "Back pain", priority: "URGENT", patient_number: "P-002", first_name: "Lwazi", last_name: "Mokoena" },
  { id: "v3", stage: "PHARMACY", complaint: "Follow-up refill", priority: "ROUTINE", patient_number: "P-003", first_name: "Nomsa", last_name: "Khumalo" }
];

export default function ReceptionistPage() {
  const [isOffline, setIsOffline] = useState(false);
  const [visits, setVisits] = useState<Visit[]>(mockVisits);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("healthos-offline-mode");
    if (stored) setIsOffline(stored === "true");

    apiFetch<Visit[]>("/api/visits")
      .then((rows) => setVisits(rows.length ? rows : mockVisits))
      .catch(() => setVisits(mockVisits));
  }, []);

  useEffect(() => {
    localStorage.setItem("healthos-offline-mode", String(isOffline));
  }, [isOffline]);

  const summary = useMemo(
    () => [
      { label: "Waiting", value: visits.filter((item) => item.stage === "TRIAGE").length },
      { label: "In consult", value: visits.filter((item) => item.stage === "CONSULT").length },
      { label: "Dispensing", value: visits.filter((item) => item.stage === "PHARMACY").length },
      { label: "Status", value: isOffline ? "Pending sync" : "Online" }
    ],
    [isOffline, visits]
  );

  return (
    <AppShell>
      <div className="role-header">
        <div>
          <p className="eyebrow">Role demo</p>
          <h2>Receptionist workflow</h2>
        </div>
        <button className="button secondary" type="button" onClick={() => setIsOffline((value) => !value)}>
          {isOffline ? "Go online" : "Offline mode"}
        </button>
      </div>

      <div className="role-summary">
        {summary.map((item) => (
          <div key={item.label} className="status-box">
            <h4>{item.label}</h4>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="dashboard-grid dashboard-grid-primary">
        <section className="panel">
          <div className="panel-heading">
            <div><p className="eyebrow">Registration</p><h3>Register patient</h3></div>
          </div>
          <form className="role-form">
            <div className="field">
              <label htmlFor="first-name">First name</label>
              <input id="first-name" defaultValue="Buhle" />
            </div>
            <div className="field">
              <label htmlFor="last-name">Last name</label>
              <input id="last-name" defaultValue="Molefe" />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" defaultValue="+27 82 123 4567" />
            </div>
            <button className="button" type="button">Save patient</button>
            {isOffline ? <div className="notice">Queued for sync: patient registration marked pending sync.</div> : null}
          </form>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div><p className="eyebrow">Queue</p><h3>Check-in queue</h3></div>
          </div>
          <div className="queue-list">
            {visits.map((visit) => (
              <div key={visit.id} className="queue-row selected">
                <div className="chip {visit.priority}">{visit.priority}</div>
                <div>
                  <strong>{visit.patient_number} • {visit.first_name} {visit.last_name}</strong>
                  <small>{visit.complaint ?? "No complaint recorded"}</small>
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
