// src/app/dashboard/manual/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { namesMatch, normAbbr } from "@/lib/constants";
import { calculateScores } from "@/lib/scoring-engine";

type Player = {
  id: string;
  name: string;
  position: string; // QB RB WR TE K DST
  team: string;     // Abbr like DAL
};

type Game = {
  week: number;
  homeTeam: string;
  homeAbbr: string;
  awayTeam: string;
  awayAbbr: string;
  total: number | null;
  spread: number | null; // favorite’s spread (negative)
  venue: string | null;
  isDome: boolean;
  start: string | null;
};

type Weather = {
  team: string;    // Abbr
  tempF: number;
  windMph: number;
  condition: number | string;
};

export default function ManualPage() {
  const [week, setWeek] = useState<number>(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [schedule, setSchedule] = useState<Game[]>([]);
  const [weather, setWeather] = useState<Weather[]>([]);
  const [manualStats, setManualStats] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Player[]>([]);
  const [selected, setSelected] = useState<any[]>([]);
  const [mode, setMode] = useState<"streamer" | "ros">("streamer");
  const [loading, setLoading] = useState(false);

  // Load cache (week + schedule + players + weather)
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/cron/sync");
        const d = await r.json();
        setWeek(d.week || 0);
        setSchedule(d.schedule || []);
        setPlayers(d.players || []);
        setWeather(d.weather || []);
        console.log("✅ Fetched data:", d);
      } catch (e) {
        console.error("❌ Initial load failed:", e);
      }
    })();
  }, []);

  // Load manual stats
  useEffect(() => {
    fetch("/api/manual-stats")
      .then((r) => r.json())
      .then((d) => setManualStats(d.data || []))
      .catch(() => {});
  }, []);

  // Filter autocomplete
  useEffect(() => {
    if (!search) return setFiltered([]);
    const s = search.toLowerCase();
    setFiltered(
      players
        .filter(
          (p) =>
            p.name.toLowerCase().includes(s) ||
            p.team.toLowerCase().includes(s) ||
            p.position.toLowerCase().includes(s)
        )
        .slice(0, 12)
    );
  }, [search, players]);

  const weatherByTeam = useMemo(() => {
    const map = new Map<string, Weather>();
    weather.forEach((w) => map.set(normAbbr(w.team), w));
    return map;
  }, [weather]);

  const findGame = (teamAbbr: string): Game | undefined => {
    const abbr = normAbbr(teamAbbr);
    return schedule.find(
      (g) => normAbbr(g.homeAbbr) === abbr || normAbbr(g.awayAbbr) === abbr
    );
  };

  const deriveMatchup = (teamAbbr: string) => {
    const g = findGame(teamAbbr);
    if (!g) return { opponent: "TBD", isHome: false, spread: null, total: null, implied: null, isDome: false };

    const abbr = normAbbr(teamAbbr);
    const isHome = normAbbr(g.homeAbbr) === abbr;
    const opponent = isHome ? g.awayAbbr : g.homeAbbr;

    // Flip favorite spread to the player’s team perspective.
    // If ESPN spread is the favorite's negative: 
    //   - For favorite team: spread stays (negative)
    //   - For underdog team: spread -> positive of abs
    let spread: number | null = null;
    if (typeof g.spread === "number") {
      const favoriteIsHome = g.spread < 0; // ESPN negative spread typically indicates the favorite side
      const playerIsFavorite = (favoriteIsHome && isHome) || (!favoriteIsHome && !isHome);
      spread = playerIsFavorite ? g.spread : Math.abs(g.spread);
    }

    const total = typeof g.total === "number" ? g.total : null;

    // Implied points (simple approximation if total+spread present)
    let implied: number | null = null;
    if (total !== null && spread !== null) {
      // If spread is negative, player is favorite -> implied = total/2 - spread/2
      // If spread is positive, player is underdog -> implied = total/2 - (+spread)/2 == total/2 - spread/2
      implied = +(total / 2 - spread / 2).toFixed(1);
    }

    return {
      opponent,
      isHome,
      spread,
      total,
      implied,
      isDome: !!g.isDome,
    };
  };

  const selectPlayer = (p: Player) => {
    const m = deriveMatchup(p.team);
    const w = weatherByTeam.get(normAbbr(p.team));
    setSelected((prev) => [
      ...prev,
      {
        ...p,
        opponent: m.opponent,
        isHome: m.isHome,
        spread: m.spread,
        total: m.total,
        impliedPts: m.implied,
        isDome: m.isDome,
        weather: w
          ? `${Math.round(w.tempF)}°F, wind ${Math.round(w.windMph)} mph, code ${w.condition}`
          : "N/A",
      },
    ]);
    setSearch("");
    setFiltered([]);
  };

  const removePlayer = (idx: number) => {
    setSelected((prev) => prev.filter((_, i) => i !== idx));
  };

  const forceRefresh = async () => {
    setLoading(true);
    try {
      // re-sync (which pulls live week, then that week’s schedule)
      const d = await fetch("/api/cron/sync", { cache: "no-store" }).then((r) => r.json());
      setWeek(d.week || 0);
      setSchedule(d.schedule || []);
      setPlayers(d.players || []);
      setWeather(d.weather || []);
      alert(`✅ Synced Week ${d.week}`);
    } catch (e) {
      alert("❌ Refresh failed");
    } finally {
      setLoading(false);
    }
  };

  const getStats = (name: string) =>
    manualStats.find((m) => m.playerName === name) || {};

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-blue-400">
          Waiver Dashboard — Week {week}
        </h1>
        <div className="flex gap-3">
          <Button onClick={forceRefresh} disabled={loading}>
            {loading ? "🔄 Refreshing..." : "♻️ Force Data Refresh"}
          </Button>
          <Button onClick={() => setMode((m) => (m === "streamer" ? "ros" : "streamer"))}>
            {mode === "streamer" ? "Switch to ROS" : "Switch to Streamer"}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search player…"
          className="bg-gray-800 text-gray-100"
        />
        {!!filtered.length && (
          <div className="absolute z-20 w-full bg-gray-900 border border-gray-700 rounded mt-1 max-h-64 overflow-y-auto">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="p-2 hover:bg-gray-700 cursor-pointer"
                onClick={() => selectPlayer(p)}
              >
                {p.name} <span className="text-gray-400">({p.team} — {p.position})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {selected.map((p, idx) => {
          const ms = getStats(p.name);
          const score = calculateScores({
            position: p.position,
            fantasyPointsLast3: Number(ms.fantasyPointsLast3 || 0),
            targetShare: Number(ms.targetShare || 0),
            snapShare: Number(ms.snapShare || 0),
            yardsPerRouteRun: Number(ms.yardsPerRouteRun || 0),
            totalPoints: Number(p.total ?? 45),
          });

          const tier =
            mode === "streamer" ? score.tierStreamer : score.tierROS;
          const badge =
            tier === "S" ? "🟩 S" :
            tier === "A" ? "🟩 A" :
            tier === "B" ? "🟨 B" :
            tier === "C" ? "🟨 C" :
            "🟥 D";

          return (
            <Card key={`${p.name}-${idx}`} className="bg-gray-800/60 border border-gray-700 text-gray-100">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center justify-between w-full">
                  <span>{p.name} ({p.team} — {p.position})</span>
                  <span className="text-xs px-2 py-1 bg-gray-700 rounded">
                    {mode === "streamer" ? "Streamer Mode" : "ROS Mode"} • {badge}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div><b>Opponent:</b> {p.opponent}</div>
                <div><b>Spread:</b> {p.spread ?? "—"}</div>
                <div><b>Total:</b> {p.total ?? "—"}</div>
                <div><b>Implied Pts:</b> {p.impliedPts ?? "—"}</div>
                <div><b>Dome:</b> {p.isDome ? "Yes" : "No"}</div>
                <div><b>Weather:</b> {p.weather}</div>
                <div className="pt-2 border-t border-gray-700">
                  <b>Score:</b>{" "}
                  {mode === "streamer"
                    ? score.streamerScore.toFixed(1)
                    : score.rosScore.toFixed(1)}{" "}
                  <span className="opacity-80">({tier})</span>
                </div>
                <div className="pt-1 text-xs text-gray-400">
                  ({mode === "streamer" ? "Last 3 + matchup weight" : "Last 3 + skill/stable weight"})
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    className="bg-red-600 px-2 py-1 rounded"
                    onClick={() => removePlayer(idx)}
                  >
                    Remove
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
