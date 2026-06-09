import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HealthOS Africa",
  description: "Clinical operating system MVP"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

