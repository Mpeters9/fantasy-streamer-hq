import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🚀 [runAll] Running all cron tasks...");

    // Local API routes to run in parallel
    const endpoints = [
      "/api/cron/odds",
      "/api/cron/weather",
      "/api/cron/rankings",
      "/api/cron/players",
      "/api/cron/streamers",
    ];

    // Fetch all local data concurrently
    const results = await Promise.all(
      endpoints.map(async (path) => {
        try {
          const res = await fetch(`http://localhost:3000${path}`, { cache: "no-store" });
          const json = await res.json();
          return { path, ...json };
        } catch (err: any) {
          console.error(`❌ [runAll] Error on ${path}:`, err.message);
          return { path, status: "error", message: err.message, data: [] };
        }
      })
    );

    const merged = Object.fromEntries(
      results.map((r) => [r.path.split("/").pop(), r])
    );

    console.log("✅ [runAll] Completed all API merges.");
    return NextResponse.json({ status: "success", merged });
  } catch (err: any) {
    console.error("❌ [runAll] Critical failure:", err.message);
    return NextResponse.json({ status: "error", message: err.message });
  }
}
