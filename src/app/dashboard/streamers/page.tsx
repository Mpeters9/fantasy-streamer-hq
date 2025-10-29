"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function StreamersPage() {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("streamer_scores")
        .select(`
          player_id,
          week,
          score,
          rank,
          tier,
          reason,
          players ( name, team, pos )
        `)
        .order("rank", { ascending: true });

      if (error) {
        console.error("Error loading streamers:", error);
        return;
      }

      setData(data || []);
    }

    load();
  }, []);

  const filtered = data.filter((s) =>
    s.players?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const tierColors: Record<string, string> = {
    A: "#22c55e", // green-500
    B: "#3b82f6", // blue-500
    C: "#eab308", // yellow-500
    D: "#ef4444", // red-500
  };

  return (
    <div
      style={{
        padding: 20,
        background: "#111827", // dark slate background
        minHeight: "100vh",
        color: "#f9fafb",
      }}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: "bold",
          marginBottom: 16,
          textAlign: "center",
          color: "#f3f4f6",
        }}
      >
        Weekly Streamer Scores
      </h1>

      <input
        placeholder="Search player..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          margin: "0 auto 20px",
          display: "block",
          padding: "10px",
          width: "100%",
          maxWidth: 400,
          border: "1px solid #374151",
          borderRadius: "8px",
          background: "#1f2937",
          color: "#f9fafb",
        }}
      />

      <div
        style={{
          display: "grid",
          gap: "16px",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        }}
      >
        {filtered.map((s) => (
          <div
            key={`${s.player_id}-${s.week}`}
            style={{
              background: "#1f2937", // dark card
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
              padding: "16px",
              color: "#f9fafb",
              border: "1px solid #374151",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                "0 4px 14px rgba(0,0,0,0.6)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "";
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                "0 2px 10px rgba(0,0,0,0.4)";
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: "bold", margin: 0 }}>
                {s.players?.name || "Unknown Player"}
              </h2>
              <span
                style={{
                  background: tierColors[s.tier] || "#6b7280",
                  color: "#fff",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  fontSize: 12,
                }}
              >
                {s.tier}
              </span>
            </div>

            <p style={{ margin: "2px 0", color: "#d1d5db" }}>
              {s.players?.team || "??"} • {s.players?.pos || "??"}
            </p>
            <p style={{ margin: "2px 0", color: "#d1d5db" }}>
              Rank: #{s.rank ?? "?"}
            </p>
            <p style={{ margin: "2px 0", color: "#d1d5db" }}>
              Score: {s.score?.toFixed(2)}
            </p>
            <p style={{ marginTop: 8, fontSize: 12, color: "#9ca3af" }}>
              {s.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
