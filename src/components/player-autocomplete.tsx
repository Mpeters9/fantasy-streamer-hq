"use client";

import React, { useState, useEffect } from "react";

interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
}

interface Props {
  onSelect: (player: Player) => void;
}

export default function PlayerAutocomplete({ onSelect }: Props) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPlayers = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/cron/players");
        const data = await res.json();
        if (data.status === "success") setPlayers(data.data || []);
      } catch (err) {
        console.error("❌ Failed to fetch players:", err);
      }
      setLoading(false);
    };
    loadPlayers();
  }, []);

  useEffect(() => {
    if (!query.trim()) return setFiltered([]);
    const q = query.toLowerCase();
    setFiltered(
      players
        .filter((p) => p.name.toLowerCase().includes(q))
        .slice(0, 8)
    );
  }, [query, players]);

  const handleSelect = (p: Player) => {
    setQuery(p.name);
    setFiltered([]);
    onSelect(p);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        className="w-full px-3 py-2 rounded bg-neutral-700 text-white placeholder:text-neutral-400"
        placeholder={loading ? "Loading players..." : "Search player..."}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {filtered.length > 0 && (
        <ul className="absolute z-20 bg-neutral-800 border border-neutral-700 w-full rounded mt-1 max-h-60 overflow-y-auto">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="p-2 hover:bg-neutral-700 cursor-pointer flex justify-between"
              onClick={() => handleSelect(p)}
            >
              <span>
                {p.name} <span className="text-neutral-400">({p.position})</span>
              </span>
              <span className="text-neutral-300">{p.team}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
