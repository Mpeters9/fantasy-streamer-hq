import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase (use service key for cron auth)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Protect the route with CRON_SECRET
export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  console.log("🔁 Running waiver streamer scoring cron...");

  try {
    // 1️⃣ Pull active players (simplified to one week or your base logic)
    const { data: players, error: playerErr } = await supabase
      .from("players")
      .select("id, name, pos, team, week, snaps, targets, redzone, fantasy_points")
      .limit(500);

    if (playerErr || !players) {
      throw new Error(playerErr?.message || "No players found");
    }

    // 2️⃣ Compute waiver score (simple example logic; customize later)
    const scored = players.map((p: any, idx: number) => {
      // sample weighted scoring logic — you can tweak this to mirror your sheet
      const snapsWeight = (p.snaps || 0) * 0.3;
      const targetsWeight = (p.targets || 0) * 0.4;
      const redzoneWeight = (p.redzone || 0) * 0.2;
      const fpWeight = (p.fantasy_points || 0) * 0.1;

      const score = snapsWeight + targetsWeight + redzoneWeight + fpWeight;
      return {
        player_id: p.id,
        week: p.week || 8,
        score,
        rank: idx + 1,
      };
    });

    // 3️⃣ Upsert scores into streamer_scores
    const { error: upsertErr } = await supabase
      .from("streamer_scores")
      .upsert(scored, { onConflict: "player_id" });

    if (upsertErr) throw upsertErr;

    console.log(`✅ Waiver scoring complete for ${scored.length} players`);
    return NextResponse.json({ ok: true, updated: scored.length });
  } catch (err: any) {
    console.error("❌ Streamer cron failed:", err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status:}
    }
// src/app/api/cron/streamers/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = req.headers.get("Authorization");
  if (auth !== "Bearer my_local_secret") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Temporary response until we connect scoring logic
  return NextResponse.json({ ok: true, message: "Streamer cron executed successfully!" });
}
