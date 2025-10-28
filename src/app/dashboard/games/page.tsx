"use client";
import useSWR from "swr";
// temporary fallback — pure HTML layout
const Card = ({ children }: any) => <div className="border rounded-lg p-4 bg-white/5">{children}</div>;
const CardContent = ({ children }: any) => <div>{children}</div>;
const Table = ({ children }: any) => <table className="w-full border-collapse">{children}</table>;
const TableHeader = ({ children }: any) => <thead className="bg-gray-800 text-white">{children}</thead>;
const TableHead = ({ children }: any) => <th className="p-2 border">{children}</th>;
const TableBody = ({ children }: any) => <tbody>{children}</tbody>;
const TableRow = ({ children }: any) => <tr className="border">{children}</tr>;
const TableCell = ({ children }: any) => <td className="p-2 border text-center">{children}</td>;

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function GamesDashboard() {
  const { data, error, isLoading } = useSWR("/api/games", fetcher, { refreshInterval: 60000 });

  if (isLoading) return <p className="p-4 text-sm">Loading games...</p>;
  if (error || !data?.ok) return <p className="p-4 text-red-500">Error: {data?.error || "Failed to load"}</p>;

  const games = data.games || [];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Games Dashboard</h1>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kickoff</TableHead>
                <TableHead>Home</TableHead>
                <TableHead>Away</TableHead>
                <TableHead>Spread</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Temp</TableHead>
                <TableHead>Wind</TableHead>
                <TableHead>Precip</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((g: any) => (
                <TableRow key={g.id}>
                  <TableCell>{new Date(g.kickoff).toLocaleString()}</TableCell>
                  <TableCell>{g.home_abbr}</TableCell>
                  <TableCell>{g.away_abbr}</TableCell>
                  <TableCell>{g.spread ?? "-"}</TableCell>
                  <TableCell>{g.total ?? "-"}</TableCell>
                  <TableCell>{g.weather?.temp ?? "-"}</TableCell>
                  <TableCell>{g.weather?.wind ?? "-"}</TableCell>
                  <TableCell>{g.weather?.precipitation ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
