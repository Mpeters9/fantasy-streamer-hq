import { NextResponse } from 'next/server';

export async function GET() {
  const weatherKey = process.env.WEATHER_API_KEY;
  const locations = ['Philadelphia', 'Baltimore', 'Kansas City', 'Dallas', 'Green Bay'];

  const results: any[] = [];
  for (const city of locations) {
    try {
      const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${weatherKey}&q=${city}`);
      const json = await res.json();
      results.push({
        city,
        temp_f: json.current?.temp_f,
        condition: json.current?.condition?.text,
        wind_mph: json.current?.wind_mph
      });
    } catch (err) {
      console.error(`❌ [weather] Failed for ${city}:`, err);
    }
  }

  console.log(`✅ [weather] Retrieved ${results.length} weather reports`);
  return NextResponse.json({
    message: 'Live weather data fetched successfully.',
    data: results
  });
}
