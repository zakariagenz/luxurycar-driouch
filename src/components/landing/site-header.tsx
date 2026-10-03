"use client";

import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BUSINESS_WHATSAPP } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";
import type { AppLocale } from "@/lib/i18n/dictionaries";

export function SiteHeader({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const { t, locale, setLocale } = useLocale();

  const NAV = [
    { href: "#fleet", label: t("navFleet") },
    { href: "#how-it-works", label: t("navHow") },
    { href: "#locations", label: t("navLocations") },
    { href: "/admin", label: t("navStaff") },
  ];

  const textClass = dark ? "text-navy-900" : "text-white";
  const mutedClass = dark
    ? "text-navy-700 hover:text-gold-700"
    : "text-white/85 hover:text-gold-300";

  const LangSwitch = ({ className }: { className?: string }) => (
    <div
      className={cn(
        "inline-flex overflow-hidden rounded-md border text-xs font-semibold",
        dark ? "border-navy-200" : "border-white/25",
        className
      )}
    >
      {(["en", "fr"] as AppLocale[]).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={cn(
            "px-2.5 py-1.5 uppercase tracking-wide transition",
            locale === code
              ? "bg-gold-500 text-navy-950"
              : dark
                ? "bg-white text-navy-600 hover:bg-navy-50"
                : "bg-transparent text-white/80 hover:bg-white/10"
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-baseline gap-2">
          <span
            className={cn(
              "font-display text-2xl font-semibold tracking-wide sm:text-3xl",
              textClass
            )}
          >
            LuxuryCar
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
            Driouch
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("text-sm font-medium transition", mutedClass)}
            >
              {item.label}
            </Link>
          ))}
          <LangSwitch />
          <Button variant="gold" size="sm" asChild>
            <a
              href={`https://wa.me/${BUSINESS_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Phone className="h-3.5 w-3.5" />
              {t("whatsapp")}
            </a>
          </Button>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <LangSwitch />
          <button
            type="button"
            className={cn("rounded-md p-2", textClass)}
            onClick={() => setOpen((v) => !v)}
            aria-label={t("menu")}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
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
            <a
              href={`https://wa.me/${BUSINESS_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("contactWhatsapp")}
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
