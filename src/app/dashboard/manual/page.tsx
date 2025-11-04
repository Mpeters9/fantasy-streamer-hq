"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import PlayerAutocomplete from "@/components/player-autocomplete";

interface PlayerRow {
  id: string;
  name: string;
  team: string;
  position: string;
  opponent?: string;
  spread?: number | null;
  weather?: string;
  impliedPts?: number | null;
  stats?: string;
  score?: number;
  tier?: string;
}

export default function ManualPage() {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [week, setWeek] = useState<number>(0);
  const [stats, setStats] = useState<any[]>([]);

  // ░░ INITIAL LOAD ░░
  useEffect(() => {
    const init = async () => {
      try {
        const w = await fetch("/api/cron/week", { cache: "no-store" });
        const wd = await w.json();
        setWeek(wd?.week || 0);

        const s = localStorage.getItem("fshq_players");
        if (s) setPlayers(JSON.parse(s));

        // preload stats
        const res = await fetch("/api/cron/stats", { cache: "no-store" });
        const data = await res.json();
        console.log("📊 Loaded stats:", data.count);
        setStats(data.data || []);
      } catch (err) {
        console.error("❌ Initial load failed:", err);
      }
    };
    init();
  }, []);

  // ░░ SAVE LOCAL ░░
  useEffect(() => {
    if (players.length)
      localStorage.setItem("fshq_players", JSON.stringify(players));
  }, [players]);

  // ░░ ADD PLAYER ░░
  const addPlayer = (p: PlayerRow) => {
    if (players.some((x) => x.name === p.name)) return;
    const statLine = findStatLine(p);
    setPlayers([
      ...players,
      { ...p, stats: statLine, score: 0, tier: "Unranked" },
    ]);
  };

  // ░░ FIND PLAYER STATS ░░
  const findStatLine = (p: PlayerRow): string => {
    if (!stats?.length) return "N/A";
    const match = stats.find(
      (s) =>
        s.name?.toLowerCase() === p.name.toLowerCase() &&
        s.team === p.team
    );
    if (!match) return "N/A";

    const pos = match.position;
    if (pos === "QB")
      return `Pass Yds ${match.passYds ?? 0} TD ${match.passTD ?? 0} INT ${match.int ?? 0} Rush ${match.rushYds ?? 0}`;
    if (pos === "RB")
      return `Rush ${match.rushYds ?? 0} yds / ${match.rushAtt ?? 0} att  Rec ${match.rec ?? 0} (${match.recYds ?? 0})`;
    if (pos === "WR" || pos === "TE")
      return `Rec ${match.rec ?? 0} (${match.recYds ?? 0}) TD ${match.recTD ?? 0}`;
    if (pos === "K")
      return `FG ${match.fgMade ?? 0}-${match.fgMiss ?? 0} XP ${match.xpMade ?? 0}`;
    if (pos === "DST")
      return `Sacks ${match.sacks ?? 0} INT ${match.defInt ?? 0} TD ${match.defTD ?? 0}`;
    return "N/A";
  };

  // ░░ REMOVE ░░
  const removePlayer = (id: string) =>
    setPlayers(players.filter((p) => p.id !== id));

  // ░░ REFRESH ░░
  const handleRefresh = async () => {
    console.log("🔁 Force refresh triggered…");
    const res = await fetch("/api/cron/stats", { cache: "no-store" });
    const data = await res.json();
    setStats(data.data || []);
    console.log("✅ Refreshed stats:", data.count);
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        stats: findStatLine(p),
      }))
    );
  };

  // ░░ VISUALS ░░
  const posAccent = (pos: string) =>
    ({
      QB: "border-sky-500",
      RB: "border-emerald-500",
      WR: "border-violet-500",
      TE: "border-amber-400",
      K: "border-rose-400",
      DST: "border-gray-500",
    }[pos] || "border-gray-600");

  const scoreColor = (s?: number) =>
    s == null
      ? "text-gray-300"
      : s >= 85
      ? "text-red-400"
      : s >= 70
      ? "text-orange-300"
      : s >= 55
      ? "text-yellow-300"
      : "text-gray-300";

  return (
    <div className="min-h-screen bg-[#0b0d12] text-gray-100 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
            📈 Manual Waiver Dashboard
          </h1>
          <div className="flex gap-2">
            <PlayerAutocomplete onSelect={addPlayer} />
            <Button
              onClick={handleRefresh}
              className="bg-sky-600 hover:bg-sky-700 text-white"
            >
              🔄 Force Data Refresh
            </Button>
          </div>
        </div>

        <div className="text-gray-400 text-sm">
          Current Week:{" "}
          <span className="font-semibold text-sky-400">Week {week || "…"}</span>
        </div>

        {/* cards */}
        <div className="space-y-5">
          {players.map((p) => (
            <Card
              key={p.id}
              className={`relative bg-gradient-to-br from-[#1c1f28] to-[#101218] border-l-4 ${posAccent(
                p.position
              )} border-gray-800 rounded-xl hover:shadow-lg hover:shadow-sky-500/10 transition-all`}
            >
              <CardHeader className="flex justify-between items-center border-b border-gray-800/60">
                <CardTitle className="flex justify-between w-full text-lg font-semibold text-white">
                  <span>
                    {p.name}{" "}
                    <span className="text-gray-400">
                      ({p.team} – {p.position})
                    </span>
                  </span>
                  <button
                    onClick={() => removePlayer(p.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs rounded-md"
                  >
                    ✕
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm pt-3">
                <div>
                  <span className="text-gray-400 font-medium">Opponent:</span>{" "}
                  <span className="text-white">{p.opponent || "TBD"}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Spread:</span>{" "}
                  <span className="text-white">
                    {p.spread != null ? p.spread : "N/A"}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-400 font-medium">Last Game:</span>{" "}
                  <span className="text-white">{p.stats || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Score:</span>{" "}
                  <span className={`font-semibold ${scoreColor(p.score)}`}>
                    {p.score ?? 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          {!players.length && (
            <div className="text-gray-500 italic text-center py-10">
              No players added yet — search above to start building your waiver list.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
