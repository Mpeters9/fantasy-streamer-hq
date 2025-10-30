'use client';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0; // ✅ Use number instead of false for extra safety

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function StreamersPage() {
  const [streamers, setStreamers] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('streamers').select('*');
      setStreamers(data || []);
    };
    load();
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Streamers</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {streamers.length ? (
          streamers.map((s) => (
            <div
              key={s.id}
              className="border border-gray-700 rounded-lg p-4 bg-white/5"
            >
              <p className="font-semibold">{s.name}</p>
              <p className="text-gray-400">{s.team}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No streamers found.</p>
        )}
      </div>
    </main>
  );
}
