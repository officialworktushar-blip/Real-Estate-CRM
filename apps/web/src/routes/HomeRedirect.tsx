import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function HomeRedirect() {
  const { user, isLoading, isProfileLoading } = useAuth();

  if (isLoading || isProfileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent" />
          <p className="text-xs text-dark-500">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <Navigate
      to={user.role === "super_admin" ? "/admin" : "/dashboard"}
      replace
    />
  );
}
