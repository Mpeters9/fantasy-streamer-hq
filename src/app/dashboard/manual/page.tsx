"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import PlayerAutocomplete from "@/components/player-autocomplete";
import { calculateStreamerScore } from "@/lib/scoring-engine";

interface Player {
  id?: string;
  name: string;
  team: string;
  position: string;
  opponent?: string;
  spread?: number;
  tempF?: number;
  windMph?: number;
  condition?: string;
  score?: number;
  tier?: string;
}

export default function ManualPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [odds, setOdds] = useState<any[]>([]);
  const [weather, setWeather] = useState<any[]>([]);
  const [week, setWeek] = useState<number>(0);

  // 🔄 Load week + odds + weather
  useEffect(() => {
    (async () => {
      try {
        const weekRes = await fetch("/api/cron/week");
        const weekData = await weekRes.json();
        setWeek(weekData.week || 0);

        const oddsRes = await fetch("/api/cron/odds");
        const oddsData = await oddsRes.json();
        setOdds(oddsData.data || []);

        const weatherRes = await fetch("/api/cron/weather");
        const weatherData = await weatherRes.json();
        setWeather(weatherData.data || []);
      } catch (err) {
        console.error("❌ Initial load failed:", err);
      }
    })();
  }, []);

  const handleSelectPlayer = (p: Player) => {
    console.log("🎯 Selected player:", p);

    const match = odds.find(
      (o) =>
        o.homeTeam.toLowerCase() === p.team.toLowerCase() ||
        o.awayTeam.toLowerCase() === p.team.toLowerCase()
    );

    let opponent = "N/A";
    let spread = null;
    if (match) {
      const isHome = match.homeTeam.toLowerCase() === p.team.toLowerCase();
      opponent = isHome ? match.awayTeam : match.homeTeam;
      spread = isHome ? match.spread : match.spread * -1;
    }

    const w = weather.find(
      (w) => w.team.toLowerCase() === p.team.toLowerCase()
    );

    const playerData: Player = {
      ...p,
      opponent,
      spread,
      tempF: w?.tempF,
      windMph: w?.windMph,
      condition:
        w?.condition === 0
          ? "Clear"
          : w?.condition === 3
          ? "Rain"
          : "Other",
    };

    const { score, tier } = calculateStreamerScore(playerData);
    setPlayers((prev) => [...prev, { ...playerData, score, tier }]);
  };

  const handleForceRefresh = async () => {
    try {
      console.log("🔁 Forcing refresh...");
      const weekRes = await fetch("/api/cron/week");
      const weekData = await weekRes.json();
      setWeek(weekData.week || 0);

      const oddsRes = await fetch("/api/cron/odds");
      const oddsData = await oddsRes.json();
      setOdds(oddsData.data || []);

      const weatherRes = await fetch("/api/cron/weather");
      const weatherData = await weatherRes.json();
      setWeather(weatherData.data || []);

      console.log("✅ Refreshed data successfully");
    } catch (err) {
      console.error("❌ Refresh failed:", err);
    }
  };

  const getTierColor = (tier: string | undefined) => {
    switch (tier) {
      case "S": return "bg-green-600 text-white";
      case "A": return "bg-blue-600 text-white";
      case "B": return "bg-yellow-500 text-black";
      case "C": return "bg-purple-600 text-white";
      case "D": return "bg-red-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  return (
    <div className="p-6 space-y-6 min-h-screen bg-neutral-900 text-neutral-50">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Fantasy Streamer HQ</h1>
        <div className="flex items-center gap-4">
          <span className="text-lg">🏈 Week {week || "–"}</span>
          <Button
            onClick={handleForceRefresh}
            className="bg-amber-500 hover:bg-amber-600 text-black"
          >
            Force Data Refresh
          </Button>
        </div>
      </div>

      <Card className="bg-neutral-800 border border-neutral-700 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-white">Add Player</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerAutocomplete onSelect={handleSelectPlayer} />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((p, i) => (
          <Card key={i} className="bg-neutral-800 border border-neutral-700 shadow-lg">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-white">
                {p.name} ({p.position})
              </CardTitle>
              <span
                className={`px-3 py-1 rounded-full text-sm font-bold ${getTierColor(p.tier)}`}
              >
                {p.tier}
              </span>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-neutral-200">
              <p><strong>Team:</strong> {p.team}</p>
              <p><strong>Opponent:</strong> {p.opponent}</p>
              <p><strong>Spread:</strong> {p.spread ? `${p.spread > 0 ? "+" : ""}${p.spread}` : "N/A"}</p>
              <p><strong>Weather:</strong> {p.condition} ({p.tempF?.toFixed(1)}°F, {p.windMph?.toFixed(1)} mph)</p>
              <p><strong>Streamer Score:</strong> <span className="font-bold text-amber-400">{p.score}</span></p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
