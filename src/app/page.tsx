"use client";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function Home() {
const { data: teams, error } = await supabase
  .from("teams")
  .select("*")
  .order("abbr", { ascending: true });

  if (error) {
    return <main className="p-6">❌ {error.message}</main>;
  }

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">NFL Teams (from Supabase)</h1>
      <ul>
        {teams.map((t: any) => (
          <li key={t.id}>
            {t.abbr} — {t.name} ({t.dome ? "Dome" : "Outdoor"})
          </li>
        ))}
      </ul>
    </main>
  );
}
