"use client";
import React from "react";

export default function PlayerCompare({ a, b, onClose }: any) {
  if (!a || !b) return null;

  const row = (label: string, key: string) => (
    <tr key={key} className="border-b border-gray-700">
      <td className="px-3 py-2 text-gray-400">{label}</td>
      <td className="px-3 py-2 text-blue-300">{a[key] ?? "-"}</td>
      <td className="px-3 py-2 text-green-300">{b[key] ?? "-"}</td>
    </tr>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-lg w-full max-w-3xl overflow-hidden">
        <header className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-blue-400">Compare Players</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-400 text-lg"
          >
            ✕
          </button>
        </header>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="px-3 py-2">Stat</th>
              <th className="px-3 py-2">{a.name}</th>
              <th className="px-3 py-2">{b.name}</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Team", "team"],
              ["Position", "position"],
              ["Opponent", "opponent"],
              ["Spread", "spread"],
              ["Implied Pts", "impliedPts"],
              ["Weather", "weather"],
              ["Streamer Score", "streamerScore"],
            ].map(([label, key]) => row(label, key))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
