"use client";

import { useCallback, useEffect, useState } from "react";
import { BookingTable } from "@/components/admin/booking-table";
import {
  bookingService,
  carService,
  locationService,
} from "@/lib/booking-service";
import type { Booking, Car, Location } from "@/lib/types";
import { useLocale } from "@/components/i18n/locale-provider";

export default function AdminBookingsPage() {
  const { t } = useLocale();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const load = useCallback(async () => {
    const [b, c, l] = await Promise.all([
      bookingService.getAll(),
      carService.getAll(),
      locationService.getAll(),
    ]);
    setBookings(b);
    setCars(c);
    setLocations(l);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-navy-900">
          {t("adminBookings")}
        </h1>
        <p className="mt-1 text-sm text-navy-500">{t("adminBookingsSub")}</p>
      </div>
      <BookingTable
        bookings={bookings}
        cars={cars}
        locations={locations}
        onChange={load}
      />
    </div>
  );
}
