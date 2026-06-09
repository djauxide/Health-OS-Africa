"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { API_URL, setSession } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@healthos.test");
  const [password, setPassword] = useState("HealthOS123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body?.error?.message ?? "Login failed");
      }

      setSession(body.data.accessToken);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login">
      <section className="panel login-card">
        <p className="kicker">Clinic pilot environment</p>
        <h1>Sign in</h1>
        <form className="form" onSubmit={submit} style={{ marginTop: 20 }}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
          </div>
          {error ? <div className="error">{error}</div> : null}
          <button className="button" disabled={loading} type="submit">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="notice">Demo credentials are prefilled for the seeded pilot clinic.</div>
      </section>
    </main>
  );
}

