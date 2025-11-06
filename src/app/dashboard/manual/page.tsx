"use client";
import React, { useState, useEffect } from "react";

interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  opponent: string;
  spread: string;
  impliedPts: string;
  weather: string;
  headshot?: string;
}

export default function ManualDashboard() {
  const [week, setWeek] = useState<number | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [added, setAdded] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Idle");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/cron/sync");
        const data = await res.json();
        const list = data.snapshot?.players || [];
        setPlayers(list);
        setWeek(data.week);
        setStatus(`✅ Week ${data.week} loaded`);
      } catch (err) {
        console.error(err);
        setStatus("❌ Load failed");
      }
      try {
        const res2 = await fetch("/api/manual-players");
        const d2 = await res2.json();
        setAdded(d2.data || []);
      } catch {}
    };
    load();
  }, []);

  const forceRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cron/sync?force=true");
      const data = await res.json();
      setPlayers(data.snapshot?.players || []);
      setWeek(data.week);
      setStatus(`✅ Refreshed for Week ${data.week}`);
    } catch (err) {
      console.error(err);
      setStatus("❌ Refresh failed");
    } finally {
      setLoading(false);
    }
  };

  const filtered =
    search.length > 1
      ? players.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase())
        )
      : [];

  const addPlayer = async (player: Player) => {
    setSearch("");
    const newList = [...added, player];
    setAdded(newList);
    await fetch("/api/manual-players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(player),
    });
  };

  const removePlayer = async (id: string) => {
    const res = await fetch("/api/manual-players", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    setAdded(data.data || []);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">🧾 Manual Dashboard</h1>
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
        {filtered.length > 0 && (
          <div className="mt-2 bg-gray-900 border border-gray-700 rounded max-h-60 overflow-y-auto">
            {filtered.slice(0, 15).map((p) => (
              <div
                key={p.id}
                className="p-2 hover:bg-gray-700 cursor-pointer"
                onClick={() => addPlayer(p)}
              >
                {p.name} • {p.team} ({p.position})
              </div>
            ))}
          </div>
        )}
      </div>

      {added.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {added.map((p) => (
            <div
              key={p.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow space-y-2"
            >
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
              <button
                onClick={() => removePlayer(p.id)}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-sm rounded py-1"
              >
                ✖ Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
