import { ENV } from "./env";
import { setCache, getCache } from "./cache";

export interface Game {
  home: string;
  away: string;
  commence: string; // ISO
  spread_home?: number;
  spread_away?: number;
  total?: number;
}

const LEAGUE = "americanfootball_nfl";

export async function fetchWeekOdds(week: number): Promise<Game[]> {
  const cacheKey = `odds_${week}`;
  const c = getCache<Game[]>(cacheKey);
  if (c) return c;

  try {
    if (!ENV.ODDS_API_KEY) throw new Error("Missing ODDS_API_KEY");
    const url = `https://api.the-odds-api.com/v4/sports/${LEAGUE}/odds/?regions=us&markets=spreads,totals&oddsFormat=american&apiKey=${ENV.ODDS_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) throw new Error(`odds http ${res.status}`);
    const raw = await res.json();

    // Normalize
    const games: Game[] = (raw || []).map((g: any) => {
      const home = (g.home_team || "").split(" ").pop();
      const away = (g.away_team || "").split(" ").pop();
      const commence = g.commence_time;
      let spread_home, spread_away, total;
      const spreads = g.bookmakers?.[0]?.markets?.find((m: any) => m.key === "spreads");
      const totals = g.bookmakers?.[0]?.markets?.find((m: any) => m.key === "totals");
      if (spreads?.outcomes?.length === 2) {
        const o1 = spreads.outcomes[0];
        const o2 = spreads.outcomes[1];
        if (o1.name?.endsWith(home)) spread_home = o1.point;
        if (o2.name?.endsWith(home)) spread_home = o2.point;
        if (o1.name?.endsWith(away)) spread_away = o1.point;
        if (o2.name?.endsWith(away)) spread_away = o2.point;
      }
      if (totals?.outcomes?.length === 2) {
        total = totals.outcomes[0]?.point ?? totals.outcomes[1]?.point;
      }
      return { home, away, commence, spread_home, spread_away, total };
    });

    setCache(cacheKey, games, 15*60*1000);
    return games;
  } catch {
    // Fallback sample
    const sample = [
      { home: "NE", away: "NYJ", commence: new Date().toISOString(), spread_home: -2.5, spread_away: 2.5, total: 41.5 },
      { home: "HOU", away: "JAX", commence: new Date().toISOString(), spread_home: -1.0, spread_away: 1.0, total: 44.0 },
      { home: "CIN", away: "CLE", commence: new Date().toISOString(), spread_home: -3.0, spread_away: 3.0, total: 40.0 },
    ];
    setCache(cacheKey, sample, 5*60*1000);
    return sample;
  }
}
