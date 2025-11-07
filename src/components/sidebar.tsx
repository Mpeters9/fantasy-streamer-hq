"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "🏠 Dashboard", href: "/dashboard/manual" },
  { name: "📊 Manual Data", href: "/dashboard/manual-data" },
  { name: "📈 Waivers", href: "/dashboard/waivers" },
  { name: "⚙️ Weights", href: "/dashboard/weights" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-gray-900 text-gray-100 h-full w-56 p-4 space-y-3 border-r border-gray-800">
      <h1 className="text-xl font-bold mb-4 text-blue-400 leading-tight">
        Fantasy Streamer HQ
      </h1>
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-3 py-2 rounded-md transition ${
              pathname === link.href
                ? "bg-blue-700 text-white"
                : "hover:bg-gray-800 text-gray-300"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
