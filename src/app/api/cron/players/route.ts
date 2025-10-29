import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  console.log("🧩 Running player cron...");

  try {
    // Pull existing players
    const { data: oldPlayers, error: oldErr } = await supabase.from("players").select("id, name");
    if (oldErr) throw oldErr;

    // Insert mock or base player data for now
    // --- FIXED mock data and upsert ---
const mockPlayers = [
  { name: "Patrick Mahomes", pos: "QB", team: "KC", score: 98.3, rank: 1 },
  { name: "Josh Allen", pos: "QB", team: "BUF", score: 95.5, rank: 2 },
  { name: "Amon-Ra St. Brown", pos: "WR", team: "DET", score: 91.2, rank: 3 },
];

const { error: insertErr } = await supabase.from("players").upsert(mockPlayers, {
  onConflict: "name",
});

    if (insertErr) throw insertErr;

    return NextResponse.json({ ok: true, count: mockPlayers.length });
  } catch (err: any) {
    console.error("❌ Player cron failed:", err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
