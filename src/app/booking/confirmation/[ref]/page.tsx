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
import { useLocale } from "@/components/i18n/locale-provider";

export default function ConfirmationPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { t, locale } = useLocale();
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
    ADDONS.map((a) => [a.id, locale === "fr" ? a.nameFr : a.name])
  ) as Record<(typeof ADDONS)[number]["id"], string>;

  const locName = (loc: Location | null) => {
    if (!loc) return "—";
    return locale === "fr" ? loc.nameFr : loc.name;
  };

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
            <p className="py-12 text-center text-navy-500">{t("loadingBooking")}</p>
          ) : !booking || !car ? (
            <div className="py-12 text-center">
              <p className="text-navy-700">{t("bookingNotFound")}</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  {t("backHome")}
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-start gap-3">
                <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-500" />
                <div>
                  <h1 className="font-display text-3xl font-semibold text-navy-900">
                    {t("bookingReceived")}
                  </h1>
                  <p className="mt-1 text-sm text-navy-500">{t("bookingPending")}</p>
                </div>
              </div>

              <div className="mb-6 rounded-xl bg-navy-900 px-4 py-4 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-gold-400">
                  {t("reference")}
                </p>
                <p className="mt-1 font-mono text-2xl font-semibold tracking-wider text-white">
                  {booking.reference}
                </p>
              </div>

              <dl className="space-y-3 text-sm">
                <Row
                  label={t("vehicle")}
                  value={`${car.make} ${car.model} (${car.year})`}
                />
                <Row
                  label={t("pickup")}
                  value={`${locName(pickup)} · ${format(new Date(booking.pickupDatetime), "dd MMM yyyy · HH:mm")}`}
                />
                <Row
                  label={t("dropoff")}
                  value={`${locName(dropoff)} · ${format(new Date(booking.dropoffDatetime), "dd MMM yyyy · HH:mm")}`}
                />
                <Row
                  label={t("addons")}
                  value={
                    booking.addons.length
                      ? booking.addons
                          .map((id) => addonLabels[id] ?? id)
                          .join(", ")
                      : t("none")
                  }
                />
                <Row label={t("client")} value={booking.client.fullName} />
                <Row label={t("phone")} value={booking.client.phone} />
                <Row
                  label={t("total")}
                  value={formatDualPrice(booking.totalMad)}
                  strong
                />
              </dl>

              {(booking.client.licensePhotoUrl || booking.client.idPhotoUrl) && (
                <div className="mt-6">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-500">
                    {t("documents")}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {booking.client.licensePhotoUrl && (
                      <a
                        href={booking.client.licensePhotoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block overflow-hidden rounded-lg border border-navy-100"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={booking.client.licensePhotoUrl}
                          alt={t("viewLicense")}
                          className="h-28 w-full object-cover"
                        />
                        <p className="bg-navy-50 px-2 py-1 text-[11px] text-navy-600">
                          {t("viewLicense")}
                        </p>
                      </a>
                    )}
                    {booking.client.idPhotoUrl && (
                      <a
                        href={booking.client.idPhotoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block overflow-hidden rounded-lg border border-navy-100"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={booking.client.idPhotoUrl}
                          alt={t("viewId")}
                          className="h-28 w-full object-cover"
                        />
                        <p className="bg-navy-50 px-2 py-1 text-[11px] text-navy-600">
                          {t("viewId")}
                        </p>
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {waLink && (
                  <Button variant="whatsapp" size="lg" className="flex-1" asChild>
                    <a href={waLink} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      {t("contactViaWhatsapp")}
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="lg" asChild>
                  <Link href="/">{t("backHome")}</Link>
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
