import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.ODDS_API_KEY;
  const url = `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?regions=us&oddsFormat=american&apiKey=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();

    console.log(`✅ [odds] Retrieved ${data.length} matchups`);
    return NextResponse.json({
      message: 'Live NFL odds fetched successfully.',
      count: data.length,
      data
    });
  } catch (err: any) {
    console.error('❌ [odds] Failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
