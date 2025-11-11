// src/app/api/cron/players/route.ts
import { NextResponse } from "next/server";
import { fetchPlayers } from "@/lib/players";

export async function GET() {
  try {
    const players = await fetchPlayers();
    return NextResponse.json(players);
  } catch (err) {
    console.error("Error in /api/cron/players:", err);
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
  }
}
