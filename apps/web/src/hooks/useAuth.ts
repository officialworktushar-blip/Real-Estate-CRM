import { useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useGuestStore } from "@/stores/guestStore";
import { supabase } from "@/lib/supabase";
import { api } from "@/services/api";
import type { Profile, User } from "@/types";

const GUEST_USER: User = {
  id: "guest",
  email: "guest@oryntal.local",
  full_name: "Guest User",
  role: "user",
  is_guest: true,
};

const SAFETY_TIMEOUT_MS = 7_000;
const PROFILE_FETCH_TIMEOUT_MS = 8_000;
const ENSURE_ORG_TIMEOUT_MS = 10_000;

interface ProfileFetchResult {
  profile: Profile | null;
  error: Error | null;
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out after ${ms}ms`)),
        ms
      )
    ),
  ]);
}

async function fetchProfile(userId: string): Promise<ProfileFetchResult> {
  const query = supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  const { data, error } = await withTimeout(
    Promise.resolve(query),
    PROFILE_FETCH_TIMEOUT_MS,
    "fetchProfile"
  );

  if (error) {
    console.error("[Auth] Failed to fetch profile:", error.message);
    return { profile: null, error: new Error(error.message) };
  }

  if (!data) {
    console.warn("[Auth] No profile row found for user:", userId);
  }

  return { profile: (data as Profile) || null, error: null };
}

function mapSupabaseUser(
  supabaseUser: any,
  profile: Profile | null = null
): User {
  const role: User["role"] =
    profile && (profile.role === "super_admin" || profile.role === "owner" || profile.role === "user")
      ? (profile.role as User["role"])
      : "user";

  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    full_name:
      profile?.full_name ||
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.user_metadata?.name ||
      supabaseUser.email?.split("@")[0] ||
      "User",
    avatar_url:
      profile?.avatar_url || supabaseUser.user_metadata?.avatar_url,
    role,
    org_id: profile?.org_id || undefined,
    is_guest: false,
  };
}

export function useAuth() {
  const { user, profile, setUser, setProfile, setLoading, setProfileLoading } =
    useAuthStore();
  const { isGuest, enterGuestMode, exitGuestMode } = useGuestStore();
  const isLoading = useAuthStore((s) => s.isLoading);
  const isProfileLoading = useAuthStore((s) => s.isProfileLoading);
  const loadSeqRef = useRef(0);

  // ── Safety timeout: if loading is still stuck after SAFETY_TIMEOUT_MS,
  // force it to false so the UI never freezes forever. ──────────────────
  useEffect(() => {
    if (!isLoading && !isProfileLoading) return;
    const id = setTimeout(() => {
      const st = useAuthStore.getState();
      if (st.isLoading) setLoading(false);
      if (st.isProfileLoading) setProfileLoading(false);
      console.warn("[Auth] Safety timeout fired — forcing loading=false");
    }, SAFETY_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [isLoading, isProfileLoading, setLoading, setProfileLoading]);

  // ── applyUser: fetch profile + ensure org, then set user in store. ───
  const applyUser = useCallback(
    async (supabaseUser: any) => {
      const seq = ++loadSeqRef.current;
      setProfileLoading(true);
      console.log("[Auth] applyUser started for:", supabaseUser.email);

      try {
        let result: ProfileFetchResult;
        try {
          result = await fetchProfile(supabaseUser.id);
        } catch (e: any) {
          console.warn(
            "[Auth] fetchProfile failed/timed out:",
            e?.message || e
          );
          result = {
            profile: null,
            error: e instanceof Error ? e : new Error(String(e)),
          };
        }

        if (seq !== loadSeqRef.current) {
          console.log("[Auth] applyUser stale — aborting");
          return;
        }

        let profile = result.error ? null : result.profile;

        // If profile is missing or has no org, provision one via the backend
        // then re-fetch.  Try up to 2 times (the backend auth middleware also
        // auto-provisions as a belt, but this is the primary path).
        if (!profile || !profile.org_id) {
          for (let attempt = 1; attempt <= 2; attempt++) {
            if (seq !== loadSeqRef.current) return;
            if (profile?.org_id) break;

            if (!result.error) {
              try {
                console.log(
                  `[Auth] ensure-org attempt ${attempt}/2 ...`
                );
                await withTimeout(
                  api.post("/auth/ensure-org", {
                    full_name: supabaseUser.user_metadata?.full_name,
                  }),
                  ENSURE_ORG_TIMEOUT_MS,
                  "ensure-org"
                );
              } catch (e: any) {
                console.warn(
                  `[Auth] ensure-org attempt ${attempt} failed:`,
                  e?.message || e
                );
              }
            }

            if (seq !== loadSeqRef.current) return;
            try {
              const refreshed = await fetchProfile(supabaseUser.id);
              if (seq !== loadSeqRef.current) return;
              if (!refreshed.error && refreshed.profile) {
                profile = refreshed.profile;
              }
            } catch (e: any) {
              console.warn(
                "[Auth] Re-fetch profile failed/timed out:",
                e?.message || e
              );
            }
          }
        }

        setProfile(profile);
        const mapped = mapSupabaseUser(supabaseUser, profile);
        console.log(
          "[Auth] Profile loaded →",
          mapped.email,
          "| role:",
          mapped.role,
          "| org_id:",
          mapped.org_id ?? "null"
        );
        setUser(mapped);
        useGuestStore.getState().exitGuestMode();
      } finally {
        if (seq === loadSeqRef.current) {
          setProfileLoading(false);
        }
      }
    },
    [setUser, setProfile, setProfileLoading]
  );

  // ── Initial session restore + auth state subscription. ───────────────
  useEffect(() => {
    let cancelled = false;

    // 1. Restore any existing session on mount.
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (cancelled) return;
        console.log(
          "[Auth] getSession →",
          session ? `user=${session.user.email}` : "null"
        );
        if (session?.user) {
          await applyUser(session.user);
        }
      })
      .catch((err) => {
        console.error("[Auth] getSession failed:", err);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          console.log("[Auth] Initial session restore complete → isLoading=false");
        }
      });

    // 2. Listen for auth state changes (login, logout, OAuth redirect).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[Auth] onAuthStateChange:", event, session?.user?.email ?? "no-session");

      if (session?.access_token) {
        localStorage.setItem("access_token", session.access_token);
      } else {
        localStorage.removeItem("access_token");
      }

      // INITIAL_SESSION is the synthetic event fired on Supabase client
      // initialization — the getSession() effect above handles it.
      if (event === "INITIAL_SESSION") {
        return;
      }

      if (session?.user) {
        // SIGNED_IN / TOKEN_REFRESHED — apply user and clear loading.
        applyUser(session.user);
        setLoading(false);
      } else if (event === "SIGNED_OUT" || (!useGuestStore.getState().isGuest && !session)) {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
    // setLoading / setProfile / setUser are stable Zustand setters.
    // applyUser is memoised with stable deps. Suppress exhaustive deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyUser]);

  // ── Email / Password login ───────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string) => {
      console.log("[Auth] Login method: email+password");
      setUser(null);
      setProfile(null);
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        switch (error.message) {
          case "Invalid login credentials":
            throw new Error("Invalid email or password. Please try again.");
          case "Email not confirmed":
            throw new Error("Invalid email or password. Please try again.");
          case "Too many requests":
            throw new Error(
              "Too many login attempts. Please wait a moment and try again."
            );
          default:
            throw new Error(error.message || "Login failed. Please try again.");
        }
      }

      console.log("[Auth] Email login succeeded →", data.user.email);

      if (data.session) {
        localStorage.setItem("access_token", data.session.access_token);
      }
      exitGuestMode();
      await applyUser(data.user);

      setLoading(false);
      console.log("[Auth] Email login complete → isLoading=false");
      return data;
    },
    [applyUser, setUser, setProfile, setLoading, exitGuestMode]
  );

  // ── Google OAuth login ───────────────────────────────────────────────
  const loginWithGoogle = useCallback(async () => {
    const redirectTo = `${window.location.origin}/auth/callback`;
    console.log("[Auth] Login method: Google → redirectTo:", redirectTo);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      console.error("[Auth] Google sign-in failed:", error.message);
      throw new Error(
        error.message || "Google sign-in failed. Please try again."
      );
    }
  }, []);

  // ── Register ─────────────────────────────────────────────────────────
  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        switch (error.message) {
          case "User already registered":
            throw new Error(
              "An account with this email already exists. Please sign in instead."
            );
          case "Password should be at least 6 characters":
            throw new Error("Password must be at least 6 characters long.");
          case "Unable to validate email address: invalid format":
            throw new Error("Please enter a valid email address.");
          case "Signup is disabled":
            throw new Error(
              "New registrations are currently disabled. Please contact support."
            );
          default:
            throw new Error(
              error.message || "Registration failed. Please try again."
            );
        }
      }

      if (data.session) {
        localStorage.setItem("access_token", data.session.access_token);
        setLoading(true);
        await applyUser(data.user);
        setLoading(false);
        exitGuestMode();
        return { signedIn: true };
      }

      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (!signInError && signInData.session) {
        localStorage.setItem("access_token", signInData.session.access_token);
        setLoading(true);
        await applyUser(signInData.user);
        setLoading(false);
        exitGuestMode();
        return { signedIn: true };
      }

      return { signedIn: false };
    },
    [applyUser, exitGuestMode, setLoading]
  );

  // ── Google sign-up (same OAuth flow) ─────────────────────────────────
  const registerWithGoogle = useCallback(async () => {
    const redirectTo = `${window.location.origin}/auth/callback`;
    console.log("[Auth] Sign-up method: Google → redirectTo:", redirectTo);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      console.error("[Auth] Google sign-up failed:", error.message);
      throw new Error(
        error.message || "Google sign-up failed. Please try again."
      );
    }
  }, []);

  // ── Guest login ──────────────────────────────────────────────────────
  const loginAsGuest = useCallback(() => {
    console.log("[Auth] Login method: guest");
    enterGuestMode();
    setUser(GUEST_USER);
    setProfile(null);
    setLoading(false);
    setProfileLoading(false);
    console.log("[Auth] Guest login complete → isLoading=false");
  }, [enterGuestMode, setUser, setProfile, setLoading, setProfileLoading]);

  // ── Logout ───────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("access_token");
    exitGuestMode();
    setUser(null);
    setProfile(null);
    setLoading(false);
    setProfileLoading(false);
  }, [setUser, setProfile, setLoading, setProfileLoading, exitGuestMode]);

  return {
    user,
    profile,
    isGuest,
    isLoading,
    isProfileLoading,
    login,
    loginWithGoogle,
    register,
    registerWithGoogle,
    loginAsGuest,
    logout,
  };
}
