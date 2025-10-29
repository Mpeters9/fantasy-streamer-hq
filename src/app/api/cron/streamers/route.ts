import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    // 1️⃣ Pull player data (mock or from your Supabase players table)
    const { data: players, error: playerErr } = await supabase.from("players").select("*");
    if (playerErr) throw playerErr;
    if (!players?.length) throw new Error("No players found");

    // 2️⃣ Pull odds & weather
    const { data: games } = await supabase.from("games").select("*");
    const { data: weather } = await supabase.from("weather").select("*");

    // 3️⃣ Generate Streamer Scores
    const results = players.map((p) => {
      const game = games?.find((g) => g.home_team === p.team || g.away_team === p.team);
      const wx = weather?.find((w) => w.team_abbr === p.team);

      const spread = game?.spread_home || 0;
      const implied_points = game?.implied_home || 0;
      const usage = Math.random() * 100; // placeholder until we connect fantasy stats
      const weather_score = wx ? (wx.temp >= 40 ? 90 : 70) : 80;

      // Weighted score
      const score = implied_points * 0.3 + usage * 0.4 + weather_score * 0.2 + (100 - Math.abs(spread)) * 0.1;

      const tier =
        score > 90 ? "S" :
        score > 80 ? "A" :
        score > 70 ? "B" :
        score > 60 ? "C" : "D";

      return {
        player_id: p.id,
        name: p.name,
        pos: p.pos,
        team: p.team,
        opponent: game?.home_team === p.team ? game.away_team : game?.home_team,
        week: game?.week || 8,
        spread,
        weather: wx?.description || "N/A",
        implied_points,
        usage,
        score,
        tier,
      };
    });

    // 4️⃣ Upsert into Supabase
    const { error: insertErr } = await supabase.from("streamer_scores").upsert(results, { onConflict: "player_id" });
    if (insertErr) throw insertErr;

    return NextResponse.json({ ok: true, inserted: results.length });
  } catch (err: any) {
    console.error("❌ Streamer cron failed:", err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
