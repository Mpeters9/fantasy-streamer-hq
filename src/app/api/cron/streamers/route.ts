// src/app/api/cron/streamers/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🚀 [streamers] Starting fantasy streamer calculations...");

    const [oddsRes, weatherRes, rankingsRes] = await Promise.all([
      fetch("http://localhost:3000/api/cron/odds").then((r) => r.json()),
      fetch("http://localhost:3000/api/cron/weather").then((r) => r.json()),
      fetch("http://localhost:3000/api/cron/rankings").then((r) => r.json()),
    ]);

    const odds = Object.values(oddsRes || {});
    const weather = weatherRes?.data || [];
    const rankings = rankingsRes || [];

    // Mock player pool (temporary — later we’ll merge real API data)
    const mockPlayers = [
      { name: "Baker Mayfield", team: "Buccaneers", position: "QB" },
      { name: "Gardner Minshew", team: "Colts", position: "QB" },
      { name: "Tyler Boyd", team: "Bengals", position: "WR" },
      { name: "Rashee Rice", team: "Chiefs", position: "WR" },
      { name: "Juwan Johnson", team: "Saints", position: "TE" },
      { name: "Zamir White", team: "Raiders", position: "RB" },
      { name: "Jaylen Warren", team: "Steelers", position: "RB" },
      { name: "Kendrick Bourne", team: "Patriots", position: "WR" },
      { name: "Michael Mayer", team: "Raiders", position: "TE" },
      { name: "Ty Chandler", team: "Vikings", position: "RB" },
    ];

    // Basic scoring weights
    const weights = {
      overUnder: 2,
      rankBoost: 1.5,
      weatherPenalty: -2,
    };

    // Convert rankings to a quick lookup map
    const teamRanks: Record<string, number> = {};
    rankings.forEach((r: any) => {
      if (r.team) teamRanks[r.team] = r.rank;
    });

    // Map weather data for lookups
    const teamWeather: Record<string, any> = {};
    weather.forEach((w: any) => {
      teamWeather[w.team] = w;
    });

    // Score each player
    const scored = mockPlayers.map((p) => {
      const teamRank = teamRanks[p.team] || 16;
      const w = teamWeather[p.team] || {};
      const temp = parseFloat(w.tempF) || 65;
      const wind = parseFloat(w.windMph) || 5;

      let score = 0;

      // Rank bonus (higher = better)
      score += (33 - teamRank) * weights.rankBoost;

      // Odds bonus (favor high totals)
      const highOU = Math.max(...odds.map((o: any) => o.overUnder || 0));
      score += highOU * weights.overUnder;

      // Weather penalty
      if (temp < 40 || wind > 15) score += weights.weatherPenalty;

      return { ...p, score: parseFloat(score.toFixed(2)) };
    });

    // Sort by score and take top 10
    const topStreamers = scored.sort((a, b) => b.score - a.score).slice(0, 10);

    return NextResponse.json({
      status: "success",
      source: "streamers",
      updated: new Date().toISOString(),
      count: topStreamers.length,
      data: topStreamers,
    });
  } catch (err: any) {
    console.error("❌ [streamers] Error:", err.message);
    return NextResponse.json({
      status: "error",
      message: err.message,
      data: [],
    });
  }
}
