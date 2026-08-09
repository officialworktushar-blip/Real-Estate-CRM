import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BrandLogo } from "@/components/common/BrandLogo";

export function AuthLayout() {
  const { user, profile, isGuest, isLoading, isProfileLoading } = useAuth();

  if (isLoading || isProfileLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold-500 border-t-transparent" />
          <p className="text-sm text-dark-400 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (user && !isGuest) {
    return (
      <Navigate
        to={profile?.role === "super_admin" ? "/admin" : "/dashboard"}
        replace
      />
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-dark-950 px-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gold-500/[0.04] blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-brand-500/[0.04] blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-gold-500/[0.02] blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#020617_70%)]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <BrandLogo size="lg" />
        </div>

        <div className="relative rounded-2xl border border-dark-700/50 bg-dark-900/60 backdrop-blur-xl shadow-2xl shadow-black/20 p-8">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold-500/[0.03] to-transparent pointer-events-none" />
          <div className="relative">
            <Outlet />
          </div>
        </div>

        <p className="text-center text-xs text-dark-500 mt-6">
          &copy; {new Date().getFullYear()} Oryntal Estate. All rights reserved.
        </p>
      </div>
    </div>
  );
}
