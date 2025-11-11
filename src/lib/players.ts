// src/lib/players.ts
export interface PlayerSummary {
  id: string;
  name: string;
  team: string;
  pos: string;
  status?: string;
  depth_chart_order?: number;
}

// Fetch all NFL players and filter for fantasy-relevant positions
export async function fetchPlayers(): Promise<PlayerSummary[]> {
  const res = await fetch("https://api.sleeper.app/v1/players/nfl", {
    cache: "no-store", // disable cache to avoid >2MB data cache limit
  });
  const data = await res.json();

  const players: PlayerSummary[] = Object.values(data)
    .filter(
      (p: any) =>
        p.active &&
        p.fantasy_positions &&
        ["QB", "RB", "WR", "TE", "K", "DEF"].includes(p.position)
    )
    .map((p: any) => ({
      id: p.player_id,
      name: p.full_name,
      team: p.team || "FA",
      pos: p.position,
      status: p.status,
      depth_chart_order: p.depth_chart_order ?? 99,
    }));

  return players;
}

// Filter only top depth-chart fantasy-relevant players
export function getFantasyRelevant(players: PlayerSummary[]): PlayerSummary[] {
  const grouped: Record<string, PlayerSummary[]> = {};
  players.forEach((p) => {
    if (!grouped[p.pos]) grouped[p.pos] = [];
    grouped[p.pos].push(p);
  });

  Object.keys(grouped).forEach((pos) => {
    grouped[pos] = grouped[pos]
      .sort((a, b) => (a.depth_chart_order ?? 99) - (b.depth_chart_order ?? 99))
      .slice(
        pos === "QB"
          ? 40
          : pos === "RB"
          ? 70
          : pos === "WR"
          ? 80
          : pos === "TE"
          ? 40
          : pos === "K"
          ? 32
          : 20
      );
  });

  return Object.values(grouped).flat();
}
