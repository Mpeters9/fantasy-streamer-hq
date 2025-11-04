// src/app/api/cron/weather/route.ts
import { NextResponse } from "next/server";

const TEAM_LOCATIONS = {
  "49ers": "Santa Clara,CA",
  "Chiefs": "Kansas City,MO",
  "Bills": "Buffalo,NY",
  "Cowboys": "Arlington,TX",
  "Eagles": "Philadelphia,PA",
  "Lions": "Detroit,MI",
  "Ravens": "Baltimore,MD",
  "Packers": "Green Bay,WI",
  "Bears": "Chicago,IL",
  "Patriots": "Foxborough,MA",
  "Broncos": "Denver,CO",
  "Seahawks": "Seattle,WA",
  "Chargers": "Inglewood,CA",
  "Raiders": "Las Vegas,NV",
  "Giants": "East Rutherford,NJ",
  "Jets": "East Rutherford,NJ",
  "Falcons": "Atlanta,GA",
  "Saints": "New Orleans,LA",
  "Vikings": "Minneapolis,MN",
  "Steelers": "Pittsburgh,PA",
  "Browns": "Cleveland,OH",
  "Bengals": "Cincinnati,OH",
  "Texans": "Houston,TX",
  "Titans": "Nashville,TN",
  "Jaguars": "Jacksonville,FL",
  "Panthers": "Charlotte,NC",
  "Commanders": "Landover,MD",
  "Cardinals": "Glendale,AZ",
  "Rams": "Inglewood,CA",
  "Colts": "Indianapolis,IN",
  "Dolphins": "Miami,FL",
  "Buccaneers": "Tampa,FL",
};

export async function GET() {
  try {
    const weatherData: any[] = [];
    const API_KEY = process.env.OPENWEATHER_KEY || "demo"; // Replace if you have your own key

    for (const [team, loc] of Object.entries(TEAM_LOCATIONS)) {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=40&longitude=-83&current_weather=true`,
        { cache: "no-store" }
      );
      const data = await res.json();
      const tempF = (data.current_weather.temperature * 9) / 5 + 32;
      weatherData.push({
        team,
        tempF,
        windMph: data.current_weather.windspeed * 0.621371,
        condition: data.current_weather.weathercode,
      });
    }

    return NextResponse.json({
      status: "success",
      count: weatherData.length,
      data: weatherData,
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
