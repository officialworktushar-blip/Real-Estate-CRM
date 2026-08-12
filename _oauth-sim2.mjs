import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qwmpwnhioekiurphsmlh.supabase.co";
const ANON_KEY = "anon-key";

const storage = new Map();

globalThis.localStorage = {
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
};

const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init = {}) => {
  const inputUrl = typeof input === "string" ? input : input.url;
  const body = init.body ? JSON.parse(init.body) : {};
  if (init.method === "POST" && inputUrl.includes("/token")) {
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

function run(href, label) {
  return new Promise(async (resolve) => {
    console.log(`\n######## SCENARIO: ${label} ########`);
    console.log(`URL: ${href}`);
    storage.clear();
    const url = new URL(href);
    globalThis.document = {
      hidden: false,
      visibilityState: "visible",
      addEventListener() {},
      removeEventListener() {},
    };
    globalThis.window = {
      location: { href: url.href },
      history: {
        state: null,
        replaceState(s, t, u) {
          console.log(`  [history.replaceState] ${u}`);
          window.location.href = u;
        },
      },
    };
    const client = createClient(SUPABASE_URL, ANON_KEY, { auth: { debug: true } });
    console.log("[useAuth] getSession()...");
    const r1 = await client.auth.getSession();
    console.log("[useAuth] getSession result session:", r1.data.session ? "PRESENT" : "NULL", "error:", r1.error?.message ?? "none");
    const events = [];
    const sub = client.auth.onAuthStateChange((e, s) => {
      events.push(e);
      console.log(`  [onAuthStateChange] ${e} session=${s ? "PRESENT" : "null"}`);
    });
    await new Promise((r) => setTimeout(r, 30));
    console.log("[AuthCallbackPage] getSession()...");
    const r2 = await client.auth.getSession();
    console.log("[AuthCallbackPage] getSession result session:", r2.data.session ? "PRESENT" : "NULL");
    const codeInUrl = new URL(url.href).searchParams.get("code");
    console.log("[AuthCallbackPage] code param in URL:", codeInUrl ?? "none");
    if (!r2.data.session && codeInUrl) {
      console.log("[AuthCallbackPage] -> exchangeCodeForSession(code)");
      const ex = await client.auth.exchangeCodeForSession(codeInUrl);
      console.log("[AuthCallbackPage] exchange error:", ex.error?.message ?? "NONE");
    }
    await new Promise((r) => setTimeout(r, 30));
    const r3 = await client.auth.getSession();
    console.log("[FINAL] session:", r3.data.session ? "PRESENT" : "NULL", "events:", events);
    sub?.subscription?.unsubscribe();
    resolve();
  });
}

await run(
  "http://localhost:5173/auth/callback?code=SOME_CODE",
  "redirectTo=/auth/callback (query code, default implicit flow)"
);
await run(
  "http://localhost:5173/auth/callback#access_token=abc&refresh_token=def&expires_in=3600&token_type=bearer",
  "redirectTo=/auth/callback (fragment tokens, default implicit flow)"
);
originalFetch;
