"use client";
import React, { useEffect, useState } from "react";

export default function WaiverDashboard() {
  const [mode, setMode] = useState<"weekly" | "ros">("weekly");
  const [position, setPosition] = useState("ALL");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/waivers?mode=${mode}&pos=${position}`);
      const json = await res.json();
      setData(json.data || []);
    } catch (e) {
      console.error("Waiver load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadWeek = async () => {
    try {
      const res = await fetch("/api/cron/week");
      const json = await res.json();
      setWeek(json.week || null);
    } catch (e) {
      console.error("Week load failed:", e);
    }
  };

  useEffect(() => {
    loadWeek();
    loadData();
  }, [mode, position]);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 text-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-4">
        📊 Waiver Rankings {week ? `(Week ${week})` : ""}
      </h1>

      <div className="flex gap-4 mb-6">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as any)}
          className="bg-gray-800 text-white rounded px-3 py-1"
        >
          <option value="weekly">Weekly Streamers</option>
          <option value="ros">Rest of Season</option>
        </select>

        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="bg-gray-800 text-white rounded px-3 py-1"
        >
          <option value="ALL">All</option>
          <option value="QB">QB</option>
          <option value="RB">RB</option>
          <option value="WR">WR</option>
          <option value="TE">TE</option>
        </select>

        <button
          onClick={loadData}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white"
        >
          🔁 Refresh Rankings
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : data.length === 0 ? (
        <p className="text-gray-400">No rankings available. Sync data first.</p>
      ) : (
        <table className="min-w-full text-sm border border-gray-700">
          <thead className="bg-gray-300 dark:bg-gray-800">
            <tr>
              <th className="p-2 border border-gray-700">#</th>
              <th className="p-2 border border-gray-700">Player</th>
              <th className="p-2 border border-gray-700">Team</th>
              <th className="p-2 border border-gray-700">Pos</th>
              <th className="p-2 border border-gray-700">FP Last 3</th>
              <th className="p-2 border border-gray-700">Snap%</th>
              <th className="p-2 border border-gray-700">Target%</th>
              <th className="p-2 border border-gray-700">Spread</th>
              <th className="p-2 border border-gray-700">Weather</th>
              <th className="p-2 border border-gray-700">Score</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p, i) => (
              <tr
                key={p.id || i}
                className={`hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  i < 3 ? "text-yellow-300 font-semibold" : ""
                }`}
              >
                <td className="p-2 border border-gray-700">{i + 1}</td>
                <td className="p-2 border border-gray-700">{p.name}</td>
                <td className="p-2 border border-gray-700">{p.team}</td>
                <td className="p-2 border border-gray-700">{p.position}</td>
                <td className="p-2 border border-gray-700">{p.fpLast3}</td>
                <td className="p-2 border border-gray-700">{p.snap}%</td>
                <td className="p-2 border border-gray-700">{p.target}%</td>
                <td className="p-2 border border-gray-700">{p.spread}</td>
                <td className="p-2 border border-gray-700">{p.weather}</td>
                <td className="p-2 border border-gray-700 font-bold">{p.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
