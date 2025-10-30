import { NextResponse } from "next/server";

const API_KEY = process.env.SPORTS_DATA_IO_API_KEY;
const API_URL = "https://api.sportsdata.io/v3/nfl/scores/json/Standings/2025REG";

export async function GET() {
  try {
    if (!API_KEY) throw new Error("Missing SPORTS_DATA_IO_API_KEY");

    const res = await fetch(API_URL, {
      headers: { "Ocp-Apim-Subscription-Key": API_KEY },
      next: { revalidate: 3600 }, // 1-hour cache to reduce API usage
    });

    if (!res.ok) throw new Error(`SportsData.io request failed: ${res.status} ${res.statusText}`);

    const standings = await res.json();

    // Combine team city + name (some responses only have one or the other)
    const rankings = standings
      .sort((a: any, b: any) => b.Wins - a.Wins || b.Percentage - a.Percentage)
      .map((team: any, i: number) => ({
        rank: i + 1,
        team: `${team.City ?? ""} ${team.Name ?? ""}`.trim(),
        record: `${team.Wins}-${team.Losses}`,
      }));

    console.log(`✅ [rankings] Retrieved ${rankings.length} NFL teams (2025 season)`);
    return NextResponse.json(rankings);
  } catch (err) {
    console.error("❌ [rankings] Error:", err);
    const fallback = [
      { rank: 1, team: "49ers", record: "7-1" },
      { rank: 2, team: "Chiefs", record: "6-2" },
      { rank: 3, team: "Ravens", record: "6-2" },
      { rank: 4, team: "Eagles", record: "6-2" },
      { rank: 5, team: "Lions", record: "6-2" },
    ];
    return NextResponse.json({
      status: "error",
      message: "Failed to fetch 2025 standings",
      data: fallback,
    });
  }
}
