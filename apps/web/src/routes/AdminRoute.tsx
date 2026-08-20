import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isLoading, isProfileLoading } = useAuth();

  if (user) {
    if (user.role !== "super_admin") {
      return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
  }

  if (isLoading || isProfileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          <p className="text-xs text-dark-500">Loading admin session…</p>
        </div>
      </div>
    );
  }

  return <Navigate to="/auth/login" replace />;
}
