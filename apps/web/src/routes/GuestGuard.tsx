import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface GuestGuardProps {
  children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const { user, isGuest, isLoading, isProfileLoading } = useAuth();
  const location = useLocation();

  if (isLoading || isProfileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={`/auth/login?message=${encodeURIComponent(
          "Please create an account to continue with purchase"
        )}`}
        state={{ from: location }}
        replace
      />
    );
  }

  if (isGuest) {
    return (
      <Navigate
        to={`/auth/login?message=${encodeURIComponent(
          "Please create an account to continue with purchase"
        )}`}
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
}
