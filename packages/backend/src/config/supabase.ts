import { createClient } from "@supabase/supabase-js";
import { config } from "./index";

const missing = !config.supabase.url || !config.supabase.serviceRoleKey;
if (missing) {
  console.warn(
    "[supabase] Credentials missing. Using placeholder URL - API calls will fail. " +
      "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in packages/backend/.env"
  );
}

// createClient throws "supabaseUrl is required" on an empty string, which crashes
// the process at boot. Use a syntactically valid placeholder so the server still
// boots and per-request errors surface as handled 500s instead.
const url = config.supabase.url || "https://placeholder.supabase.co";

export const supabaseAdmin = createClient(
  url,
  config.supabase.serviceRoleKey || "placeholder-service-role-key",
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

export const supabaseAnon = createClient(
  url,
  config.supabase.anonKey || "placeholder-anon-key"
);
