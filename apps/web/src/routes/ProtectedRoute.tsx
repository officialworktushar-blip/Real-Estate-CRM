import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, isProfileLoading } = useAuth();

  if (isLoading || isProfileLoading) {
    console.log("[ProtectedRoute] Loading — isLoading:", isLoading, "isProfileLoading:", isProfileLoading);
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          <p className="text-xs text-dark-500">Loading your session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("[ProtectedRoute] No user → redirect to /auth/login");
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}
