// src/app/api/cron/sync/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const boardRes = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=2",
      { cache: "no-store" }
    );
    const board = await boardRes.json();
    let week = board?.week?.number ?? 0;

    const events = board?.events || [];
    const allFinal = events.every((e: any) =>
      e?.competitions?.[0]?.status?.type?.completed
    );
    if (allFinal) week += 1;

    // Schedule
    const schedRes = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=2&week=${week}`,
      { cache: "no-store" }
    );
    const sched = await schedRes.json();

    const schedule = (sched.events || []).map((g: any) => {
      const c = g.competitions?.[0];
      const home = c?.competitors?.find((x: any) => x.homeAway === "home");
      const away = c?.competitors?.find((x: any) => x.homeAway === "away");
      return {
        week,
        homeTeam: home?.team?.displayName,
        homeAbbr: home?.team?.abbreviation,
        awayTeam: away?.team?.displayName,
        awayAbbr: away?.team?.abbreviation,
        start: c?.date ?? null,
        venue: c?.venue?.fullName ?? null,
        isDome: /dome|indoor/i.test(c?.venue?.fullName ?? ""),
      };
    });

    // Odds & weather
    const [odds, weather, playersRes] = await Promise.all([
      fetch(`/api/cron/odds`, { cache: "no-store" }).then((r) => r.json()).catch(() => ({ data: [] })),
      fetch(`/api/cron/weather`, { cache: "no-store" }).then((r) => r.json()).catch(() => ({ data: [] })),
      fetch(`/api/cron/players`, { cache: "no-store" }).then((r) => r.json()).catch(() => ({ data: [] })),
    ]);

    // Normalize players
    const players =
      playersRes.data?.map((p: any) => ({
        id: p.id,
        name: p.name,
        team: p.team,
        position: p.position,
        headshot: p.headshot,
      })) ?? [];

    return NextResponse.json({
      status: "success",
      fetchedAt: new Date().toISOString(),
      week,
      schedule,
      odds: odds.data ?? [],
      weather: weather.data ?? [],
      players,
    });
  } catch (err: any) {
    return NextResponse.json({
      status: "error",
      message: err.message,
      data: [],
    });
  }
}
