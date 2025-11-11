// src/app/dashboard/weights/page.tsx
"use client";

import DashboardNavbar from "@/components/dashboard-navbar";

export default function WeightsPage() {
  const staticWeights = [
    {
      position: "QB",
      metrics: [
        { label: "EPA per Play", weight: 30 },
        { label: "CPOE", weight: 15 },
        { label: "Red Zone Dropbacks", weight: 25 },
        { label: "Opponent Pass DVOA", weight: 20 },
        { label: "Pace of Play", weight: 10 },
      ],
    },
    {
      position: "RB",
      metrics: [
        { label: "Rush Share", weight: 30 },
        { label: "Target Share", weight: 25 },
        { label: "Red Zone Touches", weight: 20 },
        { label: "Opponent Rush DVOA", weight: 15 },
        { label: "Game Script", weight: 10 },
      ],
    },
    {
      position: "WR/TE",
      metrics: [
        { label: "Target Share", weight: 35 },
        { label: "Yards per Route Run", weight: 25 },
        { label: "Air Yards Share", weight: 20 },
        { label: "Opponent Pass DVOA", weight: 10 },
        { label: "QB Efficiency", weight: 10 },
      ],
    },
    {
      position: "K",
      metrics: [
        { label: "FG Attempts per Game", weight: 40 },
        { label: "Team Red Zone %", weight: 25 },
        { label: "Opponent Red Zone Stops", weight: 20 },
        { label: "Projected Game Total", weight: 15 },
      ],
    },
    {
      position: "DEF",
      metrics: [
        { label: "Pressure Rate", weight: 25 },
        { label: "Opponent Turnover Rate", weight: 25 },
        { label: "Opponent Sack %", weight: 25 },
        { label: "Implied Total Allowed", weight: 25 },
      ],
    },
  ];

  return (
    <div style={{ background: "#020617", color: "#e5e7eb", minHeight: "100vh" }}>
      <DashboardNavbar />
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: "bold" }}>⚙️ Static Weight Logic</h1>
        <p style={{ marginTop: 8, color: "#94a3b8" }}>
          Automatically applied to all streamer calculations. Optimized for predictive accuracy.
        </p>

        <div style={{ marginTop: 20, display: "grid", gap: 16 }}>
          {staticWeights.map((group) => (
            <div
              key={group.position}
              style={{
                background: "#111827",
                border: "1px solid #1f2937",
                borderRadius: 8,
                padding: 16,
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
                {group.position} Weights
              </h2>
              {group.metrics.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "4px 0",
                    borderBottom: "1px solid #1e293b",
                  }}
                >
                  <span>{m.label}</span>
                  <span style={{ fontWeight: "bold", color: "#10b981" }}>{m.weight}%</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
