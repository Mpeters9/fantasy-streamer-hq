import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SNAPSHOT_FILE = path.join(process.cwd(), "tmp", "snapshots.json");
const MANUAL_FILE = path.join(process.cwd(), "tmp", "manual-stats.json");

function readFileSafe(file: string) {
  if (!fs.existsSync(file)) return [];
  try {
    const data = fs.readFileSync(file, "utf-8");
    return JSON.parse(data || "[]");
  } catch {
    return [];
  }
}

function computeScore(player: any, weights: any = {}) {
  const {
    recentForm = 1,
    matchup = 1,
    weather = 1,
    opportunity = 1,
    ros = 1,
  } = weights;

  const form =
    ((player.fpLast3 || 0) / 20) * recentForm +
    ((player.snap || 0) / 100) * opportunity +
    ((player.target || 0) / 100) * opportunity;

  const weatherPenalty = player.weather === "bad" ? -0.2 * weather : 0;
  const matchupBonus = player.spread && player.spread < 0 ? 0.1 * matchup : 0;

  return parseFloat((form + matchupBonus + weatherPenalty + ros * 0.05).toFixed(2));
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode") || "weekly";
    const limit = parseInt(url.searchParams.get("limit") || "25");
    const position = url.searchParams.get("pos") || "ALL";

    const snapshots = readFileSafe(SNAPSHOT_FILE);
    const manual = readFileSafe(MANUAL_FILE);

    if (snapshots.length === 0) {
      return NextResponse.json({ status: "error", message: "No snapshot data found." });
    }

    const latest = snapshots.at(-1);
    const players = Array.isArray(latest.players) ? latest.players : [];

    if (players.length === 0) {
      return NextResponse.json({
        status: "error",
        message: "Snapshot contains no player entries.",
        data: [],
      });
    }

    const merged = players.map((p: any) => {
      const manualData =
        manual.find(
          (m: any) =>
            m.name?.toLowerCase().trim() === p.name?.toLowerCase().trim()
        ) || {};

      return {
        id: p.id,
        name: p.name,
        team: p.team,
        position: p.position,
        fpLast3: manualData.fpLast3 ?? 0,
        snap: manualData.snapPct ?? 0,
        target: manualData.targetShare ?? 0,
        spread: p.spread ?? 0,
        weather: p.weatherCondition ?? "ok",
      };
    });

    const weights =
      mode === "weekly"
        ? { recentForm: 1.2, matchup: 1, weather: 1, opportunity: 1 }
        : { recentForm: 0.6, matchup: 0.8, weather: 0.5, opportunity: 1.2, ros: 1 };

    const ranked = merged
      .map((p) => ({ ...p, score: computeScore(p, weights) }))
      .filter((p) => (position === "ALL" ? true : p.position === position))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return NextResponse.json({
      status: "success",
      mode,
      count: ranked.length,
      data: ranked,
    });
  } catch (e: any) {
    return NextResponse.json({ status: "error", message: e.message, data: [] });
  }
}
