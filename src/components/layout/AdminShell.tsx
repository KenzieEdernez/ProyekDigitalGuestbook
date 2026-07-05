"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ScanLine,
  Gift,
  LogOut,
  Settings,
} from "lucide-react";
import { useEventSettings } from "@/hooks/useEventSettings";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/guests", label: "Guest List", icon: Users },
  { href: "/check-in", label: "Check-in", icon: ScanLine },
  { href: "/souvenir", label: "Souvenir", icon: Gift },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function AdminShell({
  children,
  title,
  subtitle,
  actions,
}: AdminShellProps) {
  const pathname = usePathname();
  const eventSettings = useEventSettings();

  const isActive = (href: string, exact?: boolean) => {
    if (!pathname) return false;
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-stone-200 bg-white">
        <div className="border-b border-stone-100 px-6 py-6">
          <p className="font-serif text-lg font-bold text-navy">
            {eventSettings.organizer}
          </p>
          <p className="mt-0.5 text-xs text-stone-500">{eventSettings.name}</p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-royal/15 text-navy"
                    : "text-stone-600 hover:bg-stone-50 hover:text-navy"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${active ? "text-royal" : "text-stone-400"}`}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-stone-100 p-4">
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              window.location.href = "/";
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-stone-500 transition hover:text-navy"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="ml-64 flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 px-8 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                {eventSettings.organizer}
              </p>
              {title && (
                <h1 className="font-serif text-2xl font-bold text-navy">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
