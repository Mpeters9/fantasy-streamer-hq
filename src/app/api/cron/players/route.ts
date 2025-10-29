// src/app/api/cron/players/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchSleeperPlayers } from "@/lib/sleeper-api";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("🧩 Fetching live Sleeper players...");
    const players = await fetchSleeperPlayers();

    // Upsert by Sleeper ID (prevents duplicates)
    const { error: insertErr } = await supabase
      .from("players")
      .upsert(players, { onConflict: "sleeper_id" });

    if (insertErr) throw insertErr;
    console.log(`✅ Inserted/updated ${players.length} players`);
    return NextResponse.json({ ok: true, count: players.length });
  } catch (err: any) {
    console.error("❌ Player cron failed:", err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
