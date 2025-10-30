import { NextResponse } from 'next/server';

export async function GET() {
  // (You can later hook this to SportsData.io or Sleeper API)
  const mock = [
    { name: 'CJ Stroud', team: 'HOU', position: 'QB', projection: 19.5 },
    { name: 'Sam LaPorta', team: 'DET', position: 'TE', projection: 14.2 },
    { name: 'James Cook', team: 'BUF', position: 'RB', projection: 13.1 }
  ];

  console.log('✅ [players] Mock player projections returned (real API TBD)');
  return NextResponse.json({ message: 'Player data ready.', data: mock });
}
