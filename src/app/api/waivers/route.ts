import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CACHE_PATH = path.join(process.cwd(), "tmp", "fshq-cache.json");
const SCORING_PATH = path.join(process.cwd(), "tmp", "manual-data.json");

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode") || "weekly"; // weekly or ros
    const pos = url.searchParams.get("pos") || "ALL";

    if (!fs.existsSync(CACHE_PATH))
      return NextResponse.json({ status: "error", message: "No cache" });

    const cache = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
    const manual = fs.existsSync(SCORING_PATH)
      ? JSON.parse(fs.readFileSync(SCORING_PATH, "utf8"))
      : { weights: {}, stats: {} };

    const weights = manual.weights || {};
    const players = cache.snapshot?.players || [];

    // --- compute streamer scores (reuse logic) ---
    const enriched = players.map((p: any) => {
      const playerManual = manual.stats?.[p.name] || {};
      const spread = Number(p.spread) || 0;
      const implied = Number(p.impliedPts) || 0;

      const matchup = spread < 0 ? 10 : 5;
      const weatherScore = p.weather?.includes("°F")
        ? Math.max(0, 10 - Math.abs((Number(p.weather?.match(/\d+/)?.[0]) ?? 70) - 70) / 5)
        : 5;
      const manualScore =
        Object.values(playerManual).reduce((sum: any, val: any) => sum + Number(val || 0), 0) || 0;

      const total =
        matchup * (weights.matchup ?? 1) +
        weatherScore * (weights.weather ?? 1) +
        (10 - Math.abs(spread)) * (weights.spread ?? 1) +
        implied * 0.1 * (weights.implied ?? 1) +
        manualScore * (weights.manual ?? 1);

      const rosAdj = mode === "ros" ? implied * 0.15 + manualScore * 0.5 : 0;

      return {
        ...p,
        streamerScore: Number((total + rosAdj).toFixed(1)),
      };
    });

    let filtered = enriched;
    if (pos !== "ALL") filtered = enriched.filter((p: any) => p.position === pos);
    filtered.sort((a, b) => b.streamerScore - a.streamerScore);

    return NextResponse.json({
      status: "success",
      mode,
      week: cache.week,
      count: filtered.length,
      data: filtered,
    });
  } catch (err: any) {
    console.error("❌ waiver error:", err);
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}
