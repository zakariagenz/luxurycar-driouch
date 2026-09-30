import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate booking reference: LCD-XXXXXXXX */
export function generateBookingReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `LCD-${code}`;
}

/** Number of rental days (minimum 1) */
export function calcRentalDays(
  pickupIso: string,
  dropoffIso: string
): number {
  const start = new Date(pickupIso).getTime();
  const end = new Date(dropoffIso).getTime();
  const ms = Math.max(end - start, 0);
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Math.max(days, 1);
}
