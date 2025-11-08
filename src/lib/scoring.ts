import type { Player } from "./types";

export type Weights = Record<string, number>;

export const DEFAULT_WEIGHTS: Weights = {
  // Shared signals
  spread: -0.25,      // worse spread hurts
  total: 0.35,        // higher total helps
  weather_penalty: -0.1, // bad outdoor weather tiny penalty
  // Position heuristics (manual stats influence separately)
  qb_epa: 0.6,
  rb_ms: 0.5,
  wr_tar: 0.45,
  te_tar: 0.4,
};

export function scorePlayer(input: Record<string, number>, weights: Weights): number {
  let s = 0;
  for (const k of Object.keys(weights)) {
    const w = weights[k] || 0;
    const v = input[k] ?? 0;
    s += w * v;
  }
  return s;
}

export function normalizeWeather(wx: string | undefined): number {
  if (!wx) return 0;
  if (wx === "indoors") return 0.2;
  // crude parse: temperature and precip
  const precip = /precip\s+(\d+(\.\d+)?)/i.exec(wx)?.[1];
  const p = precip ? parseFloat(precip) : 0;
  return p > 1 ? -0.3 : p > 0.1 ? -0.1 : 0;
}
