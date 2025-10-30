import { NextResponse } from "next/server";

const API_KEY = process.env.SPORTS_DATA_IO_API_KEY;
const SEASON = "2025REG";

async function getCurrentWeek(): Promise<number> {
  try {
    const res = await fetch(
      `https://api.sportsdata.io/v3/nfl/scores/json/CurrentWeek`,
      { headers: { "Ocp-Apim-Subscription-Key": API_KEY! } }
    );
    if (!res.ok) return 1;
    return await res.json();
  } catch {
    return 1;
  }
}

export async function GET() {
  try {
    if (!API_KEY) throw new Error("Missing SPORTS_DATA_IO_API_KEY");

    const week = await getCurrentWeek();
    const API_URL = `https://api.sportsdata.io/v3/nfl/odds/json/GameOddsByWeek/${SEASON}/${week}`;

    const res = await fetch(API_URL, {
      headers: { "Ocp-Apim-Subscription-Key": API_KEY },
    });
    if (!res.ok) throw new Error(`SportsData.io request failed: ${res.status}`);

    const games = await res.json();

    const odds = games.map((g: any) => {
      const o = g.PregameOdds?.[0] ?? {};
      return {
        gameId: g.GameKey,
        homeTeam: g.HomeTeam,
        awayTeam: g.AwayTeam,
        spread: o.PointSpread ?? "N/A",
        overUnder: o.OverUnder ?? "N/A",
        homeMoneyLine: o.HomeMoneyLine ?? "N/A",
        awayMoneyLine: o.AwayMoneyLine ?? "N/A",
      };
    });

    console.log(`✅ [odds] Retrieved ${odds.length} games (Week ${week})`);
    return NextResponse.json(odds);
  } catch (err) {
    console.error("❌ [odds] Error:", err);
    return NextResponse.json({
      status: "error",
      message: "Failed to fetch live odds",
      data: [],
    });
  }
}
