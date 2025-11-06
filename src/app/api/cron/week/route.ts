// src/app/api/cron/week/route.ts
import { NextResponse } from "next/server";

/**
 * Returns the "live" NFL week from ESPN.
 * Used as default when no override selected in the UI.
 */
export async function GET() {
  try {
    const r = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=2",
      { cache: "no-store" }
    );
    const data = await r.json();
    const week =
      data?.events?.[0]?.week?.number ??
      data?.week?.number ??
      0;

    return NextResponse.json({ status: "success", week: Number(week) });
  } catch (e: any) {
    return NextResponse.json({ status: "error", week: 0, message: e.message });
  }
}
