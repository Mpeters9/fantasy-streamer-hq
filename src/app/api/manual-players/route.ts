import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "tmp/manual-players.json");

// Ensure file exists
function ensureFile() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify({ players: [] }, null, 2));
  }
}

export async function GET() {
  ensureFile();
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  const data = JSON.parse(raw);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    ensureFile();
    fs.writeFileSync(DATA_PATH, JSON.stringify(body, null, 2));
    return NextResponse.json({ status: "success" });
  } catch (e) {
    console.error("Error saving manual players:", e);
    return NextResponse.json({ status: "error", message: "Failed to save players" });
  }
}
