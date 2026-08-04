import { useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useGuestStore } from "@/stores/guestStore";
import { supabase } from "@/lib/supabase";
import type { User } from "@/types";

const GUEST_USER: User = {
  id: "guest",
  email: "guest@oryntal.local",
  full_name: "Guest User",
  role: "user",
  is_guest: true,
};

function mapSupabaseUser(supabaseUser: any): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    full_name:
      supabaseUser.user_metadata?.full_name ??
      supabaseUser.user_metadata?.name ??
      supabaseUser.email?.split("@")[0] ??
      "User",
    avatar_url: supabaseUser.user_metadata?.avatar_url,
    role: "user",
    is_guest: false,
  };
}

export function useAuth() {
  const { user, setUser, setLoading } = useAuthStore();
  const { isGuest, enterGuestMode, exitGuestMode } = useGuestStore();

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      } else if (!useGuestStore.getState().isGuest) {
        setUser(null);
      }
    }
  );

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  const login = useCallback(
    async (email: string, password: string) => {
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
      setUser(mapSupabaseUser(data.user));
      return data;
    },
    [setUser, exitGuestMode]
  );

  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
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
        setUser(mapSupabaseUser(data.user));
        exitGuestMode();
        return { signedIn: true };
      }

      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (!signInError && signInData.session) {
        localStorage.setItem("access_token", signInData.session.access_token);
        setUser(mapSupabaseUser(signInData.user));
        exitGuestMode();
        return { signedIn: true };
      }

      return { signedIn: false };
    },
    [setUser, exitGuestMode]
  );

  const registerWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
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
    setLoading(false);
  }, [enterGuestMode, setUser, setLoading]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("access_token");
    exitGuestMode();
    setUser(null);
  }, [setUser, exitGuestMode]);

  return {
    user,
    isGuest,
    isLoading: useAuthStore((s) => s.isLoading),
    login,
    loginWithGoogle,
    register,
    registerWithGoogle,
    loginAsGuest,
    logout,
  };
}
