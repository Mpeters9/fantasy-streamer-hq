import { NextResponse } from "next/server";
import { getScheduleMap } from "@/lib/schedule";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const week = Number(searchParams.get("week") || "10");
  const map = await getScheduleMap(week);
  // return as array for easy iteration
  const arr = Object.values(map).map(v => ({
    team: v.team, opponent: v.opponent, kickoff: v.kickoff, spread: v.spreadForTeam ?? null, total: v.total ?? null
  }));
  return NextResponse.json({ week, data: arr });
}
