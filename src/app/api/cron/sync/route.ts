import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CACHE_PATH = path.join(process.cwd(), "tmp", "fshq-cache.json");

async function getCurrentWeek() {
  try {
    const res = await fetch("https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard");
    const data = await res.json();
    return data.week?.number || 1;
  } catch {
    return 10;
  }
}

function shouldAutoRefresh(filePath: string) {
  if (!fs.existsSync(filePath)) return true;
  const stats = fs.statSync(filePath);
  const lastModified = new Date(stats.mtime);
  const now = new Date();
  const tuesday = new Date(now);
  tuesday.setDate(now.getDate() - ((now.getDay() + 5) % 7));
  tuesday.setHours(2, 0, 0, 0);
  return lastModified < tuesday;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "true";

  try {
    const CURRENT_WEEK = await getCurrentWeek();
    const mustRefresh = force || shouldAutoRefresh(CACHE_PATH);

    if (!mustRefresh && fs.existsSync(CACHE_PATH)) {
      const cached = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
      if (cached.snapshot?.players?.length > 0) {
        return NextResponse.json({
          status: "cached",
          week: cached.week,
          snapshot: cached.snapshot,
          count: cached.snapshot.players.length,
        });
      }
    }

    console.log(`🔁 Rebuilding player snapshot for Week ${CURRENT_WEEK}`);

    const [playersRes, oddsRes, weatherRes, scheduleRes] = await Promise.all([
      fetch("http://localhost:3000/api/cron/players").then((r) => r.json()),
      fetch("http://localhost:3000/api/cron/odds").then((r) => r.json()),
      fetch("http://localhost:3000/api/cron/weather").then((r) => r.json()),
      fetch(`http://localhost:3000/api/cron/schedule?week=${CURRENT_WEEK}`).then((r) => r.json()),
    ]);

    const players = playersRes?.players || playersRes?.data || [];
    const odds = oddsRes?.data || [];
    const weather = weatherRes?.data || [];
    const schedule = scheduleRes?.data || [];

    const merged = players
      .filter((p: any) => ["QB", "RB", "WR", "TE", "DST", "K"].includes(p.position))
      .map((p: any) => {
        const sched = schedule.find((g: any) => g.homeTeam === p.team || g.awayTeam === p.team);
        const opponent = sched?.homeTeam === p.team ? sched?.awayTeam : sched?.homeTeam ?? "TBD";
        const oddsGame = odds.find((g: any) => g.homeTeam === p.team || g.awayTeam === p.team) || sched;

        const rawSpread = oddsGame?.spread ?? 0;
        const spread = oddsGame?.homeTeam === p.team ? Number(rawSpread) : -1 * Number(rawSpread);
        const impliedPts =
          typeof oddsGame?.total === "number" ? (oddsGame.total / 2 + spread / 2).toFixed(1) : "N/A";

        const weatherInfo = weather.find(
          (w: any) => w.team === p.team || w.teamAbbrev === p.team || w.location?.includes(p.team)
        );
        const weatherText = weatherInfo
          ? `${weatherInfo.tempF?.toFixed?.(0) ?? "?"}°F • Wind ${weatherInfo.windMph?.toFixed?.(0) ?? "?"} mph`
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
            p.headshot || `https://a.espncdn.com/i/headshots/nfl/players/full/${p.id}.png`,
        };
      });

    const snapshot = { week: CURRENT_WEEK, players: merged, fetchedAt: new Date().toISOString() };
    fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
    fs.writeFileSync(CACHE_PATH, JSON.stringify({ week: CURRENT_WEEK, snapshot }, null, 2));

    return NextResponse.json({ status: "refreshed", week: CURRENT_WEEK, snapshot, count: merged.length });
  } catch (err: any) {
    console.error("❌ sync failed:", err);
    return NextResponse.json({ status: "error", message: err.message, snapshot: { players: [] } }, { status: 500 });
  }
}
