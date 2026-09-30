"use client";

import Image from "next/image";
import {
  Fuel,
  Gauge,
  Users,
  Briefcase,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDualPrice } from "@/lib/currency";
import type { Car } from "@/lib/types";
import { useBooking } from "@/components/booking/booking-context";
import { cn } from "@/lib/utils";

const categoryLabel: Record<Car["category"], string> = {
  economy: "Economy",
  suv: "SUV",
  luxury: "Luxury",
  van: "Van",
};

export function CarCard({ car, index = 0 }: { car: Car; index?: number }) {
  const { openBooking } = useBooking();
  const available = car.status === "available";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden border-b border-navy-100 pb-8 opacity-0 animate-fade-in-up",
        `[animation-delay:${Math.min(index * 80, 400)}ms]`
      )}
      style={{ animationDelay: `${Math.min(index * 80, 400)}ms` }}
    >
      <div className="relative mb-4 aspect-[16/10] overflow-hidden bg-navy-100">
        <Image
          src={car.imageUrl}
          alt={`${car.make} ${car.model}`}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className="bg-navy-950/80 text-white backdrop-blur">
            {categoryLabel[car.category]}
          </Badge>
          {!available && (
            <Badge variant="warning" className="capitalize">
              {car.status}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="mb-1 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl font-semibold text-navy-900">
              {car.make} {car.model}
            </h3>
            <p className="text-sm text-navy-500">{car.year} · {car.transmission} · {car.fuelType}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-navy-900">
              {formatDualPrice(car.dailyRateMad)}
            </p>
            <p className="text-xs text-navy-400">per day</p>
          </div>
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-navy-600">{car.description}</p>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-navy-600">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-gold-600" /> {car.seats} seats
          </span>
          <span className="inline-flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5 text-gold-600" /> {car.bags} bags
          </span>
          <span className="inline-flex items-center gap-1 capitalize">
            <Fuel className="h-3.5 w-3.5 text-gold-600" /> {car.fuelType}
          </span>
          <span className="inline-flex items-center gap-1 capitalize">
            <Gauge className="h-3.5 w-3.5 text-gold-600" /> {car.transmission}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {car.features.slice(0, 3).map((f) => (
            <span
              key={f}
              className="rounded bg-navy-50 px-2 py-0.5 text-[11px] text-navy-600"
            >
              {f}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-5">
          <Button
            variant="gold"
            className="w-full"
            disabled={!available}
            onClick={() => openBooking(car)}
          >
            <Zap className="h-4 w-4" />
            {available ? "Instant Book" : "Unavailable"}
          </Button>
        </div>
      </div>
    </article>
  );
}
