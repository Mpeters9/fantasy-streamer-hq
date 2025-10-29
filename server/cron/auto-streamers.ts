import cron from "node-cron";
import fetch from "node-fetch";

cron.schedule("0 3 * * *", async () => {
  console.log("⏰ Daily streamer refresh started...");
  try {
    const res = await fetch("http://localhost:3000/api/cron/streamers", {
      headers: { Authorization: "Bearer my_local_secret" },
    });
    const result = await res.text();
    console.log("✅ Daily refresh result:", result);
  } catch (err) {
    console.error("❌ Cron fetch failed:", err);
  }
});
