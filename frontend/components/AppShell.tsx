"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "../lib/api";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/queue", label: "Clinic Queue" },
  { href: "/patients", label: "Patients" },
  { href: "/appointments", label: "Appointments" },
  { href: "/audit", label: "Audit" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-wrap">
          <div className="brand-mark">H</div>
          <div>
            <div className="brand-name">HealthOS Africa</div>
            <small>Clinical operations</small>
          </div>
        </div>

        <nav className="nav" aria-label="Primary navigation">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link key={link.href} href={link.href} className={isActive ? "nav-link active" : "nav-link"}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="logout-button"
          onClick={() => {
            clearSession();
            router.push("/login");
          }}
        >
          Logout
        </button>
      </aside>

      <main className="page-shell">{children}</main>
    </div>
  );
}
