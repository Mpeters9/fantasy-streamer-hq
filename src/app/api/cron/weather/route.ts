import { NextResponse } from "next/server";

export async function GET() {
  const weather = [
    { matchup: "SEA @ GB", condition: "Rainy", temp: 51, wind: 10 },
    { matchup: "CLE @ PIT", condition: "Cloudy", temp: 44, wind: 7 },
    { matchup: "DEN @ LV", condition: "Clear", temp: 65, wind: 5 },
  ];

  return NextResponse.json({
    status: "success",
    weather,
  });
}
