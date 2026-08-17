import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isLoading, isProfileLoading } = useAuth();

  if (isLoading || isProfileLoading) {
    console.log("[AdminRoute] Loading — isLoading:", isLoading, "isProfileLoading:", isProfileLoading);
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          <p className="text-xs text-dark-500">Loading admin session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("[AdminRoute] No user → redirect to /auth/login");
    return <Navigate to="/auth/login" replace />;
  }

  if (user.role !== "super_admin") {
    console.log("[AdminRoute] Not admin (role=" + user.role + ") → redirect to /dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
