"use client";

import useSWR from "swr";
import { useState } from "react";

// --- Data Fetcher ---
const fetcher = (url: string) => fetch(url).then((r) => r.json());

// --- Main Page Component ---
export default function StreamersPage() {
  const { data, error, isLoading } = useSWR("/api/streamers", fetcher);
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState("ALL");
  const [availableOnly, setAvailableOnly] = useState(false);

  if (error) return <div className="p-6 text-red-400">❌ {error.message}</div>;
  if (isLoading || !data) return <div className="p-6">Loading streamers…</div>;

  // --- Source of truth ---
  let players = data.players ?? [];

  // --- Filters ---
  players = players.filter((p: any) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchesPos = posFilter === "ALL" || p.pos === posFilter;
    const matchesAvail = !availableOnly || p.available === true;
    return matchesSearch && matchesPos && matchesAvail;
  });

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Waiver Wire Streamers</h1>

      {/* ---- Filter Controls ---- */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search player..."
          className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-600"
        />

        <select
          value={posFilter}
          onChange={(e) => setPosFilter(e.target.value)}
          className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-600"
        >
          <option value="ALL">All Positions</option>
          <option value="QB">QB</option>
          <option value="RB">RB</option>
          <option value="WR">WR</option>
          <option value="TE">TE</option>
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
          />
          Available Only
        </label>
      </div>

      <TieredTable players={players} />
    </main>
  );
}

// --- Tiered Table Component ---
function TieredTable({ players }: { players: any[] }) {
  const grouped = players.reduce(
    (acc: Record<string, Record<string, any[]>>, p) => {
      const posKey = p.pos ?? "UNKNOWN";
      const tierKey = p.tier ?? "Tier 4";
      if (!acc[posKey]) acc[posKey] = {};
      if (!acc[posKey][tierKey]) acc[posKey][tierKey] = [];
      acc[posKey][tierKey].push(p);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([pos, tiers]) => (
        <div key={pos}>
          <h2 className="text-2xl font-bold mb-3">{pos}</h2>
          {Object.entries(tiers).map(([tier, list]) => (
            <div key={tier} className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{tier}</h3>
              <table className="min-w-full border border-gray-700 rounded-lg">
                <thead>
                  <tr className="bg-gray-800 text-gray-200">
                    <th className="px-3 py-2 text-left">Player</th>
                    <th className="px-3 py-2 text-left">Team</th>
                    <th className="px-3 py-2 text-left">Pos</th>
                    <th className="px-3 py-2 text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((p) => (
                    <tr key={p.id} className="border-t border-gray-700">
                      <td className="px-3 py-2">{p.name}</td>
                      <td className="px-3 py-2">{p.team}</td>
                      <td className="px-3 py-2">{p.pos}</td>
                      <td className="px-3 py-2 text-right">
                        {p.score?.toFixed(1) ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
