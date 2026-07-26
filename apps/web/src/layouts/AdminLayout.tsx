import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/common/Sidebar";
import { Topbar } from "@/components/common/Topbar";
import { useAppStore } from "@/stores/appStore";
import { cn } from "@/utils/helpers";
import { Shield } from "lucide-react";

export function AdminLayout() {
  const { user, isLoading } = useAuth();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
          <p className="text-sm text-dark-400 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.role !== "super_admin") return <Navigate to="/dashboard" replace />;

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
          <div className="flex items-center gap-2 text-sm text-red-400 font-medium mb-6">
            <Shield className="h-4 w-4" />
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            Super Admin
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
