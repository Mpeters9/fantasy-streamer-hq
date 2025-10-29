// src/lib/sleeper-api.ts
export async function fetchSleeperPlayers() {
  const res = await fetch("https://api.sleeper.app/v1/players/nfl");
  if (!res.ok) throw new Error("Failed to fetch Sleeper players");

  const allPlayers = await res.json();

  // Filter for active, fantasy-relevant positions
  const filtered = Object.values(allPlayers).filter((p: any) =>
    ["QB", "RB", "WR", "TE", "DEF"].includes(p.position)
  );

  // Map to simplified structure
  return filtered.map((p: any) => ({
    sleeper_id: p.player_id,
    name: p.full_name,
    team: p.team,
    pos: p.position,
    age: p.age ?? null,
    status: p.status,
    fantasy_positions: p.fantasy_positions ?? [],
    updated_at: new Date().toISOString(),
  }));
}
