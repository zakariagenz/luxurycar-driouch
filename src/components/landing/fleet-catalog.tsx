"use client";

import { useEffect, useMemo, useState } from "react";
import { CarCard } from "./car-card";
import { carService } from "@/lib/booking-service";
import type { Car, CarCategory, FuelType, Transmission } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";

export function FleetCatalog() {
  const { t } = useLocale();
  const [cars, setCars] = useState<Car[]>([]);
  const [category, setCategory] = useState<CarCategory | "all">("all");
  const [transmission, setTransmission] = useState<Transmission | "all">("all");
  const [fuelType, setFuelType] = useState<FuelType | "all">("all");
  const [loading, setLoading] = useState(true);

  const CATEGORIES: { value: CarCategory | "all"; label: string }[] = [
    { value: "all", label: t("all") },
    { value: "economy", label: t("economy") },
    { value: "suv", label: t("suv") },
    { value: "luxury", label: t("luxury") },
    { value: "van", label: t("van") },
  ];

  useEffect(() => {
    setLoading(true);
    carService
      .getAll({ category, transmission, fuelType, status: "all" })
      .then(setCars)
      .finally(() => setLoading(false));
  }, [category, transmission, fuelType]);

  const availableCount = useMemo(
    () => cars.filter((c) => c.status === "available").length,
    [cars]
  );

  return (
    <section id="fleet" className="scroll-mt-20 bg-white py-20 dark:bg-navy-950 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">
            {t("ourFleet")}
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold text-navy-900 dark:text-navy-50 sm:text-5xl">
            {t("chooseDrive")}
          </h2>
          <p className="mt-3 text-navy-600 dark:text-navy-300">
            {t("fleetIntro", { count: availableCount })}
          </p>
        </div>

        <div className="mb-10 flex flex-col gap-4 border-y border-navy-100 py-4 dark:border-navy-800">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition",
                  category === c.value
                    ? "bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950"
                    : "bg-navy-50 text-navy-700 hover:bg-navy-100 dark:bg-navy-900 dark:text-navy-200 dark:hover:bg-navy-800"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", t("anyGearbox")],
                ["automatic", t("automatic")],
                ["manual", t("manual")],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTransmission(value)}
                className={cn(
                  "border px-3 py-1.5 text-xs font-medium transition",
                  transmission === value
                    ? "border-gold-500 bg-gold-50 text-gold-700 dark:bg-gold-500/15 dark:text-gold-300"
                    : "border-navy-200 text-navy-600 hover:border-navy-300 dark:border-navy-700 dark:text-navy-300"
                )}
              >
                {label}
              </button>
            ))}
            {(
              [
                ["all", t("anyFuel")],
                ["diesel", t("diesel")],
                ["essence", t("essence")],
                ["hybrid", t("hybrid")],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFuelType(value)}
                className={cn(
                  "border px-3 py-1.5 text-xs font-medium transition",
                  fuelType === value
                    ? "border-terracotta-400 bg-terracotta-50 text-terracotta-700 dark:bg-terracotta-500/15 dark:text-terracotta-300"
                    : "border-navy-200 text-navy-600 hover:border-navy-300 dark:border-navy-700 dark:text-navy-300"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[16/10] animate-pulse bg-navy-100" />
            ))}
          </div>
        ) : cars.length === 0 ? (
          <p className="py-16 text-center text-navy-500">{t("noVehicles")}</p>
        ) : (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car, i) => (
              <CarCard key={car.id} car={car} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
