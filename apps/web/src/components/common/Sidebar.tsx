import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Home,
  Handshake,
  Calendar,
  BarChart3,
  Settings,
  Shield,
  ChevronLeft,
  Building2,
  X,
  CreditCard,
  ScrollText,
  Crown,
  FileText,
} from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { useAuthStore } from "@/stores/authStore";
import { useGuestStore } from "@/stores/guestStore";
import { cn } from "@/utils/helpers";
import { BrandLogo } from "./BrandLogo";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/dashboard/leads", icon: Users, label: "Leads" },
  { to: "/dashboard/properties", icon: Home, label: "Properties" },
  { to: "/dashboard/clients", icon: Building2, label: "Clients" },
  { to: "/dashboard/deals", icon: Handshake, label: "Deals" },
  { to: "/dashboard/calendar", icon: Calendar, label: "Calendar" },
  { to: "/dashboard/reports", icon: BarChart3, label: "Reports" },
  { to: "/dashboard/settings", icon: Settings, label: "Settings" },
];

const adminItems = [
  { to: "/admin", icon: Shield, label: "Admin Dashboard", end: true },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/subscriptions", icon: Crown, label: "Subscriptions" },
  { to: "/admin/billing", icon: CreditCard, label: "Billing" },
  { to: "/admin/audit-logs", icon: ScrollText, label: "Audit Logs" },
  { to: "/admin/settings", icon: FileText, label: "System Settings" },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, mobileMenuOpen, setMobileMenuOpen } = useAppStore();
  const user = useAuthStore((s) => s.user);
  const isGuest = useGuestStore((s) => s.isGuest);
  const isAdmin = user?.role === "super_admin";

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden",
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-dark-900 border-r border-dark-700",
          "transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-16",
          "max-md:shadow-2xl",
          mobileMenuOpen
            ? "translate-x-0"
            : "max-md:-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-dark-700">
          <BrandLogo
            size={sidebarOpen ? "md" : "sm"}
            showText={sidebarOpen}
          />
          <button
            onClick={toggleSidebar}
            className="hidden md:flex p-1.5 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-colors"
          >
            <ChevronLeft
              className={cn("h-5 w-5 transition-transform", !sidebarOpen && "rotate-180")}
            />
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gold-500/10 text-gold-400 border border-gold-500/20"
                    : "text-dark-400 hover:bg-dark-800 hover:text-dark-100"
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                {sidebarOpen && (
                  <p className="px-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">
                    Admin
                  </p>
                )}
              </div>
              {adminItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "text-dark-400 hover:bg-dark-800 hover:text-dark-100"
                    )
                  }
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {sidebarOpen && (
          <div className="px-4 py-3 border-t border-dark-700">
            {isGuest ? (
              <div>
                <p className="text-sm text-dark-200 truncate font-medium">Guest User</p>
                <Link
                  to="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs text-gold-400 hover:text-gold-300 transition-colors"
                >
                  Create an account
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-sm text-dark-200 truncate font-medium">{user?.full_name}</p>
                <p className="text-xs text-dark-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
