"use client";

import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BUSINESS_WHATSAPP } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "#fleet", label: "Fleet" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#locations", label: "Locations" },
  { href: "/admin", label: "Staff" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold tracking-wide text-white sm:text-3xl">
            LuxuryCar
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
            Driouch
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-white/85 transition hover:text-gold-300"
            >
              {item.label}
            </Link>
          ))}
          <Button variant="gold" size="sm" asChild>
            <a
              href={`https://wa.me/${BUSINESS_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Phone className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          </Button>
        </nav>

        <button
          type="button"
          className="rounded-md p-2 text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          open ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="mx-4 rounded-xl border border-white/10 bg-navy-950/95 p-4 backdrop-blur">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2.5 text-sm text-white/90 hover:bg-white/5"
            >
              {item.label}
            </Link>
          ))}
          <Button variant="gold" className="mt-2 w-full" asChild>
            <a href={`https://wa.me/${BUSINESS_WHATSAPP}`} target="_blank" rel="noopener noreferrer">
              Contact WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
