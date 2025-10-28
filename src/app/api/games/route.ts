// src/app/api/games/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // 1️⃣ Get all games
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("*")
      .order("kickoff", { ascending: true });

    if (gamesError) throw gamesError;

    // 2️⃣ Get all teams for lookup
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("abbr, name, dome, lat, lon");

    if (teamsError) throw teamsError;

    // 3️⃣ Get all weather data
    const { data: weather, error: weatherError } = await supabase
      .from("weather")
      .select("team_abbr, temp, wind, precipitation, updated_at");

    if (weatherError) throw weatherError;

    // 4️⃣ Combine manually
    const merged = games.map((g) => {
      const home = teams.find((t) => t.abbr === g.home_abbr);
      const away = teams.find((t) => t.abbr === g.away_abbr);
      const wthr = weather.find((w) => w.team_abbr === g.home_abbr);

      return {
        ...g,
        home_team: home,
        away_team: away,
        weather: wthr,
      };
    });

    return NextResponse.json({ ok: true, count: merged.length, games: merged });
  } catch (err: any) {
    console.error("Error in /api/games:", err.message);
    return NextResponse.json({ ok: false, error: err.message });
  }
}
