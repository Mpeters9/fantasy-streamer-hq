// src/app/api/cron/weather/route.ts
import { NextResponse } from "next/server";

type TeamLocation = {
  team: string;
  lat: number;
  lon: number;
};

// Minimal set of major NFL teams for demo; add more if you like
const teamCoordinates: TeamLocation[] = [
  { team: "49ers", lat: 37.403, lon: -121.97 },
  { team: "Chiefs", lat: 39.0489, lon: -94.4840 },
  { team: "Bills", lat: 42.7738, lon: -78.7868 },
  { team: "Packers", lat: 44.5013, lon: -88.0622 },
  { team: "Eagles", lat: 39.9008, lon: -75.1675 },
  { team: "Ravens", lat: 39.2780, lon: -76.6227 },
  { team: "Cowboys", lat: 32.7473, lon: -97.0945 },
  { team: "Bears", lat: 41.8623, lon: -87.6167 },
  { team: "Lions", lat: 42.3400, lon: -83.0456 },
  { team: "Patriots", lat: 42.0917, lon: -71.2643 },
];

export async function GET() {
  try {
    const reports = await Promise.all(
      teamCoordinates.map(async ({ team, lat, lon }) => {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed for ${team}: ${res.status}`);
        const data = await res.json();
        const current = data.current_weather || {};
        return {
          team,
          tempF: (current.temperature * 9) / 5 + 32,
          windMph: current.windspeed * 0.621371,
          condition: current.weathercode,
        };
      })
    );

    return NextResponse.json({
      status: "success",
      count: reports.length,
      data: reports,
    });
  } catch (err: any) {
    console.error("❌ [weather] Error:", err.message);
    return NextResponse.json({
      status: "error",
      message: err.message,
      data: [],
    });
  }
}
