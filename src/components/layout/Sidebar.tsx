"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard, FileCheck, AlertTriangle, ClipboardCheck, Users,
  GraduationCap, Wrench, FileText, Settings, ChevronLeft, ChevronRight,
  Shield, Building2, BarChart3, Siren, Globe, CreditCard
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Permits", href: "/permits", icon: FileCheck },
  { name: "Incidents", href: "/incidents", icon: AlertTriangle },
  { name: "Emergency", href: "/emergency", icon: Siren },
  { name: "Inspections", href: "/inspections", icon: ClipboardCheck },
  { name: "Risk Assessment", href: "/risk-assessment", icon: Shield },
  { name: "Training", href: "/training", icon: GraduationCap },
  { name: "Assets", href: "/assets", icon: Wrench },
  { name: "Contractors", href: "/contractors", icon: Building2 },
  { name: "Compliance", href: "/compliance", icon: FileText },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

const adminItems = [
  { name: "Admin Portal", href: "/admin", icon: Users },
  { name: "Subscription", href: "/subscription", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

const platformAdminItems = [
  { name: "Platform Admin", href: "/platform", icon: Globe },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, userProfile, isPlatformAdmin } = useAuth();

  const isAdmin = user?.role === "company_admin" || user?.role === "platform_admin" || user?.role === "hse_manager";

  return (
    <aside className={`bg-[#0D47A1] text-white transition-all duration-300 ${collapsed ? "w-16" : "w-64"} min-h-screen flex flex-col`}>
      {/* Logo */}
      <div className="p-3 border-b border-blue-800">
        <div className="flex items-center justify-between">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Shield className="text-[#0D47A1]" size={20} />
              </div>
              <div>
                <span className="font-bold text-lg">SafetyNexus</span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mx-auto">
              <Shield className="text-[#0D47A1]" size={20} />
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className={`p-1 hover:bg-blue-800 rounded ${collapsed ? "hidden" : ""}`}>
            <ChevronLeft size={20} />
          </button>
        </div>
        {/* Company Name */}
        {!collapsed && userProfile?.companyName && (
          <div className="mt-2 px-1">
            <div className="text-xs text-blue-200 truncate">{userProfile.companyName}</div>
          </div>
        )}
      </div>
      {collapsed && (
        <button onClick={() => setCollapsed(false)} className="p-2 hover:bg-blue-800 border-b border-blue-800">
          <ChevronRight size={20} className="mx-auto" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive ? "bg-white text-[#0D47A1] font-semibold" : "hover:bg-blue-800"
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon size={20} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className={`mt-6 mb-2 px-4 ${collapsed ? "hidden" : ""}`}>
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Admin</span>
            </div>
            <ul className="space-y-1 px-2">
              {adminItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive ? "bg-white text-[#0D47A1] font-semibold" : "hover:bg-blue-800"
                      }`}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon size={20} />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {/* Platform Admin Section - Only for platform_admin role */}
        {isPlatformAdmin && (
          <>
            <div className={`mt-6 mb-2 px-4 ${collapsed ? "hidden" : ""}`}>
              <span className="text-xs font-semibold text-yellow-300 uppercase tracking-wider">Platform</span>
            </div>
            <ul className="space-y-1 px-2">
              {platformAdminItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive ? "bg-yellow-400 text-[#0D47A1] font-semibold" : "hover:bg-blue-800"
                      }`}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon size={20} />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </nav>

      {/* User Info */}
      {!collapsed && user && (
        <div className="p-4 border-t border-blue-800">
          <div className="text-sm font-medium truncate">{user.displayName}</div>
          <div className="text-xs text-blue-300 capitalize">{user.role.replace("_", " ")}</div>
        </div>
      )}
    </aside>
  );
}

