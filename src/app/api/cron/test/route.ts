import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: '✅ API test route is working locally!' });
}
