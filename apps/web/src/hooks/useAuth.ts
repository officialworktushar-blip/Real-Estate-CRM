import { useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useGuestStore } from "@/stores/guestStore";
import { api } from "@/services/api";
import { supabase } from "@/services/supabase";
import type { User } from "@/types";

const GUEST_USER: User = {
  id: "guest",
  email: "guest@oryntal.local",
  full_name: "Guest User",
  role: "user",
  is_guest: true,
};

export function useAuth() {
  const { user, setUser, setLoading } = useAuthStore();
  const { isGuest, enterGuestMode, exitGuestMode } = useGuestStore();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<{ data: { user: unknown } }>("/auth/me")
      .then((res) => {
        setUser(res.data.user as User);
      })
      .catch(() => {
        localStorage.removeItem("access_token");
      })
      .finally(() => setLoading(false));
  }, [setUser, setLoading]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<{
        data: { session: { access_token: string }; user: unknown };
      }>("/auth/login", { email, password });
      localStorage.setItem("access_token", res.data.session.access_token);
      exitGuestMode();
      setUser(res.data.user as User);
      return res.data;
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
    if (error) throw error;
  }, []);

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      const res = await api.post<{ data: { user: unknown } }>(
        "/auth/register",
        { full_name: fullName, email, password }
      );
      return res.data;
    },
    []
  );

  const registerWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) throw error;
  }, []);

  const loginAsGuest = useCallback(() => {
    enterGuestMode();
    setUser(GUEST_USER);
    setLoading(false);
  }, [enterGuestMode, setUser, setLoading]);

  const logout = useCallback(() => {
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
