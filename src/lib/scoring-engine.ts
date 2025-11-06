// src/lib/scoring-engine.ts
export interface WeightConfig {
  targetShare: number;
  snapShare: number;
  redZone: number;
  weather: number;
  spread: number;
  total: number;
  recentForm: number;
}

export const defaultWeights: WeightConfig = {
  targetShare: 25,
  snapShare: 20,
  redZone: 15,
  weather: 10,
  spread: 10,
  total: 10,
  recentForm: 10,
};

export function getWeights(): WeightConfig {
  if (typeof window === "undefined") return defaultWeights;
  const saved = localStorage.getItem("weights");
  return saved ? JSON.parse(saved) : defaultWeights;
}

export function calculateStreamerScore(stats: any): number {
  const w = getWeights();
  const score =
    (stats.targetShare * w.targetShare +
      stats.snapShare * w.snapShare +
      stats.redZone * w.redZone +
      stats.weather * w.weather +
      stats.spread * w.spread +
      stats.total * w.total +
      stats.recentForm * w.recentForm) /
    100;
  return Math.round(score * 10) / 10;
}
