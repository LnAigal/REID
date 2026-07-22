"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mail,
  Globe,
  Key,
  BarChart3,
  Settings,
  LogOut,
  FileText,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Emails", href: "/dashboard/emails", icon: Mail },
  { name: "Domains", href: "/dashboard/domains", icon: Globe },
  { name: "API Keys", href: "/dashboard/api-keys", icon: Key },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Templates", href: "/dashboard/templates", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-black/80 backdrop-blur-xl transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Mail className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">REID</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-zinc-400 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all w-full"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-white/10 bg-black/50 backdrop-blur-xl px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-zinc-400 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-semibold">
              U
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
