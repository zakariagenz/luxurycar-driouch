"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle2, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  bookingService,
  carService,
  locationService,
} from "@/lib/booking-service";
import type { Booking, Car, Location } from "@/lib/types";
import { formatDualPrice } from "@/lib/currency";
import { buildWhatsAppBookingLink } from "@/lib/whatsapp";
import { ADDONS } from "@/lib/mock-data";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

export default function ConfirmationPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const [reference, setReference] = useState<string>("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [pickup, setPickup] = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ ref }) => setReference(ref));
  }, [params]);

  useEffect(() => {
    if (!reference) return;
    (async () => {
      setLoading(true);
      const b = await bookingService.getByReference(reference);
      if (!b) {
        setLoading(false);
        return;
      }
      setBooking(b);
      const [c, p, d] = await Promise.all([
        carService.getById(b.carId),
        locationService.getById(b.pickupLocationId),
        locationService.getById(b.dropoffLocationId),
      ]);
      setCar(c ?? null);
      setPickup(p ?? null);
      setDropoff(d ?? null);
      setLoading(false);
    })();
  }, [reference]);

  const addonLabels = Object.fromEntries(
    ADDONS.map((a) => [a.id, a.name])
  ) as Record<(typeof ADDONS)[number]["id"], string>;

  const waLink =
    booking && car && pickup && dropoff
      ? buildWhatsAppBookingLink({
          booking,
          car,
          pickup,
          dropoff,
          addonLabels,
        })
      : null;

  return (
    <main className="min-h-screen bg-navy-50/30">
      <div className="relative bg-navy-950 pb-24 pt-8">
        <SiteHeader />
      </div>

      <div className="relative z-10 mx-auto -mt-16 max-w-2xl px-4 pb-20 sm:px-6">
        <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-xl sm:p-8">
          {loading ? (
            <p className="py-12 text-center text-navy-500">Loading booking…</p>
          ) : !booking || !car ? (
            <div className="py-12 text-center">
              <p className="text-navy-700">Booking not found.</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Back home
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-start gap-3">
                <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-500" />
                <div>
                  <h1 className="font-display text-3xl font-semibold text-navy-900">
                    Booking received
                  </h1>
                  <p className="mt-1 text-sm text-navy-500">
                    Your request is pending confirmation. Send it on WhatsApp
                    for the fastest response.
                  </p>
                </div>
              </div>

              <div className="mb-6 rounded-xl bg-navy-900 px-4 py-4 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-gold-400">
                  Reference
                </p>
                <p className="mt-1 font-mono text-2xl font-semibold tracking-wider text-white">
                  {booking.reference}
                </p>
              </div>

              <dl className="space-y-3 text-sm">
                <Row
                  label="Vehicle"
                  value={`${car.make} ${car.model} (${car.year})`}
                />
                <Row
                  label="Pick-up"
                  value={`${pickup?.name ?? "—"} · ${format(new Date(booking.pickupDatetime), "dd MMM yyyy · HH:mm")}`}
                />
                <Row
                  label="Drop-off"
                  value={`${dropoff?.name ?? "—"} · ${format(new Date(booking.dropoffDatetime), "dd MMM yyyy · HH:mm")}`}
                />
                <Row
                  label="Add-ons"
                  value={
                    booking.addons.length
                      ? booking.addons
                          .map((id) => addonLabels[id] ?? id)
                          .join(", ")
                      : "None"
                  }
                />
                <Row label="Client" value={booking.client.fullName} />
                <Row label="Phone" value={booking.client.phone} />
                <Row
                  label="Total"
                  value={formatDualPrice(booking.totalMad)}
                  strong
                />
              </dl>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {waLink && (
                  <Button variant="whatsapp" size="lg" className="flex-1" asChild>
                    <a href={waLink} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      Contact via WhatsApp
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="lg" asChild>
                  <Link href="/">Back to home</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-navy-50 py-2">
      <dt className="text-navy-500">{label}</dt>
      <dd
        className={
          strong
            ? "text-right font-semibold text-navy-900"
            : "text-right text-navy-800"
        }
      >
        {value}
      </dd>
    </div>
  );
}
