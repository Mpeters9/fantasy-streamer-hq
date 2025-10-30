'use client';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0; // ✅ Use number instead of false for extra safety

import useSWR from 'swr';
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function GamesPage() {
  const { data, error, isLoading } = useSWR('/api/games', fetcher);

  if (isLoading) return <p className="p-8">Loading...</p>;
  if (error) return <p className="p-8 text-red-400">Error loading games.</p>;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Games</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.games?.map((g: any) => (
          <div
            key={g.id}
            className="border border-gray-700 rounded-lg p-4 bg-white/5"
          >
            <p className="font-semibold">
              {g.home_team} vs {g.away_team}
            </p>
            <p className="text-gray-400">{g.date}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
