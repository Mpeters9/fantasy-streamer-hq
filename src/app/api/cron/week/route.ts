import { NextResponse } from "next/server";

/**
 * ESPN Current NFL Week API
 * Returns the active NFL week (used in dashboard header).
 */
export async function GET() {
  try {
    const res = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // ESPN provides the week number inside leagues[0].season
    const week =
      data?.leagues?.[0]?.calendar?.find((c: any) => c.entries)?.entries?.find(
        (e: any) => e.state === "in"
      )?.label ||
      data?.week?.number ||
      null;

    if (!week)
      return NextResponse.json({
        status: "error",
        week: 0,
        message: "Unable to determine current week",
      });

    console.log(`📅 [week] ESPN reports current week = ${week}`);
    return NextResponse.json({
      status: "success",
      week: parseInt(week, 10),
    });
  } catch (err: any) {
    console.error("❌ [week] Error:", err.message);
    return NextResponse.json({
      status: "error",
      week: 0,
      message: err.message,
    });
  }
}
