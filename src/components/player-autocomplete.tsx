"use client";
import React, { useState, useEffect } from "react";

interface Player {
  id?: string;
  name: string;
  team: string;
  position: string;
  headshot?: string;
}

interface Props {
  onSelect: (player: Player) => void;
}

export default function PlayerAutocomplete({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [filtered, setFiltered] = useState<Player[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/cron/sync", { cache: "no-store" });
        const d = await res.json();
        if (d?.players?.length) setPlayers(d.players);
        else {
          const r = await fetch("/api/cron/players");
          const f = await r.json();
          setPlayers(f.data || []);
        }
      } catch {
        console.warn("Failed to load players");
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!query.trim()) setFiltered([]);
    else {
      const q = query.toLowerCase();
      setFiltered(
        players.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.team.toLowerCase().includes(q)
        )
      );
    }
  }, [query, players]);

  return (
    <div className="relative w-full">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search player..."
        className="w-full p-2 rounded bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
      />
      {filtered.length > 0 && (
        <ul className="absolute z-20 bg-white dark:bg-gray-800 w-full rounded shadow max-h-48 overflow-y-auto">
          {filtered.map((p) => (
            <li
              key={p.id ?? p.name}
              onClick={() => {
                onSelect(p);
                setQuery(p.name);
                setFiltered([]);
              }}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {p.headshot && (
                  <img
                    src={p.headshot}
                    alt={p.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                )}
                <span>{p.name}</span>
                <span className="text-xs text-gray-500">
                  {p.team} • {p.position}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
