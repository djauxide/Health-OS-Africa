"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "../lib/api";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/patients", label: "Patients" },
  { href: "/appointments", label: "Appointments" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearSession();
    router.push("/login");
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">HealthOS Africa</div>
        <nav className="nav">
          {links.map((link) => (
            <Link className={pathname.startsWith(link.href) ? "active" : ""} href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main">
        <div className="topbar">
          <div>
            <p className="kicker">Ubuntu Family Clinic</p>
            <h1>Clinical Operations</h1>
          </div>
          <button className="button secondary" onClick={logout} type="button">
            Sign out
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}

