import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function HomeRedirect() {
  const { user, isLoading, isProfileLoading } = useAuth();

  if (isLoading || isProfileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent" />
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
