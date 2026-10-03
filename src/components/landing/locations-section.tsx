"use client";

import { Plane, Building2, Hotel } from "lucide-react";
import { LOCATIONS } from "@/lib/mock-data";
import { useLocale } from "@/components/i18n/locale-provider";

export function LocationsSection() {
  const { t, locale } = useLocale();
  const airports = LOCATIONS.filter((l) => l.type === "airport");
  const others = LOCATIONS.filter((l) => l.type !== "airport");
  const name = (id: string) => {
    const loc = LOCATIONS.find((l) => l.id === id)!;
    return locale === "fr" ? loc.nameFr : loc.name;
  };

  return (
    <section id="locations" className="scroll-mt-20 bg-white py-20 dark:bg-navy-950 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">
            {t("moroccoCoverage")}
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold text-navy-900 dark:text-navy-50">
            {t("pickupAnywhere")}
          </h2>
          <p className="mt-3 text-navy-600 dark:text-navy-300">{t("locationsIntro")}</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-navy-500 dark:text-navy-400">
              <Plane className="h-4 w-4 text-gold-600" />
              {t("airports")}
            </h3>
            <ul className="divide-y divide-navy-100 border-y border-navy-100 dark:divide-navy-800 dark:border-navy-800">
              {airports.map((loc) => (
                <li
                  key={loc.id}
                  className="flex items-center justify-between py-3.5"
                >
                  <div>
                    <p className="font-medium text-navy-900 dark:text-navy-50">{name(loc.id)}</p>
                    <p className="text-xs text-navy-500 dark:text-navy-400">{loc.city}</p>
                  </div>
                  <span className="text-xs text-navy-500 dark:text-navy-400">
                    {loc.deliveryFeeMad === 0
                      ? t("included")
                      : `+${loc.deliveryFeeMad} MAD`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-navy-500 dark:text-navy-400">
              <Building2 className="h-4 w-4 text-gold-600" />
              {t("agencyDelivery")}
            </h3>
            <ul className="divide-y divide-navy-100 border-y border-navy-100 dark:divide-navy-800 dark:border-navy-800">
              {others.map((loc) => (
                <li
                  key={loc.id}
                  className="flex items-center justify-between py-3.5"
                >
                  <div className="flex items-start gap-2">
                    {loc.type === "hotel" ? (
                      <Hotel className="mt-0.5 h-4 w-4 text-terracotta-500" />
                    ) : null}
                    <div>
                      <p className="font-medium text-navy-900 dark:text-navy-50">{name(loc.id)}</p>
                      <p className="text-xs text-navy-500 dark:text-navy-400">{loc.city}</p>
                    </div>
                  </div>
                  <span className="text-xs text-navy-500 dark:text-navy-400">
                    {loc.deliveryFeeMad === 0
                      ? t("free")
                      : `+${loc.deliveryFeeMad} MAD`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
