"use client";
import React, { useState, useEffect } from "react";
import PlayerAutocomplete from "@/components/player-autocomplete";
import { calculateStreamerScore } from "@/lib/scoring-engine";

export default function PlayerComparePage() {
  const [week, setWeek] = useState<number>(0);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<any[]>([]);
  const [odds, setOdds] = useState<any[]>([]);
  const [weather, setWeather] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const d = await fetch("/api/cron/sync", { cache: "no-store" }).then((r) => r.json());
      setWeek(d.week || 0);
      setPlayers(d.players || []);
      setOdds(d.odds || []);
      setWeather(d.weather || []);
      setSchedule(d.schedule || []);
    };
    load();
  }, []);

  const handleSelect = (p: any) => {
    if (selectedPlayers.find((sp) => sp.id === p.id)) return;
    setSelectedPlayers([...selectedPlayers, p]);
  };

  const removePlayer = (id: string) =>
    setSelectedPlayers(selectedPlayers.filter((p) => p.id !== id));

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

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Player Comparison Tool</h1>
        <p className="text-sm text-gray-400">Week {week}</p>
      </div>

      <div className="mb-6">
        <PlayerAutocomplete onSelect={handleSelect} />
      </div>

      {selectedPlayers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-700 text-sm rounded-lg overflow-hidden">
            <thead className="bg-gray-200 dark:bg-gray-800">
              <tr>
                <th className="p-2 border border-gray-700">Player</th>
                <th className="p-2 border border-gray-700">Team</th>
                <th className="p-2 border border-gray-700">Opponent</th>
                <th className="p-2 border border-gray-700">Spread</th>
                <th className="p-2 border border-gray-700">Weather</th>
                <th className="p-2 border border-gray-700">Implied Pts</th>
                <th className="p-2 border border-gray-700">Score</th>
                <th className="p-2 border border-gray-700">Remove</th>
              </tr>
            </thead>
            <tbody>
              {selectedPlayers.map((p) => {
                const matchup = getOpponentData(p.team);
                const score = calculateStreamerScore({
                  targetShare: 0.5,
                  snapShare: 0.6,
                  redZone: 0.3,
                  weather: 0.8,
                  spread: 0.4,
                  total: 0.6,
                  recentForm: 0.7,
                });

                return (
                  <tr key={p.id} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                    <td className="p-2 border border-gray-700 font-medium flex items-center gap-2">
                      {p.headshot && (
                        <img
                          src={p.headshot}
                          alt={p.name}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      {p.name} <span className="text-xs text-gray-400">{p.position}</span>
                    </td>
                    <td className="p-2 border border-gray-700">{p.team}</td>
                    <td className="p-2 border border-gray-700">{matchup?.opponent ?? "TBD"}</td>
                    <td className="p-2 border border-gray-700">{matchup?.spread ?? "N/A"}</td>
                    <td className="p-2 border border-gray-700">
                      {matchup
                        ? `${matchup.temp}°F, ${matchup.wind} mph`
                        : "N/A"}
                    </td>
                    <td className="p-2 border border-gray-700">{matchup?.impliedPts ?? "—"}</td>
                    <td className="p-2 border border-gray-700 font-semibold">{score}</td>
                    <td className="p-2 border border-gray-700 text-center">
                      <button
                        onClick={() => removePlayer(p.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700"
                      >
                        ✖
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-gray-500 text-center mt-8">
          Search for players above to start comparing.
        </div>
      )}
    </div>
  );
}
