import { NextResponse } from "next/server";
import { saveJSON, loadJSON } from "@/lib/filedb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const week = Number(body.week || 10);
    const entries = Array.isArray(body.entries) ? body.entries : [];
    saveJSON(`manual_week_${week}.json`, entries);
    // return merged (persisted) to the client
    const saved = loadJSON<any[]>(`manual_week_${week}.json`, []);
    return NextResponse.json({ ok:true, week, data: saved });
  } catch (e: any) {
    return NextResponse.json({ ok:false, error: String(e?.message || e) }, { status: 500 });
  }
}
