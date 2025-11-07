// src/components/sidebar.tsx
// (Kept lightweight for future reuse if you want a separate component)
"use client";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-gray-900/70 border-r border-gray-800">
      <div className="px-4 py-5 border-b border-gray-800">
        <h1 className="text-xl font-bold">🏈 Streamer HQ</h1>
        <p className="text-xs text-gray-400">Tuesday-proof waivers</p>
      </div>
      <nav className="p-3 space-y-1 text-sm">
        <Link className="block px-3 py-2 rounded hover:bg-gray-800" href="/">🏠 Home</Link>
        <Link className="block px-3 py-2 rounded hover:bg-gray-800" href="/dashboard/waivers">📊 Waivers</Link>
        <Link className="block px-3 py-2 rounded hover:bg-gray-800" href="/dashboard/manual">🧠 Manual</Link>
        <Link className="block px-3 py-2 rounded hover:bg-gray-800" href="/dashboard/manual-data">📝 Manual Data</Link>
        <Link className="block px-3 py-2 rounded hover:bg-gray-800" href="/dashboard/weights">⚙️ Weights</Link>
      </nav>
    </aside>
  );
}
