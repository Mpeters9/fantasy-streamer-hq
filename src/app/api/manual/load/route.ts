import { NextResponse } from "next/server";
import { loadJSON } from "@/lib/filedb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const week = Number(searchParams.get("week") || "10");
  const data = loadJSON<any[]>(`manual_week_${week}.json`, []);
  return NextResponse.json({ ok:true, data });
}
