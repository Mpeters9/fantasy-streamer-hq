// ==============================
// Fantasy Streamer HQ - Local Cron Runner
// ==============================
// This script calls your local Next.js API routes for odds, weather, and rankings.
// Run it manually with:  node run-crons.js
// Or schedule it with Windows Task Scheduler to automate daily updates.
// ==============================

import "dotenv/config";  // Loads .env.local automatically in Node 18+

// Use the same CRON_SECRET as in your API routes.
// If .env.local doesn't have CRON_SECRET defined, this fallback will be used.
const CRON_SECRET = process.env.CRON_SECRET || "fantasyhq-secret";

/**
 * Helper to call a given cron endpoint
 * @param {string} endpoint - odds | weather | rankings
 */
async function run(endpoint) {
  const url = `http://localhost:3000/api/cron/${endpoint}`;
  console.log(`🔄 Running ${url}...`);

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    });

    const text = await res.text(); // Read as text first to handle non-JSON errors

    try {
      const data = JSON.parse(text);
      console.log(`✅ ${endpoint}:`, data);
    } catch {
      console.error(`❌ ${endpoint}:`, text);
    }
  } catch (e) {
    console.error(`💥 Failed to run ${endpoint}:`, e.message);
  }
}

/**
 * Run all crons sequentially
 */
async function main() {
  console.log("🚀 Starting local Fantasy Streamer HQ cron jobs...");
  await run("odds");
  await run("weather");
  await run("rankings");
  console.log("🎉 All crons done!");
}

main().catch((e) => console.error("❌ Unexpected error:", e));
