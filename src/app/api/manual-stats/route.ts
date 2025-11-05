import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "tmp");
const FILE_PATH = path.join(DATA_DIR, "manual-stats.json");

/**
 * Helper to ensure tmp directory exists
 */
function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * GET — Load manual stat entries
 */
export async function GET() {
  try {
    ensureDir();
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify([]));
    }
    const file = fs.readFileSync(FILE_PATH, "utf8");
    const data = JSON.parse(file || "[]");
    return NextResponse.json({ status: "success", count: data.length, data });
  } catch (err: any) {
    console.error("❌ [manual-stats] Error:", err.message);
    return NextResponse.json({
      status: "error",
      message: err.message,
      data: [],
    });
  }
}

/**
 * POST — Save entries
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    ensureDir();
    fs.writeFileSync(FILE_PATH, JSON.stringify(body, null, 2));
    return NextResponse.json({
      status: "success",
      count: Array.isArray(body) ? body.length : 0,
      message: "Manual stats updated successfully.",
    });
  } catch (err: any) {
    console.error("❌ [manual-stats] Save error:", err.message);
    return NextResponse.json({
      status: "error",
      message: err.message,
    });
  }
}
