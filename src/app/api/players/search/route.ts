import { NextResponse } from "next/server";
import { fetchPlayers } from "@/lib/players";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();
  const pos = (searchParams.get("pos") || "").toUpperCase();
  const limit = Number(searchParams.get("limit") || "20");

  const all = await fetchPlayers();
  const filtered = all.filter(p => {
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.team.toLowerCase() === q;
    const matchPos = !pos || p.pos === pos;
    return matchQ && matchPos;
  }).slice(0, limit);

  return NextResponse.json({ data: filtered });
}
