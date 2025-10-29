import "../config/load-env.js";       // 👈 force-load .env.local manually
import cron from "node-cron";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";


// ────────────────────────────────────────────────
//  Setup
// ────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Base URL detection
const baseUrl = process.env.CRON_BASE_URL || "http://localhost:3000";
const headers = { Authorization: "Bearer my_local_secret" };

// ────────────────────────────────────────────────
//  Core Runner
// ────────────────────────────────────────────────
async function run(endpoint: string) {
  const url = `${baseUrl}/api/cron/${endpoint}`;
  console.log(`🔄  Running ${endpoint} cron → ${url}`);

  try {
    const res = await fetch(url, { headers });
    const text = await res.text();

    console.log(`✅  ${endpoint} success: ${text}`);

    // Log success to Supabase
    await supabase.from("cron_logs").insert({
      endpoint,
      status: "success",
      message: text.slice(0, 500),
      created_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error(`❌  ${endpoint} failed:`, err?.message || err);

    // Log failure to Supabase
    await supabase.from("cron_logs").insert({
      endpoint,
      status: "failed",
      message: err?.message || "Unknown error",
      created_at: new Date().toISOString(),
    });
  }
}

// Run all endpoints sequentially
async function runAllCrons() {
  const endpoints = ["odds", "weather", "rankings", "players", "streamers"];
  for (const ep of endpoints) await run(ep);
}

// ────────────────────────────────────────────────
//  Scheduling
// ────────────────────────────────────────────────
cron.schedule("0 3 * * *", async () => {
  console.log("⏰ Daily refresh started...");
  await runAllCrons();
  console.log("🎉 Daily refresh complete!");
});

// Immediate run on start
(async () => {
  console.log("🚀 Starting immediate cron run...");
  await runAllCrons();
})();
