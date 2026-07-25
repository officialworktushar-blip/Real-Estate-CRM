import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Home, Handshake, Calendar, BarChart3, Settings, Shield, ChevronLeft, Building2 } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { useAuthStore } from "@/stores/authStore";
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
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "super_admin";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-gray-900 text-white transition-all duration-300 flex flex-col",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-800">
        <BrandLogo
          size={sidebarOpen ? "sidebar" : "sidebar-collapsed"}
          darkMode="dark"
        />
        <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-gray-800">
          <ChevronLeft className={cn("h-5 w-5 transition-transform", !sidebarOpen && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-brand-600" : "text-gray-400 hover:bg-gray-800 hover:text-white"
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
              {sidebarOpen && <p className="px-3 text-xs font-semibold text-gray-500 uppercase">Admin</p>}
            </div>
            {adminItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-red-600" : "text-gray-400 hover:bg-gray-800 hover:text-white"
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
        <div className="px-4 py-3 border-t border-gray-800">
          <p className="text-sm text-gray-400 truncate">{user?.full_name}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
      )}
    </aside>
  );
}
