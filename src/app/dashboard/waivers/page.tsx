"use client";
import React, { useState, useEffect } from "react";
import PlayerCompare from "@/components/player-compare";

export default function WaiverDashboard() {
  const [players, setPlayers] = useState<any[]>([]);
  const [pos, setPos] = useState("ALL");
  const [mode, setMode] = useState("weekly");
  const [status, setStatus] = useState("Loading...");
  const [week, setWeek] = useState<number | null>(null);
  const [compare, setCompare] = useState<any[]>([]);

  async function load(selectedPos = pos, selectedMode = mode) {
    const res = await fetch(`/api/waivers?mode=${selectedMode}&pos=${selectedPos}`);
    const data = await res.json();
    setPlayers(data.data || []);
    setWeek(data.week);
    setStatus(`✅ Loaded ${data.count} players`);
    setPos(selectedPos);
    setMode(selectedMode);
  }

  useEffect(() => {
    load();
  }, []);

  function handleCompare(p: any) {
    if (compare.some((x) => x.id === p.id)) return;
    setCompare((prev) => (prev.length >= 2 ? [p] : [...prev, p]));
  }

  function handleModeToggle() {
    const newMode = mode === "weekly" ? "ros" : "weekly";
    load(pos, newMode);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">📋 Waiver Rankings</h1>
          <p className="text-gray-400 mt-1">
            Week {week ?? "-"} • Mode: {mode.toUpperCase()} • {status}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["ALL", "QB", "RB", "WR", "TE", "DST", "K"].map((p) => (
            <button
              key={p}
              onClick={() => load(p, mode)}
              className={`px-3 py-1 rounded ${
                pos === p ? "bg-blue-600" : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={handleModeToggle}
            className="px-4 py-1 rounded bg-purple-600 hover:bg-purple-700"
          >
            Toggle Mode
          </button>
        </div>
      </header>

      {players.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="px-2 py-2 text-left">Rank</th>
                <th className="px-2 py-2 text-left">Player</th>
                <th className="px-2 py-2 text-left">Pos</th>
                <th className="px-2 py-2 text-left">Team</th>
                <th className="px-2 py-2 text-left">Opponent</th>
                <th className="px-2 py-2 text-left">Spread</th>
                <th className="px-2 py-2 text-left">Weather</th>
                <th className="px-2 py-2 text-left text-blue-400">Score</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr key={p.id + i} className="border-b border-gray-800 hover:bg-gray-900">
                  <td className="px-2 py-2">{i + 1}</td>
                  <td className="px-2 py-2 flex items-center gap-2">
                    <img
                      src={p.headshot}
                      alt={p.name}
                      className="w-8 h-8 rounded-full border border-gray-700"
                      onError={(e) =>
                        ((e.target as HTMLImageElement).src =
                          "https://a.espncdn.com/i/headshots/nophoto.png")
                      }
                    />
                    {p.name}
                  </td>
                  <td className="px-2 py-2">{p.position}</td>
                  <td className="px-2 py-2">{p.team}</td>
                  <td className="px-2 py-2">{p.opponent}</td>
                  <td className="px-2 py-2">{p.spread}</td>
                  <td className="px-2 py-2">{p.weather}</td>
                  <td className="px-2 py-2 text-blue-400 font-semibold">
                    {p.streamerScore}
                  </td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => handleCompare(p)}
                      className="px-2 py-1 bg-blue-700 hover:bg-blue-800 text-xs rounded"
                    >
                      Compare
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {compare.length === 2 && (
        <PlayerCompare a={compare[0]} b={compare[1]} onClose={() => setCompare([])} />
      )}
    </div>
  );
}
