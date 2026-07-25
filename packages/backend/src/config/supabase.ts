import { createClient } from "@supabase/supabase-js";
import { config } from "./index";

if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  console.warn("Supabase credentials not configured. API calls will fail.");
}

export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

export const supabaseAnon = createClient(
  config.supabase.url,
  config.supabase.anonKey
);
