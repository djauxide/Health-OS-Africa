"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../../components/AppShell";
import { apiFetch } from "../../lib/api";

type Entry = { id: string; event_type: string; actor: string | null; target_type: string | null; created_at: string; metadata: Record<string, unknown> };
export default function AuditPage() {
  const [rows, setRows] = useState<Entry[]>([]); const [error, setError] = useState("");
  useEffect(() => { apiFetch<Entry[]>("/api/audit?limit=200").then(setRows).catch((err) => setError(err.message)); }, []);
  return <AppShell><section className="panel"><div className="panel-heading"><div><p className="eyebrow">Governance</p><h2>Audit log</h2></div><span className="status-pill online"><i />Protected</span></div>{error && <div className="error">{error}</div>}<table className="table"><thead><tr><th>Time</th><th>User</th><th>Event</th><th>Target</th><th>Details</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{new Date(row.created_at).toLocaleString()}</td><td>{row.actor || "System"}</td><td>{row.event_type}</td><td>{row.target_type || "-"}</td><td className="muted">{Object.keys(row.metadata || {}).length ? JSON.stringify(row.metadata) : "-"}</td></tr>)}</tbody></table></section></AppShell>;
}
