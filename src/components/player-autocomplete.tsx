"use client";
import React, { useState, useEffect } from "react";

interface Player {
  id: string;
  name: string;
  team: string;
  teamName: string;
  position: string;
  headshot?: string;
}

export default function PlayerAutocomplete({
  onSelect,
}: {
  onSelect: (player: Player) => void;
}) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch live 2025 data from /api/cron/players
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/cron/players");
        const data = await res.json();
        if (data.status === "success") {
          setPlayers(data.data);
        } else {
          console.error("Failed to load player data:", data.message);
        }
      } catch (err) {
        console.error("Error fetching players:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (query.length === 0) {
      setFiltered([]);
      return;
    }
    setFiltered(
      players.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query, players]);

  return (
    <div className="relative w-80">
      <input
        type="text"
        className="w-full rounded-md border border-gray-700 bg-gray-900 text-white px-3 py-2"
        placeholder="Search player..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && (
        <p className="absolute right-2 top-2 text-xs text-gray-500">Loading...</p>
      )}

      {filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-gray-800 rounded-lg shadow-lg max-h-72 overflow-y-auto border border-gray-700">
          {filtered.slice(0, 15).map((p) => (
            <div
              key={p.id}
              onClick={() => {
                onSelect(p);
                setQuery(p.name);
                setFiltered([]);
              }}
              className="px-3 py-2 hover:bg-gray-700 cursor-pointer flex items-center gap-3"
            >
              {p.headshot && (
                <img
                  src={p.headshot}
                  alt={p.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-gray-400">
                  {p.team} • {p.position}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
