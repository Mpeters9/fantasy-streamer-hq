import { NextResponse } from "next/server";

/**
 * Pulls the full 32 NFL rosters from ESPN public API.
 * Filters to fantasy-relevant positions and returns a flat player list:
 * id, name, team, position, headshot
 */
export async function GET() {
  try {
    const TEAM_IDS = [
      "1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16",
      "17","18","19","20","21","22","23","24","25","26","27","28","29","30","33","34"
    ];
    const VALID = new Set(["QB", "RB", "WR", "TE", "K", "DST", "D/ST"]);

    const players: any[] = [];

    for (const id of TEAM_IDS) {
      const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${id}/roster`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;

      const data = await res.json();
      const teamAbbr = data.team?.abbreviation ?? "UNK";

      for (const group of data.athletes ?? []) {
        for (const p of group.items ?? []) {
          const pos = p.position?.abbreviation ?? "N/A";
          if (!VALID.has(pos)) continue;

          players.push({
            id: String(p.id),
            name: p.displayName,
            team: teamAbbr,
            position: pos === "D/ST" ? "DST" : pos,
            headshot:
              p.headshot?.href ??
              "https://a.espncdn.com/i/headshots/nophoto.png",
          });
        }
      }
    }

    // De-dupe by (name,team,position)
    const key = (x: any) => `${x.name}|${x.team}|${x.position}`;
    const dedup = Array.from(
      new Map(players.map(p => [key(p), p])).values()
    );

    return NextResponse.json({
      ok: true,
      count: dedup.length,
      data: dedup.sort((a, b) => a.name.localeCompare(b.name)),
    });
  } catch (err: any) {
    console.error("❌ /cron/players:", err);
    return NextResponse.json({ ok: false, error: err.message, data: [] }, { status: 500 });
  }
}
