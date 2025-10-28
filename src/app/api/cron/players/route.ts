import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("🧩 Running player cron...");
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .limit(1);

    if (error) throw error;
    return NextResponse.json({ ok: true, count: data?.length || 0 });
  } catch (err: any) {
    console.error("Player cron failed:", err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
