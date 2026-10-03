/**
 * Core domain types for LuxuryCar Driouch
 * Ready for Supabase mapping — field names align with snake_case DB columns via adapters.
 */

export type Currency = "MAD" | "EUR";
export type Locale = "en" | "fr" | "ar";

export type CarCategory = "economy" | "suv" | "luxury" | "van";
export type Transmission = "automatic" | "manual";
export type FuelType = "diesel" | "essence" | "hybrid" | "electric";
export type CarStatus = "available" | "rented" | "maintenance";

export type LocationType = "airport" | "agency" | "hotel" | "city";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "picked_up"
  | "completed"
  | "cancelled";

export type AddonType =
  | "gps"
  | "child_seat"
  | "additional_driver"
  | "full_insurance";

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  category: CarCategory;
  transmission: Transmission;
  fuelType: FuelType;
  seats: number;
  bags: number;
  dailyRateMad: number;
  status: CarStatus;
  imageUrl: string;
  features: string[];
  description: string;
}

export interface Location {
  id: string;
  name: string;
  nameFr: string;
  nameAr: string;
  type: LocationType;
  /** IATA code for airports (CMN, RAK, …) */
  code?: string;
  city: string;
  deliveryFeeMad: number;
}

export interface Addon {
  id: AddonType;
  name: string;
  nameFr: string;
  description: string;
  dailyRateMad: number;
  /** Flat fee if not daily (0 = use dailyRateMad) */
  flatFeeMad?: number;
}

export interface ClientDetails {
  fullName: string;
  phone: string;
  email: string;
  whatsappPreferred: boolean;
  licenseNumber: string;
  /** Passport or Moroccan CIN number */
  idDocument: string;
  /** Compressed JPEG data URL of driving license */
  licensePhotoUrl?: string;
  /** Compressed JPEG data URL of CIN / passport */
  idPhotoUrl?: string;
}

export interface BookingSearch {
  pickupLocationId: string;
  dropoffLocationId: string;
  pickupDate: string; // ISO date
  pickupTime: string; // HH:mm
  dropoffDate: string;
  dropoffTime: string;
}

export interface Booking {
  id: string;
  reference: string;
  carId: string;
  status: BookingStatus;
  pickupLocationId: string;
  dropoffLocationId: string;
  pickupDatetime: string; // ISO
  dropoffDatetime: string;
  addons: AddonType[];
  client: ClientDetails;
  totalMad: number;
  notes?: string;
  /** Human-readable contract summary */
  contractText?: string;
  /** Structured editable contract fields */
  contractData?: import("./contract").ContractFormData;
  contractUpdatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingDraft extends Partial<BookingSearch> {
  carId?: string;
  addons?: AddonType[];
  client?: Partial<ClientDetails>;
}

/** Admin dashboard metrics snapshot */
export interface DashboardMetrics {
  todayPickups: number;
  activeRentals: number;
  pendingRequests: number;
  todayDropoffs: number;
  monthlyRevenueMad: number;
}

export interface FleetFilters {
  category?: CarCategory | "all";
  transmission?: Transmission | "all";
  fuelType?: FuelType | "all";
  status?: CarStatus | "all";
  maxDailyRate?: number;
}
