import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SNAPSHOT_DIR = path.join(process.cwd(), "tmp");
const SNAPSHOT_FILE = path.join(SNAPSHOT_DIR, "snapshots.json");

function readSnapshots() {
  if (!fs.existsSync(SNAPSHOT_FILE)) return [];
  const raw = fs.readFileSync(SNAPSHOT_FILE, "utf-8");
  return JSON.parse(raw || "[]");
}

function writeSnapshots(data: any) {
  if (!fs.existsSync(SNAPSHOT_DIR)) fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(data, null, 2));
}

// GET → list all snapshots
export async function GET() {
  try {
    const all = readSnapshots();
    return NextResponse.json({ status: "success", count: all.length, data: all });
  } catch (e: any) {
    return NextResponse.json({ status: "error", message: e.message });
  }
}

// POST → save new snapshot
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { week, players, odds, weather, schedule } = body;
    if (!week || !players) throw new Error("Missing fields");

    const all = readSnapshots();
    const exists = all.find((s: any) => s.week === week);
    if (exists) {
      exists.players = players;
      exists.odds = odds;
      exists.weather = weather;
      exists.schedule = schedule;
      exists.savedAt = new Date().toISOString();
    } else {
      all.push({
        week,
        players,
        odds,
        weather,
        schedule,
        savedAt: new Date().toISOString(),
      });
    }
    writeSnapshots(all);
    return NextResponse.json({ status: "success", message: `Snapshot saved for week ${week}` });
  } catch (e: any) {
    return NextResponse.json({ status: "error", message: e.message });
  }
}
