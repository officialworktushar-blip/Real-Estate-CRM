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

interface ProfileFetchResult {
  profile: Profile | null;
  error: Error | null;
}

async function fetchProfile(userId: string): Promise<ProfileFetchResult> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[useAuth] Failed to fetch profile:", error.message);
    return { profile: null, error: new Error(error.message) };
  }

  if (!data) {
    console.warn("[useAuth] No profile row found for user:", userId);
  }

  return { profile: (data as Profile) || null, error: null };
}

function mapSupabaseUser(
  supabaseUser: any,
  profile: Profile | null = null
): User {
  const role: User["role"] =
    profile && (profile.role === "super_admin" || profile.role === "user")
      ? profile.role
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

  useEffect(() => {
    if (!isLoading && !isProfileLoading) return;
    const timeout = setTimeout(() => {
      if (useAuthStore.getState().isLoading) setLoading(false);
      if (useAuthStore.getState().isProfileLoading) setProfileLoading(false);
    }, 15000);
    return () => clearTimeout(timeout);
  }, [isLoading, isProfileLoading, setLoading, setProfileLoading]);

  const applyUser = useCallback(
    async (supabaseUser: any) => {
      const seq = ++loadSeqRef.current;
      setProfileLoading(true);

      try {
        const result = await fetchProfile(supabaseUser.id);

        if (seq !== loadSeqRef.current) {
          return;
        }

        // New signups / OAuth accounts may lack a linked org (or a profile row
        // entirely) if provisioning lagged behind the auth event. Ask the
        // backend to create an organization and link the profile, then re-fetch.
        let profile = result.error ? null : result.profile;
        if (!profile || !profile.org_id) {
          if (!result.error) {
            try {
              await api.post("/auth/ensure-org", {
                full_name: supabaseUser.user_metadata?.full_name,
              });
            } catch (e: any) {
              console.warn("[useAuth] ensure-org failed:", e?.message || e);
            }
          }
          if (seq !== loadSeqRef.current) return;
          const refreshed = await fetchProfile(supabaseUser.id);
          if (seq !== loadSeqRef.current) return;
          if (!refreshed.error && refreshed.profile) {
            profile = refreshed.profile;
          }
        }

        // Always set the user from the session, even when the profile is
        // missing or failed to load, so guards/navigation never hang on a
        // stale null user.
        setProfile(profile);
        const mapped = mapSupabaseUser(supabaseUser, profile);
        setUser(mapped);
      } finally {
        if (seq === loadSeqRef.current) {
          setProfileLoading(false);
        }
      }
    },
    [setUser, setProfile, setProfileLoading]
  );

  useEffect(() => {
    let cancelled = false;

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (cancelled) return;
        if (session?.user) {
          await applyUser(session.user);
        }
      })
      .catch((err) => {
        console.error("[useAuth] Failed to restore session:", err);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.access_token) {
          localStorage.setItem("access_token", session.access_token);
        } else {
          localStorage.removeItem("access_token");
        }

        if (event === "INITIAL_SESSION") {
          return;
        }
        if (session?.user) {
          applyUser(session.user);
        } else if (!useGuestStore.getState().isGuest) {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [applyUser, setUser, setProfile, setLoading]);

  const login = useCallback(
    async (email: string, password: string) => {
      setUser(null);
      setProfile(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
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

      if (data.session) {
        localStorage.setItem("access_token", data.session.access_token);
      }
      exitGuestMode();
      await applyUser(data.user);
      return data;
    },
    [applyUser, setUser, setProfile, exitGuestMode]
  );

  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      throw new Error(
        error.message || "Google sign-in failed. Please try again."
      );
    }
  }, []);

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
        await applyUser(data.user);
        exitGuestMode();
        return { signedIn: true };
      }

      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (!signInError && signInData.session) {
        localStorage.setItem("access_token", signInData.session.access_token);
        await applyUser(signInData.user);
        exitGuestMode();
        return { signedIn: true };
      }

      return { signedIn: false };
    },
    [applyUser, exitGuestMode]
  );

  const registerWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      throw new Error(
        error.message || "Google sign-up failed. Please try again."
      );
    }
  }, []);

  const loginAsGuest = useCallback(() => {
    enterGuestMode();
    setUser(GUEST_USER);
    setProfile(null);
    setLoading(false);
    setProfileLoading(false);
  }, [enterGuestMode, setUser, setProfile, setLoading, setProfileLoading]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("access_token");
    exitGuestMode();
    setUser(null);
    setProfile(null);
  }, [setUser, setProfile, exitGuestMode]);

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
