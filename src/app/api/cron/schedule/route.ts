// src/app/api/cron/schedule/route.ts
import { NextResponse } from "next/server";
import { DOME_TEAMS, normAbbr } from "@/lib/constants";

/**
 * FREE, RELIABLE weekly schedule for any week:
 *  - GET /api/cron/schedule              -> current week (ESPN live)
 *  - GET /api/cron/schedule?week=10      -> explicit week
 *
 * Output per game:
 * { week, homeTeam, homeAbbr, awayTeam, awayAbbr, total, spread, venue, isDome, start }
 *
 * Spread: ESPN odds sometimes provide it. If absent, null.
 * Dome: from ESPN venue.indoor if present, else by known dome teams fallback.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const weekParam = searchParams.get("week"); // optional
    const base = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=2";
    const url = weekParam ? `${base}&week=${weekParam}` : base;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`ESPN schedule ${res.status}`);

    const data = await res.json();
    const week =
      Number(weekParam) ||
      data?.events?.[0]?.week?.number ||
      data?.week?.number ||
      0;

    const games = (data?.events ?? []).map((ev: any) => {
      const comp = ev?.competitions?.[0];
      const competitors = comp?.competitors ?? [];
      const home = competitors.find((c: any) => c.homeAway === "home");
      const away = competitors.find((c: any) => c.homeAway === "away");

      const homeTeam = home?.team?.displayName ?? "TBD";
      const awayTeam = away?.team?.displayName ?? "TBD";
      const homeAbbr = home?.team?.abbreviation ?? homeTeam;
      const awayAbbr = away?.team?.abbreviation ?? awayTeam;

      // ESPN odds (not always present)
      const line = comp?.odds?.[0];
      const total =
        typeof line?.overUnder === "number"
          ? line.overUnder
          : (line?.overUnder && Number(line.overUnder)) || null;

      // Spread is from perspective of favorite; ESPN gives details like "DAL -3.5"
      // When "spread" is present as a number -> it’s usually favorite spread.
      // We keep raw numeric here; UI will flip sign for away players.
      const spread =
        typeof line?.spread === "number"
          ? line.spread
          : (line?.details && parseFloat(String(line.details).split(" ").pop() ?? ""))
              || null;

      const venue = comp?.venue?.fullName ?? comp?.venue?.address?.city ?? "TBD";
      const indoor = comp?.venue?.indoor;
      const isDome = typeof indoor === "boolean"
        ? indoor
        : DOME_TEAMS.has(normAbbr(homeAbbr));

      const start = ev?.date ?? null;

      return {
        week,
        homeTeam,
        homeAbbr,
        awayTeam,
        awayAbbr,
        total,
        spread,
        venue,
        isDome,
        start,
      };
    });

    return NextResponse.json({
      status: "success",
      week,
      count: games.length,
      data: games,
    });
  } catch (e: any) {
    return NextResponse.json({ status: "error", message: e.message, data: [] });
  }
}
