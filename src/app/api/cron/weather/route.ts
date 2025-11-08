import { NextResponse } from "next/server";
import { getWeatherForTeam } from "@/lib/weather";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const team = (searchParams.get("team") || "").toUpperCase();
  const kickoff = searchParams.get("kickoff") || new Date().toISOString();
  const wx = await getWeatherForTeam(team, kickoff);
  return NextResponse.json({ team, weather: wx });
}
