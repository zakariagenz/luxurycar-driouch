"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Booking, Car, Location } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_COLOR: Record<Booking["status"], string> = {
  pending: "bg-amber-400",
  confirmed: "bg-sky-500",
  picked_up: "bg-emerald-500",
  completed: "bg-navy-300",
  cancelled: "bg-red-400",
};

interface AdminCalendarProps {
  bookings: Booking[];
  cars: Car[];
  locations: Location[];
}

export function AdminCalendar({
  bookings,
  cars,
  locations,
}: AdminCalendarProps) {
  const [cursor, setCursor] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const eventsForDay = (day: Date) =>
    bookings.filter((b) => {
      if (b.status === "cancelled") return false;
      const pickup = new Date(b.pickupDatetime);
      const dropoff = new Date(b.dropoffDatetime);
      return (
        isSameDay(pickup, day) ||
        isSameDay(dropoff, day) ||
        (day > pickup && day < dropoff && b.status === "picked_up")
      );
    });

  const carName = (id: string) => {
    const c = cars.find((x) => x.id === id);
    return c ? `${c.make} ${c.model}` : id;
  };

  const locName = (id: string) =>
    locations.find((l) => l.id === id)?.name ?? id;

  return (
    <div className="border border-navy-100 bg-white">
      <div className="flex items-center justify-between border-b border-navy-100 px-4 py-3">
        <h2 className="font-display text-xl font-semibold text-navy-900">
          {format(cursor, "MMMM yyyy")}
        </h2>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCursor((d) => addDays(startOfMonth(d), -1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCursor((d) => addDays(endOfMonth(d), 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-navy-100 bg-navy-50/50 text-center text-xs font-semibold uppercase tracking-wider text-navy-500">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const events = eventsForDay(day);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[88px] border-b border-r border-navy-50 p-1.5 sm:min-h-[110px]",
                !isSameMonth(day, cursor) && "bg-navy-50/40 text-navy-300"
              )}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                  isToday(day) && "bg-navy-900 text-white"
                )}
              >
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-0.5">
                {events.slice(0, 3).map((b) => {
                  const isPickup = isSameDay(new Date(b.pickupDatetime), day);
                  const isDropoff = isSameDay(new Date(b.dropoffDatetime), day);
                  let tag = "Active";
                  if (isPickup) tag = "Pick-up";
                  if (isDropoff) tag = "Drop-off";
                  return (
                    <div
                      key={`${b.id}-${tag}`}
                      className="truncate rounded px-1 py-0.5 text-[10px] text-white"
                      style={{}}
                      title={`${tag}: ${carName(b.carId)} @ ${locName(isDropoff ? b.dropoffLocationId : b.pickupLocationId)}`}
                    >
                      <span
                        className={cn(
                          "block truncate rounded px-1 py-0.5",
                          STATUS_COLOR[b.status]
                        )}
                      >
                        {tag}: {carName(b.carId).split(" ").slice(0, 2).join(" ")}
                      </span>
                    </div>
                  );
                })}
                {events.length > 3 && (
                  <p className="text-[10px] text-navy-400">
                    +{events.length - 3} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 border-t border-navy-100 px-4 py-3 text-xs text-navy-600">
        {(
          [
            ["pending", "Pending"],
            ["confirmed", "Confirmed"],
            ["picked_up", "Picked up"],
            ["completed", "Completed"],
          ] as const
        ).map(([k, label]) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", STATUS_COLOR[k])} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function BookingStatusBadge({ status }: { status: Booking["status"] }) {
  const map: Record<
    Booking["status"],
    { label: string; variant: "warning" | "info" | "success" | "secondary" | "danger" }
  > = {
    pending: { label: "Pending Confirmation", variant: "warning" },
    confirmed: { label: "Confirmed", variant: "info" },
    picked_up: { label: "Picked Up", variant: "success" },
    completed: { label: "Completed", variant: "secondary" },
    cancelled: { label: "Cancelled", variant: "danger" },
  };
  const m = map[status];
  return <Badge variant={m.variant}>{m.label}</Badge>;
}
