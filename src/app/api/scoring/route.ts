import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CACHE_PATH = path.join(process.cwd(), "tmp", "fshq-cache.json");
const MANUAL_DATA_PATH = path.join(process.cwd(), "tmp", "manual-data.json");

export async function GET() {
  try {
    if (!fs.existsSync(CACHE_PATH))
      return NextResponse.json({ status: "error", message: "No player cache found" });

    const cache = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
    const players = cache.snapshot?.players || [];

    const manual = fs.existsSync(MANUAL_DATA_PATH)
      ? JSON.parse(fs.readFileSync(MANUAL_DATA_PATH, "utf8"))
      : { weights: {}, stats: {} };

    const weights = manual.weights || { matchup: 1, weather: 1, spread: 1, implied: 1 };
    const manualStats = manual.stats || {};

    const scored = players.map((p: any) => {
      const playerManual = manualStats[p.name] || {};
      const spread = Number(p.spread) || 0;
      const implied = Number(p.impliedPts) || 0;

      const matchupScore = spread < 0 ? 10 : 5;
      const weatherScore = p.weather?.includes("°F")
        ? Math.max(0, 10 - Math.abs((Number(p.weather?.match(/\d+/)?.[0]) ?? 70) - 70) / 5)
        : 5;

      const manualPosScore =
        Object.values(playerManual).reduce((sum: any, val: any) => sum + Number(val || 0), 0) || 0;

      const total =
        matchupScore * (weights.matchup ?? 1) +
        weatherScore * (weights.weather ?? 1) +
        (10 - Math.abs(spread)) * (weights.spread ?? 1) +
        implied * 0.1 * (weights.implied ?? 1) +
        manualPosScore * (weights.manual ?? 1);

      return { ...p, streamerScore: Number(total.toFixed(1)) };
    });

    scored.sort((a, b) => b.streamerScore - a.streamerScore);
    return NextResponse.json({ status: "success", week: cache.week, data: scored });
  } catch (err: any) {
    console.error("❌ scoring error:", err);
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}
