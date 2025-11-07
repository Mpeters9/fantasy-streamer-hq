import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "tmp/waiver-data.json");

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pos = searchParams.get("pos") || "ALL";
    const mode = searchParams.get("mode") || "weekly";

    if (!fs.existsSync(DATA_PATH)) {
      return NextResponse.json({
        status: "success",
        week: 10,
        mode,
        count: 0,
        data: [],
      });
    }

    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw);

    let data = parsed.players || [];
    if (pos !== "ALL") {
      data = data.filter((p: any) => p.position === pos);
    }

    return NextResponse.json({
      status: "success",
      mode,
      week: parsed.week || 10,
      count: data.length,
      data,
    });
  } catch (e) {
    console.error("Waiver API Error:", e);
    return NextResponse.json({ status: "error", message: "Failed to load waivers" });
  }
}
