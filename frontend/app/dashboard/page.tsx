"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/AppShell";
import { apiFetch } from "../../lib/api";

interface Dashboard {
  patients: number;
  appointmentsToday: number;
  consultationsToday: number;
  medicineUnits: number;
  lowStockAlerts: number;
}

const flow = [
  { label: "Registration", value: 78, tone: "teal" },
  { label: "Triage", value: 54, tone: "blue" },
  { label: "Consultation", value: 66, tone: "purple" },
  { label: "Pharmacy", value: 42, tone: "amber" }
];

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Dashboard>("/api/dashboard")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  const metrics = useMemo(
    () => [
      { label: "Registered patients", value: data?.patients, note: "All clinic records", tone: "teal", icon: "◎" },
      { label: "Appointments today", value: data?.appointmentsToday, note: "Scheduled visits", tone: "blue", icon: "▣" },
      { label: "Consultations today", value: data?.consultationsToday, note: "Completed today", tone: "purple", icon: "✚" },
      { label: "Medicine units", value: data?.medicineUnits, note: "Across pharmacy stock", tone: "green", icon: "▤" },
      { label: "Stock alerts", value: data?.lowStockAlerts, note: "Needs attention", tone: "amber", icon: "!" }
    ],
    [data]
  );

  return (
    <AppShell>
      {error ? <div className="notice">Unable to load live dashboard data: {error}</div> : null}

      <section className="dashboard-heading">
        <div>
          <p className="eyebrow">Monday, 21 September 2026</p>
          <h2>Good morning, Clinic Admin</h2>
          <p className="muted">Here is what is happening across Ubuntu Family Clinic today.</p>
        </div>
        <div className="dashboard-actions">
          <Link className="button secondary" href="/appointments">View appointments</Link>
          <Link className="button" href="/patients">Register patient</Link>
        </div>
      </section>

      <section className="metric-grid" aria-label="Clinic overview">
        {metrics.map((metric) => (
          <article className={`metric-card ${metric.tone}`} key={metric.label}>
            <div className="metric-topline"><span>{metric.label}</span><b>{metric.icon}</b></div>
            <strong>{metric.value ?? "—"}</strong>
            <small>{metric.note}</small>
          </article>
        ))}
      </section>

      <section className="dashboard-grid dashboard-grid-primary">
        <article className="panel flow-panel">
          <div className="panel-heading"><div><p className="eyebrow">Operational overview</p><h3>Today&apos;s clinic flow</h3></div><span className="status-pill online"><i />Operational</span></div>
          <div className="flow-list">
            {flow.map((item) => <div className="flow-row" key={item.label}><div className="flow-label"><span>{item.label}</span><strong>{item.value}%</strong></div><div className="progress-track"><span className={`progress ${item.tone}`} style={{ width: `${item.value}%` }} /></div></div>)}
          </div>
          <div className="flow-footer"><span>Patient movement across the core clinic workflow</span><Link href="/appointments">Open workflow →</Link></div>
        </article>

        <article className="panel alert-panel">
          <div className="panel-heading"><div><p className="eyebrow">Needs attention</p><h3>Priority alerts</h3></div><span className="alert-count">{data?.lowStockAlerts ?? 0}</span></div>
          <div className="alert-item critical"><span className="alert-icon">!</span><div><strong>Stock alerts</strong><p>{data?.lowStockAlerts ?? 0} medication items are at or below reorder level.</p></div></div>
          <div className="alert-item info"><span className="alert-icon">i</span><div><strong>Keep the queue moving</strong><p>Use appointments and patient check-in to maintain a clean handoff.</p></div></div>
          <Link className="text-link" href="/appointments">Review clinic activity →</Link>
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid-secondary">
        <article className="panel queue-panel">
          <div className="panel-heading"><div><p className="eyebrow">Live operations</p><h3>Clinic workboard</h3></div><Link className="text-link" href="/appointments">See all →</Link></div>
          <div className="workboard">
            {[{ label: "Waiting for registration", value: "—", tone: "teal" }, { label: "Waiting for triage", value: "—", tone: "blue" }, { label: "Waiting for consultation", value: data?.appointmentsToday ?? "—", tone: "purple" }, { label: "Waiting for pharmacy", value: "—", tone: "amber" }].map((item) => <div className="workboard-item" key={item.label}><span className={`workboard-icon ${item.tone}`} /><div><strong>{item.value}</strong><small>{item.label}</small></div></div>)}
          </div>
        </article>
        <article className="panel activity-panel">
          <div className="panel-heading"><div><p className="eyebrow">System health</p><h3>Recent activity</h3></div><span className="status-pill online"><i />Live</span></div>
          <div className="activity-item"><span className="activity-dot teal" /><div><strong>Dashboard data refreshed</strong><small>Tenant and clinic metrics are scoped to your session</small></div></div>
          <div className="activity-item"><span className="activity-dot blue" /><div><strong>Appointments are ready</strong><small>{data?.appointmentsToday ?? "—"} visits scheduled for today</small></div></div>
          <div className="activity-item"><span className="activity-dot amber" /><div><strong>Pharmacy requires review</strong><small>{data?.lowStockAlerts ?? "—"} low-stock alerts recorded</small></div></div>
        </article>
      </section>
    </AppShell>
  );
}
