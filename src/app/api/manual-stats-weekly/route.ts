import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "tmp");
function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * GET ?week=#
 *  - /api/manual-stats-weekly?week=10 → returns week 10 snapshot
 *  - default = latest
 */
export async function GET(req: Request) {
  try {
    ensureDir();
    const url = new URL(req.url);
    const weekParam = url.searchParams.get("week");
    const week = weekParam ? Number(weekParam) : null;

    const files = fs.readdirSync(DATA_DIR).filter((f) => f.startsWith("manual-stats-week-"));
    if (!files.length) return NextResponse.json({ status: "success", count: 0, data: [] });

    const target =
      week && files.includes(`manual-stats-week-${week}.json`)
        ? `manual-stats-week-${week}.json`
        : files.sort().reverse()[0];

    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, target), "utf8"));
    return NextResponse.json({
      status: "success",
      week: target.match(/\d+/)?.[0] ?? "?",
      count: data.length,
      data,
    });
  } catch (err: any) {
    console.error("❌ [manual-stats-weekly] GET error:", err.message);
    return NextResponse.json({ status: "error", message: err.message, data: [] });
  }
}

/**
 * POST  body = { week, data }
 * Stores to tmp/manual-stats-week-<week>.json
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const week = body.week || "unknown";
    const entries = body.data || [];
    ensureDir();

    const file = path.join(DATA_DIR, `manual-stats-week-${week}.json`);
    fs.writeFileSync(file, JSON.stringify(entries, null, 2));

    return NextResponse.json({
      status: "success",
      week,
      count: entries.length,
      message: `Saved snapshot for Week ${week}`,
    });
  } catch (err: any) {
    console.error("❌ [manual-stats-weekly] POST error:", err.message);
    return NextResponse.json({ status: "error", message: err.message });
  }
}
