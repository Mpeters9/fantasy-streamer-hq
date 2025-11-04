import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || "";
    const CACHE_FILE = path.join("/tmp", "fshq-cache.json");

    const [players, odds, weather] = await Promise.all([
      fetch(`${base}/api/cron/players`).then((r) => r.json()),
      fetch(`${base}/api/cron/odds`).then((r) => r.json()),
      fetch(`${base}/api/cron/weather`).then((r) => r.json()),
    ]);

    const result = {
      timestamp: new Date().toISOString(),
      summary: {
        players: players.count || 0,
        odds: odds.count || 0,
        weather: weather.count || 0,
      },
      data: { players, odds, weather },
    };

    fs.writeFileSync(CACHE_FILE, JSON.stringify(result, null, 2));
    console.log("✅ Auto-refresh completed and cache updated");

    return NextResponse.json({
      status: "success",
      message: "Auto-refreshed successfully",
      summary: result.summary,
      timestamp: result.timestamp,
    });
  } catch (err: any) {
    console.error("❌ Auto-refresh error:", err.message);
    return NextResponse.json({
      status: "error",
      message: err.message,
    });
  }
}
