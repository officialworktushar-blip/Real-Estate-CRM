import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qwmpwnhioekiurphsmlh.supabase.co";
const ANON_KEY = "anon-key";

// --- Mock browser environment ---
const storage = new Map();
const url = new URL("http://localhost:5173/auth/callback?code=FAKE_AUTH_CODE");

globalThis.window = {
  location: { href: url.href },
  history: {
    state: null,
    replaceState(state, title, newUrl) {
      const u = new URL(newUrl, window.location.href);
      url.search = u.search;
      url.hash = u.hash;
      window.location.href = url.href;
      console.log("[history.replaceState] URL now:", url.href);
    },
  },
};

globalThis.localStorage = {
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
};

// Storage key derived from supabase URL
const storageKey = `sb-${new URL(SUPABASE_URL).hostname.split(".")[0]}-auth-token`;

// Pre-seed the PKCE code verifier that signInWithOAuth would have stored
const codeVerifier = "fake_code_verifier_12345";
storage.set(`${storageKey}-code-verifier`, codeVerifier);

// --- Mock fetch to simulate Supabase Auth server ---
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init = {}) => {
  const inputUrl = typeof input === "string" ? input : input.url;
  const body = init.body ? JSON.parse(init.body) : {};

  if (init.method === "POST" && inputUrl.includes("/token?grant_type=pkce")) {
    console.log(
      "[fetch] POST /token?grant_type=pkce  body:",
      JSON.stringify(body)
    );
    if (body.auth_code !== "FAKE_AUTH_CODE" || body.code_verifier !== codeVerifier) {
      console.log("[fetch] -> error: invalid_grant");
      return new Response(
        JSON.stringify({
          error: "invalid_grant",
          error_description: "Invalid code.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log("[fetch] -> session issued");
    return new Response(
      JSON.stringify({
        access_token: "fake.access.token",
        token_type: "bearer",
        expires_in: 3600,
        expires_at: Math.round(Date.now() / 1000) + 3600,
        refresh_token: "fake.refresh.token",
        user: {
          id: "user-123",
          aud: "authenticated",
          email: "user@example.com",
          user_metadata: { full_name: "John Doe", name: "John Doe" },
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  if (init.method === "GET" && inputUrl.includes("/user")) {
    return new Response(
      JSON.stringify({
        id: "user-123",
        aud: "authenticated",
        email: "user@example.com",
        user_metadata: { full_name: "John Doe", name: "John Doe" },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  console.log("[fetch] unhandled:", init.method, inputUrl);
  return new Response(JSON.stringify({}), { status: 200 });
};

// --- Create client exactly like lib/supabase.ts ---
const supabase = createClient(SUPABASE_URL, ANON_KEY, { auth: { flowType: "pkce" } });

// Simulate the useAuth flow: getSession() + onAuthStateChange()
console.log("\n=== useAuth: calling getSession() ===");
const sessionResult = await supabase.auth.getSession();
console.log(
  "[getSession] session:",
  sessionResult.data.session
    ? `present (user=${sessionResult.data.session.user.id})`
    : "NULL"
);

console.log("\n=== useAuth: registering onAuthStateChange ===");
const events = [];
const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
  events.push(event);
  console.log(
    `[onAuthStateChange] event=${event} session=${session ? "present" : "null"}`
  );
});

await new Promise((r) => setTimeout(r, 50));

console.log("\n=== AuthCallbackPage: calling getSession() again ===");
const s2 = await supabase.auth.getSession();
console.log(
  "[getSession#2] session:",
  s2.data.session ? `present (user=${s2.data.session.user.id})` : "NULL"
);
const codeInUrl = new URL(window.location.href).searchParams.get("code");
console.log("[AuthCallbackPage] code in URL after init:", codeInUrl);

if (!s2.data.session && codeInUrl) {
  console.log(
    "\n[AuthCallbackPage] NO SESSION + code present -> exchangeCodeForSession()"
  );
  const ex = await supabase.auth.exchangeCodeForSession(codeInUrl);
  console.log("[exchangeCodeForSession] error:", ex.error?.message ?? "none");
}

await new Promise((r) => setTimeout(r, 50));

console.log("\n=== FINAL STATE ===");
console.log("Events seen:", events);
const finalSession = await supabase.auth.getSession();
console.log(
  "Final session:",
  finalSession.data.session
    ? `present (user=${finalSession.data.session.user.id})`
    : "NULL"
);

sub.subscription.unsubscribe();
originalFetch;

