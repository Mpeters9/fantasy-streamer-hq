"use client";
import React, { useState } from "react";


export default function CronDashboard() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any | null>(null);

  const runAll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cron/runAll", { cache: "no-store" });
      const json = await res.json();
      setData(json.merged);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-400">🏈 Fantasy Streamer HQ — Live Data Dashboard</h1>

      <button
        onClick={runAll}
        disabled={loading}
        className={`px-6 py-3 rounded-lg font-semibold transition ${
          loading ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Fetching..." : "Run All Cron Jobs"}
      </button>

      {data && (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Rankings */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-xl font-semibold mb-3 text-yellow-400">🏆 Power Rankings</h2>
            <ul className="space-y-1 text-sm">
              {data.rankings?.slice(0, 10).map((team: any) => (
                <li key={team.rank} className="flex justify-between border-b border-gray-800 py-1">
                  <span>{team.rank}. {team.team}</span>
                  <span className="text-gray-400">{team.record}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Weather */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-xl font-semibold mb-3 text-sky-400">🌤️ Game Weather</h2>
            <ul className="space-y-1 text-sm">
              {data.weather?.data?.length
                ? data.weather.data.map((w: any, i: number) => (
                    <li key={i} className="flex justify-between border-b border-gray-800 py-1">
                      <span>{w.team}</span>
                      <span className="text-gray-400">
                        {w.tempF}°F / {w.windMph} mph
                      </span>
                    </li>
                  ))
                : <p className="text-gray-500">No weather data available.</p>}
            </ul>
          </section>

          {/* Odds */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-xl font-semibold mb-3 text-green-400">💰 Vegas Odds</h2>
            <ul className="space-y-1 text-sm">
              {Object.values(data.odds || {}).slice(0, 10).map((o: any, i) => (
                <li key={i} className="flex justify-between border-b border-gray-800 py-1">
                  <span>OU: {o.overUnder}</span>
                  <span className="text-gray-400">{o.homeMoneyLine}/{o.awayMoneyLine}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Streamers */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-5 md:col-span-2 lg:col-span-3">
            <h2 className="text-xl font-semibold mb-3 text-pink-400">🧠 Streamer Suggestions</h2>
            {data.streamers?.data?.length ? (
              <ul className="text-sm space-y-1">
                {data.streamers.data.map((s: any, i: number) => (
                  <li key={i} className="border-b border-gray-800 py-1 flex justify-between">
                    <span>{s.name}</span>
                    <span className="text-gray-400">{s.reason}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Streamer engine active — awaiting player stats input.</p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
