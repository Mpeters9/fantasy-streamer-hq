import { fetchWeekOdds } from "./odds";

export interface TeamGame {
  team: string;
  opponent: string;
  isHome: boolean;
  kickoff: string;
  spreadForTeam?: number;
  total?: number;
}

export async function getScheduleMap(week: number): Promise<Record<string, TeamGame>> {
  const games = await fetchWeekOdds(week);
  const map: Record<string, TeamGame> = {};
  for (const g of games) {
    const home = (g.home || "").toUpperCase();
    const away = (g.away || "").toUpperCase();
    map[home] = {
      team: home,
      opponent: away,
      isHome: true,
      kickoff: g.commence,
      spreadForTeam: g.spread_home,
      total: g.total,
    };
    map[away] = {
      team: away,
      opponent: home,
      isHome: false,
      kickoff: g.commence,
      spreadForTeam: g.spread_away,
      total: g.total,
    };
  }
  return map;
}
