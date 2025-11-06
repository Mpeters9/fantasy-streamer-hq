"use client";
import React, { useState, useEffect } from "react";
import WeightsPanel from "@/components/weights-panel";
import PlayerAutocomplete from "@/components/player-autocomplete";
import { calculateStreamerScore } from "@/lib/scoring-engine";

export default function ManualPage() {
  const [openWeights, setOpenWeights] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  const [week, setWeek] = useState<number>(0);
  const [players, setPlayers] = useState<any[]>([]);
  const [odds, setOdds] = useState<any[]>([]);
  const [weather, setWeather] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch main data
  useEffect(() => {
    const load = async () => {
      try {
        const d = await fetch("/api/cron/sync", { cache: "no-store" }).then((r) => r.json());
        setWeek(d.week || 0);
        setPlayers(d.players || []);
        setOdds(d.odds || []);
        setWeather(d.weather || []);
        setSchedule(d.schedule || []);
      } catch (e) {
        console.error("❌ Load error:", e);
      }
    };
    load();
  }, []);

  const handleSelect = (p: any) => setPlayer(p);

  const forceRefresh = async () => {
    setLoading(true);
    try {
      const d = await fetch("/api/cron/sync", { cache: "no-store" }).then((r) => r.json());
      setWeek(d.week || 0);
      setPlayers(d.players || []);
      setOdds(d.odds || []);
      setWeather(d.weather || []);
      setSchedule(d.schedule || []);
await fetch("/api/snapshots", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    week: d.week,
    players: d.players,
    odds: d.odds,
    weather: d.weather,
    schedule: d.schedule,
  }),
});
alert(`✅ Synced + snapshot saved for Week ${d.week}`);
    } catch (e: any) {
      alert("❌ Refresh failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const getOpponentData = (team: string) => {
    const game = schedule.find(
      (g) => g.homeAbbr === team || g.awayAbbr === team
    );
    if (!game) return null;

    const isHome = game.homeAbbr === team;
    const opponent = isHome ? game.awayAbbr : game.homeAbbr;

    const oddsData = odds.find(
      (o: any) =>
        o.homeTeam?.includes(game.homeAbbr) ||
        o.awayTeam?.includes(game.awayAbbr)
    );

    const spread =
      isHome && oddsData
        ? oddsData.spread
        : oddsData
        ? oddsData.spread * -1
        : "N/A";

    const weatherData = weather.find((w) => w.team === team);

    return {
      opponent,
      spread,
      temp: weatherData?.tempF ?? "—",
      wind: weatherData?.windMph ?? "—",
      condition: weatherData?.condition ?? "—",
      impliedPts: oddsData ? (oddsData.total / 2).toFixed(1) : "—",
    };
  };

  const matchup = player ? getOpponentData(player.team) : null;

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Fantasy Streamer HQ – Manual Dashboard</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={forceRefresh}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
          >
            {loading ? "Refreshing..." : "♻️ Force Data Refresh"}
          </button>
          <button
            onClick={() => setOpenWeights(true)}
            className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded-md"
          >
            ⚙️ Weights
          </button>
        </div>
      </div>

      <div className="mb-4 text-sm">
        <span className="font-semibold">Current Week:</span> {week || "—"}
      </div>

      {/* Player search */}
      <div className="mb-6">
        <PlayerAutocomplete onSelect={handleSelect} />
      </div>

      {/* Selected player card */}
      {player && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-200 dark:border-gray-700 max-w-3xl">
          <div className="flex items-center gap-4 border-b border-gray-300 dark:border-gray-700 pb-3 mb-3">
            {player.headshot && (
              <img
                src={player.headshot}
                alt={player.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold">{player.name}</h2>
              <p className="text-sm text-gray-400">
                {player.team} • {player.position}
              </p>
            </div>
          </div>

          {/* Matchup Info */}
          <div className="grid grid-cols-5 gap-3 text-sm text-gray-300">
            <div>
              <span className="font-semibold text-gray-400">Opponent:</span>{" "}
              {matchup?.opponent ?? "TBD"}
            </div>
            <div>
              <span className="font-semibold text-gray-400">Spread:</span>{" "}
              {matchup?.spread ?? "N/A"}
            </div>
            <div>
              <span className="font-semibold text-gray-400">Weather:</span>{" "}
              {matchup
                ? `${matchup.temp}°F, Wind ${matchup.wind} mph`
                : "N/A"}
            </div>
            <div>
              <span className="font-semibold text-gray-400">Implied Pts:</span>{" "}
              {matchup?.impliedPts ?? "—"}
            </div>
            <div>
              <span className="font-semibold text-gray-400">Score:</span>{" "}
              {calculateStreamerScore({
                targetShare: 0.5,
                snapShare: 0.6,
                redZone: 0.3,
                weather: 0.8,
                spread: 0.4,
                total: 0.6,
                recentForm: 0.7,
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal for weights panel */}
      {openWeights && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl w-[400px]">
            <div className="flex justify-between items-center p-3 border-b border-gray-700">
              <h3 className="font-semibold">Adjust Scoring Weights</h3>
              <button onClick={() => setOpenWeights(false)}>✖</button>
            </div>
            <WeightsPanel />
          </div>
        </div>
      )}
    </div>
  );
}
