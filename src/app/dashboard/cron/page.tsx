'use client';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0; // ✅ Use number instead of false for extra safety

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase, subscribeToCronLogs } from '@/lib/realtime';

export default function CronPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const { mutate } = useSWR('/api/cron/runAll');

  useEffect(() => {
    const unsubscribe = subscribeToCronLogs((log) => setLogs((l) => [...l, log]));
return unsubscribe;

  }, []);

  async function runNow() {
    toast('Running all crons...');
    await fetch('/api/cron/runAll', { method: 'POST' });
    mutate();
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Cron Jobs</h1>
      <Button onClick={runNow}>Run All Now</Button>
      <div className="mt-6 space-y-2 bg-black/10 p-4 rounded-md h-96 overflow-y-auto">
        {logs.length ? (
          logs.map((line, i) => <div key={i}>{line}</div>)
        ) : (
          <div className="text-gray-400">No logs yet.</div>
        )}
      </div>
    </main>
  );
}
