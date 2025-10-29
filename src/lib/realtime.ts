import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function subscribeToCronLogs(
  onInsert: (payload: any) => void
) {
  // Subscribe to INSERT events on the cron_logs table
  const channel = supabase
    .channel('cron_logs_realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'cron_logs' },
      (payload) => onInsert(payload.new)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
