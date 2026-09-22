"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/AppShell";
import { apiFetch } from "../../lib/api";

type QueueEntry = {
  id: string;
  stage: string;
  complaint: string | null;
  priority: string;
  patient_number: string;
  first_name: string;
  last_name: string;
};

const mockQueue: QueueEntry[] = [
  { id: "triage-1", stage: "TRIAGE", complaint: "Severe headache", priority: "CRITICAL", patient_number: "P-004", first_name: "Sipho", last_name: "Mokoena" },
  { id: "triage-2", stage: "TRIAGE", complaint: "High fever and chills", priority: "URGENT", patient_number: "P-005", first_name: "Lerato", last_name: "Adebayo" },
  { id: "triage-3", stage: "TRIAGE", complaint: "Routine review", priority: "ROUTINE", patient_number: "P-006", first_name: "Zanele", last_name: "Dlamini" }
];

export default function NursePage() {
  const [queue, setQueue] = useState<QueueEntry[]>(mockQueue);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("healthos-offline-mode");
    if (stored) setIsOffline(stored === "true");

    apiFetch<QueueEntry[]>("/api/visits")
      .then((rows) => setQueue(rows.length ? rows : mockQueue))
      .catch(() => setQueue(mockQueue));
  }, []);

  useEffect(() => {
    localStorage.setItem("healthos-offline-mode", String(isOffline));
  }, [isOffline]);

  const sortedQueue = useMemo(() => {
    return [...queue].sort((a, b) => {
      const order = { CRITICAL: 0, URGENT: 1, ROUTINE: 2 } as Record<string, number>;
      return (order[a.priority] ?? 99) - (order[b.priority] ?? 99);
    });
  }, [queue]);

  return (
    <AppShell>
      <div className="role-header">
        <div>
          <p className="eyebrow">Role demo</p>
          <h2>Nurse triage</h2>
        </div>
        <button className="button secondary" type="button" onClick={() => setIsOffline((value) => !value)}>
          {isOffline ? "Switch online" : "Offline mode"}
        </button>
      </div>

      <div className="role-summary">
        <div className="status-box"><h4>Critical</h4><strong>{sortedQueue.filter((item) => item.priority === "CRITICAL").length}</strong></div>
        <div className="status-box"><h4>Urgent</h4><strong>{sortedQueue.filter((item) => item.priority === "URGENT").length}</strong></div>
        <div className="status-box"><h4>Routine</h4><strong>{sortedQueue.filter((item) => item.priority === "ROUTINE").length}</strong></div>
        <div className="status-box"><h4>Sync</h4><strong>{isOffline ? "Pending" : "Live"}</strong></div>
      </div>

      <div className="dashboard-grid dashboard-grid-primary">
        <section className="panel">
          <div className="panel-heading">
            <div><p className="eyebrow">Priority queue</p><h3>Triage list</h3></div>
          </div>
          <div className="queue-list">
            {sortedQueue.map((visit) => (
              <div key={visit.id} className="queue-row selected">
                <span className={`chip ${visit.priority}`}>{visit.priority}</span>
                <div>
                  <strong>{visit.patient_number} • {visit.first_name} {visit.last_name}</strong>
                  <small>{visit.complaint ?? "No complaint"}</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div><p className="eyebrow">Assessment</p><h3>Vitals and triage</h3></div>
          </div>
          <form className="role-form">
            <div className="field"><label>BP</label><input defaultValue="120/80" /></div>
            <div className="field"><label>Pulse</label><input defaultValue="82" /></div>
            <div className="field"><label>Temp</label><input defaultValue="37.2" /></div>
            <div className="field"><label>SpO₂</label><input defaultValue="98%" /></div>
            <div className="field"><label>Priority</label><select defaultValue="URGENT"><option>ROUTINE</option><option>URGENT</option><option>CRITICAL</option></select></div>
            <div className="field"><label>Notes</label><textarea rows={4} defaultValue="Patient reports fever and dry cough for 2 days. Clinical assessment is workflow support only." /></div>
            <button className="button" type="button">Save triage</button>
            {isOffline ? <div className="notice">Triage saved locally and marked pending sync.</div> : null}
          </form>
        </section>
      </div>

      {error ? <div className="notice">{error}</div> : null}
    </AppShell>
  );
}
