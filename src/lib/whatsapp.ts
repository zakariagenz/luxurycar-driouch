import type { AddonType, Booking, Car, Location } from "./types";
import { formatDualPrice } from "./currency";
import { format } from "date-fns";

/** Owner WhatsApp — replace with real business number (country code, no +) */
export const BUSINESS_WHATSAPP = "212703740880";

interface WhatsAppBookingContext {
  booking: Booking;
  car: Car;
  pickup: Location;
  dropoff: Location;
  addonLabels: Record<AddonType, string>;
}

/**
 * Build a wa.me deep link with a pre-filled booking summary
 * so clients can confirm directly with the agency.
 */
export function buildWhatsAppBookingLink(ctx: WhatsAppBookingContext): string {
  const { booking, car, pickup, dropoff, addonLabels } = ctx;
  const addons =
    booking.addons.length > 0
      ? booking.addons.map((a) => addonLabels[a]).join(", ")
      : "None";

  const lines = [
    `🚗 *LuxuryCar Driouch — Booking Request*`,
    ``,
    `*Reference:* ${booking.reference}`,
    `*Vehicle:* ${car.make} ${car.model} (${car.year})`,
    `*Pick-up:* ${pickup.name} — ${format(new Date(booking.pickupDatetime), "dd MMM yyyy HH:mm")}`,
    `*Drop-off:* ${dropoff.name} — ${format(new Date(booking.dropoffDatetime), "dd MMM yyyy HH:mm")}`,
    `*Add-ons:* ${addons}`,
    `*Client:* ${booking.client.fullName}`,
    `*Phone:* ${booking.client.phone}`,
    `*Email:* ${booking.client.email}`,
    `*License:* ${booking.client.licenseNumber}`,
    `*ID/Passport:* ${booking.client.idDocument}`,
    `*Total:* ${formatDualPrice(booking.totalMad)}`,
    ``,
    `Please confirm my reservation. Thank you!`,
  ];

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${BUSINESS_WHATSAPP}?text=${text}`;
}

/** Quick reminder link for admin staff */
export function buildWhatsAppReminderLink(
  phone: string,
  reference: string,
  pickupLabel: string
): string {
  const clean = phone.replace(/\D/g, "");
  const withCountry = clean.startsWith("212")
    ? clean
    : clean.startsWith("0")
      ? `212${clean.slice(1)}`
      : `212${clean}`;

  const text = encodeURIComponent(
    `Hello! Reminder from LuxuryCar Driouch about booking *${reference}*. Pick-up: ${pickupLabel}. Reply if you need any change. Safe travels! 🚗`
  );
  return `https://wa.me/${withCountry}?text=${text}`;
}
