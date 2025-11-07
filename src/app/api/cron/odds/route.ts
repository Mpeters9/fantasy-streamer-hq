import { NextResponse } from "next/server";

export async function GET() {
  const games = [
    { matchup: "SEA @ GB", spread: "-3.5", total: "44.5" },
    { matchup: "CLE @ PIT", spread: "-2.0", total: "41.0" },
    { matchup: "DEN @ LV", spread: "1.5", total: "42.5" },
  ];

  return NextResponse.json({
    status: "success",
    games,
  });
}
