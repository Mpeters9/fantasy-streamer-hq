import { NextResponse } from "next/server";

async function safeFetch(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`[autoFill] Failed to fetch ${url}:`, err);
    return { status: "error", data: [] };
  }
}

export async function GET() {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const [rankings, odds, weather, players] = await Promise.all([
      safeFetch(`${base}/api/cron/rankings`),
      safeFetch(`${base}/api/cron/odds`),
      safeFetch(`${base}/api/cron/weather`),
      safeFetch(`${base}/api/cron/players`),
    ]);

    const teams: Record<string, any> = {};

    const addData = (teamName: string, key: string, value: any) => {
      if (!teamName) return;
      const keyNorm = teamName.toLowerCase().trim();
      if (!teams[keyNorm]) teams[keyNorm] = {};
      teams[keyNorm][key] = value;
    };

    // Rankings
    if (Array.isArray(rankings?.data)) {
      for (const t of rankings.data) {
        addData(t.team, "Rank", t.rank);
        addData(t.team, "Record", t.record);
      }
    }

    // Odds
    if (Array.isArray(odds?.data)) {
      for (const g of odds.data) {
        const h = g.homeTeam || g.team || "";
        const a = g.awayTeam || "";
        const spread = Number(g.spread) || 0;
        const total = Number(g.total) || 0;
        addData(h, "Spread", spread);
        addData(h, "Total", total);
        addData(a, "Spread", -spread);
        addData(a, "Total", total);
        const impliedH = total / 2 - spread / 2 + 25;
        const impliedA = total / 2 + spread / 2 + 25;
        addData(h, "ImpliedPts", Math.round(impliedH));
        addData(a, "ImpliedPts", Math.round(impliedA));
      }
    }

    // Weather
    if (Array.isArray(weather?.data)) {
      for (const w of weather.data) {
        addData(w.team, "TempF", w.tempF);
        addData(w.team, "WindMph", w.windMph);
        addData(w.team, "Weather_OK", Number(w.tempF) > 25 && Number(w.windMph) < 12);
      }
    }

    // Players — now safely handles all cases
    if (players?.data && typeof players.data === "object") {
      for (const [pos, arr] of Object.entries(players.data)) {
        if (!Array.isArray(arr)) continue;
        for (const p of arr) {
          addData(p.team, `${pos}_Player`, p.name);
          addData(p.team, `${pos}_Score`, p.overall);
        }
      }
    }

    const result = Object.entries(teams).map(([team, vals]) => ({
      team,
      ...vals,
    }));

    return NextResponse.json({
      status: "success",
      count: result.length,
      data: result,
      updated: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[autoFill] Uncaught error:", err.message);
    return NextResponse.json({
      status: "error",
      message: err.message,
      data: [],
    });
  }
}
