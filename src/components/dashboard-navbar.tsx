// src/components/dashboard-navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardNavbar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard/manual", label: "🧠 Manual Entry" },
    { href: "/dashboard/manual-data", label: "📊 Manual Stats" },
    { href: "/dashboard/waivers", label: "🚨 Waivers" },
    { href: "/dashboard/weights", label: "⚙️ Weights" },
  ];

  return (
    <nav
      style={{
        display: "flex",
        gap: "1rem",
        padding: "1rem 1.5rem",
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #1f2937",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {links.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              color: active ? "#10b981" : "#e5e7eb",
              textDecoration: "none",
              fontWeight: active ? "bold" : "normal",
              fontSize: "0.95rem",
              transition: "color 0.2s ease-in-out",
            }}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
