"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../../components/AppShell";
import { apiFetch } from "../../lib/api";

interface Dashboard {
  patients: number;
  appointmentsToday: number;
  consultationsToday: number;
  medicineUnits: number;
  lowStockAlerts: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Dashboard>("/api/dashboard")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  const stats = [
    ["Registered Patients", data?.patients],
    ["Appointments Today", data?.appointmentsToday],
    ["Consultations Today", data?.consultationsToday],
    ["Medicine Units", data?.medicineUnits],
    ["Stock Alerts", data?.lowStockAlerts]
  ];

  return (
    <AppShell>
      {error ? <div className="notice">{error}</div> : null}
      <section className="grid stats">
        {stats.map(([label, value]) => (
          <div className="card" key={label}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value ?? "-"}</div>
          </div>
        ))}
      </section>
      <section className="grid columns">
        <div className="panel">
          <h2>Clinic Flow</h2>
          <table className="table">
            <tbody>
              <tr>
                <td>Registration</td>
                <td>Patient demographics and medical aid capture</td>
              </tr>
              <tr>
                <td>Appointments</td>
                <td>Bookings, check-ins, and queue intake</td>
              </tr>
              <tr>
                <td>Triage</td>
                <td>Vitals and priority classification</td>
              </tr>
              <tr>
                <td>Consultation</td>
                <td>SOAP notes, diagnosis, and prescriptions</td>
              </tr>
              <tr>
                <td>Pharmacy</td>
                <td>Dispensing and stock control</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h2>Environment</h2>
          <table className="table">
            <tbody>
              <tr>
                <td>Frontend</td>
                <td>Next.js</td>
              </tr>
              <tr>
                <td>Backend</td>
                <td>TypeScript API</td>
              </tr>
              <tr>
                <td>Database</td>
                <td>PostgreSQL 16</td>
              </tr>
              <tr>
                <td>Gateway</td>
                <td>Nginx</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}

