import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const WEIGHTS_FILE = path.join(process.cwd(), "tmp", "weights.json");

async function ensureFile() {
  await fs.mkdir(path.dirname(WEIGHTS_FILE), { recursive: true });
  try {
    await fs.access(WEIGHTS_FILE);
  } catch {
    await fs.writeFile(WEIGHTS_FILE, JSON.stringify({}, null, 2), "utf-8");
  }
}

export async function GET() {
  try {
    await ensureFile();
    const raw = await fs.readFile(WEIGHTS_FILE, "utf-8");
    const json = JSON.parse(raw);
    return NextResponse.json({ status: "success", data: json });
  } catch (e: any) {
    return NextResponse.json({ status: "error", message: e.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureFile();
    const body = await req.json();
    await fs.writeFile(WEIGHTS_FILE, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ status: "success" });
  } catch (e: any) {
    return NextResponse.json({ status: "error", message: e.message });
  }
}
