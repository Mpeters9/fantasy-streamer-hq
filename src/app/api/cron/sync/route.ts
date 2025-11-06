import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CACHE_PATH = path.join(process.cwd(), "tmp", "fshq-cache.json");
const CURRENT_WEEK = 10;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "true";

  try {
    if (!force && fs.existsSync(CACHE_PATH)) {
      const cached = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
      if (cached.snapshot?.players?.length > 0) {
        return NextResponse.json({
          status: "success",
          week: cached.week,
          snapshot: cached.snapshot,
          count: cached.snapshot.players.length,
        });
      }
    }

    console.log("🌐 Fetching updated player, odds, weather, and schedule data…");

    const [playersRes, oddsRes, weatherRes, scheduleRes] = await Promise.all([
      fetch("http://localhost:3000/api/cron/players").then((r) => r.json()),
      fetch("http://localhost:3000/api/cron/odds").then((r) => r.json()),
      fetch("http://localhost:3000/api/cron/weather").then((r) => r.json()),
      fetch(`http://localhost:3000/api/cron/schedule?week=${CURRENT_WEEK}`).then(
        (r) => r.json()
      ),
    ]);

    const players = playersRes?.players || playersRes?.data || [];
    const odds = oddsRes?.data || [];
    const weather = weatherRes?.data || [];
    const schedule = scheduleRes?.data || [];

    const merged = players
      .filter((p: any) =>
        ["QB", "RB", "WR", "TE", "DST", "K"].includes(p.position)
      )
      .map((p: any) => {
        const sched = schedule.find(
          (g: any) => g.homeTeam === p.team || g.awayTeam === p.team
        );
        const opponent =
          sched?.homeTeam === p.team
            ? sched?.awayTeam
            : sched?.homeTeam ?? "TBD";

        // Prefer odds feed if available, else fallback to schedule odds
        const oddsGame =
          odds.find(
            (g: any) => g.homeTeam === p.team || g.awayTeam === p.team
          ) || sched;

        const rawSpread = oddsGame?.spread ?? 0;
        const spread =
          oddsGame?.homeTeam === p.team
            ? Number(rawSpread)
            : -1 * Number(rawSpread);

        const impliedPts =
          typeof oddsGame?.total === "number"
            ? (oddsGame.total / 2 + spread / 2).toFixed(1)
            : "N/A";

        const weatherInfo = weather.find(
          (w: any) =>
            w.team === p.team ||
            w.teamAbbrev === p.team ||
            w.location?.includes(p.team)
        );

        const weatherText = weatherInfo
          ? `${weatherInfo.tempF?.toFixed?.(0) ?? "?"}°F • Wind ${
              weatherInfo.windMph?.toFixed?.(0) ?? "?"
            } mph`
          : "N/A";

        return {
          id: p.id,
          name: p.name,
          team: p.team,
          position: p.position,
          opponent,
          spread: isNaN(spread) ? "N/A" : spread.toFixed(1),
          impliedPts,
          weather: weatherText,
          headshot:
            p.headshot ||
            `https://a.espncdn.com/i/headshots/nfl/players/full/${p.id}.png`,
        };
      });

    const snapshot = {
      week: CURRENT_WEEK,
      players: merged,
      fetchedAt: new Date().toISOString(),
    };

    fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
    fs.writeFileSync(
      CACHE_PATH,
      JSON.stringify({ week: CURRENT_WEEK, snapshot }, null, 2)
    );

    console.log(`✅ Cached ${merged.length} enriched players for Week ${CURRENT_WEEK}.`);

    return NextResponse.json({
      status: "success",
      week: CURRENT_WEEK,
      snapshot,
      count: merged.length,
    });
  } catch (err: any) {
    console.error("❌ Sync failed:", err);
    return NextResponse.json(
      { status: "error", message: err.message, snapshot: { players: [] } },
      { status: 500 }
    );
  }
}
