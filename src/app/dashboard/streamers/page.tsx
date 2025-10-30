import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🎯 [streamers] Fetching updated waiver streamers...");

    // 1️⃣ Fetch Sleeper player data (free API)
    const sleeperRes = await fetch("https://api.sleeper.app/v1/players/nfl", {
      cache: "no-store",
    });
    const sleeperData = await sleeperRes.json();

    // 2️⃣ Convert Sleeper data into a quick lookup table
    const players = Object.values(sleeperData) as any[];

    // Helper: find player by name and get percent rostered (fallback 0)
    const getRosterPercent = (name: string) => {
      const match = players.find(
        (p) =>
          p.full_name?.toLowerCase() === name.toLowerCase() ||
          `${p.first_name} ${p.last_name}`.toLowerCase() === name.toLowerCase()
      );
      return match?.percent_rostered ?? 0;
    };

    // 3️⃣ Mock some “base performance” data (since we don’t have live stats yet)
    //    This should eventually pull from your real player API.
    const mockPlayers = [
      { name: "Tyrone Tracy", team: "NYG", position: "RB", overall: 18.6 },
      { name: "Jerome Ford", team: "CLE", position: "RB", overall: 17.9 },
      { name: "Tank Bigsby", team: "PHI", position: "RB", overall: 16.4 },
      { name: "Jayden Higgins", team: "HOU", position: "WR", overall: 16.9 },
      { name: "Tre Tucker", team: "LV", position: "WR", overall: 15.8 },
      { name: "Colston Loveland", team: "CHI", position: "TE", overall: 14.2 },
      { name: "Hunter Henry", team: "NE", position: "TE", overall: 13.9 },
      { name: "Rams DST", team: "LAR", position: "DST", overall: 13.5 },
      { name: "Ravens DST", team: "BAL", position: "DST", overall: 13.3 },
      { name: "Jaguars DST", team: "JAX", position: "DST", overall: 13.1 },
    ];

    // 4️⃣ Attach roster % and filter waiver-eligible (<50% rostered)
    const WAIVER_THRESHOLD = 0.5;
    const enriched = mockPlayers.map((p) => ({
      ...p,
      percentRostered: getRosterPercent(p.name),
    }));

    const waiverOnly = enriched.filter(
      (p) => p.percentRostered === 0 || p.percentRostered <= WAIVER_THRESHOLD
    );

    // 5️⃣ Group by position
    const grouped: Record<string, any[]> = {};
    for (const pl of waiverOnly) {
      if (!grouped[pl.position]) grouped[pl.position] = [];
      grouped[pl.position].push(pl);
    }

    // 6️⃣ Limit top 5 per position
    for (const key of Object.keys(grouped)) {
      grouped[key] = grouped[key]
        .sort((a, b) => b.overall - a.overall)
        .slice(0, 5);
    }

    // ✅ Final return
    return NextResponse.json({
      status: "success",
      updated: new Date().toISOString(),
      data: grouped,
    });
  } catch (err) {
    console.error("❌ [streamers] Error:", err);
    return NextResponse.json(
      { status: "error", message: "Failed to build streamer list" },
      { status: 500 }
    );
  }
}
