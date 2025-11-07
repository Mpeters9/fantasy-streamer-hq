"use client";
import React, { useEffect, useMemo, useState } from "react";

type Player = {
  id?: string;
  name: string;
  team: string;
  position: string;
  headshot?: string;
  opponent?: string;
  spread?: number | string;
  impliedPts?: number | string;
  weather?: string;
  streamerScore?: number;
};

export default function ManualDashboard() {
  const [week, setWeek] = useState<number | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Idle");
  const [mode, setMode] = useState<"weekly" | "ros">("weekly");
  const [loading, setLoading] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  const safeHeadshot = (url?: string) => {
    if (!url) return "https://a.espncdn.com/i/headshots/nophoto.png";
    if (url.includes("404") || url.includes("undefined")) return "https://a.espncdn.com/i/headshots/nophoto.png";
    return url;
  };

  const fetchScoring = async (m: "weekly" | "ros") => {
    const r = await fetch(`/api/scoring?mode=${m}`, { cache: "no-store" });
    if (!r.ok) throw new Error("scoring failed");
    return r.json();
  };

  const fetchPlayersFallback = async () => {
    const r = await fetch("/api/cron/players", { cache: "no-store" });
    if (!r.ok) throw new Error("players failed");
    const j = await r.json();
    const list = Array.isArray(j.data) ? j.data : Array.isArray(j.players) ? j.players : [];
    return { week: j.week ?? null, data: list };
  };

  const load = async (m = mode) => {
    if (loading) return;
    setLoading(true);
    try {
      const js = await fetchScoring(m);
      if (js?.status === "success" && Array.isArray(js.data)) {
        setPlayers(js.data);
        setWeek(js.week ?? null);
        setStatus(`✅ ${m.toUpperCase()} • Week ${js.week ?? "-"}`);
      } else throw new Error("bad scoring payload");
    } catch {
      try {
        const fb = await fetchPlayersFallback();
        setPlayers(fb.data);
        setWeek(fb.week);
        setStatus("⚠️ fallback players only");
      } catch {
        setPlayers([]);
        setStatus("❌ load failed");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer = setTimeout(() => load(), 300);
    return () => clearTimeout(timer);
  }, [mode]);

  const filtered = useMemo(() => {
    if (!search || search.length < 2) return players.slice(0, 30);
    return players.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()));
  }, [players, search]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">🧠 Manual Dashboard</h1>
          <p className="text-gray-400 text-sm">{status}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "weekly" | "ros")}
            className="bg-gray-900 border border-gray-800 rounded px-2 py-2"
          >
            <option value="weekly">Weekly</option>
            <option value="ros">Rest of Season</option>
          </select>
          <button
            disabled={loading}
            onClick={() => load()}
            className={`px-3 py-2 rounded ${loading ? "bg-gray-700" : "bg-blue-600 hover:bg-blue-700"} text-white`}
          >
            {loading ? "Syncing…" : "🔁 Refresh"}
          </button>
        </div>
      </header>

      <div className="bg-gray-900/60 border border-gray-800 p-4 rounded">
        <input
          type="text"
          placeholder="Search player…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <div key={`${p.id || p.name}-${i}`} className="bg-gray-900 border border-gray-800 rounded-lg p-4 shadow space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={safeHeadshot(p.headshot)}
                  alt={p.name}
                  className="w-14 h-14 rounded-full border border-gray-800"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://a.espncdn.com/i/headshots/nophoto.png";
                    setErrorCount((prev) => prev + 1);
                  }}
                />
                <div>
                  <h2 className="text-lg font-semibold">{p.name}</h2>
                  <p className="text-gray-400 text-sm">
                    {p.team} • {p.position}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>Opponent: <span className="text-gray-300">{p.opponent ?? "-"}</span></p>
                <p>Spread: <span className="text-gray-300">{p.spread ?? "-"}</span></p>
                <p>Implied: <span className="text-gray-300">{p.impliedPts ?? "-"}</span></p>
                <p>Weather: <span className="text-gray-300">{p.weather ?? "-"}</span></p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-blue-400">⭐ {p.streamerScore ?? 0}</p>
                <span className="text-xs px-2 py-1 rounded bg-gray-800 border border-gray-700">
                  {mode.toUpperCase()} {week ? `• W${week}` : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No players found.</p>
      )}
    </div>
  );
}
