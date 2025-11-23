"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  ShieldCheck,
  Users,
  MessageSquare,
  Bot,
  Flag,
  LogOut,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/moderators", label: "Moderators", icon: ShieldCheck },
  { href: "/admin/chats", label: "Chats", icon: MessageSquare },
  { href: "/admin/models", label: "Models", icon: Bot },
  { href: "/admin/reports", label: "Reports", icon: Flag },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Auto-collapse on small screens for responsive experience
  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const handleChange = () => setCollapsed(media.matches);
    handleChange();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const isActive = useMemo(() => {
    const current = pathname;
    return (href: string) => current === href;
  }, [pathname]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,122,255,0.08),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(4,201,155,0.08),transparent_35%)]" />
      <div className="relative flex min-h-screen">
        <aside
          className={cn(
            "flex flex-col shrink-0 border-r border-slate-200 bg-white/80 backdrop-blur-sm transition-all duration-200",
            collapsed ? "w-16" : "w-64"
          )}
        >
          <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-200">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#04C99B] flex items-center justify-center text-white font-semibold shadow">
              S
            </div>
            {!collapsed && (
              <div>
                <p className="text-sm font-semibold">SafeChat.AI</p>
                <p className="text-xs text-slate-500">Admin Control</p>
              </div>
            )}
          </div>
          <nav className="px-2 py-4 space-y-1 flex-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-slate-900 text-white shadow"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </Link>
              );
            })}
          </nav>
          <div className="px-2 pb-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </Button>
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">{children}</main>
      </div>
    </div>
  );
}
