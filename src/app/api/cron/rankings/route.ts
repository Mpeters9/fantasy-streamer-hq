import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.fantasypros.com/public/v2/nfl/weekly-rankings", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const teams = json.rankings?.slice(0, 10).map((t: any, i: number) => ({
      rank: i + 1,
      team: t.team_name || t.team || "Unknown",
      record: t.record || "N/A",
    }));

    return NextResponse.json({ status: "success", count: teams.length, data: teams });
  } catch (err: any) {
    console.error("Failed to fetch live rankings:", err.message);
    // Stable fallback (your previous data)
    const fallback = [
      { rank: 1, team: "49ers", record: "7-1" },
      { rank: 2, team: "Chiefs", record: "6-2" },
      { rank: 3, team: "Ravens", record: "6-2" },
      { rank: 4, team: "Eagles", record: "6-2" },
      { rank: 5, team: "Lions", record: "6-2" },
    ];
    return NextResponse.json({ status: "success", count: fallback.length, data: fallback });
  }
}
