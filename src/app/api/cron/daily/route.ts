import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = req.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const base =
    process.env.VERCEL_URL && !process.env.VERCEL_URL.includes("localhost")
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  const endpoints = ["/api/cron/odds", "/api/cron/weather", "/api/cron/rankings"];

  const results = [];
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${base}${ep}`, {
        headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
      });
      const data = await res.json();
      results.push({ ep, data });
    } catch (err: any) {
      results.push({ ep, error: err.message });
    }
  }

  return NextResponse.json({
    ok: true,
    message: "Daily cron completed",
    results,
  });
}
