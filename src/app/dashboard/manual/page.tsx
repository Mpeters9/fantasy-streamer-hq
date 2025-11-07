"use client";
import React, { useEffect, useState } from "react";

export default function ManualDashboard() {
  const [week, setWeek] = useState<number | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Idle");

  useEffect(() => {
    const init = async () => {
      const res = await fetch("/api/scoring");
      const data = await res.json();
      setWeek(data.week);
      setPlayers(data.data || []);
      setStatus(`✅ Loaded Week ${data.week}`);
    };
    init();
  }, []);

  const forceRefresh = async () => {
    setLoading(true);
    try {
      await fetch("/api/cron/sync?force=true");
      const scored = await fetch("/api/scoring").then((r) => r.json());
      setPlayers(scored.data || []);
      setWeek(scored.week);
      setStatus(`✅ Refreshed Week ${scored.week}`);
    } catch {
      setStatus("❌ Refresh failed");
    } finally {
      setLoading(false);
    }
  };

  const filtered =
    search.length > 1
      ? players.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      : players.slice(0, 30);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">🏈 Manual Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Week {week ?? "-"} • {status}
          </p>
        </div>
        <button
          onClick={forceRefresh}
          disabled={loading}
          className={`px-4 py-2 rounded text-white shadow ${
            loading
              ? "bg-gray-600 cursor-wait"
              : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
          }`}
        >
          {loading ? "🔄 Syncing..." : "🔁 Force Data Refresh"}
        </button>
      </header>

      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Search player..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src={p.headshot}
                  alt={p.name}
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src =
                      "https://a.espncdn.com/i/headshots/nophoto.png")
                  }
                  className="w-14 h-14 rounded-full border border-gray-600"
                />
                <div>
                  <h2 className="text-lg font-semibold text-white">{p.name}</h2>
                  <p className="text-gray-400 text-sm">
                    {p.team} • {p.position}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>Opponent: {p.opponent}</p>
                <p>Spread: {p.spread}</p>
                <p>Implied: {p.impliedPts}</p>
                <p>Weather: {p.weather}</p>
              </div>
              <p className="text-lg font-bold text-blue-400">
                ⭐ Streamer Score: {p.streamerScore}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
