import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/common/Sidebar";
import { useAppStore } from "@/stores/appStore";
import { cn } from "@/utils/helpers";

export function AdminLayout() {
  const { user, isLoading } = useAuth();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.role !== "super_admin") return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className={cn("transition-all duration-300", sidebarOpen ? "ml-64" : "ml-16")}>
        <div className="p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-red-600 font-medium mb-1">
              <span className="h-2 w-2 rounded-full bg-red-600" />
              Super Admin
            </div>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
