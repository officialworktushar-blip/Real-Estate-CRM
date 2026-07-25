import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/services/api";

export function useAuth() {
  const { user, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api.get<{ data: { user: unknown } }>("/auth/me").then((res) => {
      setUser(res.data.user as any);
    }).catch(() => {
      localStorage.removeItem("access_token");
    }).finally(() => setLoading(false));
  }, [setUser, setLoading]);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ data: { session: { access_token: string }; user: unknown } }>("/auth/login", { email, password });
    localStorage.setItem("access_token", res.data.session.access_token);
    setUser(res.data.user as any);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return { user, login, logout, isLoading: useAuthStore((s) => s.isLoading) };
}
