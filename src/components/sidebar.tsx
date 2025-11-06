"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard (Main)", href: "/dashboard/manual" },
  { label: "Manual Data Entry", href: "/dashboard/manual-data" },
  { label: "Weekly Snapshots", href: "/dashboard/snapshots" },
  { label: "Odds Feed", href: "/api/cron/odds" },
  { label: "Weather Feed", href: "/api/cron/weather" },
];


<a
  href="/dashboard/snapshots"
  className="block px-4 py-2 hover:bg-gray-800 rounded-md text-sm"
>
  🗓️ Weekly Snapshots
</a>

<a
  href="/dashboard/waivers"
  className="block px-4 py-2 hover:bg-gray-800 rounded-md text-sm"
>
  🧮 Waiver Recommendations
</a>


export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-64 bg-gray-900 text-gray-200 p-4 space-y-3">
      <h1 className="text-xl font-bold mb-4 text-blue-400">Fantasy Streamer HQ</h1>
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`block px-3 py-2 rounded ${
                path === item.href ? "bg-blue-600 text-white" : "hover:bg-gray-800"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
<a
  href="/dashboard/compare"
  className="block px-4 py-2 hover:bg-gray-800 rounded-md text-sm"
>
  🔍 Player Comparison
</a>

