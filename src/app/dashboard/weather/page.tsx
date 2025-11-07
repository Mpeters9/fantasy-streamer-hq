"use client";
import React, { useEffect, useState } from "react";

export default function WeatherFeed() {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/cron/weather")
      .then((r) => r.json())
      .then((d) => setData(d.weather || []));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">🌦️ Weather Feed</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {data.map((w, i) => (
          <div key={i} className="bg-gray-800 p-4 rounded border border-gray-700">
            <p className="font-semibold text-blue-400">{w.matchup}</p>
            <p>Condition: {w.condition}</p>
            <p>Temp: {w.temp}°F</p>
            <p>Wind: {w.wind} mph</p>
          </div>
        ))}
      </div>
    </div>
  );
}
