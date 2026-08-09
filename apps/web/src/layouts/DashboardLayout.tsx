import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/common/Sidebar";
import { Topbar } from "@/components/common/Topbar";
import { useAppStore } from "@/stores/appStore";
import { cn } from "@/utils/helpers";

export function DashboardLayout() {
  const { user, isLoading, isProfileLoading } = useAuth();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

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

  if (!user) return <Navigate to="/auth/login" replace />;

  return (
    <div className="min-h-screen bg-dark-950">
      <Sidebar />
      <Topbar />

      <main
        className={cn(
          "pt-16 transition-all duration-300 ease-in-out min-h-screen",
          "max-md:ml-0",
          sidebarOpen ? "md:ml-64" : "md:ml-16"
        )}
      >
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
