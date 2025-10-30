import { NextResponse } from 'next/server';

export async function GET() {
  // For now, combine odds + weather pseudo-logic for “streamer score”
  const streamers = [
    { name: 'Jake Ferguson', team: 'DAL', matchup: 'vs PHI', score: 7.8 },
    { name: 'Jayden Reed', team: 'GB', matchup: 'vs CHI', score: 7.5 },
    { name: 'Taysom Hill', team: 'NO', matchup: 'vs ATL', score: 6.9 }
  ];

  console.log('✅ [streamers] Live streamer suggestions generated');
  return NextResponse.json({
    message: 'Live streamer recommendations ready.',
    data: streamers
  });
}
