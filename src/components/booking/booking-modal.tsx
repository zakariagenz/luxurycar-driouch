"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { useBooking } from "./booking-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addonService,
  bookingService,
  calculateBookingTotal,
  carService,
  locationService,
} from "@/lib/booking-service";
import type { Addon, AddonType, Car, Location } from "@/lib/types";
import { formatDualPrice } from "@/lib/currency";
import { calcRentalDays, cn } from "@/lib/utils";
import { ADDONS } from "@/lib/mock-data";

const STEPS = ["Vehicle & dates", "Locations & add-ons", "Your details"];

export function BookingModal() {
  const router = useRouter();
  const {
    isOpen,
    closeBooking,
    state,
    setStep,
    setCar,
    setSearch,
    setAddons,
    setClient,
    setSubmittedBooking,
  } = useBooking();

  const [cars, setCars] = useState<Car[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [addonsCatalog, setAddonsCatalog] = useState<Addon[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    carService.getAll({ status: "available" }).then(setCars);
    locationService.getAll().then(setLocations);
    addonService.getAll().then(setAddonsCatalog);
  }, [isOpen]);

  const pickupIso = `${state.search.pickupDate}T${state.search.pickupTime}:00`;
  const dropoffIso = `${state.search.dropoffDate}T${state.search.dropoffTime}:00`;

  const pickupLoc = locations.find((l) => l.id === state.search.pickupLocationId);
  const dropoffLoc = locations.find(
    (l) => l.id === state.search.dropoffLocationId
  );

  const days = useMemo(
    () => calcRentalDays(pickupIso, dropoffIso),
    [pickupIso, dropoffIso]
  );

  const estimate = useMemo(() => {
    if (!state.car || !pickupLoc || !dropoffLoc) return 0;
    return calculateBookingTotal(
      state.car,
      pickupIso,
      dropoffIso,
      pickupLoc,
      dropoffLoc,
      state.addons
    );
  }, [state.car, state.addons, pickupIso, dropoffIso, pickupLoc, dropoffLoc]);

  const toggleAddon = (id: AddonType) => {
    setAddons(
      state.addons.includes(id)
        ? state.addons.filter((a) => a !== id)
        : [...state.addons, id]
    );
  };

  const canGoNext = () => {
    if (state.step === 1) {
      return !!state.car && !!state.search.pickupDate && !!state.search.dropoffDate;
    }
    if (state.step === 2) {
      return !!state.search.pickupLocationId && !!state.search.dropoffLocationId;
    }
    const c = state.client;
    return (
      !!c.fullName &&
      !!c.phone &&
      !!c.email &&
      !!c.licenseNumber &&
      !!c.idDocument
    );
  };

  const handleSubmit = async () => {
    if (!state.car || !canGoNext()) return;
    setSubmitting(true);
    setError(null);
    try {
      const booking = await bookingService.create({
        carId: state.car.id,
        pickupLocationId: state.search.pickupLocationId,
        dropoffLocationId: state.search.dropoffLocationId,
        pickupDatetime: new Date(pickupIso).toISOString(),
        dropoffDatetime: new Date(dropoffIso).toISOString(),
        addons: state.addons,
        client: {
          fullName: state.client.fullName,
          phone: state.client.phone,
          email: state.client.email,
          whatsappPreferred: state.client.whatsappPreferred,
          licenseNumber: state.client.licenseNumber,
          idDocument: state.client.idDocument,
        },
      });
      setSubmittedBooking(booking);
      closeBooking();
      router.push(`/booking/confirmation/${booking.reference}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && closeBooking()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Book your vehicle</DialogTitle>
          <DialogDescription>
            Complete these 3 steps — confirmation takes under a minute.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <ol className="mb-2 flex items-center gap-2">
          {STEPS.map((label, i) => {
            const n = (i + 1) as 1 | 2 | 3;
            const active = state.step === n;
            const done = state.step > n;
            return (
              <li key={label} className="flex flex-1 items-center gap-2">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    done || active
                      ? "bg-navy-900 text-white"
                      : "bg-navy-100 text-navy-500"
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : n}
                </span>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:inline",
                    active ? "text-navy-900" : "text-navy-400"
                  )}
                >
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="ml-auto hidden h-px flex-1 bg-navy-100 sm:block" />
                )}
              </li>
            );
          })}
        </ol>

        {/* Step 1 */}
        {state.step === 1 && (
          <div className="space-y-4 animate-slide-in-right">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Pick-up date</Label>
                <Input
                  type="date"
                  value={state.search.pickupDate}
                  onChange={(e) => setSearch({ pickupDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Pick-up time</Label>
                <Input
                  type="time"
                  value={state.search.pickupTime}
                  onChange={(e) => setSearch({ pickupTime: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Drop-off date</Label>
                <Input
                  type="date"
                  value={state.search.dropoffDate}
                  onChange={(e) => setSearch({ dropoffDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Drop-off time</Label>
                <Input
                  type="time"
                  value={state.search.dropoffTime}
                  onChange={(e) => setSearch({ dropoffTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Select vehicle</Label>
              <Select
                value={state.car?.id}
                onValueChange={(id) => {
                  const car = cars.find((c) => c.id === id);
                  if (car) setCar(car);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a car" />
                </SelectTrigger>
                <SelectContent>
                  {cars.map((car) => (
                    <SelectItem key={car.id} value={car.id}>
                      {car.make} {car.model} — {formatDualPrice(car.dailyRateMad)}/day
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {state.car && (
              <p className="rounded-lg bg-navy-50 px-3 py-2 text-sm text-navy-700">
                {days} day{days > 1 ? "s" : ""} · from{" "}
                <strong>{formatDualPrice(state.car.dailyRateMad * days)}</strong>{" "}
                (before delivery & add-ons)
              </p>
            )}
          </div>
        )}

        {/* Step 2 */}
        {state.step === 2 && (
          <div className="space-y-4 animate-slide-in-right">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Pick-up point</Label>
                <Select
                  value={state.search.pickupLocationId}
                  onValueChange={(v) => setSearch({ pickupLocationId: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                        {loc.deliveryFeeMad > 0
                          ? ` (+${loc.deliveryFeeMad} MAD)`
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Drop-off point</Label>
                <Select
                  value={state.search.dropoffLocationId}
                  onValueChange={(v) => setSearch({ dropoffLocationId: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Add-ons</Label>
              <div className="space-y-2">
                {(addonsCatalog.length ? addonsCatalog : ADDONS).map((addon) => {
                  const checked = state.addons.includes(addon.id);
                  const price =
                    addon.flatFeeMad && addon.flatFeeMad > 0
                      ? `${addon.flatFeeMad} MAD flat`
                      : `${addon.dailyRateMad} MAD/day`;
                  return (
                    <label
                      key={addon.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition",
                        checked
                          ? "border-gold-400 bg-gold-50/60"
                          : "border-navy-100 hover:border-navy-200"
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleAddon(addon.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-navy-900">
                            {addon.name}
                          </span>
                          <span className="text-xs text-navy-500">{price}</span>
                        </div>
                        <p className="text-xs text-navy-500">{addon.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {state.car && (
              <p className="rounded-lg bg-navy-900 px-3 py-2.5 text-sm text-white">
                Estimated total:{" "}
                <strong className="text-gold-300">{formatDualPrice(estimate)}</strong>
              </p>
            )}
          </div>
        )}

        {/* Step 3 */}
        {state.step === 3 && (
          <div className="space-y-3 animate-slide-in-right">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={state.client.fullName}
                onChange={(e) => setClient({ fullName: e.target.value })}
                placeholder="As on your license / passport"
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={state.client.phone}
                  onChange={(e) => setClient({ phone: e.target.value })}
                  placeholder="+212 6XX XXX XXX"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={state.client.email}
                  onChange={(e) => setClient({ email: e.target.value })}
                  placeholder="you@email.com"
                  required
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="license">Driving license number</Label>
                <Input
                  id="license"
                  value={state.client.licenseNumber}
                  onChange={(e) => setClient({ licenseNumber: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="idDoc">Passport / CIN</Label>
                <Input
                  id="idDoc"
                  value={state.client.idDocument}
                  onChange={(e) => setClient({ idDocument: e.target.value })}
                  required
                />
              </div>
            </div>
            <label className="flex items-center gap-2 rounded-lg border border-navy-100 p-3">
              <Checkbox
                checked={state.client.whatsappPreferred}
                onCheckedChange={(v) =>
                  setClient({ whatsappPreferred: v === true })
                }
              />
              <span className="flex items-center gap-1.5 text-sm text-navy-700">
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                Prefer WhatsApp for booking updates
              </span>
            </label>

            {state.car && (
              <div className="rounded-lg border border-navy-100 bg-navy-50/50 p-3 text-sm text-navy-700">
                <p>
                  <strong>
                    {state.car.make} {state.car.model}
                  </strong>{" "}
                  · {days} day{days > 1 ? "s" : ""}
                </p>
                <p className="mt-1 text-base font-semibold text-navy-900">
                  Total: {formatDualPrice(estimate)}
                </p>
              </div>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}

        <div className="mt-2 flex justify-between gap-2 border-t border-navy-100 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={state.step === 1 || submitting}
            onClick={() => setStep((state.step - 1) as 1 | 2 | 3)}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {state.step < 3 ? (
            <Button
              type="button"
              variant="gold"
              disabled={!canGoNext()}
              onClick={() => setStep((state.step + 1) as 1 | 2 | 3)}
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="gold"
              disabled={!canGoNext() || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Confirm booking"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
