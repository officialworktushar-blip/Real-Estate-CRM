import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const LOGIN_FAILURE_MESSAGE = encodeURIComponent(
  "Sign-in could not be completed. Please try again."
);

export function AuthCallbackPage() {
  const { user, isLoading, isProfileLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Step 1: On mount, ensure the OAuth session is recovered.
  // The Supabase client processes hash tokens / PKCE code automatically
  // during initialization. This is a safety net for edge cases.
  useEffect(() => {
    let active = true;

    const recover = async () => {
      try {
        // Check if session already exists (normal case after redirect).
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log(
          "[OAuth Callback] getSession →",
          session ? `user=${session.user.email}` : "null"
        );

        if (session) return; // Session is ready — onAuthStateChange will apply it.

        // Rare: Supabase client didn't auto-exchange. Try manual PKCE exchange.
        const code = searchParams.get("code");
        if (code) {
          console.log("[OAuth Callback] Exchanging PKCE code for session…");
          const { data, error } =
            await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("[OAuth Callback] Code exchange failed:", error.message);
          } else if (data.session) {
            console.log("[OAuth Callback] Code exchange succeeded:", data.session.user.email);
          }
        }
      } catch (err) {
        console.error("[OAuth Callback] Recovery error:", err);
      }
    };

    recover();
    return () => {
      active = false;
    };
  }, [searchParams]);

  // Step 2: Once session + profile are loaded, redirect by role.
  // If genuinely no session, send to login.
  useEffect(() => {
    // Wait until loading is fully resolved.
    if (isLoading || isProfileLoading) return;

    if (user) {
      const dest = user.role === "super_admin" ? "/admin" : "/dashboard";
      console.log("[OAuth Callback] Redirect →", dest, "(role=" + user.role + ")");
      navigate(dest, { replace: true });
      return;
    }

    // No user in store — check if a session actually exists but profile
    // hasn't loaded yet (rare timing issue). If so, wait for it.
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session?.user) {
        console.log("[OAuth Callback] Session exists but user=null → re-init via /");
        navigate("/", { replace: true });
        return;
      }
      console.log("[OAuth Callback] No session → redirect to login");
      navigate(`/auth/login?message=${LOGIN_FAILURE_MESSAGE}`, { replace: true });
    });
    return () => {
      active = false;
    };
  }, [user, isLoading, isProfileLoading, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-dark-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold-500 border-t-transparent" />
        <p className="text-sm text-dark-400 animate-pulse">
          Completing sign in…
        </p>
      </div>
    </div>
  );
}
