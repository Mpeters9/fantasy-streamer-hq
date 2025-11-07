import { NextRequest, NextResponse } from "next/server";
import { computeStreamerScores } from "@/lib/scoring-engine";

function getOrigin(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

async function safeFetch(url: string) {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = (url.searchParams.get("mode") || "weekly").toLowerCase() as "weekly" | "ros";
  const origin = getOrigin(req);

  try {
    let players: any[] = [];
    let week: number | null = null;

    const sync = await safeFetch(`${origin}/api/cron/sync`);
    if (sync && (Array.isArray(sync.players) || Array.isArray(sync.data))) {
      players = Array.isArray(sync.players) ? sync.players : sync.data;
      week = sync.week ?? null;
    } else {
      const fallback = await safeFetch(`${origin}/api/cron/players`);
      players = fallback?.data || [];
      week = fallback?.week ?? null;
    }

    const clean = Array.isArray(players) ? players : [];
    const scored = await computeStreamerScores(clean, mode);
    return NextResponse.json({ status: "success", mode, week, data: scored });
  } catch (e: any) {
    return NextResponse.json({ status: "error", message: e.message, data: [] });
  }
}
