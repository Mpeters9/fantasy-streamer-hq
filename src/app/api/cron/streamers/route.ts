import { NextResponse } from "next/server";

/**
 * Main Streamer Sync Endpoint
 * Combines all cron routes (players, odds, weather, stats)
 * Used by dashboard "Force Data Refresh" or nightly cron job
 */
export async function GET() {
  try {
    console.log("🔁 [streamers] Starting full sync…");

    // 1️⃣ Players
    const playersRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/cron/players`);
    const playersData = await playersRes.json();

    // 2️⃣ Odds
    const oddsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/cron/odds`);
    const oddsData = await oddsRes.json();

    // 3️⃣ Weather
    const weatherRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/cron/weather`);
    const weatherData = await weatherRes.json();

    // 4️⃣ Stats
    const statsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/cron/stats`);
    const statsData = await statsRes.json();

    // success summary
    console.log(
      `✅ [streamers] Sync completed → players:${playersData?.count || 0} odds:${oddsData?.count || 0} weather:${weatherData?.count || 0} stats:${statsData?.count || 0}`
    );

    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      results: {
        players: playersData?.count || 0,
        odds: oddsData?.count || 0,
        weather: weatherData?.count || 0,
        stats: statsData?.count || 0,
      },
    });
  } catch (err: any) {
    console.error("❌ [streamers] Full sync failed:", err.message);
    return NextResponse.json({
      status: "error",
      message: err.message,
      results: {},
    });
  }
}
