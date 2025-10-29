'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { supabase, subscribeToCronLogs } from '@/lib/realtime';

// ───────────────────────────────
//  Simple Toast + Button
// ───────────────────────────────
const toast = {
  success: (msg: string) => alert(msg),
  error: (msg: string) => alert(msg)
};

const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`rounded-md bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 ${props.className || ''}`}
  />
);

// ───────────────────────────────
//  Fetcher for last 50 logs
// ───────────────────────────────
const fetcher = async () => {
  const { data, error } = await supabase
    .from('cron_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
};

// ───────────────────────────────
//  Dashboard
// ───────────────────────────────
export default function CronDashboard() {
  const { data, error, isLoading, mutate } = useSWR('cron_logs', fetcher, {
    refreshInterval: 60000
  });

  const [running, setRunning] = useState(false);

  // subscribe to realtime inserts
  useEffect(() => {
    const unsubscribe = subscribeToCronLogs(() => mutate());
    return unsubscribe;
  }, [mutate]);

  // compute last successful run and latest statuses
  const { lastSuccess, endpointStatuses } = useMemo(() => {
    if (!data || data.length === 0) return { lastSuccess: null, endpointStatuses: {} };
    const statuses: Record<string, string> = {};
    for (const log of data) {
      if (!(log.endpoint in statuses)) statuses[log.endpoint] = log.status;
    }
    const success = data.find((l) => l.status === 'success');
    return { lastSuccess: success ? new Date(success.created_at) : null, endpointStatuses: statuses };
  }, [data]);

  const triggerCrons = async () => {
    try {
      setRunning(true);
      const res = await fetch('/api/cron/runAll', {
        method: 'POST',
        headers: { Authorization: 'Bearer my_local_secret' }
      });
      const text: string = await res.text();
      toast.success('✅ Cron triggered!');
      console.log(text);
    } catch (err: any) {
      toast.error('❌ Cron trigger failed.');
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  if (isLoading) return <div className="p-6 text-center">Loading logs…</div>;
  if (error) return <div className="p-6 text-red-500">Failed to load logs</div>;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Cron Job Monitor (Realtime)</h1>
          <p className="text-neutral-400 text-sm mt-1">
            {lastSuccess
              ? `Last successful run: ${lastSuccess.toLocaleString()}`
              : 'No successful runs yet.'}
          </p>
        </div>
        <Button onClick={triggerCrons} disabled={running}>
          {running ? 'Running…' : 'Run All Now'}
        </Button>
      </div>

      {/* Endpoint status badges */}
      <div className="flex flex-wrap gap-2">
        {['odds', 'weather', 'rankings', 'players', 'streamers'].map((ep) => {
          const status = endpointStatuses[ep];
          const color =
            status === 'success'
              ? 'bg-green-700 text-green-200'
              : status === 'failed'
              ? 'bg-red-700 text-red-200'
              : 'bg-neutral-700 text-neutral-200';
          return (
            <span
              key={ep}
              className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}
            >
              {ep}: {status || 'pending'}
            </span>
          );
        })}
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto rounded-xl border border-neutral-800">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-3 py-2 text-left">Time</th>
              <th className="px-3 py-2 text-left">Endpoint</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Message</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((log: any) => (
              <tr
                key={log.id}
                className="border-t border-neutral-800 hover:bg-neutral-900/50"
              >
                <td className="px-3 py-2 text-neutral-300">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-3 py-2">{log.endpoint}</td>
                <td
                  className={`px-3 py-2 font-semibold ${
                    log.status === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {log.status}
                </td>
                <td className="px-3 py-2 text-neutral-400 truncate max-w-[300px]">
                  {log.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
