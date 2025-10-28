import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// --- GET ---
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profile = searchParams.get("profile") || "default";

  const { data, error } = await supabase
    .from("user_weights")
    .select("*")
    .eq("profile", profile)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({
      ok: true,
      weights: {
        impliedPts: 0.35,
        opponentRank: 0.25,
        weather: 0.1,
        redZoneShare: 0.15,
        targetShare: 0.1,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    weights: {
      impliedPts: data.implied_pts,
      opponentRank: data.opponent_rank,
      weather: data.weather,
      redZoneShare: data.red_zone_share,
      targetShare: data.target_share,
    },
  });
}

// --- POST ---
export async function POST(req: Request) {
  const body = await req.json();
  const {
    profile = "default",
    impliedPts,
    opponentRank,
    weather,
    redZoneShare,
    targetShare,
  } = body;

  const { error } = await supabase.from("user_weights").upsert(
    {
      profile,
      implied_pts: impliedPts,
      opponent_rank: opponentRank,
      weather,
      red_zone_share: redZoneShare,
      target_share: targetShare,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "profile" }
  );

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
