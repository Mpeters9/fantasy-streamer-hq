import { NextResponse } from "next/server";
import { loadJSON } from "@/lib/filedb";
import { getScheduleMap } from "@/lib/schedule";
import { scorePlayer, DEFAULT_WEIGHTS, normalizeWeather } from "@/lib/scoring";
import { getWeatherForTeam } from "@/lib/weather";
import { fetchPlayers } from "@/lib/players";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const week = Number(searchParams.get("week") || "10");

  // Manual stats (by id)
  const manual = loadJSON<any[]>(`manual_week_${week}.json`, []);
  const manualById = new Map<string, any>();
  for (const m of manual) manualById.set(m.id, m);

  // Base players universe
  const all = await fetchPlayers();

  // Schedule and odds map
  const sched = await getScheduleMap(week);

  // Build scored list for fantasy-relevant players that have manual entries (you add players you care about)
  const shortlist = all.filter(p => manualById.has(p.id));

  const out = [];
  for (const p of shortlist) {
    const m = manualById.get(p.id);
    const tg = sched[p.team] || null;
    const opp = tg?.opponent || "TBD";
    const spread = tg?.spreadForTeam ?? 0;
    const total = tg?.total ?? 0;
    const kickoff = tg?.kickoff || new Date().toISOString();
    const wxText = await getWeatherForTeam(p.team, kickoff);
    const wxNorm = normalizeWeather(wxText);

    const pos = (p.pos || "WR").toUpperCase();

    // Map manual stats to feature vectors per pos
    const inputs: Record<string, number> = {
      spread: Number(spread) || 0,
      total: Number(total) || 0,
      weather_penalty: wxNorm,
      qb_epa: 0,
      rb_ms: 0,
      wr_tar: 0,
      te_tar: 0,
    };

    if (pos === "QB") {
      inputs.qb_epa = Number(m.stats?.qb_epa ?? 0);
    } else if (pos === "RB") {
      inputs.rb_ms = Number(m.stats?.rb_ms ?? 0);
    } else if (pos === "WR") {
      inputs.wr_tar = Number(m.stats?.wr_tprr ?? 0);
    } else if (pos === "TE") {
      inputs.te_tar = Number(m.stats?.te_tprr ?? 0);
    }

    const streamerScore = Math.round(scorePlayer(inputs, DEFAULT_WEIGHTS) * 100) / 100;

    out.push({
      id: p.id,
      name: p.name,
      team: p.team,
      position: p.pos,
      headshot: p.headshot,
      opponent: opp,
      spread,
      implied: total ? Math.round(((total + (spread || 0)) / 2) * 10) / 10 : null,
      weather: wxText,
      streamerScore,
      week,
    });
  }

  return NextResponse.json({ week, count: out.length, data: out });
}
