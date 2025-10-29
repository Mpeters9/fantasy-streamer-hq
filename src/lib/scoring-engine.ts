// src/lib/scoring-engine.ts
export function scoringEngine(player: { pos: string; score: number }) {
  // Basic example — replace with fantasy logic later
  const baseScore = player.score || 0;

  // Apply small position multipliers (to simulate fantasy weighting)
  const multiplier =
    player.pos === "QB"
      ? 1.2
      : player.pos === "RB"
      ? 1.1
      : player.pos === "WR"
      ? 1.05
      : 1.0;

  return Number((baseScore * multiplier).toFixed(2));
}
  