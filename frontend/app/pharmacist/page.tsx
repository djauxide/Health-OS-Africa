"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../../components/AppShell";
import { apiFetch } from "../../lib/api";

type Medication = { id: string; generic_name: string; strength: string | null; quantity_on_hand: number; reorder_threshold: number };

type AlertItem = { id: string; generic_name: string; quantity_on_hand: number; reorder_threshold: number; expiry_date: string | null };

const mockStock: Medication[] = [
  { id: "m1", generic_name: "Amoxicillin", strength: "500mg", quantity_on_hand: 35, reorder_threshold: 20 },
  { id: "m2", generic_name: "Paracetamol", strength: "500mg", quantity_on_hand: 18, reorder_threshold: 25 },
  { id: "m3", generic_name: "Salbutamol", strength: "100mcg", quantity_on_hand: 8, reorder_threshold: 10 }
];

export default function PharmacistPage() {
  const [stock, setStock] = useState<Medication[]>(mockStock);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("healthos-offline-mode");
    if (stored) setIsOffline(stored === "true");

    Promise.all([
      apiFetch<Medication[]>("/api/pharmacy/medications").catch(() => mockStock),
      apiFetch<AlertItem[]>("/api/pharmacy/alerts").catch(() => [
        { id: "a1", generic_name: "Salbutamol", quantity_on_hand: 8, reorder_threshold: 10, expiry_date: null }
      ])
    ]).then(([items, itemAlerts]) => {
      setStock(items);
      setAlerts(itemAlerts);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("healthos-offline-mode", String(isOffline));
  }, [isOffline]);

  return (
    <AppShell>
      <div className="role-header">
        <div>
          <p className="eyebrow">Role demo</p>
          <h2>Pharmacy dispensing</h2>
        </div>
        <button className="button secondary" type="button" onClick={() => setIsOffline((value) => !value)}>
          {isOffline ? "Switch online" : "Offline mode"}
        </button>
      </div>

      <div className="role-summary">
        <div className="status-box"><h4>Low-stock</h4><strong>{alerts.length}</strong></div>
        <div className="status-box"><h4>Dispensed</h4><strong>23</strong></div>
        <div className="status-box"><h4>Pending</h4><strong>4</strong></div>
        <div className="status-box"><h4>Sync</h4><strong>{isOffline ? "Pending" : "Live"}</strong></div>
      </div>

      <div className="dashboard-grid dashboard-grid-primary">
        <section className="panel">
          <div className="panel-heading"><div><p className="eyebrow">Inventory</p><h3>Medication stock</h3></div></div>
          <div className="queue-list">
            {stock.map((item) => (
              <div key={item.id} className="workboard-item">
                <div>
                  <strong>{item.generic_name}</strong>
                  <small>{item.strength}</small>
                </div>
                <div>
                  <strong>{item.quantity_on_hand}</strong>
                  <small>on hand</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading"><div><p className="eyebrow">Alerts</p><h3>Stock warnings</h3></div></div>
          <div className="alert-item critical">
            <span className="alert-icon">!</span>
            <div>
              <strong>Reorder needed</strong>
              <p>{alerts.length ? alerts.map((item) => item.generic_name).join(", ") : "No urgent stock warnings"}</p>
            </div>
          </div>
          <button className="button" type="button" style={{ marginTop: 16 }}>Dispense selected item</button>
          {isOffline ? <div className="notice" style={{ marginTop: 16 }}>Pharmacy action stored pending sync.</div> : null}
        </section>
      </div>
    </AppShell>
  );
}
