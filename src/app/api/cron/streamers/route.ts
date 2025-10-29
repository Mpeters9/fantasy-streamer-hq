import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    console.log("🎯 Running streamer scoring cron (pure JS mode)");

    // Step 1: Fetch all players
    const { data: players, error: playerErr } = await supabase
      .from("players")
      .select("id, name, pos, team, score");

    if (playerErr) throw playerErr;
    if (!players?.length) throw new Error("No players found.");

    // Step 2: Sort players by score manually (no rank())
    const sorted = players
      .filter((p) => typeof p.score === "number" && !isNaN(p.score))
      .sort((a, b) => Number(b.score) - Number(a.score));

    // Step 3: Generate ranks & tiers in JavaScript
    const results = sorted.map((p, index) => ({
      player_id: p.id,
      week: 9,
      score: Number(p.score),
      rank: index + 1,
      tier:
        index < 10
          ? "A"
          : index < 25
          ? "B"
          : index < 50
          ? "C"
          : index < 75
          ? "D"
          : "E",
      reason: `Ranked ${index + 1} by score`,
    }));

    // Step 4: Push data to Supabase table
    const { error: upsertErr } = await supabase
      .from("streamer_scores")
      .upsert(results, { onConflict: "player_id, week" });

    if (upsertErr) throw upsertErr;

    console.log(`✅ Upserted ${results.length} streamer scores`);
    return NextResponse.json({ ok: true, updated: results.length });
  } catch (err: any) {
    console.error("❌ Streamer cron failed:", err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
