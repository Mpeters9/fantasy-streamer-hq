"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard/manual", label: "Dashboard (Main)", icon: "📊" },
    { href: "/dashboard/manual-data", label: "Manual Data Entry", icon: "✍️" },
    { href: "/dashboard/weekly-snapshots", label: "Weekly Snapshots", icon: "🗓️" },
    { href: "/dashboard/odds-feed", label: "Odds Feed", icon: "💰" },
    { href: "/dashboard/weather-feed", label: "Weather Feed", icon: "🌦️" },
  ];

  return (
    <div className="min-h-screen flex bg-[#0e1117] text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#12161e] border-r border-gray-800 flex flex-col shadow-lg">
        <div className="text-2xl font-bold px-6 py-5 border-b border-gray-800 flex items-center gap-2">
          🏈 <span className="text-blue-400">Fantasy HQ</span>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="p-2 space-y-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md transition",
                      active
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    )}
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 text-xs text-gray-500 border-t border-gray-800">
          Fantasy Streamer HQ v2.0
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
