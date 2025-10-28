// run-crons.js
import fetch from "node-fetch";

console.log("🚀 Starting local Fantasy Streamer HQ cron jobs...");

const CRON_SECRET = process.env.CRON_SECRET || "my_local_secret";

const crons = [
  "http://localhost:3000/api/cron/odds",
  "http://localhost:3000/api/cron/weather",
  "http://localhost:3000/api/cron/rankings",
];

const run = async () => {
  for (const url of crons) {
    console.log(`🔄 Running ${url}...`);
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${CRON_SECRET}` },
      });
      const data = await res.json();
      console.log(`✅ ${url.split("/").pop()}:`, data);
    } catch (err) {
      console.log(`💥 Failed to run ${url.split("/").pop()}:`, err.message);
    }
  }
  console.log("🎉 All crons done!");
};

run();
