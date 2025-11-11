// src/app/dashboard/waivers/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";

interface PlayerRow {
  id: string;
  name: string;
  team: string;
  pos: string;
  opponent: string;
  impliedTotal: number;
  spread: number;
  streamerScore: number;
  metrics?: Record<string, number>;
  week: number;
}

export default function WaiversPage() {
  const [rows, setRows] = useState<PlayerRow[]>([]);
  const [week, setWeek] = useState<number>(0);
  const [status, setStatus] = useState("Loading…");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"streamerScore" | "impliedTotal" | "spread">("streamerScore");

  // ---- LOAD DATA ----
  useEffect(() => {
    const load = async () => {
      try {
        const wkRes = await fetch("/api/cron/week");
        const wkJson = await wkRes.json();
        const wk = wkJson?.week ?? 11;
        setWeek(wk);

        const res = await fetch(`/api/scoring?week=${wk}`);
        const json = await res.json();

        if (!json?.data || !Array.isArray(json.data)) throw new Error("Invalid scoring data");

        setRows(json.data);
        setStatus(`✅ ${json.count} players loaded`);
      } catch (err) {
        console.error(err);
        setStatus("❌ Failed to load waiver data");
      }
    };
    load();
  }, []);

  // ---- SEARCH + SORT ----
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let data = rows;
    if (q) {
      data = data.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.team?.toLowerCase().includes(q) ||
          r.pos?.toLowerCase().includes(q)
      );
    }
    return [...data].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [rows, search, sortBy]);

  // ---- UTILITIES ----
  const scoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 75) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 45) return "text-orange-400";
    return "text-red-400";
  };

  const spreadColor = (spread: number) => (spread < 0 ? "text-emerald-400" : "text-red-400");

  const weatherBadge = (metrics?: Record<string, number>) => {
    const w = metrics?.weather ?? 0;
    if (w <= -5) return <span className="bg-red-600/20 text-red-300 px-2 py-1 rounded text-xs">🌧️ Poor</span>;
    if (w >= 3) return <span className="bg-emerald-600/20 text-emerald-300 px-2 py-1 rounded text-xs">☀️ Clear</span>;
    return <span className="bg-slate-700/40 text-slate-300 px-2 py-1 rounded text-xs">🌤️ Neutral</span>;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">🚨 Waiver Board</h1>
          <p className="text-slate-400 text-sm">
            Week {week} • {status}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
          >
            <option value="streamerScore">Sort: Streamer Score</option>
            <option value="impliedTotal">Sort: Implied Total</option>
            <option value="spread">Sort: Spread</option>
          </select>
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500"
          />
        </div>
      </header>

      <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800 text-slate-300 uppercase text-xs">
            <tr>
              <th className="px-3 py-2 text-left">Player</th>
              <th className="px-3 py-2 text-left">Team</th>
              <th className="px-3 py-2 text-left">Pos</th>
              <th className="px-3 py-2 text-left">Opponent</th>
              <th className="px-3 py-2 text-right">Streamer Score</th>
              <th className="px-3 py-2 text-right">Implied Total</th>
              <th className="px-3 py-2 text-right">Spread</th>
              <th className="px-3 py-2 text-center">Weather</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-slate-400 py-6">
                  No players found.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-slate-800 hover:bg-slate-800/50 transition"
                >
                  <td className="px-3 py-2 font-medium">{p.name}</td>
                  <td className="px-3 py-2">{p.team}</td>
                  <td
                    className={`px-3 py-2 font-semibold ${
                      p.pos === "QB"
                        ? "text-sky-400"
                        : p.pos === "RB"
                        ? "text-green-400"
                        : p.pos === "WR"
                        ? "text-yellow-400"
                        : p.pos === "TE"
                        ? "text-purple-400"
                        : p.pos === "K"
                        ? "text-pink-400"
                        : "text-slate-400"
                    }`}
                  >
                    {p.pos}
                  </td>
                  <td className="px-3 py-2">{p.opponent}</td>
                  <td className={`px-3 py-2 text-right font-semibold ${scoreColor(p.streamerScore)}`}>
                    {p.streamerScore.toFixed(1)}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-300">
                    {p.impliedTotal?.toFixed(1)}
                  </td>
                  <td className={`px-3 py-2 text-right ${spreadColor(p.spread)}`}>
                    {p.spread > 0 ? `+${p.spread}` : p.spread}
                  </td>
                  <td className="px-3 py-2 text-center">{weatherBadge(p.metrics)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
