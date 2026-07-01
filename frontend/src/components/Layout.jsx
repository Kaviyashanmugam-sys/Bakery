import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Cake,
  Tags,
  Users,
  FileBarChart,
  MessageSquare,
  Settings as SettingsIcon,
  Sliders,
  Workflow,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/orders", label: "Orders", icon: ShoppingBag },
  { to: "/products", label: "Products", icon: Cake },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/whatsapp-logs", label: "WhatsApp Logs", icon: MessageSquare },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
  { to: "/settings/meta", label: "Meta Configuration", icon: Sliders },
  { to: "/settings/flow-builder", label: "Flow Builder Config", icon: Workflow },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-crust-800 text-crust-50 flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-crust-600/50">
          <h1 className="text-xl font-semibold tracking-tight">🍰 Sweet Crust</h1>
          <p className="text-xs text-crust-100/70 mt-0.5">Bakery Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-crust-600 text-white font-medium"
                    : "text-crust-100/80 hover:bg-crust-600/40 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-crust-600/50">
          <p className="text-xs text-crust-100/60 px-2 mb-2">
            Signed in as <span className="font-medium text-crust-50">{user?.name}</span>
          </p>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-crust-100/80 hover:bg-berry-600 hover:text-white transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-crust-50 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
