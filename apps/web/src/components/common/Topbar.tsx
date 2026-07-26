import { LogOut, Menu, Bell, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/stores/appStore";
import { cn } from "@/utils/helpers";

export function Topbar() {
  const { user, isGuest, logout } = useAuth();
  const { toggleMobileMenu, sidebarOpen } = useAppStore();
  const sidebarWidth = sidebarOpen ? 256 : 64;

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16",
        "bg-dark-900/80 backdrop-blur-xl border-b border-dark-700",
        "flex items-center justify-between px-4 md:px-6",
        "transition-all duration-300"
      )}
      style={{ left: `${sidebarWidth}px` }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-800 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {isGuest && (
          <Link
            to="/auth/register"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-gold-500/10 border border-gold-500/20 px-3 py-1.5 text-xs font-medium text-gold-400 hover:bg-gold-500/20 transition-colors"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Sign Up
          </Link>
        )}

        <button className="relative p-2 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold-500" />
        </button>

        <div className="hidden sm:flex items-center gap-3 ml-2 pl-3 border-l border-dark-700">
          <div className="flex flex-col items-end min-w-0">
            <span className="text-sm font-medium text-dark-100 truncate max-w-[140px]">
              {isGuest ? "Guest User" : user?.full_name}
            </span>
            <span className="text-xs text-dark-400 truncate max-w-[140px]">
              {isGuest ? "Limited access" : user?.email}
            </span>
          </div>
          <div className="h-8 w-8 rounded-full bg-dark-700 flex items-center justify-center text-sm font-semibold text-gold-400 shrink-0">
            {isGuest ? "G" : user?.full_name?.charAt(0).toUpperCase()}
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-dark-800 transition-colors ml-1"
          title={isGuest ? "Exit guest mode" : "Sign out"}
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
