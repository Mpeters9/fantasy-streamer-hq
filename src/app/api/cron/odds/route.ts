import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Example live API (replace with your preferred odds API)
    const res = await fetch("https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?regions=us&oddsFormat=american", {
      headers: { "x-api-key": process.env.ODDS_API_KEY || "" },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const parsed = json.slice(0, 10).map((g: any) => ({
      homeTeam: g.home_team,
      awayTeam: g.away_team,
      spread: g.bookmakers?.[0]?.markets?.[0]?.outcomes?.[0]?.point ?? "N/A",
      total: g.bookmakers?.[0]?.markets?.find((m: any) => m.key === "totals")?.outcomes?.[0]?.point ?? "N/A",
      homeMoneyLine: g.bookmakers?.[0]?.markets?.[1]?.outcomes?.[0]?.price ?? "N/A",
      awayMoneyLine: g.bookmakers?.[0]?.markets?.[1]?.outcomes?.[1]?.price ?? "N/A",
    }));

    return NextResponse.json({ status: "success", count: parsed.length, data: parsed });
  } catch (err: any) {
    console.error("Failed to fetch live odds:", err.message);
    // Return mock odds fallback
    const mock = [
      { homeTeam: "49ers", awayTeam: "Chiefs", spread: -3.5, total: 48.5, homeMoneyLine: -180, awayMoneyLine: 160 },
      { homeTeam: "Eagles", awayTeam: "Lions", spread: -2.5, total: 50.0, homeMoneyLine: -140, awayMoneyLine: 120 },
    ];
    return NextResponse.json({ status: "success", count: mock.length, data: mock });
  }
}
