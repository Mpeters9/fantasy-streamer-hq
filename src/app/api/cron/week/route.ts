import { NextResponse } from "next/server";

// Simple week resolver with manual override
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wk = searchParams.get("week");
  if (wk) return NextResponse.json({ week: Number(wk) });

  // Fallback: approximate NFL week by date (roughly Sep->Jan)
  const now = new Date();
  const start = new Date(now.getFullYear(), 8, 3); // early Sep
  const diffW = Math.max(1, Math.min(18, Math.floor((now.getTime()-start.getTime())/(7*24*3600*1000))+1));
  return NextResponse.json({ week: diffW });
}
