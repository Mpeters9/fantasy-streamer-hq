import { NextResponse } from 'next/server';

export async function GET() {
  // Simple static team ranks (replace later with ESPN API or PFF)
  const rankings = [
    { team: 'BAL', rank: 1, offense: 89, defense: 91 },
    { team: 'KC', rank: 2, offense: 92, defense: 85 },
    { team: 'PHI', rank: 3, offense: 90, defense: 83 }
  ];

  console.log('✅ [rankings] Static team ranks used for now');
  return NextResponse.json({ message: 'Rankings loaded', data: rankings });
}
  