import { NextResponse } from "next/server";

export async function GET() {
  const base =
    process.env.VERCEL_URL && !process.env.VERCEL_URL.includes("localhost")
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  const res = await fetch(`${base}/api/cron/daily`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  });

  const data = await res.json();
  return NextResponse.json(data);
}
