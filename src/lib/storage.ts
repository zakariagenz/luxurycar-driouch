/**
 * Persist mock bookings/cars in localStorage so confirmation & admin
 * stay in sync across client navigations during demos.
 */

import type { Booking, Car } from "./types";
import { BOOKINGS, CARS } from "./mock-data";

const CARS_KEY = "lcd_cars_v1";
const BOOKINGS_KEY = "lcd_bookings_v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function loadCars(): Car[] {
  if (!canUseStorage()) return [...CARS];
  try {
    const raw = localStorage.getItem(CARS_KEY);
    if (raw) return JSON.parse(raw) as Car[];
  } catch {
    /* ignore */
  }
  return [...CARS];
}

export function saveCars(cars: Car[]): void {
  if (!canUseStorage()) return;
  localStorage.setItem(CARS_KEY, JSON.stringify(cars));
}

export function loadBookings(): Booking[] {
  if (!canUseStorage()) return [...BOOKINGS];
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (raw) return JSON.parse(raw) as Booking[];
  } catch {
    /* ignore */
  }
  // Seed once
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(BOOKINGS));
  return [...BOOKINGS];
}

export function saveBookings(bookings: Booking[]): void {
  if (!canUseStorage()) return;
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}
