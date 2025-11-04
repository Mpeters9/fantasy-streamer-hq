import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

//
// ✅ Use a cross-platform cache folder
//
const CACHE_DIR =
  process.env.NODE_ENV === "production"
    ? "/tmp"
    : path.join(process.cwd(), ".cache");

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

const CACHE_FILE = path.join(CACHE_DIR, "fshq-cache.json");
const CACHE_TTL_HOURS = 6;

function getBaseUrl() {
  // Handles both local dev and production
  const raw =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";
  return raw.startsWith("http") ? raw.replace(/\/$/, "") : `https://${raw}`;
}

async function fetchData() {
  const base = getBaseUrl();

  const [players, odds, weather] = await Promise.all([
    fetch(`${base}/api/cron/players`, { cache: "no-store" }).then((r) => r.json()),
    fetch(`${base}/api/cron/odds`, { cache: "no-store" }).then((r) => r.json()),
    fetch(`${base}/api/cron/weather`, { cache: "no-store" }).then((r) => r.json()),
  ]);

  const result = {
    timestamp: new Date().toISOString(),
    summary: {
      players: players.count || 0,
      odds: odds.count || 0,
      weather: weather.count || 0,
    },
    data: { players, odds, weather },
  };

  fs.writeFileSync(CACHE_FILE, JSON.stringify(result, null, 2));
  return result;
}

function isCacheValid(stats: fs.Stats) {
  const ageHrs = (Date.now() - stats.mtimeMs) / 1000 / 3600;
  return ageHrs < CACHE_TTL_HOURS;
}

export async function GET() {
  try {
    let cached: any = null;

    if (fs.existsSync(CACHE_FILE)) {
      const stats = fs.statSync(CACHE_FILE);
      if (isCacheValid(stats)) {
        cached = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
      }
    }

    if (cached) {
      console.log("🟢 Using cached sync data");
      return NextResponse.json({
        status: "success",
        cached: true,
        ...cached,
      });
    }

    console.log("🔁 Cache expired — fetching fresh data...");
    const fresh = await fetchData();
    return NextResponse.json({
      status: "success",
      cached: false,
      ...fresh,
    });
  } catch (err: any) {
    console.error("❌ Sync error:", err.message);
    return NextResponse.json({
      status: "error",
      message: err.message,
    });
  }
}
