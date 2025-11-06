import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const week = Number(url.searchParams.get("week") || 10);

    // ESPN’s consistent, fast, and public scoreboard API
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?week=${week}`
    );
    const data = await res.json();

    const games = data.events.map((ev: any) => {
      const home = ev.competitions[0].competitors.find(
        (c: any) => c.homeAway === "home"
      );
      const away = ev.competitions[0].competitors.find(
        (c: any) => c.homeAway === "away"
      );

      const odds = ev.competitions[0].odds?.[0] || {};
      return {
        homeTeam: home.team.abbreviation,
        awayTeam: away.team.abbreviation,
        homeTeamFull: home.team.displayName,
        awayTeamFull: away.team.displayName,
        spread: odds.details?.includes("EVEN")
          ? 0
          : Number(odds.details?.match(/([-+]?\d+\.?\d*)/g)?.[0] ?? 0),
        total: odds.overUnder ?? null,
        date: ev.date,
      };
    });

    return NextResponse.json({
      status: "success",
      week,
      count: games.length,
      data: games,
    });
  } catch (err: any) {
    console.error("❌ schedule fetch failed:", err);
    return NextResponse.json(
      { status: "error", message: err.message, data: [] },
      { status: 500 }
    );
  }
}
