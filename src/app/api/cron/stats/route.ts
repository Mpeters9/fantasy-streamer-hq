import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * ESPN NFL Stats (position-specific, 2025)
 * Fetches per-player weekly stats and caches them for 12 hours.
 */
export async function GET() {
  const cachePath = "C:/tmp/fshq-stats.json";
  const cacheTTL = 12 * 60 * 60 * 1000; // 12 hours

  try {
    // Serve from cache if recent
    if (fs.existsSync(cachePath)) {
      const stat = fs.statSync(cachePath);
      const age = Date.now() - stat.mtimeMs;
      if (age < cacheTTL) {
        const cached = JSON.parse(fs.readFileSync(cachePath, "utf8"));
        console.log("🗂️ [stats] Using cached data");
        return NextResponse.json(cached);
      }
    }
  } catch (e) {
    console.warn("⚠️ Cache check failed:", e);
  }

  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard`,
      { cache: "no-store" }
    );
    const data = await res.json();

    if (!data.events?.length)
      return NextResponse.json({
        status: "success",
        count: 0,
        fetchedAt: new Date().toISOString(),
        data: [],
      });

    const players: any[] = [];

    const mapStats = (stats: any[], position: string) => {
      const mapped: any = { position };
      for (const s of stats) {
        const label = s.name?.toLowerCase();
        const value = parseFloat(s.displayValue || "0");

        // QB
        if (position === "QB") {
          if (label.includes("passing yards")) mapped.passYds = value;
          if (label.includes("passing touchdowns")) mapped.passTD = value;
          if (label.includes("interceptions")) mapped.int = value;
          if (label.includes("rushing yards")) mapped.rushYds = value;
          if (label.includes("rushing touchdowns")) mapped.rushTD = value;
        }

        // RB
        if (position === "RB") {
          if (label.includes("rushing attempts")) mapped.rushAtt = value;
          if (label.includes("rushing yards")) mapped.rushYds = value;
          if (label.includes("rushing touchdowns")) mapped.rushTD = value;
          if (label.includes("receptions")) mapped.rec = value;
          if (label.includes("receiving yards")) mapped.recYds = value;
          if (label.includes("receiving touchdowns")) mapped.recTD = value;
        }

        // WR & TE
        if (["WR", "TE"].includes(position)) {
          if (label.includes("receptions")) mapped.rec = value;
          if (label.includes("receiving yards")) mapped.recYds = value;
          if (label.includes("receiving touchdowns")) mapped.recTD = value;
          if (label.includes("targets")) mapped.targets = value;
        }

        // Kicker
        if (position === "K") {
          if (label.includes("field goals made")) mapped.fgMade = value;
          if (label.includes("field goals missed")) mapped.fgMiss = value;
          if (label.includes("extra points made")) mapped.xpMade = value;
        }

        // Defense
        if (["DST", "D/ST"].includes(position)) {
          if (label.includes("sacks")) mapped.sacks = value;
          if (label.includes("interceptions")) mapped.defInt = value;
          if (label.includes("fumble")) mapped.fumRec = value;
          if (label.includes("defensive touchdowns")) mapped.defTD = value;
          if (label.includes("points allowed")) mapped.pointsAllowed = value;
        }
      }
      return mapped;
    };

    for (const ev of data.events) {
      const comp = ev.competitions?.[0];
      if (!comp) continue;

      for (const side of comp.competitors || []) {
        const team = side.team?.abbreviation;
        const opp =
          comp.competitors?.find((t: any) => t !== side)?.team?.abbreviation ||
          "UNK";

        for (const group of side.leaders || []) {
          for (const item of group?.leaders || []) {
            const athlete = item?.athlete;
            if (!athlete) continue;
            const pos = athlete.position?.abbreviation || "UNK";

            const playerStats = mapStats(item?.athlete?.stats || [], pos);

            players.push({
              id: athlete.id,
              name: athlete.displayName,
              team,
              opponent: opp,
              position: pos,
              ...playerStats,
            });
          }
        }
      }
    }

    console.log(`✅ [stats] Pulled ${players.length} player stats`);
    const payload = {
      status: "success",
      count: players.length,
      fetchedAt: new Date().toISOString(),
      data: players,
    };

    // Cache locally
    try {
      fs.writeFileSync(cachePath, JSON.stringify(payload, null, 2));
      console.log("💾 [stats] Cached successfully");
    } catch (e) {
      console.warn("⚠️ Cache write failed:", e);
    }

    return NextResponse.json(payload);
  } catch (err: any) {
    console.error("❌ [stats] Error:", err.message);
    return NextResponse.json({
      status: "error",
      message: err.message,
      data: [],
    });
  }
}
