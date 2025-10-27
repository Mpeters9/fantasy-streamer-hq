import { NextResponse } from "next/server";

const authorize = (req: Request) => {
  const header = req.headers.get("Authorization");
  return header === `Bearer ${process.env.CRON_SECRET}`;
};

export async function GET(req: Request) {
  if (!authorize(req)) return new NextResponse("Unauthorized", { status: 401 });

  // ✅ later you'll compute QB/RB/WR scores and write them to Supabase.rankings
  return NextResponse.json({ ok: true, recalculated: new Date().toISOString() });
}
