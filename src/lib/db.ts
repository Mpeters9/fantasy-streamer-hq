// ==============================
// Fantasy Streamer HQ - Supabase Client
// ==============================
import { createClient } from "@supabase/supabase-js";

// Read keys from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fail early if keys aren't set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("❌ Missing Supabase credentials in .env.local");
}

// Export shared Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
