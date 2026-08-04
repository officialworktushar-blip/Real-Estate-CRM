import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isLoading } = useAuth();

  console.log("[AdminRoute] rendering", {
    user,
    role: user?.role,
    isLoading,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user.role !== "super_admin") {
    console.log("[AdminRoute] Access denied for role:", user.role);
    return <Navigate to="/dashboard" replace />;
  }

  console.log("[AdminRoute] Access granted for role:", user.role);

  return <>{children}</>;
}
