"use client";
import { useState } from "react";

export interface PlayerData {
  weather?: string;
  dome?: boolean;
  spread?: number;
  total?: number;
  impliedPts?: number;
  opponentRank?: number;
}

export default function usePlayerData() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PlayerData | null>(null);

  const fetchPlayerData = async (team: string, opponent: string) => {
    try {
      setLoading(true);

      // Weather endpoint (free)
      const weatherRes = await fetch(`/api/weather?team=${team}`);
      const weather = weatherRes.ok ? await weatherRes.json() : null;

      // Odds endpoint (your Express /routes/odds.ts)
      const oddsRes = await fetch(`/api/odds?team=${team}`);
      const odds = oddsRes.ok ? await oddsRes.json() : null;

      // Fallback dummy if API fails
      const merged: PlayerData = {
        weather: weather?.condition || "Clear",
        dome: weather?.isDome || false,
        spread: odds?.spread ?? -3,
        total: odds?.total ?? 44.5,
        impliedPts: odds?.impliedPts ?? 24.5,
        opponentRank: Math.floor(Math.random() * 32) + 1,
      };

      setData(merged);
      return merged;
    } catch (err) {
      console.error("Error fetching player data:", err);
      const fallback: PlayerData = {
        weather: "Clear",
        dome: false,
        spread: -3,
        total: 44.5,
        impliedPts: 24.5,
        opponentRank: 16,
      };
      setData(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, fetchPlayerData };
}
