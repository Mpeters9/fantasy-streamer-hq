// src/app/dashboard/manual/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";

interface PlayerData {
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

export default function ManualPage() {
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [week, setWeek] = useState<number>(0);
  const [status, setStatus] = useState("Loading…");
  const [search, setSearch] = useState("");
  const [selectedPos, setSelectedPos] = useState<string>("ALL");

  // 🧠 LOAD WEEK + PLAYER DATA
  useEffect(() => {
    const load = async () => {
      try {
        const weekRes = await fetch("/api/cron/week");
        const { week } = await weekRes.json();
        setWeek(week);

        const res = await fetch(`/api/scoring?week=${week}`);
        const json = await res.json();

        if (!json?.data || !Array.isArray(json.data)) {
          setStatus("⚠️ No scoring data found");
          return;
        }

        setPlayers(json.data);
        setStatus(`✅ Week ${week} data loaded`);
      } catch (err) {
        console.error("Failed to load manual page data:", err);
        setStatus("❌ Error loading player data");
      }
    };
    load();
  }, []);

  // 🧮 SEARCH + FILTER
  const filteredPlayers = useMemo(() => {
    const q = search.toLowerCase();
    return players.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.team.toLowerCase().includes(q) ||
        p.pos.toLowerCase().includes(q);
      const matchesPos = selectedPos === "ALL" || p.pos === selectedPos;
      return matchesSearch && matchesPos;
    });
  }, [players, search, selectedPos]);

  // 🎨 UI HELPERS
  const scoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 75) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 45) return "text-orange-400";
    return "text-red-400";
  };

  const weatherBadge = (metrics?: Record<string, number>) => {
    const w = metrics?.weather ?? 0;
    if (w <= -5) return <span className="bg-red-600/20 text-red-300 px-2 py-1 rounded text-xs">🌧️ Poor</span>;
    if (w >= 3) return <span className="bg-emerald-600/20 text-emerald-300 px-2 py-1 rounded text-xs">☀️ Clear</span>;
    return <span className="bg-slate-700/40 text-slate-300 px-2 py-1 rounded text-xs">🌤️ Neutral</span>;
  };

  const posTabs = ["ALL", "QB", "RB", "WR", "TE", "K", "DEF"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">📊 Manual Stats Dashboard</h1>
          <p className="text-slate-400 text-sm">
            Week {week} • {status}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500"
          />
        </div>
      </header>

      {/* POSITION FILTER TABS */}
      <div className="flex flex-wrap gap-2 mb-3">
        {posTabs.map((pos) => (
          <button
            key={pos}
            onClick={() => setSelectedPos(pos)}
            className={`px-3 py-1.5 rounded text-sm font-medium border ${
              selectedPos === pos
                ? "bg-emerald-600 text-white border-emerald-500"
                : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            {pos}
          </button>
        ))}
      </div>

      {/* PLAYER TABLE */}
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
              <th className="px-3 py-2 text-center">Weather</th>
              <th className="px-3 py-2 text-left">Manual Note</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-slate-400 py-6">
                  No players found.
                </td>
              </tr>
            ) : (
              filteredPlayers.map((p) => (
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
                  <td
                    className={`px-3 py-2 text-right font-semibold ${scoreColor(
                      p.streamerScore
                    )}`}
                  >
                    {p.streamerScore.toFixed(1)}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-300">
                    {p.impliedTotal?.toFixed(1)}
                  </td>
                  <td className="px-3 py-2 text-center">{weatherBadge(p.metrics)}</td>
                  <td className="px-3 py-2 text-left">
                    <input
                      type="text"
                      placeholder="Add note..."
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white w-full"
                      onChange={(e) => {
                        // optional local save logic if needed later
                      }}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
