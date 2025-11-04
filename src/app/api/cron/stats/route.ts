import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * ESPN NFL Stats (2025) — resilient version
 * Always returns data, even if ESPN is slow to update.
 */
export async function GET() {
  const cachePath = "C:/tmp/fshq-stats.json";
  const cacheTTL = 12 * 60 * 60 * 1000; // 12 h

  // helper for sending a cached file
  const sendCache = (label = "🗂️ [stats] Served cached data") => {
    try {
      if (fs.existsSync(cachePath)) {
        const cached = JSON.parse(fs.readFileSync(cachePath, "utf8"));
        console.log(label, `(${cached.count} players)`);
        return NextResponse.json(cached);
      }
    } catch (e) {
      console.warn("⚠️ Cache read failed:", e);
    }
    return NextResponse.json({
      status: "error",
      message: "No valid cached data available.",
      count: 0,
      data: [],
    });
  };

  // ① try pulling fresh ESPN data
  try {
    console.log("📡 [stats] Fetching fresh data from ESPN…");
    const res = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",
      { cache: "no-store" }
    );

    // ESPN sometimes returns HTML on downtime
    const text = await res.text();
    if (text.startsWith("<!DOCTYPE")) throw new Error("Invalid ESPN response");
    const data = JSON.parse(text);

    const events = data.events || [];
    if (!events.length) throw new Error("Empty event list");

    const players: any[] = [];

    const mapStats = (stats: any[], position: string) => {
      const mapped: any = { position };
      for (const s of stats || []) {
        const label = s.name?.toLowerCase() ?? "";
        const val = parseFloat(s.displayValue || "0");
        if (position === "QB") {
          if (label.includes("passing yards")) mapped.passYds = val;
          if (label.includes("passing touchdowns")) mapped.passTD = val;
          if (label.includes("interceptions")) mapped.int = val;
          if (label.includes("rushing yards")) mapped.rushYds = val;
          if (label.includes("rushing touchdowns")) mapped.rushTD = val;
        }
        if (position === "RB") {
          if (label.includes("rushing yards")) mapped.rushYds = val;
          if (label.includes("rushing touchdowns")) mapped.rushTD = val;
          if (label.includes("receptions")) mapped.rec = val;
          if (label.includes("receiving yards")) mapped.recYds = val;
        }
        if (["WR", "TE"].includes(position)) {
          if (label.includes("receptions")) mapped.rec = val;
          if (label.includes("receiving yards")) mapped.recYds = val;
          if (label.includes("receiving touchdowns")) mapped.recTD = val;
        }
      }
      return mapped;
    };

    for (const ev of events) {
      const comp = ev.competitions?.[0];
      if (!comp) continue;
      for (const side of comp.competitors || []) {
        const team = side.team?.abbreviation;
        const opp =
          comp.competitors?.find((x: any) => x !== side)?.team?.abbreviation ||
          "UNK";
        for (const group of side.leaders || []) {
          for (const l of group.leaders || []) {
            const a = l.athlete;
            if (!a) continue;
            const pos = a.position?.abbreviation || "UNK";
            const statLine = mapStats(a.stats || [], pos);
            players.push({
              id: a.id,
              name: a.displayName,
              team,
              opponent: opp,
              position: pos,
              ...statLine,
            });
          }
        }
      }
    }

    // if we got data, save + return
    if (players.length) {
      const payload = {
        status: "success",
        count: players.length,
        fetchedAt: new Date().toISOString(),
        data: players,
      };
      try {
        fs.writeFileSync(cachePath, JSON.stringify(payload, null, 2));
        console.log("💾 [stats] Cached successfully");
      } catch (e) {
        console.warn("⚠️ Cache write failed:", e);
      }
      return NextResponse.json(payload);
    }

    throw new Error("No player data parsed");
  } catch (err: any) {
    console.warn("⚠️ [stats] ESPN fetch failed:", err.message);
    // fallback to last cached
    return sendCache("🕓 [stats] ESPN down — using last cached data");
  }
}
