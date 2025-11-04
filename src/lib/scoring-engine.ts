// src/lib/scoring-engine.ts

export function calculateStreamerScore(p: any): { score: number; tier: string } {
  if (!p) return { score: 0, tier: "N/A" };

  const weatherBonus =
    p.weather && p.weather.includes("Dome")
      ? 1.05
      : p.weather && p.weather.includes("Rain")
      ? 0.9
      : 1;

  const spreadFactor = p.spread != null ? (p.spread <= -3 ? 1.05 : p.spread >= 3 ? 0.95 : 1) : 1;

  const opponentFactor =
    p.opponentRank && p.opponentRank <= 10
      ? 0.9
      : p.opponentRank && p.opponentRank >= 20
      ? 1.1
      : 1;

  const base =
    p.position === "QB"
      ? (p.passYds ?? 0) * 0.04 + (p.passTD ?? 0) * 4 + (p.rushYds ?? 0) * 0.1
      : p.position === "RB"
      ? (p.rushYds ?? 0) * 0.1 + (p.recYds ?? 0) * 0.1 + (p.recTD ?? 0) * 6
      : ["WR", "TE"].includes(p.position)
      ? (p.recYds ?? 0) * 0.1 + (p.recTD ?? 0) * 6
      : p.position === "DST"
      ? (p.defTD ?? 0) * 6 + (p.sacks ?? 0) * 1 + (p.int ?? 0) * 2
      : 0;

  const score = Math.min(
    Math.round(base * weatherBonus * spreadFactor * opponentFactor),
    100
  );

  const tier =
    score >= 90
      ? "S"
      : score >= 75
      ? "A"
      : score >= 60
      ? "B"
      : score >= 45
      ? "C"
      : "D";

  return { score, tier };
}
