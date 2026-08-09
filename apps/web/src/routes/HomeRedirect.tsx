import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function HomeRedirect() {
  const { user, profile, isLoading } = useAuth();

  console.log("Auth loading:", isLoading);
  console.log("User:", user);
  console.log("Profile:", profile);
  console.log("Role:", profile?.role);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  console.log("[HomeRedirect] Routing by role:", profile?.role ?? user.role);
  return (
    <Navigate
      to={profile?.role === "super_admin" ? "/admin" : "/dashboard"}
      replace
    />
  );
}
