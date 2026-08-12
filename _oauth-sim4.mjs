import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const SUPABASE_URL = "https://qwmpwnhioekiurphsmlh.supabase.co";
const ANON_KEY = fs
  .readFileSync("apps/web/.env", "utf8")
  .match(/VITE_SUPABASE_ANON_KEY=(.+)/)[1]
  .trim();

const storage = new Map();
globalThis.localStorage = {
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
};
globalThis.document = { hidden: false, addEventListener() {}, removeEventListener() {} };
globalThis.window = {
  location: { href: "http://localhost:5173/auth/login" },
  history: { state: null, replaceState() {} },
};

for (const flowType of ["implicit", "pkce"]) {
  const client = createClient(SUPABASE_URL, ANON_KEY, { auth: { flowType } });
  console.log(`\n===== flowType=${flowType} =====`);
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: "http://localhost:5173/auth/callback", skipBrowserRedirect: true },
  });
  console.log("error:", error?.message ?? "none");
  const u = new URL(data.url);
  console.log("authorize URL host:", u.host + u.pathname);
  console.log("provider:", u.searchParams.get("provider"));
  console.log("redirect_to:", u.searchParams.get("redirect_to"));
  console.log("code_challenge:", u.searchParams.get("code_challenge") ? "YES" : "NO");
  console.log("code_challenge_method:", u.searchParams.get("code_challenge_method"));
  console.log("flow_type:", u.searchParams.get("flow_type"));
  const verifierInStorage = storage.has("sb-qwmpwnhioekiurphsmlh-auth-token-code-verifier");
  console.log("code verifier stored by client:", verifierInStorage);
}
process.exit(0);
