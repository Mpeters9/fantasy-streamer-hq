import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function GET() {
  try {
    const { data: teams } = await supabase.from("teams").select("abbr, lat, lon");

    if (!teams) throw new Error("No teams found");

    for (const team of teams) {
      // Simulate weather API call
      const fakeWeather = {
        temp: Math.floor(50 + Math.random() * 30), // 50–80°F
        wind: Math.floor(Math.random() * 20),      // 0–20 mph
        precip: Math.random() < 0.2 ? 1 : 0,       // 20% chance rain
        condition: "Clear",
      };

      await supabase.from("weather").upsert({
        team_abbr: team.abbr,
        lat: team.lat,
        lon: team.lon,
        temp: fakeWeather.temp,
        wind: fakeWeather.wind,
        precip: fakeWeather.precip,
        condition: fakeWeather.condition,
        last_updated: new Date().toISOString(),
      });
    }

    return NextResponse.json({ ok: true, updated: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message });
  }
}
