import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qwmpwnhioekiurphsmlh.supabase.co";
const ANON_KEY = "anon-key";
const storageKey = `sb-${new URL(SUPABASE_URL).hostname.split(".")[0]}-auth-token`;
const codeVerifier = "fake_code_verifier_12345";

const storage = new Map();
globalThis.localStorage = {
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
};

globalThis.document = {
  hidden: false,
  visibilityState: "visible",
  addEventListener() {},
  removeEventListener() {},
};

const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init = {}) => {
  const inputUrl = typeof input === "string" ? input : input.url;
  const body = init.body ? JSON.parse(init.body) : {};
  if (init.method === "POST" && inputUrl.includes("/token")) {
    console.log("[fetch] POST /token body:", JSON.stringify(body));
    if (body.auth_code !== "FAKE_AUTH_CODE" || body.code_verifier !== codeVerifier) {
      console.log("[fetch] -> invalid_grant (verifier mismatch)");
      return new Response(
        JSON.stringify({ error: "invalid_grant", error_description: "Invalid code." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log("[fetch] -> session issued");
    return new Response(
      JSON.stringify({
        access_token: "fake.access.token",
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: "fake.refresh.token",
        user: { id: "user-123", email: "user@example.com" },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
  if (init.method === "GET" && inputUrl.includes("/user")) {
    return new Response(
      JSON.stringify({ id: "user-123", email: "user@example.com" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
  return new Response(JSON.stringify({}), { status: 200 });
};

const url = new URL("http://localhost:5173/auth/callback?code=FAKE_AUTH_CODE");
globalThis.window = {
  location: { href: url.href },
  history: {
    state: null,
    replaceState(s, t, u) {
      console.log("[history.replaceState]", u);
      window.location.href = u;
    },
  },
};

storage.set(`${storageKey}-code-verifier`, JSON.stringify(codeVerifier));
console.log("Storage key:", storageKey, "verifier seeded:", storage.get(`${storageKey}-code-verifier`));

const supabase = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { flowType: "pkce" },
});

console.log("\n[useAuth] getSession()...");
const r1 = await supabase.auth.getSession();
console.log("[useAuth] getSession session:", r1.data.session ? "PRESENT" : "NULL");
console.log("  verifier still in storage?", storage.has(`${storageKey}-code-verifier`));
console.log("  session in storage?", storage.has(storageKey));

console.log("\n[AuthCallbackPage] getSession()...");
const r2 = await supabase.auth.getSession();
console.log("[AuthCallbackPage] getSession session:", r2.data.session ? "PRESENT" : "NULL");
console.log("[AuthCallbackPage] code in URL:", new URL(window.location.href).searchParams.get("code") ?? "none");

if (!r2.data.session) {
  const code = new URL(window.location.href).searchParams.get("code");
  if (code) {
    console.log("[AuthCallbackPage] -> exchangeCodeForSession fallback");
    const ex = await supabase.auth.exchangeCodeForSession(code);
    console.log("[AuthCallbackPage] exchange error:", ex.error?.message ?? "NONE");
  }
}

const r3 = await supabase.auth.getSession();
console.log("\n[FINAL] session:", r3.data.session ? "PRESENT" : "NULL");
originalFetch;

process.exit(0);

