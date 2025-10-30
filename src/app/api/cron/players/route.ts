// src/app/api/cron/players/route.ts
import { NextResponse } from "next/server";

/**
 * ESPN Public Roster API (2025)
 * - No API key required
 * - Pulls all 32 team rosters
 * - Filters for fantasy-relevant positions only
 */
export async function GET() {
  try {
    // ESPN team IDs (full 32 teams)
    const TEAM_IDS = [
      "1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16",
      "17","18","19","20","21","22","23","24","25","26","27","28","29","30","33","34"
    ];

    // Fantasy-relevant positions only
    const VALID_POSITIONS = new Set(["QB", "RB", "WR", "TE", "K", "DST", "D/ST"]);

    const players: any[] = [];

    // Fetch each team roster from ESPN
    for (const id of TEAM_IDS) {
      const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${id}/roster`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;

      const data = await res.json();
      const teamName = data.team?.displayName || "Unknown Team";
      const teamAbbr = data.team?.abbreviation || "UNK";

      for (const group of data.athletes || []) {
        for (const p of group.items || []) {
          const pos = p.position?.abbreviation || "N/A";
          if (!VALID_POSITIONS.has(pos)) continue;

          players.push({
            id: p.id,
            name: p.displayName,
            position: pos === "D/ST" ? "DST" : pos,
            team: teamAbbr,
            teamName,
            jersey: p.jersey || null,
            headshot: p.headshot?.href || null,
          });
        }
      }
    }

    // Sort alphabetically by position for easier reading
    players.sort((a, b) => a.position.localeCompare(b.position));

    console.log(`✅ [players] Pulled ${players.length} fantasy-relevant players (2025)`);
    return NextResponse.json({
      status: "success",
      season: 2025,
      count: players.length,
      data: players.slice(0, 500), // trim for fast load
    });
  } catch (err: any) {
    console.error("❌ [players] Error:", err.message);
    return NextResponse.json({
      status: "error",
      message: err.message,
      data: [],
    });
  }
}
