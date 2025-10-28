import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/db";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
const token = authHeader?.split(" ")[1];
if (token !== process.env.CRON_SECRET) {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}
    const auth = req.headers.get("Authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.ODDS_API_KEY;
    if (!apiKey) throw new Error("Missing ODDS_API_KEY in environment variables.");

    const url = `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=${apiKey}&regions=us&markets=spreads,totals&dateFormat=iso`;
    const res = await fetch(url);
    const data = await res.json();

    if (!Array.isArray(data)) throw new Error("Invalid odds response");

    // Fetch all teams from Supabase
    const { data: teams, error: teamErr } = await supabase
      .from("teams")
      .select("id, name, abbr");
    if (teamErr) throw teamErr;

    // Build fuzzy match map
    const teamMap: Record<string, string> = {};
    for (const t of teams) {
      teamMap[t.name.toLowerCase()] = t.id;
      teamMap[t.abbr.toLowerCase()] = t.id;
      // also allow last word (e.g., “Ravens”, “Packers”)
      const lastWord = t.name.split(" ").pop()?.toLowerCase();
      if (lastWord) teamMap[lastWord] = t.id;
    }

    const rows = data
      .map((g: any) => {
        const home = g.home_team.toLowerCase();
        const away = g.away_team.toLowerCase();

        const home_team = teamMap[home] || teamMap[home.split(" ").pop()] || null;
        const away_team = teamMap[away] || teamMap[away.split(" ").pop()] || null;

        if (!home_team || !away_team) return null; // skip unrecognized teams

        const bookmaker = g.bookmakers?.[0];
        const spreads = bookmaker?.markets?.find((m: any) => m.key === "spreads")?.outcomes || [];
        const totals = bookmaker?.markets?.find((m: any) => m.key === "totals")?.outcomes || [];

        const spread_home = Number(spreads.find((o: any) => o.name.toLowerCase() === g.home_team.toLowerCase())?.point ?? 0);
        const total = Number(totals[0]?.point ?? 44);

        return {
          week: 9, // adjust weekly
          kickoff: g.commence_time,
          home_team,
          away_team,
          spread_home,
          total,
          implied_home: total / 2 - spread_home / 2,
          implied_away: total / 2 + spread_home / 2,
        };
      })
      .filter(Boolean);

    if (!rows.length) {
      return NextResponse.json({ ok: true, inserted: 0, reason: "No matching teams found" });
    }

    const { error: insertErr } = await supabase.from("games").insert(rows);
    if (insertErr) throw insertErr;

    return NextResponse.json({ ok: true, inserted: rows.length });
  } catch (err: any) {
    console.error("❌ Odds cron error:", err.message);
    return NextResponse.json({ ok: false, error: err.message });
  }
}
