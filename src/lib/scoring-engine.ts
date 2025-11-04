// src/lib/scoring-engine.ts
export interface PlayerInput {
  position: string;
  stats: Record<string, number | null | undefined>;
  spread?: number | null;
  impliedPts?: number | null;
  weather?: string;
  favored?: boolean;
}

export function calculateStreamerScore(
  player: PlayerInput
): { score: number; tier: string; emoji: string } {
  const pos = player.position;
  const s = player.stats || {};
  const val = (x: any) => (typeof x === "number" && !isNaN(x) ? x : 0);
  const norm = (x: number, min: number, max: number) =>
    Math.max(0, Math.min(1, (x - min) / (max - min)));

  let score = 0;

  if (pos === "QB") {
    score =
      0.25 * norm(val(player.impliedPts ?? 20), 10, 35) +
      0.25 * (1 - norm(val(s.oppRank_vs_QB ?? 16), 1, 32)) +
      0.15 * (player.weather?.includes("mph") ? 0.9 : 1) +
      0.1 * (player.spread && player.spread < 0 ? 1 : 0.5) +
      0.15 * (1 - norm(val(s.pressureRate ?? 25), 0, 50)) +
      0.1 * norm(val(s.recentFantasyAvg ?? 12), 0, 25);
  }

  if (pos === "RB") {
    score =
      0.2 * norm(val(s.snapShare ?? 60), 30, 90) +
      0.15 * norm(val(s.rushShare ?? 45), 20, 80) +
      0.15 * norm(val(s.targetsPerG ?? 3), 0, 8) +
      0.15 * norm(val(s.redZoneTouches ?? 2), 0, 6) +
      0.15 * (1 - norm(val(s.oppRank_vs_RB ?? 16), 1, 32)) +
      0.1 * (player.spread && player.spread < 0 ? 1 : 0.5) +
      0.1 * (player.weather?.includes("mph") ? 0.9 : 1);
  }

  if (pos === "WR") {
    score =
      0.25 * norm(val(s.targetShare ?? 22), 10, 35) +
      0.15 * norm(val(s.aDOT ?? 9), 5, 15) +
      0.2 * (1 - norm(val(s.oppRank_vs_WR ?? 16), 1, 32)) +
      0.1 * norm(val(s.redZoneTargets ?? 2), 0, 6) +
      0.1 * norm(val(s.routesPerDB ?? 85), 60, 100) +
      0.1 * (player.impliedPts && player.impliedPts > 24 ? 1 : 0.6) +
      0.1 * (player.weather?.includes("mph") ? 0.9 : 1);
  }

  if (pos === "TE") {
    score =
      0.25 * norm(val(s.routePct ?? 75), 50, 100) +
      0.2 * norm(val(s.targetShare ?? 18), 5, 30) +
      0.2 * norm(val(s.redZoneTargets ?? 1.5), 0, 6) +
      0.2 * (1 - norm(val(s.oppRank_vs_TE ?? 16), 1, 32)) +
      0.15 * (player.spread && player.spread < 0 ? 1 : 0.5);
  }

  const finalScore = Math.round(score * 100);

  let tier = "Avoid",
    emoji = "❌";
  if (finalScore >= 85) {
    tier = "Elite Stream";
    emoji = "🔥";
  } else if (finalScore >= 70) {
    tier = "Strong Play";
    emoji = "💪";
  } else if (finalScore >= 55) {
    tier = "Viable";
    emoji = "✅";
  } else if (finalScore >= 40) {
    tier = "Desperation";
    emoji = "⚠️";
  }

  return { score: finalScore, tier, emoji };
}
