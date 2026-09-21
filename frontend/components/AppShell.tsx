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
  const pathname = usePathname(); const router = useRouter();
  return <div className="shell"><aside className="sidebar"><div className="brand">HealthOS Africa</div><nav className="nav" aria-label="Primary navigation">{links.map((link) => <Link className={pathname.startsWith(link.href) ? "active" : ""} href={link.href} key={link.href}>{link.label}</Link>)}</nav></aside><main className="main"><div className="topbar"><div><p className="kicker">Ubuntu Family Clinic · Connected</p><h1>Clinical Operations</h1></div><button className="button secondary" onClick={() => { clearSession(); router.push("/login"); }} type="button">Sign out</button></div>{children}</main></div>;
}
