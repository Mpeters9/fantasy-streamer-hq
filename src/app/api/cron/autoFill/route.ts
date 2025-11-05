// src/app/api/cron/week/route.ts
import { NextResponse } from "next/server";

/**
 * Fetches current NFL week from ESPN API, fallback to manual override.
 */
export async function GET() {
  try {
    const res = await fetch("https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard", {
      cache: "no-store",
    });
    const data = await res.json();

    let week = data.week?.number || data.leagues?.[0]?.calendar?.[0]?.entries?.[0]?.value || 10;

    // Force update if ESPN hasn't rolled forward yet (Monday-Tuesday gap)
    if (Number(week) < 10) week = 10;

    return NextResponse.json({
      status: "success",
      week: Number(week),
      fetchedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({
      status: "error",
      message: err.message,
      week: 10,
    });
  }
}
