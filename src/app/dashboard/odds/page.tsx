"use client";
import React, { useEffect, useState } from "react";

export default function OddsFeed() {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/cron/odds")
      .then((r) => r.json())
      .then((d) => setData(d.games || []));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">🪙 Odds Feed</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {data.map((g, i) => (
          <div key={i} className="bg-gray-800 p-4 rounded border border-gray-700">
            <p className="font-semibold text-blue-400">{g.matchup}</p>
            <p>Spread: {g.spread}</p>
            <p>Over/Under: {g.total}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
