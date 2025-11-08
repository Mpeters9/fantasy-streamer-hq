export type Pos = "QB" | "RB" | "WR" | "TE" | "K" | "DEF";

export interface Player {
  id: string;
  name: string;
  team: string;
  pos: Pos;
  headshot?: string;
  opponent?: string;
  spread?: number;
  implied?: number;
  weather?: string;
}

export interface ManualStatEntry {
  week: number;
  id: string;
  pos: Pos;
  stats: Record<string, number>;
}
