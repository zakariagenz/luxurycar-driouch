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
import { DocumentPhotoUpload } from "./document-photo-upload";
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
import { useLocale } from "@/components/i18n/locale-provider";

export function BookingModal() {
  const router = useRouter();
  const { t, locale } = useLocale();
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

  const STEPS = [t("stepVehicle"), t("stepLocations"), t("stepDetails")];

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

  const locationLabel = (loc: Location) =>
    locale === "fr" ? loc.nameFr : loc.name;

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
      !!c.idDocument &&
      !!c.licensePhotoUrl &&
      !!c.idPhotoUrl
    );
  };

  const handleSubmit = async () => {
    if (!state.car || !canGoNext()) {
      if (!state.client.licensePhotoUrl || !state.client.idPhotoUrl) {
        setError(t("photosRequired"));
      }
      return;
    }
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
          licensePhotoUrl: state.client.licensePhotoUrl,
          idPhotoUrl: state.client.idPhotoUrl,
        },
      });
      setSubmittedBooking(booking);
      closeBooking();
      router.push(`/booking/confirmation/${booking.reference}`);
    } catch {
      setError(t("bookingError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && closeBooking()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("bookTitle")}</DialogTitle>
          <DialogDescription>{t("bookDesc")}</DialogDescription>
        </DialogHeader>

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

        {state.step === 1 && (
          <div className="space-y-4 animate-slide-in-right">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t("pickupDate")}</Label>
                <Input
                  type="date"
                  value={state.search.pickupDate}
                  onChange={(e) => setSearch({ pickupDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("pickupTime")}</Label>
                <Input
                  type="time"
                  value={state.search.pickupTime}
                  onChange={(e) => setSearch({ pickupTime: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("dropoffDate")}</Label>
                <Input
                  type="date"
                  value={state.search.dropoffDate}
                  onChange={(e) => setSearch({ dropoffDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("dropoffTime")}</Label>
                <Input
                  type="time"
                  value={state.search.dropoffTime}
                  onChange={(e) => setSearch({ dropoffTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t("selectVehicle")}</Label>
              <Select
                value={state.car?.id}
                onValueChange={(id) => {
                  const car = cars.find((c) => c.id === id);
                  if (car) setCar(car);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("chooseCar")} />
                </SelectTrigger>
                <SelectContent>
                  {cars.map((car) => (
                    <SelectItem key={car.id} value={car.id}>
                      {car.make} {car.model} — {formatDualPrice(car.dailyRateMad)}
                      {t("perDayShort")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {state.car && (
              <p className="rounded-lg bg-navy-50 px-3 py-2 text-sm text-navy-700">
                {days} {days > 1 ? t("days") : t("day")} ·{" "}
                <strong>{formatDualPrice(state.car.dailyRateMad * days)}</strong>{" "}
                {t("beforeAddons")}
              </p>
            )}
          </div>
        )}

        {state.step === 2 && (
          <div className="space-y-4 animate-slide-in-right">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t("pickupPoint")}</Label>
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
                        {locationLabel(loc)}
                        {loc.deliveryFeeMad > 0
                          ? ` (+${loc.deliveryFeeMad} MAD)`
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("dropoffPoint")}</Label>
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
                        {locationLabel(loc)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">{t("addons")}</Label>
              <div className="space-y-2">
                {(addonsCatalog.length ? addonsCatalog : ADDONS).map((addon) => {
                  const checked = state.addons.includes(addon.id);
                  const price =
                    addon.flatFeeMad && addon.flatFeeMad > 0
                      ? `${addon.flatFeeMad} MAD ${t("flat")}`
                      : `${addon.dailyRateMad} MAD${t("perDayShort")}`;
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
                            {locale === "fr" ? addon.nameFr : addon.name}
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
                {t("estimatedTotal")}{" "}
                <strong className="text-gold-300">{formatDualPrice(estimate)}</strong>
              </p>
            )}
          </div>
        )}

        {state.step === 3 && (
          <div className="space-y-3 animate-slide-in-right">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">{t("fullName")}</Label>
              <Input
                id="fullName"
                value={state.client.fullName}
                onChange={(e) => setClient({ fullName: e.target.value })}
                placeholder={t("fullNamePlaceholder")}
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">{t("phone")}</Label>
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
                <Label htmlFor="email">{t("email")}</Label>
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
                <Label htmlFor="license">{t("licenseNumber")}</Label>
                <Input
                  id="license"
                  value={state.client.licenseNumber}
                  onChange={(e) => setClient({ licenseNumber: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="idDoc">{t("idDocument")}</Label>
                <Input
                  id="idDoc"
                  value={state.client.idDocument}
                  onChange={(e) => setClient({ idDocument: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DocumentPhotoUpload
                label={t("licensePhoto")}
                value={state.client.licensePhotoUrl}
                onChange={(url) => setClient({ licensePhotoUrl: url })}
              />
              <DocumentPhotoUpload
                label={t("idPhoto")}
                value={state.client.idPhotoUrl}
                onChange={(url) => setClient({ idPhotoUrl: url })}
              />
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
                {t("preferWhatsapp")}
              </span>
            </label>

            {state.car && (
              <div className="rounded-lg border border-navy-100 bg-navy-50/50 p-3 text-sm text-navy-700">
                <p>
                  <strong>
                    {state.car.make} {state.car.model}
                  </strong>{" "}
                  · {days} {days > 1 ? t("days") : t("day")}
                </p>
                <p className="mt-1 text-base font-semibold text-navy-900">
                  {t("total")} {formatDualPrice(estimate)}
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
            {t("back")}
          </Button>

          {state.step < 3 ? (
            <Button
              type="button"
              variant="gold"
              disabled={!canGoNext()}
              onClick={() => setStep((state.step + 1) as 1 | 2 | 3)}
            >
              {t("continue")}
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
                  {t("submitting")}
                </>
              ) : (
                t("confirmBooking")
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
