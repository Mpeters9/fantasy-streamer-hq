"use client";
import React, { useEffect, useMemo, useState } from "react";
import type { Player } from "@/lib/types";

export default function ManualDashboard() {
  const [week, setWeek] = useState<number>(10);
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Idle");

  useEffect(() => {
    (async () => {
      const wk = await fetch("/api/cron/week").then(r=>r.json());
      setWeek(wk.week);
      setStatus(`Week ${wk.week}`);
      const p = await fetch("/api/cron/players").then(r=>r.json());
      setPlayers(Array.isArray(p) ? p : []);
    })().catch(e=>console.error(e));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return players.slice(0, 30);
    return players.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.team.toLowerCase().includes(q) ||
      p.pos.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [players, search]);

  return (
    <div className="space-y-4">
      <header className="flex items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold">🧠 Manual Entry</h1>
          <p className="text-gray-400">{status}</p>
        </div>
        <input
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          placeholder="Search player/team/pos…"
          className="ml-auto bg-gray-900 border border-gray-700 rounded px-3 py-2"
        />
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <article key={p.id} className="bg-gray-900 border border-gray-800 rounded p-4 space-y-2">
            <div className="flex items-center gap-3">
              <img src={p.headshot || "https://a.espncdn.com/i/headshots/nophoto.png"} alt={p.name} className="w-12 h-12 rounded-full border border-gray-700" onError={(e)=>((e.target as HTMLImageElement).src="https://a.espncdn.com/i/headshots/nophoto.png")} />
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-xs text-gray-400">{p.team} · {p.pos}</p>
              </div>
              <a className="ml-auto text-blue-400 hover:underline text-sm" href={`/dashboard/manual-data?id=${p.id}&pos=${p.pos}`}>Enter Stats →</a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
