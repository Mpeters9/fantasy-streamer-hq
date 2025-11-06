import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const WAIVER_FILE = path.join(process.cwd(), "tmp", "waiver-last.json");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    fs.mkdirSync(path.dirname(WAIVER_FILE), { recursive: true });
    fs.writeFileSync(WAIVER_FILE, JSON.stringify(body, null, 2));
    return NextResponse.json({ status: "success", count: body.length });
  } catch (e: any) {
    return NextResponse.json({ status: "error", message: e.message });
  }
}
