// src/app/api/cron/sync/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * Unified cache sync:
 *  - current week
 *  - schedule for that week
 *  - players (fantasy-relevant)
 *  - weather (your existing endpoint)
 *
 * NOTE: Odds are now embedded in schedule when ESPN provides them.
 */
export async function GET() {
  const cachePath = path.join(process.cwd(), "tmp", "fshq-cache.json");
  const tmpDir = path.dirname(cachePath);
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  try {
    // Fetch live week then fetch that specific week's schedule so it's deterministic
    const weekRes = await fetch("http://localhost:3000/api/cron/week", { cache: "no-store" });
    const weekJson = await weekRes.json();
    const liveWeek = weekJson?.week || 0;

    const [playersR, schedR, weatherR] = await Promise.allSettled([
      fetch("http://localhost:3000/api/cron/players", { cache: "no-store" }),
      fetch(`http://localhost:3000/api/cron/schedule?week=${liveWeek}`, { cache: "no-store" }),
      fetch("http://localhost:3000/api/cron/weather", { cache: "no-store" }),
    ]);

    const toJson = async (p: any) => (p.status === "fulfilled" ? p.value.json() : { data: [] });

    const players = await toJson(playersR);
    const schedule = await toJson(schedR);
    const weather = await toJson(weatherR);

    const payload = {
      status: "success",
      fetchedAt: new Date().toISOString(),
      week: schedule.week || liveWeek || 0,
      schedule: schedule.data || [],
      players: players.data || [],
      weather: weather.data || [],
    };

    fs.writeFileSync(cachePath, JSON.stringify(payload, null, 2));
    return NextResponse.json(payload);
  } catch (e: any) {
    return NextResponse.json({ status: "error", message: e.message });
  }
}
