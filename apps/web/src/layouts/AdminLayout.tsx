import { Component, type ReactNode } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/common/Sidebar";
import { Topbar } from "@/components/common/Topbar";
import { useAppStore } from "@/stores/appStore";
import { cn } from "@/utils/helpers";
import { Shield } from "lucide-react";

interface BoundaryState {
  error: Error | null;
}

class AdminPageBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      console.error("[AdminLayout] Admin page failed to render:", this.state.error);
      return (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <p className="text-sm font-semibold text-red-400 mb-2">
            Admin page failed to render
          </p>
          <pre className="text-xs text-red-300/80 whitespace-pre-wrap text-left bg-dark-900/60 rounded-lg p-4 mb-4">
            {this.state.error.message}
            {"\n"}
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function AdminLayout() {
  const { user, isLoading, isProfileLoading } = useAuth();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  if (isLoading || isProfileLoading) {
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
          <AdminPageBoundary>
            <Outlet />
          </AdminPageBoundary>
        </div>
      </main>
    </div>
  );
}
