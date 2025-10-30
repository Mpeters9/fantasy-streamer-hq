import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "online",
    message: "Fantasy Streamer HQ API is active.",
    routes: [
      "/api/cron/odds",
      "/api/cron/weather",
      "/api/cron/rankings",
      "/api/cron/players",
      "/api/cron/streamers",
      "/api/cron/runAll",
    ],
    updated: new Date().toISOString(),
  });
}
