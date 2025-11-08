"use client";
import React, { useEffect, useMemo, useState } from "react";
import type { Player } from "@/lib/types";

type Row = {
  id: string; name: string; team: string; position: string;
  headshot?: string;
  opponent?: string; spread?: number; implied?: number; weather?: string;
  streamerScore: number;
};

export default function WaiversPage() {
  const [week, setWeek] = useState<number>(10);
  const [rows, setRows] = useState<Row[]>([]);
  const [pos, setPos] = useState("ALL");
  const [status, setStatus] = useState("");

  const load = async (w?: number) => {
    const wk = w ?? (await fetch("/api/cron/week").then(r=>r.json())).week;
    setWeek(wk);
    const data = await fetch(`/api/scoring?week=${wk}`).then(r=>r.json());
    setRows(data.data || []);
    setStatus(`✅ ${data.count} players`);
  };

  useEffect(()=>{ load().catch(console.error); }, []);

  const filtered = useMemo(()=>{
    const list = rows.slice().sort((a,b)=>b.streamerScore - a.streamerScore);
    if (pos === "ALL") return list;
    return list.filter(r => r.position === pos);
  }, [rows, pos]);

  return (
    <div className="space-y-4">
      <header className="flex items-end gap-3">
        <div>
          <h1 className="text-2xl font-bold">🚨 Waivers</h1>
          <p className="text-gray-400">Week {week} {status && "• " + status}</p>
        </div>
        <select value={pos} onChange={(e)=>setPos(e.target.value)} className="ml-auto bg-gray-900 border border-gray-700 rounded px-3 py-2">
          <option>ALL</option><option>QB</option><option>RB</option><option>WR</option><option>TE</option>
        </select>
        <button onClick={()=>load(week)} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded">🔁 Refresh</button>
      </header>

      <div className="overflow-x-auto rounded border border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-900">
            <tr>
              <th className="text-left p-2">Player</th>
              <th className="text-left p-2">Opp</th>
              <th className="text-right p-2">Spread</th>
              <th className="text-right p-2">Implied</th>
              <th className="text-left p-2">Weather</th>
              <th className="text-right p-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-t border-gray-800 hover:bg-gray-900/50">
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <img src={r.headshot || "https://a.espncdn.com/i/headshots/nophoto.png"} className="w-8 h-8 rounded-full border border-gray-800" onError={(e)=>((e.target as HTMLImageElement).src="https://a.espncdn.com/i/headshots/nophoto.png")} />
                    <div>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-gray-400">{r.team} · {r.position}</div>
                    </div>
                  </div>
                </td>
                <td className="p-2">{r.opponent}</td>
                <td className="p-2 text-right">{r.spread ?? "—"}</td>
                <td className="p-2 text-right">{r.implied ?? "—"}</td>
                <td className="p-2">{r.weather ?? "—"}</td>
                <td className="p-2 text-right font-semibold">{r.streamerScore}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-400">No rows</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
