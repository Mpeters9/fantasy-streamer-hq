export interface StatRow {
  pos: string;
  impliedPts?: number;
  opponentRank?: number;
  weather?: string;
  dome?: boolean;
  rushYds_perG?: number;
  targetShare?: number;
  airYards?: number;
  redZoneTouches?: number;
  routePercent?: number;
}

export function calculateScore(player: StatRow): { score: number; tier: string } {
  let score = 0;

  const safe = (v?: number, weight = 1) => (v ?? 0) * weight;

  switch (player.pos) {
    case "QB":
      score += safe(40 - (player.opponentRank ?? 16), 1.5);
      score += safe(player.impliedPts, 1.2);
      if (player.weather === "Clear" || player.dome) score += 8;
      break;

    case "RB":
      score += safe(40 - (player.opponentRank ?? 16), 1.4);
      score += safe(player.redZoneTouches, 0.6);
      score += safe(player.impliedPts, 0.8);
      break;

    case "WR":
      score += safe(40 - (player.opponentRank ?? 16), 1.2);
      score += safe(player.targetShare, 0.7);
      score += safe(player.airYards, 0.1);
      break;

    case "TE":
      score += safe(40 - (player.opponentRank ?? 16), 1.1);
      score += safe(player.routePercent, 0.5);
      score += safe(player.redZoneTouches, 0.6);
      break;
  }

  // Normalize
  if (score < 0) score = 0;
  if (score > 100) score = 100;

  let tier = "🟩 Elite";
  if (score < 80) tier = "🟦 Great";
  if (score < 60) tier = "🟨 Solid";
  if (score < 40) tier = "🟧 Risky";
  if (score < 25) tier = "🟥 Avoid";

  return { score: Math.round(score), tier };
}
