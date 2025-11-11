// src/app/api/cron/week/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.sleeper.app/v1/state/nfl");
    const data = await res.json();

    let week = data.week;
    const now = new Date();
    const day = now.getUTCDay(); // 0 = Sunday ... 6 = Saturday
    const hour = now.getUTCHours();

    // If it’s Monday–Wednesday morning, use the next week
    if (day === 1 || day === 2 || (day === 3 && hour < 12)) {
      week += 1;
    }

    return NextResponse.json({ week });
  } catch (err) {
    console.error("Week fetch failed:", err);
    // Default fallback — if Sleeper API is down
    return NextResponse.json({ week: 11 });
  }
}
