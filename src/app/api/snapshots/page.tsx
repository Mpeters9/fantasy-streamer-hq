"use client";
import React, { useEffect, useState } from "react";

export default function WeeklySnapshots() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/snapshots").then((r) => r.json());
        setData(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6 text-gray-400">Loading snapshots…</div>;

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-100">
      <h1 className="text-2xl font-semibold mb-4">Weekly Snapshots</h1>

      {data.length === 0 && (
        <p className="text-gray-400">No snapshots yet — force-refresh on Dashboard to create one.</p>
      )}

      {data.map((s) => (
        <div
          key={s.week}
          className="mb-4 border border-gray-700 rounded-lg p-4 bg-gray-800 shadow"
        >
          <div className="flex justify-between mb-2">
            <h2 className="font-bold text-lg">Week {s.week}</h2>
            <span className="text-sm text-gray-400">Saved {new Date(s.savedAt).toLocaleString()}</span>
          </div>

          <details className="cursor-pointer">
            <summary className="text-sm text-blue-400 hover:text-blue-300">
              View Top 5 Streamers (Score sample)
            </summary>
            <ul className="mt-2 text-sm list-disc list-inside">
              {s.players
                .slice(0, 5)
                .map((p: any, i: number) => (
                  <li key={i}>
                    {p.name} ({p.team}) – {p.position}
                  </li>
                ))}
            </ul>
          </details>
        </div>
      ))}
    </div>
  );
}
