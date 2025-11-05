"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
}

interface ManualStat {
  playerName: string;
  position: string;
  team: string;
  [key: string]: string | number | undefined;
}

export default function ManualDataPage() {
  const [stats, setStats] = useState<ManualStat[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Player[]>([]);
  const [newEntry, setNewEntry] = useState<ManualStat>({
    playerName: "",
    position: "",
    team: "",
  });

  // Load ESPN player list
  useEffect(() => {
    fetch("/api/cron/players")
      .then((r) => r.json())
      .then((d) => setPlayers(d.data || []));
  }, []);

  // Search filter
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
        .slice(0, 6)
    );
  }, [search, players]);

  const selectPlayer = (p: Player) => {
    setNewEntry({ playerName: p.name, position: p.position, team: p.team });
    setSearch("");
    setFiltered([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
  };

  const addEntry = () => {
    if (!newEntry.playerName) return alert("Select a player first!");
    setStats([...stats, newEntry]);
    setNewEntry({ playerName: "", position: "", team: "" });
  };

  const saveAll = async () => {
    await fetch("/api/manual-stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stats),
    });
    alert("✅ Saved!");
  };

  const renderInputs = () => {
    const pos = newEntry.position;
    const inputClass = "bg-gray-800 text-gray-100";
    const make = (name: string, placeholder: string) => (
      <Input
        key={name}
        name={name}
        placeholder={placeholder}
        type="text"
        onChange={handleChange}
        className={inputClass}
      />
    );

    if (pos === "QB")
      return (
        <>
          {make("fantasyPointsLast3", "FP Last 3")}
          {make("passAttempts", "Pass Att/G")}
          {make("deepAttempts", "Deep Att/G")}
          {make("rushYardsPerGame", "Rush Yds/G")}
          {make("oppRankQB", "Opp Rank vs QB")}
          {make("oppExplosivePass", "Explosive Pass % (Opp)")}
        </>
      );

    if (pos === "RB")
      return (
        <>
          {make("fantasyPointsLast3", "FP Last 3")}
          {make("rushShare", "Rush Share %")}
          {make("targetShare", "Target %")}
          {make("snapShare", "Snap %")}
          {make("redZoneTouches", "Red Zone Touches")}
          {make("goalLineCarries", "Goal Line Carries")}
          {make("oppExplosiveRush", "Explosive Rush % (Opp)")}
          {make("twoMinRole", "Two-Min Role (Y/N)")}
          {make("thirdDownRole", "3rd Down Role (Y/N)")}
        </>
      );

    if (pos === "WR")
      return (
        <>
          {make("fantasyPointsLast3", "FP Last 3")}
          {make("targetShare", "Target %")}
          {make("airYards", "Air Yards")}
          {make("aDOT", "aDOT")}
          {make("redZoneTargets", "Red Zone Targets")}
          {make("firstReadShare", "1st Read Share %")}
          {make("yardsPerRouteRun", "Yds/Route Run")}
          {make("snapShare", "Snap %")}
        </>
      );

    if (pos === "TE")
      return (
        <>
          {make("fantasyPointsLast3", "FP Last 3")}
          {make("routeShare", "Route %")}
          {make("targetShare", "Target %")}
          {make("redZoneTargets", "Red Zone Targets")}
          {make("yardsPerRouteRun", "Yds/Route Run")}
        </>
      );

    // Default empty or placeholder
    return <p className="text-gray-400 italic">Select a player to enter stats.</p>;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="bg-gray-900 text-gray-100 border border-gray-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-400">
            Manual Data Entry
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Player Search */}
          <div className="relative">
            <Input
              placeholder="Search player..."
              value={search || newEntry.playerName}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-800 text-gray-100"
            />
            {filtered.length > 0 && (
              <div className="absolute bg-gray-800 border border-gray-700 rounded mt-1 w-full max-h-48 overflow-y-auto z-10">
                {filtered.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => selectPlayer(p)}
                    className="p-2 cursor-pointer hover:bg-gray-700"
                  >
                    {p.name}{" "}
                    <span className="text-gray-400">
                      ({p.team} – {p.position})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {renderInputs()}
          </div>

          <Button
            onClick={addEntry}
            className="bg-green-600 hover:bg-green-500 text-white w-full md:w-auto"
          >
            ➕ Add Player
          </Button>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm mt-4 border border-gray-800">
              <thead className="bg-gray-800 text-gray-300">
                <tr>
                  <th className="p-2 text-left">Player</th>
                  <th>Pos</th>
                  <th>Team</th>
                  <th>FP Last 3</th>
                  <th>Key Metrics</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s, i) => (
                  <tr
                    key={i}
                    className="border-t border-gray-800 hover:bg-gray-800/40 transition"
                  >
                    <td className="p-2">{s.playerName}</td>
                    <td>{s.position}</td>
                    <td>{s.team}</td>
                    <td>{s.fantasyPointsLast3 ?? "-"}</td>
                    <td>
                      {Object.entries(s)
                        .filter(
                          ([k]) =>
                            !["playerName", "position", "team", "fantasyPointsLast3"].includes(k)
                        )
                        .map(([k, v]) => (
                          <div key={k} className="text-xs text-gray-300">
                            {k}: <span className="text-gray-100">{v ?? "-"}</span>
                          </div>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button
            onClick={saveAll}
            className="bg-blue-600 hover:bg-blue-500 text-white w-full mt-4"
          >
            💾 Save Manual Stats
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
