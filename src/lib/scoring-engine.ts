// src/lib/scoring-engine.ts
import fs from "fs/promises";
import path from "path";

const MANUAL_PATH = path.join(process.cwd(), "tmp", "manual-stats.json");
const WEIGHTS_PATH = path.join(process.cwd(), "tmp", "weights.json");

type PlayerAuto = {
  id?: string;
  name: string;
  team: string;
  position: string;
  opponent?: string;
  impliedPts?: number;
  weather?: string; // "Clear" | "Wind" | etc.
  spread?: number;  // negative = favorite
};

type ManualRow = {
  key: string;         // `${id || name}|${team}`
  pos: string;         // "QB"|"RB"|"WR"|"TE"
  stats: Record<string, number | string | boolean | null | undefined>;
};

type Weights = Record<string, number>;
type Mode = "weekly" | "ros";

function sanitizeNumber(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function computeStreamerScores(
  autoPlayers: PlayerAuto[],
  mode: Mode = "weekly"
): Promise<any[]> {
  // --- load manual stats + weights ---
  let manualData: ManualRow[] = [];
  let weights: Record<string, Weights> = {};

  try {
    const raw = await fs.readFile(MANUAL_PATH, "utf-8");
    const json = JSON.parse(raw);
    manualData = Array.isArray(json.data) ? json.data : [];
  } catch {
    manualData = [];
  }

  try {
    const rawW = await fs.readFile(WEIGHTS_PATH, "utf-8");
    weights = JSON.parse(rawW);
  } catch {
    weights = {};
  }

  // Default weight templates (Google-Sheet style, cleaned of auto-fed dupes)
  const base: Record<string, Weights> = {
    QB: {
      // Weekly/ROS relevant manual stats:
      Recent3_FantasyAvg: 2.0,
      PassAtt_perG: 0.4,
      DeepAtt_perG: 0.5,
      RushYds_perG: 1.2,
      // matchup modifiers from manual (if you choose to record them)
      Opp_PressureRate_A: -1.0,
      Opp_ExplosivePass_A: -1.0,
    },
    RB: {
      SnapShare: 1.3,
      RushShare: 1.0,
      Targets_perG: 2.0,
      RedZoneTouches: 1.2,
      GoalLineCarries: 1.0,
      Opp_RunSuccess_A: -1.0,
      RecentForm_RB: 1.0,
      TwoMinRole: 0.5,
      ThirdDownRole: 0.6,
    },
    WR: {
      TargetShare: 2.2,
      AirYards: 0.5,
      aDOT: 0.4,
      RedZoneTargets: 1.2,
      YardsPerRouteRun: 1.0,
      RecentForm_WR: 1.0,
    },
    TE: {
      Route: 1.0,
      TargetShare: 2.0,
      RedZoneTargets: 1.4,
      YardsPerRouteRun: 1.0,
      Recent3_FantasyAvg: 1.0,
    },
  };

  // Mode multipliers: weekly favors recency/matchup; ROS softens them
  const modeBump = (pos: string, key: string) => {
    if (mode === "weekly") {
      if (/Recent/i.test(key)) return 1.25;
      if (/Opp_|Implied|Spread/i.test(key)) return 1.15;
      if (/RedZone|GoalLine/i.test(key)) return 1.1;
    } else {
      // ros
      if (/Recent/i.test(key)) return 0.8;
      if (/Opp_|Implied|Spread/i.test(key)) return 0.9;
    }
    return 1.0;
  };

  const weightMap: Record<string, Weights> = {};
  ["QB", "RB", "WR", "TE"].forEach((p) => {
    const w = { ...(base[p] || {}), ...(weights[p] || {}) };
    const scaled: Weights = {};
    for (const [k, v] of Object.entries(w)) {
      scaled[k] = sanitizeNumber(v) * modeBump(p, k);
    }
    weightMap[p] = scaled;
  });

  const results = autoPlayers.map((p) => {
    const pos = (p.position || "").toUpperCase();
    const key = `${p.id || p.name}|${p.team}`;
    const manual = manualData.find((m) => m.key === key);
    const w = weightMap[pos] || {};

    let score = 0;

    // 1) Manual stats (position-specific)
    if (manual?.stats) {
      for (const [k, v] of Object.entries(manual.stats)) {
        if (w[k] !== undefined) score += sanitizeNumber(v) * sanitizeNumber(w[k]);
      }
    }

    // 2) Auto matchup context — *small* bump (already visible in cards)
    if (sanitizeNumber(p.impliedPts) > 24) score += mode === "weekly" ? 1.0 : 0.5;
    if (p.weather === "Clear") score += 0.4;
    if (sanitizeNumber(p.spread) < 0) score += 0.35;

    return {
      ...p,
      manualStats: manual?.stats || {},
      streamerScore: Number(score.toFixed(2)),
    };
  });

  return results.sort((a, b) => b.streamerScore - a.streamerScore);
}
