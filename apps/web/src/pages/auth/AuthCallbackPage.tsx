import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export function AuthCallbackPage() {
  const { user, isLoading, isProfileLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const finish = () => {
      if (active) setReady(true);
    };

    // The supabase client processes the OAuth return automatically during
    // initialization (implicit tokens in the fragment, or a PKCE code). Only
    // fall back to a manual code exchange if no session landed from that.
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!active) return undefined;
        const code = searchParams.get("code");
        if (!session && code) {
          return supabase.auth.exchangeCodeForSession(code);
        }
        return undefined;
      })
      .catch(() => undefined)
      .finally(finish);

    return () => {
      active = false;
    };
  }, [searchParams]);

  useEffect(() => {
    if (!ready || isLoading || isProfileLoading) return;

    if (user) {
      navigate(user.role === "super_admin" ? "/admin" : "/dashboard", {
        replace: true,
      });
      return;
    }

    navigate(
      `/auth/login?message=${encodeURIComponent(
        "Sign-in could not be completed. Please try again."
      )}`,
      { replace: true }
    );
  }, [ready, user, isLoading, isProfileLoading, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-dark-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold-500 border-t-transparent" />
        <p className="text-sm text-dark-400 animate-pulse">
          Completing sign in...
        </p>
      </div>
    </div>
  );
}
