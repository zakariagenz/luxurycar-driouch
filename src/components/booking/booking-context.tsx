"use client";

import * as React from "react";
import type {
  AddonType,
  Booking,
  BookingSearch,
  Car,
  ClientDetails,
} from "@/lib/types";

export interface BookingFlowState {
  search: BookingSearch;
  car: Car | null;
  addons: AddonType[];
  client: ClientDetails;
  step: 1 | 2 | 3;
  submittedBooking: Booking | null;
}

interface BookingContextValue {
  state: BookingFlowState;
  isOpen: boolean;
  openBooking: (car?: Car, search?: Partial<BookingSearch>) => void;
  closeBooking: () => void;
  setStep: (step: 1 | 2 | 3) => void;
  setCar: (car: Car) => void;
  setSearch: (search: Partial<BookingSearch>) => void;
  setAddons: (addons: AddonType[]) => void;
  setClient: (client: Partial<ClientDetails>) => void;
  setSubmittedBooking: (booking: Booking | null) => void;
  reset: () => void;
}

function defaultSearch(): BookingSearch {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const end = new Date(tomorrow);
  end.setDate(end.getDate() + 3);

  const toDate = (d: Date) => d.toISOString().slice(0, 10);

  return {
    pickupLocationId: "loc-driouch",
    dropoffLocationId: "loc-driouch",
    pickupDate: toDate(tomorrow),
    pickupTime: "10:00",
    dropoffDate: toDate(end),
    dropoffTime: "10:00",
  };
}

function defaultClient(): ClientDetails {
  return {
    fullName: "",
    phone: "",
    email: "",
    whatsappPreferred: true,
    licenseNumber: "",
    idDocument: "",
  };
}

const BookingContext = React.createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [state, setState] = React.useState<BookingFlowState>({
    search: defaultSearch(),
    car: null,
    addons: [],
    client: defaultClient(),
    step: 1,
    submittedBooking: null,
  });

  const openBooking = React.useCallback(
    (car?: Car, search?: Partial<BookingSearch>) => {
      setState((prev) => ({
        ...prev,
        car: car ?? prev.car,
        search: { ...prev.search, ...search },
        step: car ? 2 : 1,
        submittedBooking: null,
        addons: [],
        client: defaultClient(),
      }));
      setIsOpen(true);
    },
    []
  );

  const closeBooking = React.useCallback(() => setIsOpen(false), []);

  const setStep = React.useCallback((step: 1 | 2 | 3) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const setCar = React.useCallback((car: Car) => {
    setState((prev) => ({ ...prev, car }));
  }, []);

  const setSearch = React.useCallback((search: Partial<BookingSearch>) => {
    setState((prev) => ({
      ...prev,
      search: { ...prev.search, ...search },
    }));
  }, []);

  const setAddons = React.useCallback((addons: AddonType[]) => {
    setState((prev) => ({ ...prev, addons }));
  }, []);

  const setClient = React.useCallback((client: Partial<ClientDetails>) => {
    setState((prev) => ({
      ...prev,
      client: { ...prev.client, ...client },
    }));
  }, []);

  const setSubmittedBooking = React.useCallback((booking: Booking | null) => {
    setState((prev) => ({ ...prev, submittedBooking: booking }));
  }, []);

  const reset = React.useCallback(() => {
    setState({
      search: defaultSearch(),
      car: null,
      addons: [],
      client: defaultClient(),
      step: 1,
      submittedBooking: null,
    });
  }, []);

  const value = React.useMemo(
    () => ({
      state,
      isOpen,
      openBooking,
      closeBooking,
      setStep,
      setCar,
      setSearch,
      setAddons,
      setClient,
      setSubmittedBooking,
      reset,
    }),
    [
      state,
      isOpen,
      openBooking,
      closeBooking,
      setStep,
      setCar,
      setSearch,
      setAddons,
      setClient,
      setSubmittedBooking,
      reset,
    ]
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = React.useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
