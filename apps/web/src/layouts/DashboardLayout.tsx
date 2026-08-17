import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/common/Sidebar";
import { Topbar } from "@/components/common/Topbar";
import { useAppStore } from "@/stores/appStore";
import { cn } from "@/utils/helpers";

export function DashboardLayout() {
  const { user } = useAuth();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

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
