// src/app/api/cron/week/route.ts
import { NextResponse } from "next/server";

/**
 * Returns ESPN’s *current* regular season week.
 * Note: we also allow ?week= to override in schedule route; this endpoint is “live”.
 */
export async function GET() {
  try {
    const r = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=2",
      { cache: "no-store" }
    );
    if (!r.ok) throw new Error(`ESPN ${r.status}`);
    const data = await r.json();

    // ESPN typically puts week at events[0].week.number during the slate
    const week =
      data?.events?.[0]?.week?.number ??
      data?.week?.number ??
      0;

    return NextResponse.json({ status: "success", week: Number(week) });
  } catch (e: any) {
    return NextResponse.json({ status: "error", week: 0, message: e.message });
  }
}
