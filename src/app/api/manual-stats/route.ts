import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const STORE = path.join(process.cwd(), "tmp", "manual-stats.json");

async function ensureFile() {
  await fs.mkdir(path.dirname(STORE), { recursive: true });
  try {
    await fs.access(STORE);
  } catch {
    await fs.writeFile(STORE, JSON.stringify({ data: [] }, null, 2), "utf-8");
  }
}

export async function GET() {
  try {
    await ensureFile();
    const raw = await fs.readFile(STORE, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch (e: any) {
    return NextResponse.json({ status: "error", message: e.message, data: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureFile();
    const body = await req.json();
    const raw = await fs.readFile(STORE, "utf-8");
    const data = JSON.parse(raw);
    const arr = Array.isArray(data.data) ? data.data : [];
    const key = `${body.id || body.name}|${body.team}`;
    const idx = arr.findIndex((r: any) => r.key === key);
    const entry = { key, ...body };
    if (idx >= 0) arr[idx] = entry;
    else arr.push(entry);
    await fs.writeFile(STORE, JSON.stringify({ data: arr }, null, 2), "utf-8");
    return NextResponse.json({ status: "success", key });
  } catch (e: any) {
    return NextResponse.json({ status: "error", message: e.message });
  }
}
