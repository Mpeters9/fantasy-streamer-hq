// src/app/dashboard/manual-data/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import type { PlayerSummary } from "@/lib/players";

interface ManualStatRow {
  id: string;
  name: string;
  team: string;
  pos: string;
  week: number;
  stats: Record<string, number>;
}

export default function ManualDataPage() {
  const [week, setWeek] = useState<number>(0);
  const [allPlayers, setAllPlayers] = useState<PlayerSummary[]>([]);
  const [rows, setRows] = useState<ManualStatRow[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Loading…");

  useEffect(() => {
    const init = async () => {
      try {
        const weekRes = await fetch("/api/cron/week");
        const { week } = await weekRes.json();
        setWeek(week);

        const res = await fetch("/api/cron/players");
        const players = await res.json();
        setAllPlayers(players);

        setStatus("✅ Ready for input");
      } catch (e) {
        console.error(e);
        setStatus("❌ Failed to load players");
      }
    };
    init();
  }, []);

  const filteredPlayers = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return [];
    return allPlayers.filter((p) => {
      const name = p.name?.toLowerCase() || "";
      const team = p.team?.toLowerCase() || "";
      const pos = p.pos?.toLowerCase() || "";
      return name.includes(q) || team.includes(q) || pos.includes(q);
    });
  }, [search, allPlayers]);

  const addPlayer = (p: PlayerSummary) => {
    if (rows.some((r) => r.id === p.id)) return;
    setRows((prev) => [
      ...prev,
      { id: p.id, name: p.name, team: p.team, pos: p.pos, week, stats: {} },
    ]);
    setSearch("");
  };

  const updateStat = (id: string, key: string, val: number) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, stats: { ...r.stats, [key]: val } } : r
      )
    );
  };

  const saveAll = async () => {
    await fetch("/api/manual/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ week, data: rows }),
    });
    setStatus("💾 Saved successfully!");
  };

  const getFields = (pos: string) => {
    switch (pos) {
      case "QB":
        return [
          ["EPA / Play", "epa_per_play"],
          ["CPOE", "cpoe"],
          ["RZ Dropbacks", "rz_dropbacks"],
          ["Implied Total", "implied_total"],
        ];
      case "RB":
        return [
          ["Rush Share %", "rush_share"],
          ["Target Share %", "target_share"],
          ["RZ Touches", "rz_touches"],
          ["Implied Total", "implied_total"],
        ];
      case "WR":
      case "TE":
        return [
          ["Target Share %", "target_share"],
          ["Yards / Route Run", "yprr"],
          ["Air Yards Share %", "air_share"],
          ["Implied Total", "implied_total"],
        ];
      case "K":
        return [
          ["FG Attempts", "fg_att"],
          ["50+ Attempts", "fg_50"],
          ["XP Attempts", "xp_att"],
          ["Implied Total", "implied_total"],
        ];
      case "DEF":
        return [
          ["Pressure Rate %", "pressure_rate"],
          ["Turnover Rate %", "turnover_rate"],
          ["Points Allowed", "pts_allowed"],
          ["Implied Total", "implied_total"],
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🧠 Predictive Stats Entry</h1>
        <p className="text-sm text-slate-400">
          Week {week} • {status}
        </p>
      </header>

      <section className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-800 text-white px-3 py-2 rounded mb-3 placeholder-slate-400"
        />
        {filteredPlayers.length > 0 && (
          <ul className="max-h-40 overflow-y-auto">
            {filteredPlayers.map((p) => (
              <li
                key={p.id}
                onClick={() => addPlayer(p)}
                className={`cursor-pointer px-3 py-2 rounded hover:bg-slate-700 ${
                  p.pos === "QB"
                    ? "text-sky-400"
                    : p.pos === "RB"
                    ? "text-green-400"
                    : p.pos === "WR"
                    ? "text-yellow-400"
                    : p.pos === "TE"
                    ? "text-purple-400"
                    : "text-slate-300"
                }`}
              >
                {p.name} • {p.team} • {p.pos}
              </li>
            ))}
          </ul>
        )}
      </section>

      {rows.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="bg-slate-900 border border-slate-800 rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="font-semibold">{r.name}</h2>
                  <p className="text-xs text-slate-400">
                    {r.team} • {r.pos}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setRows((prev) => prev.filter((x) => x.id !== r.id))
                  }
                  className="text-xs px-2 py-1 bg-red-600 rounded hover:bg-red-500"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                {getFields(r.pos).map(([label, key]) => (
                  <label key={key} className="flex flex-col text-xs">
                    <span>{label}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={r.stats[key] ?? ""}
                      onChange={(e) =>
                        updateStat(r.id, key, Number(e.target.value))
                      }
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      <div className="flex justify-end">
        <button
          onClick={saveAll}
          className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded text-sm font-medium"
        >
          💾 Save All
        </button>
      </div>
    </div>
  );
}
