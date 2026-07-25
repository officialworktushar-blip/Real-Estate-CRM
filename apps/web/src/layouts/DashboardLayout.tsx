import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/common/Sidebar";
import { useAppStore } from "@/stores/appStore";
import { cn } from "@/utils/helpers";

export function DashboardLayout() {
  const { user, isLoading } = useAuth();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth/login" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className={cn("transition-all duration-300", sidebarOpen ? "ml-64" : "ml-16")}>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
