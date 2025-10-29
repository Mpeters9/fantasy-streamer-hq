import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function POST(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== 'Bearer my_local_secret') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const baseUrl = process.env.CRON_BASE_URL || 'http://localhost:3000';
  const endpoints = ['odds', 'weather', 'rankings', 'players', 'streamers'];
  const results: Record<string, string> = {};

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${baseUrl}/api/cron/${ep}`, {
        headers: { Authorization: 'Bearer my_local_secret' }
      });
      const text: string = await res.text();
      results[ep] = text;
    } catch (err: any) {
      results[ep] = `Failed: ${err.message}`;
    }
  }

  return NextResponse.json({ results });
}
