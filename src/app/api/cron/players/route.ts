import { NextResponse } from "next/server";

/**
 * ✅ Live ESPN Roster Fetcher for 2025 Season
 * - No API key required
 * - Pulls all 32 team rosters
 * - Filters for fantasy-relevant positions
 */
export async function GET() {
  try {
    const TEAM_IDS = [
      "1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16",
      "17","18","19","20","21","22","23","24","25","26","27","28","29","30","33","34"
    ];

    const VALID_POSITIONS = new Set(["QB", "RB", "WR", "TE", "K", "D/ST"]);

    const players: any[] = [];

    for (const id of TEAM_IDS) {
      const res = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${id}/roster`,
        { cache: "no-store" }
      );
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
            headshot: p.headshot?.href || null,
          });
        }
      }
    }

    players.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      status: "success",
      season: 2025,
      count: players.length,
      data: players,
    });
  } catch (err: any) {
    console.error("❌ Error fetching player data:", err.message);
    return NextResponse.json({
      status: "error",
      message: err.message,
      data: [],
    });
  }
}
