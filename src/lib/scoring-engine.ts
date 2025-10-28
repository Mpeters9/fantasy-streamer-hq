// src/lib/scoring-engine.ts
import { supabase } from "@/lib/supabase";

/**
 * Calculates a fantasy "streamer" score for each player.
 * This mirrors your Google Sheet weighting system.
 */
export async function calculateStreamerScores() {
  try {
    // 1️⃣ Pull everything we need
    const { data: players, error: pErr } = await supabase
      .from("players")
      .select("id, name, pos, team_abbr, opp_abbr, opp_rank_vs_pos, redzone_share, target_share, available");
    if (pErr) throw pErr;

    const { data: games, error: gErr } = await supabase
      .from("games")
      .select("home_team, away_team, implied_home, implied_away, week");
    if (gErr) throw gErr;

    const { data: weather, error: wErr } = await supabase
      .from("weather")
      .select("team_abbr, temp, precipitation, wind");
    if (wErr) throw wErr;

    // 2️⃣ Weighting rules — copy of your sheet logic
    const weights = {
      impliedPts: 0.35,
      opponentRank: 0.25,
      weather: 0.10,
      redZoneShare: 0.15,
      targetShare: 0.10,
      availability: 0.05,
    };

    const normalize = (v: number, min: number, max: number) => (v - min) / (max - min);

    // 3️⃣ Combine everything
    const scored = players.map((p) => {
      const game = games.find(
        (g) => g.home_team === p.team_abbr || g.away_team === p.team_abbr
      );
      const w = weather.find((w) => w.team_abbr === p.team_abbr);

      const implied = game
        ? game.home_team === p.team_abbr
          ? game.implied_home
          : game.implied_away
        : 20;

      const oppFactor = 1 - normalize(p.opp_rank_vs_pos || 16, 1, 32); // lower rank = better matchup
      const weatherFactor = w
        ? 1 -
          normalize(
            (Math.abs((w.temp ?? 70) - 70) / 70 + (w.wind ?? 0) / 40 + (w.precipitation ?? 0) / 100) /
              3,
            0,
            1
          )
        : 1;
      const rzFactor = (p.redzone_share ?? 0) / 100;
      const tgtFactor = (p.target_share ?? 0) / 100;
      const availFactor = p.available ? 1 : 0;

      const score =
        implied * weights.impliedPts +
        oppFactor * weights.opponentRank * 100 +
        weatherFactor * weights.weather * 100 +
        rzFactor * weights.redZoneShare * 100 +
        tgtFactor * weights.targetShare * 100 +
        availFactor * weights.availability * 100;

      return { id: p.id, name: p.name, pos: p.pos, team: p.team_abbr, score: Math.round(score * 10) / 10 };
    });

    // 4️⃣ Save back to Supabase
    for (const s of scored) {
      await supabase.from("players").update({ score: s.score }).eq("id", s.id);
    }

    return { ok: true, count: scored.length };
  } catch (err: any) {
    console.error("❌ scoring engine error", err.message);
    return { ok: false, error: err.message };
  }
}
