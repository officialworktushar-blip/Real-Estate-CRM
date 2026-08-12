import { useEffect, useState } from "react";
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
  const [ready, setReady] = useState(false);

  // Recover the OAuth session: the supabase client already processes the
  // return automatically during initialization (implicit hash tokens, or a
  // PKCE code). Only fall back to a manual code exchange if no session landed.
  useEffect(() => {
    let active = true;

    const finish = () => {
      if (active) setReady(true);
    };

    // Fail-safe: never leave the user stuck on the "Completing sign in..."
    // screen forever (requirement: loading state must always resolve).
    const timeout = setTimeout(finish, 10000);

    const recover = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log(
          "[OAuth] Session after redirect:",
          session ? `present (user=${session.user.id})` : "NULL"
        );

        if (session) return;

        const code = searchParams.get("code");
        if (code) {
          console.log("[OAuth] No session yet, exchanging code for session...");
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            code
          );
          if (error) {
            console.error("[OAuth] Code exchange failed:", error.message);
          } else if (data.session) {
            console.log(
              "[OAuth] Session after code exchange:",
              `present (user=${data.session.user.id})`
            );
          }
        }
      } catch (err) {
        console.error("[OAuth] Callback recovery error:", err);
      } finally {
        clearTimeout(timeout);
        finish();
      }
    };

    recover();

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [searchParams]);

  // Once the session is fully available (user + profile loaded), redirect by
  // role. If there is genuinely no session, send the user to login.
  useEffect(() => {
    if (!ready || isLoading || isProfileLoading) return;

    if (user) {
      const destination =
        user.role === "super_admin" ? "/admin" : "/dashboard";
      console.log(
        `[OAuth] Final redirect decision: ${destination} (role=${user.role})`
      );
      navigate(destination, { replace: true });
      return;
    }

    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session?.user) {
        // A session exists but the store is empty (rare). Re-run the auth
        // bootstrap via HomeRedirect instead of bouncing back to login.
        console.log(
          "[OAuth] Session exists but store empty — re-initializing to apply user."
        );
        navigate("/", { replace: true });
        return;
      }
      console.log("[OAuth] Final redirect decision: /auth/login (no session)");
      navigate(`/auth/login?message=${LOGIN_FAILURE_MESSAGE}`, {
        replace: true,
      });
    });
    return () => {
      active = false;
    };
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
