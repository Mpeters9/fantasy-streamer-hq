import { NextResponse } from "next/server";

/**
 * Fetches NFL game odds for the current live ESPN week.
 * Works automatically with ESPN's public data, no API key required.
 */
export async function GET() {
  try {
    // Step 1: Get the current NFL week dynamically from ESPN
    const scoreboard = await fetch("https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard", {
      cache: "no-store",
    }).then((r) => r.json());

    let weekNum = scoreboard?.week?.number ?? 0;

    // ✅ Fix ESPN's Tuesday lag
    const today = new Date();
    const day = today.getUTCDay();
    if (day === 2 && today.getUTCHours() < 22) {
      console.warn("⚠️ ESPN still on old week; auto-advancing for odds.");
      weekNum += 1;
    }

    console.log(`📅 Fetching odds for Week ${weekNum}`);

    // Step 2: Pull live game data for that week
    const url = `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events?week=${weekNum}&limit=50`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch ESPN odds feed (${res.status})`);

    const eventsData = await res.json();
    const games: any[] = [];

    for (const e of eventsData.items || []) {
      const eventRes = await fetch(e.$ref, { cache: "no-store" });
      const event = await eventRes.json();

      const comp = event.competitions?.[0];
      if (!comp) continue;

      const home = comp.competitors?.find((c: any) => c.homeAway === "home");
      const away = comp.competitors?.find((c: any) => c.homeAway === "away");

      const oddsData = comp.odds?.[0];
      const spread = oddsData?.details ? parseFloat(oddsData.details.replace(/[^\d.-]/g, "")) : null;
      const total = oddsData?.overUnder ? parseFloat(oddsData.overUnder) : null;

      games.push({
        homeTeam: home?.team?.displayName || "Unknown",
        awayTeam: away?.team?.displayName || "Unknown",
        spread,
        total,
        homeMoneyLine: oddsData?.homeMoneyLine ?? null,
        awayMoneyLine: oddsData?.awayMoneyLine ?? null,
      });
    }

    console.log(`✅ Pulled ${games.length} games for Week ${weekNum}`);

    return NextResponse.json({
      status: "success",
      week: weekNum,
      count: games.length,
      data: games,
    });
  } catch (err: any) {
    console.error("❌ [odds] Error:", err.message);
    return NextResponse.json({
      status: "error",
      message: err.message,
      data: [],
    });
  }
}
