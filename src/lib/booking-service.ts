/**
 * Mock data service — swap implementations for Supabase later without
 * changing UI consumers. All methods are async to mirror real DB calls.
 */

import { ADDONS, getDashboardMetrics, LOCATIONS } from "./mock-data";
import type {
  Addon,
  AddonType,
  Booking,
  BookingStatus,
  Car,
  CarStatus,
  ClientDetails,
  DashboardMetrics,
  FleetFilters,
  Location,
} from "./types";
import { calcRentalDays, generateBookingReference } from "./utils";
import {
  loadBookings,
  loadCars,
  saveBookings,
  saveCars,
} from "./storage";

let carsStore: Car[] | null = null;
let bookingsStore: Booking[] | null = null;

function getCars(): Car[] {
  if (!carsStore) carsStore = loadCars();
  return carsStore;
}

function getBookings(): Booking[] {
  if (!bookingsStore) bookingsStore = loadBookings();
  return bookingsStore;
}

function setCars(next: Car[]) {
  carsStore = next;
  saveCars(next);
}

function setBookings(next: Booking[]) {
  bookingsStore = next;
  saveBookings(next);
}

function delay(ms = 120): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export const carService = {
  async getAll(filters?: FleetFilters): Promise<Car[]> {
    await delay();
    let result = [...getCars()];
    if (!filters) return result;

    if (filters.category && filters.category !== "all") {
      result = result.filter((c) => c.category === filters.category);
    }
    if (filters.transmission && filters.transmission !== "all") {
      result = result.filter((c) => c.transmission === filters.transmission);
    }
    if (filters.fuelType && filters.fuelType !== "all") {
      result = result.filter((c) => c.fuelType === filters.fuelType);
    }
    if (filters.status && filters.status !== "all") {
      result = result.filter((c) => c.status === filters.status);
    }
    if (filters.maxDailyRate) {
      result = result.filter((c) => c.dailyRateMad <= filters.maxDailyRate!);
    }
    return result;
  },

  async getById(id: string): Promise<Car | undefined> {
    await delay();
    return getCars().find((c) => c.id === id);
  },

  async create(car: Omit<Car, "id">): Promise<Car> {
    await delay();
    const created: Car = { ...car, id: `car-${Date.now()}` };
    setCars([created, ...getCars()]);
    return created;
  },

  async update(id: string, patch: Partial<Car>): Promise<Car | undefined> {
    await delay();
    setCars(getCars().map((c) => (c.id === id ? { ...c, ...patch, id } : c)));
    return getCars().find((c) => c.id === id);
  },

  async setStatus(id: string, status: CarStatus): Promise<Car | undefined> {
    return this.update(id, { status });
  },
};

export const locationService = {
  async getAll(): Promise<Location[]> {
    await delay(50);
    return [...LOCATIONS];
  },

  async getById(id: string): Promise<Location | undefined> {
    return LOCATIONS.find((l) => l.id === id);
  },
};

export const addonService = {
  async getAll(): Promise<Addon[]> {
    await delay(50);
    return [...ADDONS];
  },
};

export function calculateBookingTotal(
  car: Car,
  pickupIso: string,
  dropoffIso: string,
  pickupLocation: Location,
  dropoffLocation: Location,
  addonIds: AddonType[]
): number {
  const days = calcRentalDays(pickupIso, dropoffIso);
  let total = car.dailyRateMad * days;
  total += pickupLocation.deliveryFeeMad;
  if (dropoffLocation.id !== pickupLocation.id) {
    total += dropoffLocation.deliveryFeeMad;
  }

  for (const id of addonIds) {
    const addon = ADDONS.find((a) => a.id === id);
    if (!addon) continue;
    if (addon.flatFeeMad && addon.flatFeeMad > 0) {
      total += addon.flatFeeMad;
    } else {
      total += addon.dailyRateMad * days;
    }
  }
  return total;
}

export const bookingService = {
  async getAll(): Promise<Booking[]> {
    await delay();
    return [...getBookings()].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async getByReference(reference: string): Promise<Booking | undefined> {
    await delay();
    return getBookings().find((b) => b.reference === reference);
  },

  async getById(id: string): Promise<Booking | undefined> {
    await delay();
    return getBookings().find((b) => b.id === id);
  },

  async create(input: {
    carId: string;
    pickupLocationId: string;
    dropoffLocationId: string;
    pickupDatetime: string;
    dropoffDatetime: string;
    addons: AddonType[];
    client: ClientDetails;
  }): Promise<Booking> {
    await delay(200);
    const car = getCars().find((c) => c.id === input.carId);
    const pickup = LOCATIONS.find((l) => l.id === input.pickupLocationId);
    const dropoff = LOCATIONS.find((l) => l.id === input.dropoffLocationId);
    if (!car || !pickup || !dropoff) {
      throw new Error("Invalid booking payload");
    }

    const totalMad = calculateBookingTotal(
      car,
      input.pickupDatetime,
      input.dropoffDatetime,
      pickup,
      dropoff,
      input.addons
    );

    const now = new Date().toISOString();
    const booking: Booking = {
      id: `bk-${Date.now()}`,
      reference: generateBookingReference(),
      carId: input.carId,
      status: "pending",
      pickupLocationId: input.pickupLocationId,
      dropoffLocationId: input.dropoffLocationId,
      pickupDatetime: input.pickupDatetime,
      dropoffDatetime: input.dropoffDatetime,
      addons: input.addons,
      client: input.client,
      totalMad,
      createdAt: now,
      updatedAt: now,
    };

    setBookings([booking, ...getBookings()]);
    return booking;
  },

  async updateStatus(
    id: string,
    status: BookingStatus
  ): Promise<Booking | undefined> {
    await delay();
    const current = getBookings();
    const target = current.find((b) => b.id === id);
    if (!target) return undefined;

    setBookings(
      current.map((b) =>
        b.id === id
          ? { ...b, status, updatedAt: new Date().toISOString() }
          : b
      )
    );

    if (status === "picked_up" || status === "confirmed") {
      setCars(
        getCars().map((c) =>
          c.id === target.carId ? { ...c, status: "rented" as CarStatus } : c
        )
      );
    }
    if (status === "completed" || status === "cancelled") {
      setCars(
        getCars().map((c) =>
          c.id === target.carId
            ? { ...c, status: "available" as CarStatus }
            : c
        )
      );
    }

    return getBookings().find((b) => b.id === id);
  },

  async updateTimes(
    id: string,
    pickupDatetime: string,
    dropoffDatetime: string
  ): Promise<Booking | undefined> {
    await delay();
    setBookings(
      getBookings().map((b) =>
        b.id === id
          ? {
              ...b,
              pickupDatetime,
              dropoffDatetime,
              updatedAt: new Date().toISOString(),
            }
          : b
      )
    );
    return getBookings().find((b) => b.id === id);
  },

  async getMetrics(): Promise<DashboardMetrics> {
    await delay(50);
    return getDashboardMetrics(getBookings());
  },
};
