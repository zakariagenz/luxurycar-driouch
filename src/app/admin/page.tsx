"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MetricsWidget } from "@/components/admin/metrics-widget";
import { AdminCalendar } from "@/components/admin/admin-calendar";
import { BookingStatusBadge } from "@/components/admin/admin-calendar";
import {
  bookingService,
  carService,
  locationService,
} from "@/lib/booking-service";
import type { Booking, Car, DashboardMetrics, Location } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useLocale } from "@/components/i18n/locale-provider";

export default function AdminOverviewPage() {
  const { t } = useLocale();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const load = useCallback(async () => {
    const [m, b, c, l] = await Promise.all([
      bookingService.getMetrics(),
      bookingService.getAll(),
      carService.getAll(),
      locationService.getAll(),
    ]);
    setMetrics(m);
    setBookings(b);
    setCars(c);
    setLocations(l);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pending = bookings.filter((b) => b.status === "pending").slice(0, 5);
  const todayPickups = bookings.filter((b) => {
    const d = new Date(b.pickupDatetime);
    const now = new Date();
    return (
      d.toDateString() === now.toDateString() &&
      (b.status === "confirmed" || b.status === "pending")
    );
  });

  const carLabel = (id: string) => {
    const c = cars.find((x) => x.id === id);
    return c ? `${c.make} ${c.model}` : "—";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-navy-900 dark:text-navy-50">
          {t("adminOverview")}
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">{t("adminOverviewSub")}</p>
      </div>

      {metrics && <MetricsWidget metrics={metrics} />}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-navy-900 dark:text-navy-50">
              {t("pendingRequests")}
            </h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/bookings">{t("viewAll")}</Link>
            </Button>
          </div>
          <div className="divide-y divide-navy-100 border border-navy-100 bg-white dark:divide-navy-800 dark:border-navy-800 dark:bg-navy-900">
            {pending.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-navy-500 dark:text-navy-400">
                {t("noPending")}
              </p>
            )}
            {pending.map((b) => (
              <div
                key={b.id}
                className="flex items-start justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-navy-900 dark:text-navy-50">{b.client.fullName}</p>
                  <p className="text-xs text-navy-500 dark:text-navy-400">
                    {carLabel(b.carId)} ·{" "}
                    {format(new Date(b.pickupDatetime), "dd MMM HH:mm")}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-navy-400">
                    {b.reference}
                  </p>
                </div>
                <BookingStatusBadge status={b.status} />
              </div>
            ))}
          </div>

          <div>
            <h2 className="mb-3 font-display text-xl font-semibold text-navy-900 dark:text-navy-50">
              {t("todayPickups")}
            </h2>
            <div className="divide-y divide-navy-100 border border-navy-100 bg-white dark:divide-navy-800 dark:border-navy-800 dark:bg-navy-900">
              {todayPickups.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-navy-500 dark:text-navy-400">
                  {t("noPickups")}
                </p>
              )}
              {todayPickups.map((b) => (
                <div key={b.id} className="px-4 py-3 text-sm">
                  <p className="font-medium text-navy-900 dark:text-navy-50">
                    {format(new Date(b.pickupDatetime), "HH:mm")} —{" "}
                    {carLabel(b.carId)}
                  </p>
                  <p className="text-xs text-navy-500 dark:text-navy-400">{b.client.fullName}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <AdminCalendar
            bookings={bookings}
            cars={cars}
            locations={locations}
          />
        </div>
      </div>
    </div>
  );
}
