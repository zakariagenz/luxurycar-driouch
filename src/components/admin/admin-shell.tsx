"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Car,
  ClipboardList,
  LayoutDashboard,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/admin/fleet", label: "Fleet", icon: Car },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-gold-500/15 text-gold-300"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-navy-50/50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-navy-950 text-white lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <p className="font-display text-xl font-semibold">
            LuxuryCar <span className="text-gold-400">Admin</span>
          </p>
          <p className="mt-0.5 text-xs text-white/50">Staff dashboard</p>
        </div>
        <div className="flex-1 px-3 py-4">
          <NavLinks />
        </div>
        <div className="border-t border-white/10 p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to website
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-navy-100 bg-white px-4 py-3 lg:hidden">
        <p className="font-display text-lg font-semibold text-navy-900">
          Admin
        </p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-navy-700"
          aria-label="Menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 bg-navy-950/95 p-4 lg:hidden">
          <div className="mb-6 flex justify-between">
            <p className="font-display text-xl text-white">Menu</p>
            <button type="button" onClick={() => setOpen(false)} className="text-white">
              <X />
            </button>
          </div>
          <NavLinks onNavigate={() => setOpen(false)} />
          <Link
            href="/"
            className="mt-8 flex items-center gap-2 text-sm text-white/60"
            onClick={() => setOpen(false)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to website
          </Link>
        </div>
      )}

      <div className="lg:pl-60">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
