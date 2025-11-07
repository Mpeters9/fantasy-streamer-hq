import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const TMP_DIR = path.join(process.cwd(), "tmp");
const CACHE_PATH = path.join(TMP_DIR, "player-cache.json");

// Normalize team keys to a simple token for matching
const norm = (s: string) => (s || "").toLowerCase().replace(/[^a-z]/g, "");

// Basic implied points calculator
function calcImplied(total: number, spread: number, isHome: boolean) {
  const fav = total / 2 - spread / 2;
  const dog = total - fav;
  return isHome ? fav : dog;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const force = url.searchParams.get("force") === "true";

    const origin = `${url.protocol}//${url.host}`; // absolute base for internal fetches

    if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

    // 1) Pull fresh players
    const playersRes = await fetch(`${origin}/api/cron/players`, { cache: "no-store" });
    const playersJson = await playersRes.json();
    if (!playersJson?.ok) throw new Error(playersJson?.error || "Failed players");

    // 2) Odds & schedule (your existing endpoints)
    const weekRes = await fetch(`${origin}/api/cron/week`, { cache: "no-store" });
    const { week } = await weekRes.json();

    const schedRes = await fetch(`${origin}/api/cron/schedule?week=${week}`, { cache: "no-store" });
    const schedJson = await schedRes.json();
    const games: any[] = schedJson?.data ?? [];

    // Build a lookup for opponent/spread/implied by team
    // Expecting schedule items: { homeTeam, awayTeam, spread, total, ... }
    const byTeam: Record<string, any> = {};
    for (const g of games) {
      const home = g.homeTeam;
      const away = g.awayTeam;
      const spread = typeof g.spread === "number" ? g.spread : 0;
      const total = typeof g.total === "number" ? g.total : 44;

      byTeam[norm(home)] = {
        opponent: away,
        spread, // spread is for home team (negative = home favorite)
        implied: calcImplied(total, spread, true),
      };
      byTeam[norm(away)] = {
        opponent: home,
        // flip spread for away side
        spread: -spread,
        implied: calcImplied(total, spread, false),
      };
    }

    // 3) Weather (expecting [{team, tempF, windMph, condition}])
    const weatherRes = await fetch(`${origin}/api/cron/weather`, { cache: "no-store" });
    const weatherJson = await weatherRes.json();
    const wMap: Record<string, any> = {};
    for (const w of weatherJson?.data ?? []) {
      wMap[norm(w.team)] = w;
    }

    // 4) Merge
    const merged = (playersJson.data as any[]).map(p => {
      const teamKey = norm(p.team);           // "dal"
      const odds = byTeam[teamKey];
      const weather = wMap[teamKey];

      return {
        ...p,
        opponent: odds?.opponent ?? "TBD",
        spread: typeof odds?.spread === "number" ? Number(odds.spread) : 0,
        impliedPts: typeof odds?.implied === "number" ? Number(odds.implied.toFixed(1)) : null,
        weather: weather
          ? (weather.condition === 0 ? "Clear"
            : weather.condition === 3 ? "Wind"
            : "Weather")
          : "Indoor/Dome",
      };
    });

    // 5) Write cache (always, or only if force — either way is safe)
    fs.writeFileSync(CACHE_PATH, JSON.stringify({
      week,
      updatedAt: new Date().toISOString(),
      players: merged,
    }, null, 2));

    return NextResponse.json({
      ok: true,
      week,
      count: merged.length,
      cache: CACHE_PATH,
    });
  } catch (err: any) {
    console.error("❌ /cron/sync:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
