"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminCalendar } from "@/components/admin/admin-calendar";
import {
  bookingService,
  carService,
  locationService,
} from "@/lib/booking-service";
import type { Booking, Car, Location } from "@/lib/types";

export default function AdminCalendarPage() {
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
          Calendar
        </h1>
        <p className="mt-1 text-sm text-navy-500">
          Active rentals, pick-ups, and drop-offs across the month.
        </p>
      </div>
      <AdminCalendar bookings={bookings} cars={cars} locations={locations} />
    </div>
  );
}
