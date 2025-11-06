import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Derive full origin (localhost or prod) dynamically
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

    // Always fetch absolute URLs when inside an API route
    const [weekRes, playersRes, weatherRes, oddsRes] = await Promise.all([
      fetch(`${baseUrl}/api/cron/week`).then((r) => r.json()),
      fetch(`${baseUrl}/api/cron/players`).then((r) => r.json()),
      fetch(`${baseUrl}/api/cron/weather`).then((r) => r.json()),
      fetch(`${baseUrl}/api/cron/odds`).then((r) => r.json()),
    ]);

    const week = weekRes.week ?? 10;
    const players = playersRes.data ?? [];
    const weather = weatherRes.data ?? [];
    const odds = oddsRes.data ?? [];

    return NextResponse.json({
      status: "success",
      week,
      count: players.length,
      snapshot: { week, players, weather, odds },
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Cron sync failed:", err);
    return NextResponse.json(
      { status: "error", message: (err as Error).message },
      { status: 500 }
    );
  }
}
