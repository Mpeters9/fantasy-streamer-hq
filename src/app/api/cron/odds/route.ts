import { NextResponse } from "next/server";

// Helper to confirm request came from Vercel Cron
const authorize = (req: Request) => {
  const header = req.headers.get("Authorization");
  return header === `Bearer ${process.env.CRON_SECRET}`;
};

export async function GET(req: Request) {
  if (!authorize(req)) return new NextResponse("Unauthorized", { status: 401 });

  const key = process.env.THE_ODDS_API_KEY!;
  const url = `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds?regions=us&markets=spreads,totals&apiKey=${key}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // ✅ later you'll store this data in Supabase.games
    return NextResponse.json({ ok: true, games: data?.length ?? 0 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
