"use client";
import React, { useState, useEffect } from "react";

interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  opponent?: string;
  spread?: string;
  weather?: string;
  impliedPts?: number;
  headshot?: string;
  score?: number;
}

export default function ManualDashboard() {
  const [week, setWeek] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Player | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>("Not synced");

  const syncData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cron/sync");
      const data = await res.json();
      setWeek(data.week);
      setPlayers(data.snapshot?.players || []);
      setSyncStatus(`✅ Synced for Week ${data.week} (${data.count} players)`);
    } catch (e: any) {
      console.error("❌ Sync error:", e);
      setSyncStatus("❌ Sync failed – try again");
    } finally {
      setLoading(false);
    }
  };

  const loadPlayers = async () => {
    try {
      const res = await fetch("/api/cron/players");
      const data = await res.json();
      setPlayers(data.data || []);
    } catch (e) {
      console.error("Player load failed:", e);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  const handleSelect = async (player: Player) => {
    setSearch(player.name);
    setSelected(null);
    try {
      const [weatherRes, oddsRes] = await Promise.all([
        fetch("/api/cron/weather").then((r) => r.json()),
        fetch("/api/cron/odds").then((r) => r.json()),
      ]);

      const weather = weatherRes.data.find(
        (w: any) => w.team === player.team
      );
      const game = oddsRes.data.find(
        (g: any) => g.homeTeam === player.team || g.awayTeam === player.team
      );

      const opponent =
        game?.homeTeam === player.team ? game?.awayTeam : game?.homeTeam;
      const spread =
        game?.homeTeam === player.team
          ? game.spread
          : game.spread
          ? -1 * game.spread
          : "N/A";
      const impliedPts = game?.total
        ? (game.total / 2 + (spread as number) / 2).toFixed(1)
        : "N/A";

      const playerData = {
        ...player,
        opponent,
        spread: typeof spread === "number" ? spread.toFixed(1) : spread,
        impliedPts,
        weather: weather
          ? `${weather.tempF.toFixed(0)}°F, Wind ${weather.windMph.toFixed(
              0
            )} mph`
          : "Indoor/Dome",
        headshot: `https://a.espncdn.com/i/headshots/nfl/players/full/${player.id}.png`,
      };

      setSelected(playerData);
    } catch (e) {
      console.error("Failed to load player details:", e);
    }
  };

  const filteredPlayers =
    search.length > 1
      ? players.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase())
        )
      : [];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">🧾 Manual Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Current Week:{" "}
            <span className="font-semibold text-blue-400">
              {week ? week : "–"}
            </span>
          </p>
        </div>

        <button
          onClick={syncData}
          disabled={loading}
          className={`mt-4 sm:mt-0 px-4 py-2 rounded text-white shadow transition-colors ${
            loading
              ? "bg-gray-600 cursor-wait"
              : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
          }`}
        >
          {loading ? "🔄 Syncing..." : "🔁 Force Data Refresh"}
        </button>
      </header>

      <div
        className={`rounded-lg p-4 border ${
          syncStatus.startsWith("✅")
            ? "border-green-400 bg-green-900/20"
            : syncStatus.startsWith("❌")
            ? "border-red-400 bg-red-900/20"
            : "border-gray-700 bg-gray-800"
        } text-gray-200`}
      >
        {syncStatus}
      </div>

      <section className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Search Players</h2>

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="🔍 Type a player name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-gray-100 px-3 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {filteredPlayers.length > 0 && (
            <div className="absolute z-10 bg-gray-800 border border-gray-700 mt-1 w-full max-h-64 overflow-y-auto rounded-md shadow-lg">
              {filteredPlayers.slice(0, 10).map((p) => (
                <div
                  key={p.id}
                  className="p-2 hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleSelect(p)}
                >
                  {p.name} • {p.team} ({p.position})
                </div>
              ))}
            </div>
          )}
        </div>

        {selected ? (
          <div className="rounded-lg bg-gray-900 border border-gray-700 p-4 flex items-center gap-4 shadow-inner">
            <img
              src={selected.headshot}
              onError={(e) =>
                ((e.target as HTMLImageElement).src =
                  "https://a.espncdn.com/i/headshots/nophoto.png")
              }
              alt={selected.name}
              className="w-16 h-16 rounded-full border border-gray-600 object-cover"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">
                {selected.name}
              </h3>
              <p className="text-gray-400">
                {selected.team} • {selected.position}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-sm">
                <p>Opponent: {selected.opponent || "TBD"}</p>
                <p>Spread: {selected.spread || "N/A"}</p>
                <p>Weather: {selected.weather}</p>
                <p>Implied Pts: {selected.impliedPts}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">
            Select a player to view matchup data.
          </p>
        )}
      </section>
    </div>
  );
}
