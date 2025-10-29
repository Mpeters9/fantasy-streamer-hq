"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// --- Connect to Supabase (read-only client)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Streamer = {
  id: string;
  name: string;
  pos: string;
  team: string;
  opponent: string;
  week: number;
  spread: number;
  weather: string;
  implied_points: number;
  usage: number;
  score: number;
  tier: string;
};

export default function StreamerDashboard() {
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreamers = async () => {
      const { data, error } = await supabase
        .from("streamer_scores")
        .select("*")
        .order("score", { ascending: false });

      if (error) {
        console.error("Error fetching streamers:", error.message);
      } else {
        setStreamers(data || []);
      }
      setLoading(false);
    };

    fetchStreamers();
  }, []);

  if (loading) return <p className="p-6">Loading streamers...</p>;

  const tiers = ["S", "A", "B", "C", "D"];

  const tierColors: Record<string, string> = {
    S: "from-yellow-400 to-orange-500",
    A: "from-green-400 to-emerald-500",
    B: "from-blue-400 to-indigo-500",
    C: "from-purple-400 to-fuchsia-500",
    D: "from-gray-400 to-gray-600",
  };

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-3xl font-bold">🏈 Streamer HQ Dashboard</h1>
      <p className="text-gray-400">Automatically ranked and tiered streamers based on your weighted model.</p>

      {tiers.map((tier) => {
        const players = streamers.filter((p) => p.tier === tier);
        if (!players.length) return null;

        return (
          <div key={tier}>
            <h2
              className={`text-2xl font-bold mb-3 bg-gradient-to-r ${tierColors[tier]} text-transparent bg-clip-text`}
            >
              Tier {tier}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="border border-gray-700 rounded-xl p-4 bg-white/5 hover:bg-white/10 transition"
                >
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-lg">{p.name}</h3>
                    <span className="text-sm text-gray-400">{p.pos}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-1">
                    {p.team} vs {p.opponent}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    Week {p.week} | Spread: {p.spread ?? "N/A"} | Weather: {p.weather ?? "N/A"}
                  </p>
                  <p className="text-sm">
                    Usage: <span className="font-semibold">{p.usage?.toFixed(1) ?? 0}%</span>
                  </p>
                  <p className="text-sm">
                    Implied Points: <span className="font-semibold">{p.implied_points ?? "—"}</span>
                  </p>
                  <p className="text-lg font-bold mt-2 text-emerald-400">
                    🧮 Score: {p.score?.toFixed(1)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
