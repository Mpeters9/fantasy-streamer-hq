"use client";

import React, { useEffect, useState } from "react";

export default function ManualDashboard() {
  const [players, setPlayers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Load all players (QB/RB/WR/TE)
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const res = await fetch("/api/cron/players");
        const json = await res.json();
        const all = Object.values(json.data || {}).flat();
        setPlayers(all);
      } catch (err) {
        console.error("Failed to fetch players:", err);
      }
    };
    loadPlayers();
  }, []);

  // ✅ Filter suggestions
  useEffect(() => {
    if (!query) {
      setFiltered([]);
      return;
    }
    const q = query.toLowerCase();
    const f = players.filter(
      (p: any) =>
        p.name.toLowerCase().includes(q) ||
        p.team.toLowerCase().includes(q) ||
        p.position.toLowerCase().includes(q)
    );
    setFiltered(f.slice(0, 8));
  }, [query, players]);

  // ✅ Fetch contextual team data for a player
  const getTeamContext = async (team: string) => {
    try {
      const res = await fetch("/api/cron/autoFill");
      const json = await res.json();
      return (json.data || []).find(
        (t: any) => t.team?.toLowerCase() === team.toLowerCase().trim()
      );
    } catch (err) {
      console.error("Error loading context:", err);
      return null;
    }
  };

  // ✅ Priority Score Formula
  const calculateScore = (p: any) => {
    const oppRank = Number(p.OppRank_vs_Pos || 15);
    const implied = Number(p.ImpliedPts || 20);
    const recent = Number(p.RecentAvg || 10);
    const spread = Number(p.Spread || 0);
    const weatherBonus = p.Weather_OK ? 5 : 0;

    let score =
      (30 * (32 - oppRank)) / 32 + // inverse rank
      0.2 * implied +
      0.25 * recent +
      0.1 * (spread > 0 ? 2 : 1) +
      weatherBonus;

    return Math.round(score);
  };

  // ✅ When user selects player
  const handleSelect = async (player: any) => {
    setQuery("");
    setFiltered([]);

    if (selected.find((p) => p.player === player.name)) return;

    const context = await getTeamContext(player.team);

    const enriched = {
      player: player.name,
      team: player.team,
      position: player.position,
      opponent: context?.Opponent || "—",
      spread: context?.Spread ?? "-",
      total: context?.Total ?? "-",
      implied: context?.ImpliedPts ?? "-",
      oppRank: context?.[`OppRank_vs_${player.position}`] ?? 15,
      recentAvg: player.recentAvg ?? 10,
      weather: context?.Weather_OK ?? true,
      score: 0,
      rank: "-",
    };

    const score = calculateScore({
      OppRank_vs_Pos: enriched.oppRank,
      ImpliedPts: enriched.implied,
      RecentAvg: enriched.recentAvg,
      Spread: enriched.spread,
      Weather_OK: enriched.weather,
    });

    enriched.score = score;

    setSelected((prev) => {
      const updated = [...prev, enriched];
      // Recalculate ranks
      const sorted = [...updated].sort((a, b) => b.score - a.score);
      return sorted.map((p, i) => ({ ...p, rank: i + 1 }));
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b border-gray-700 pb-4">
          <h1 className="text-3xl font-bold">🏈 Fantasy Streamer HQ</h1>
          <p className="text-gray-400 text-sm">
            Auto-calculating Streamer Priority Scores
          </p>
        </header>

        {/* 🔍 Search */}
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type player name..."
            className="w-full px-4 py-3 rounded-lg bg-gray-900 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {filtered.length > 0 && (
            <ul className="absolute z-20 w-full bg-gray-900 border border-gray-700 rounded-lg mt-1 max-h-60 overflow-y-auto">
              {filtered.map((p, i) => (
                <li
                  key={i}
                  className="px-4 py-2 hover:bg-blue-600 hover:text-white cursor-pointer transition"
                  onClick={() => handleSelect(p)}
                >
                  {p.name} — {p.team} ({p.position})
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 📊 Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-200">
              <tr>
                {[
                  "Player",
                  "Pos",
                  "Team",
                  "Opp",
                  "Spread",
                  "Total",
                  "Implied",
                  "OppRank",
                  "RecentAvg",
                  "Weather",
                  "Score",
                  "Rank",
                ].map((col) => (
                  <th key={col} className="px-4 py-2 text-left">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selected.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    Start typing to scout players
                  </td>
                </tr>
              ) : (
                selected.map((p, i) => (
                  <tr
                    key={i}
                    className="border-t border-gray-800 hover:bg-gray-900 transition"
                  >
                    <td className="px-4 py-2">{p.player}</td>
                    <td className="px-4 py-2">{p.position}</td>
                    <td className="px-4 py-2">{p.team}</td>
                    <td className="px-4 py-2">{p.opponent}</td>
                    <td className="px-4 py-2">{p.spread}</td>
                    <td className="px-4 py-2">{p.total}</td>
                    <td className="px-4 py-2">{p.implied}</td>
                    <td className="px-4 py-2">{p.oppRank}</td>
                    <td className="px-4 py-2">{p.recentAvg}</td>
                    <td className="px-4 py-2">
                      {p.weather ? "✅ OK" : "⚠️ Risky"}
                    </td>
                    <td className="px-4 py-2 font-bold text-blue-400">
                      {p.score}
                    </td>
                    <td className="px-4 py-2 font-bold text-emerald-400">
                      {p.rank}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
