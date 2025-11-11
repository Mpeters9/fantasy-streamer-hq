// src/app/api/scoring/route.ts
import { NextResponse } from "next/server";
import { fetchPlayers, getFantasyRelevant } from "@/lib/players";

const STATIC_WEIGHTS: Record<string, Record<string, number>> = {
  QB: {
    epa_per_play: 25,
    cpoe: 12,
    red_zone_dropbacks: 22,
    opponent_pass_dvoa: 15,
    pace: 8,
    implied_total: 10,
    weather: 8,
  },
  RB: {
    rush_share: 25,
    target_share: 20,
    red_zone_touches: 20,
    opponent_rush_dvoa: 15,
    game_script: 10,
    implied_total: 8,
    weather: 5,
  },
  WR: {
    target_share: 28,
    yprr: 22,
    air_yards_share: 20,
    opponent_pass_dvoa: 10,
    qb_efficiency: 10,
    implied_total: 6,
    weather: 4,
  },
  TE: {
    target_share: 30,
    yprr: 20,
    red_zone_targets: 20,
    opponent_pass_dvoa: 10,
    qb_efficiency: 10,
    implied_total: 5,
    weather: 5,
  },
  K: {
    fg_attempts: 30,
    team_redzone_pct: 20,
    opponent_redzone_stops: 15,
    projected_total: 10,
    implied_total: 15,
    weather: 10,
  },
  DEF: {
    pressure_rate: 25,
    opponent_turnover_rate: 25,
    sack_rate: 20,
    implied_total: 5,
    weather: 15,
  },
};

function weightedScore(position: string, stats: Record<string, number>): number {
  const weights = STATIC_WEIGHTS[position] || STATIC_WEIGHTS["QB"];
  let total = 0;
  let sum = 0;
  for (const [key, weight] of Object.entries(weights)) {
    const val = typeof stats[key] === "number" ? stats[key] : 0;
    total += val * weight;
    sum += weight;
  }
  return sum ? total / sum : 0;
}

function generateMockMetrics(pos: string, seed: number): Record<string, number> {
  const rand = (min: number, max: number) =>
    ((Math.sin(seed++) * 10000) % 1) * (max - min) + min;

  const implied_total = rand(17, 33); // team scoring projection
  const weather = rand(0, 1) > 0.85 ? rand(-10, -5) : rand(0, 5); // bad = penalty

  switch (pos) {
    case "QB":
      return {
        epa_per_play: rand(0.1, 0.4),
        cpoe: rand(-5, 10),
        red_zone_dropbacks: rand(5, 25),
        opponent_pass_dvoa: rand(-20, 20),
        pace: rand(50, 75),
        implied_total,
        weather,
      };
    case "RB":
      return {
        rush_share: rand(25, 80),
        target_share: rand(5, 20),
        red_zone_touches: rand(2, 10),
        opponent_rush_dvoa: rand(-15, 15),
        game_script: rand(-10, 10),
        implied_total,
        weather,
      };
    case "WR":
    case "TE":
      return {
        target_share: rand(10, 30),
        yprr: rand(1.2, 3.2),
        air_yards_share: rand(10, 35),
        opponent_pass_dvoa: rand(-15, 15),
        qb_efficiency: rand(55, 75),
        implied_total,
        weather,
      };
    case "K":
      return {
        fg_attempts: rand(1, 5),
        team_redzone_pct: rand(40, 70),
        opponent_redzone_stops: rand(20, 55),
        projected_total: rand(38, 55),
        implied_total,
        weather,
      };
    case "DEF":
      return {
        pressure_rate: rand(10, 35),
        opponent_turnover_rate: rand(5, 20),
        sack_rate: rand(3, 8),
        implied_total,
        weather,
      };
    default:
      return { implied_total, weather };
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let week = parseInt(searchParams.get("week") || "0", 10);

    if (!week) {
      try {
        const wk = await fetch("http://localhost:3000/api/cron/week").then((r) =>
          r.json()
        );
        week = wk.week;
      } catch {
        week = 11;
      }
    }

    const allPlayers = await fetchPlayers();
    const players = getFantasyRelevant(allPlayers);

    const data = players.map((p, i) => {
      const metrics = generateMockMetrics(p.pos, i + week * 13);
      const streamerScore = weightedScore(p.pos, metrics);
      const implied = typeof metrics.implied_total === "number" ? metrics.implied_total : 0;
      const spread = Number((Math.random() * 12 - 6).toFixed(1));

      return {
        ...p,
        week,
        metrics,
        streamerScore: Number((streamerScore + Math.random() * 3).toFixed(2)),
        impliedTotal: Number(implied.toFixed(1)),
        spread,
        opponent: ["@KC", "vs MIN", "@BUF", "vs DAL", "@CIN"][i % 5],
      };
    });

    const ranked = data.sort((a, b) => b.streamerScore - a.streamerScore);
    return NextResponse.json({ week, count: ranked.length, data: ranked });
  } catch (err) {
    console.error("Error in /api/scoring:", err);
    return NextResponse.json(
      { error: "Failed to generate scoring data" },
      { status: 500 }
    );
  }
}
