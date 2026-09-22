"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../../components/AppShell";
import { apiFetch } from "../../lib/api";

type AuditEntry = {
  id: string;
  event_type: string;
  target_type: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
};

const mockAudit: AuditEntry[] = [
  { id: "a1", event_type: "PATIENT_CHECKED_IN", target_type: "Visit", created_at: "2026-09-22T09:05:00Z", metadata: { actor: "Receptionist" } },
  { id: "a2", event_type: "TRIAGE_RECORDED", target_type: "Visit", created_at: "2026-09-22T09:10:00Z", metadata: { priority: "URGENT" } },
  { id: "a3", event_type: "CONSULTATION_CREATED", target_type: "Visit", created_at: "2026-09-22T09:25:00Z", metadata: { diagnosis: "URI" } }
];

export default function AdminPage() {
  const [entries, setEntries] = useState<AuditEntry[]>(mockAudit);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("healthos-offline-mode");
    if (stored) setIsOffline(stored === "true");

    apiFetch<AuditEntry[]>("/api/audit?limit=50")
      .then((rows) => setEntries(rows.length ? rows : mockAudit))
      .catch(() => setEntries(mockAudit));
  }, []);

  useEffect(() => {
    localStorage.setItem("healthos-offline-mode", String(isOffline));
  }, [isOffline]);

  return (
    <AppShell>
      <div className="role-header">
        <div>
          <p className="eyebrow">Role demo</p>
          <h2>Administrator control</h2>
        </div>
        <button className="button secondary" type="button" onClick={() => setIsOffline((value) => !value)}>
          {isOffline ? "Switch online" : "Offline mode"}
        </button>
      </div>

      <div className="role-summary">
        <div className="status-box"><h4>Patients today</h4><strong>96</strong></div>
        <div className="status-box"><h4>Queue length</h4><strong>14</strong></div>
        <div className="status-box"><h4>Stock alerts</h4><strong>4</strong></div>
        <div className="status-box"><h4>Sync state</h4><strong>{isOffline ? "Pending" : "Live"}</strong></div>
      </div>

      <div className="dashboard-grid dashboard-grid-primary">
        <section className="panel">
          <div className="panel-heading"><div><p className="eyebrow">Governance</p><h3>Audit log</h3></div></div>
          <div className="queue-list">
            {entries.map((entry) => (
              <div key={entry.id} className="workboard-item">
                <div>
                  <strong>{entry.event_type}</strong>
                  <small>{entry.target_type}</small>
                </div>
                <div>
                  <strong>{new Date(entry.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
                  <small>{JSON.stringify(entry.metadata)}</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading"><div><p className="eyebrow">Compliance</p><h3>Demo warning</h3></div></div>
          <div className="alert-item info">
            <span className="alert-icon">i</span>
            <div>
              <strong>Prototype status</strong>
              <p>This demo uses synthetic data only and is not POPIA or clinical validation approved.</p>
            </div>
          </div>
          {isOffline ? <div className="notice" style={{ marginTop: 16 }}>Action queue is pending sync; the app is offline.</div> : null}
        </section>
      </div>
    </AppShell>
  );
}
