import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Fantasy Streamer HQ API is running 🚀",
    endpoints: [
      "/api/cron/odds",
      "/api/cron/weather",
      "/api/cron/rankings",
      "/api/cron/players",
      "/api/cron/streamers",
      "/api/cron/runAll",
    ],
  });
}
