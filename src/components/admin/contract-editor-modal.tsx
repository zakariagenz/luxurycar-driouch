"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2, Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildContractForm,
  contractFormToSummary,
  renderContractPrintHtml,
  type ContractFormData,
} from "@/lib/contract";
import { bookingService } from "@/lib/booking-service";
import type { Booking, Car, Location } from "@/lib/types";
import { useLocale } from "@/components/i18n/locale-provider";

interface ContractEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  car: Car | null;
  pickup: Location | null;
  dropoff: Location | null;
  cars: Car[];
  locations: Location[];
  onSaved: () => void;
}

function emptyForm(): ContractFormData {
  return {
    reference: "",
    contractDate: "",
    lessorName: "",
    lessorAddress: "",
    lesseeName: "",
    lesseePhone: "",
    lesseeEmail: "",
    licenseNumber: "",
    idDocument: "",
    vehicleId: "",
    vehicleLabel: "",
    licensePlate: "",
    vehicleYear: "",
    pickupDatetime: "",
    pickupLocationId: "",
    pickupLocation: "",
    dropoffDatetime: "",
    dropoffLocationId: "",
    dropoffLocation: "",
    rentalDays: "",
    addons: "",
    dailyRateMad: "",
    totalMad: "",
    depositMad: "",
    fuelPolicy: "",
    mileagePolicy: "",
    specialConditions: "",
  };
}

function withIds(
  data: ContractFormData,
  cars: Car[],
  locations: Location[],
  booking: Booking
): ContractFormData {
  const byPlate = cars.find((c) => c.licensePlate === data.licensePlate);
  const byPickup =
    locations.find(
      (l) =>
        l.id === data.pickupLocationId ||
        l.name === data.pickupLocation ||
        l.nameFr === data.pickupLocation
    ) ?? locations.find((l) => l.id === booking.pickupLocationId);
  const byDropoff =
    locations.find(
      (l) =>
        l.id === data.dropoffLocationId ||
        l.name === data.dropoffLocation ||
        l.nameFr === data.dropoffLocation
    ) ?? locations.find((l) => l.id === booking.dropoffLocationId);
  const vehicle =
    cars.find((c) => c.id === data.vehicleId) ??
    byPlate ??
    cars.find((c) => c.id === booking.carId);

  return {
    ...data,
    vehicleId: vehicle?.id ?? data.vehicleId ?? booking.carId,
    pickupLocationId:
      byPickup?.id ?? data.pickupLocationId ?? booking.pickupLocationId,
    dropoffLocationId:
      byDropoff?.id ?? data.dropoffLocationId ?? booking.dropoffLocationId,
  };
}

export function ContractEditorModal({
  open,
  onOpenChange,
  booking,
  car,
  pickup,
  dropoff,
  cars,
  locations,
  onSaved,
}: ContractEditorModalProps) {
  const { t, locale } = useLocale();
  const [form, setForm] = useState<ContractFormData>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    if (!open || !booking || !car || !pickup || !dropoff) return;
    if (booking.contractData) {
      setForm(withIds(booking.contractData, cars, locations, booking));
    } else {
      setForm(
        buildContractForm({
          booking,
          car,
          pickup,
          dropoff,
          locale,
        })
      );
    }
    setSavedMsg(false);
  }, [open, booking, car, pickup, dropoff, locale, cars, locations]);

  const set =
    (key: keyof ContractFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const locLabel = (loc: Location) =>
    locale === "fr" ? loc.nameFr : loc.name;

  const onSelectVehicle = (id: string) => {
    const selected = cars.find((c) => c.id === id);
    if (!selected) return;
    setForm((prev) => ({
      ...prev,
      vehicleId: selected.id,
      vehicleLabel: `${selected.make} ${selected.model}`,
      licensePlate: selected.licensePlate,
      vehicleYear: String(selected.year),
      dailyRateMad: String(selected.dailyRateMad),
    }));
  };

  const onSelectPickup = (id: string) => {
    const selected = locations.find((l) => l.id === id);
    if (!selected) return;
    setForm((prev) => ({
      ...prev,
      pickupLocationId: selected.id,
      pickupLocation: locLabel(selected),
    }));
  };

  const onSelectDropoff = (id: string) => {
    const selected = locations.find((l) => l.id === id);
    if (!selected) return;
    setForm((prev) => ({
      ...prev,
      dropoffLocationId: selected.id,
      dropoffLocation: locLabel(selected),
    }));
  };

  const save = async () => {
    if (!booking) return;
    setSaving(true);
    try {
      const summary = contractFormToSummary(form, locale);
      await bookingService.saveContract(booking.id, summary, form);
      setSavedMsg(true);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const printContract = () => {
    const win = window.open(
      "",
      "_blank",
      "noopener,noreferrer,width=860,height=960"
    );
    if (!win) return;
    win.document.write(
      renderContractPrintHtml(form, locale, {
        licensePhotoUrl: booking?.client.licensePhotoUrl,
        idPhotoUrl: booking?.client.idPhotoUrl,
        titleLicense: t("viewLicense"),
        titleId: t("viewId"),
      })
    );
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gold-600" />
            {t("contractTitle")}
            {booking ? ` · ${booking.reference}` : ""}
          </DialogTitle>
          <DialogDescription>{t("contractHint")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("reference")}>
              <Input value={form.reference} onChange={set("reference")} />
            </Field>
            <Field label={t("contractDate")}>
              <Input
                type="date"
                value={form.contractDate}
                onChange={set("contractDate")}
              />
            </Field>
          </div>

          <Section title={t("contractSectionParties")}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t("contractLessorName")}>
                <Input value={form.lessorName} onChange={set("lessorName")} />
              </Field>
              <Field label={t("contractLessorAddress")}>
                <Input
                  value={form.lessorAddress}
                  onChange={set("lessorAddress")}
                />
              </Field>
              <Field label={t("contractLesseeName")}>
                <Input value={form.lesseeName} onChange={set("lesseeName")} />
              </Field>
              <Field label={t("phone")}>
                <Input value={form.lesseePhone} onChange={set("lesseePhone")} />
              </Field>
              <Field label={t("email")}>
                <Input value={form.lesseeEmail} onChange={set("lesseeEmail")} />
              </Field>
              <Field label={t("licenseNumber")}>
                <Input
                  value={form.licenseNumber}
                  onChange={set("licenseNumber")}
                />
              </Field>
              <Field label={t("idDocument")} className="sm:col-span-2">
                <Input value={form.idDocument} onChange={set("idDocument")} />
              </Field>
            </div>
          </Section>

          <Section title={t("contractSectionVehicle")}>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label={t("vehicle")} className="sm:col-span-3">
                <Select
                  value={form.vehicleId || undefined}
                  onValueChange={onSelectVehicle}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("chooseCar")} />
                  </SelectTrigger>
                  <SelectContent>
                    {cars.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.make} {c.model} · {c.licensePlate} · {c.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t("contractPlate")}>
                <Input value={form.licensePlate} readOnly className="bg-navy-50" />
              </Field>
              <Field label={t("contractYear")}>
                <Input value={form.vehicleYear} readOnly className="bg-navy-50" />
              </Field>
              <Field label={t("contractDailyRate")}>
                <Input
                  type="number"
                  value={form.dailyRateMad}
                  onChange={set("dailyRateMad")}
                />
              </Field>
            </div>
          </Section>

          <Section title={t("contractSectionPeriod")}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t("pickup")}>
                <Input
                  type="datetime-local"
                  value={form.pickupDatetime}
                  onChange={set("pickupDatetime")}
                />
              </Field>
              <Field label={t("pickupLocation")}>
                <Select
                  value={form.pickupLocationId || undefined}
                  onValueChange={onSelectPickup}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectLocation")} />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {locLabel(loc)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t("dropoff")}>
                <Input
                  type="datetime-local"
                  value={form.dropoffDatetime}
                  onChange={set("dropoffDatetime")}
                />
              </Field>
              <Field label={t("dropoffLocation")}>
                <Select
                  value={form.dropoffLocationId || undefined}
                  onValueChange={onSelectDropoff}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectLocation")} />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {locLabel(loc)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t("contractDays")}>
                <Input value={form.rentalDays} onChange={set("rentalDays")} />
              </Field>
              <Field label={t("addons")}>
                <Input value={form.addons} onChange={set("addons")} />
              </Field>
            </div>
          </Section>

          <Section title={t("contractSectionPricing")}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t("contractTotal")}>
                <Input
                  type="number"
                  value={form.totalMad}
                  onChange={set("totalMad")}
                />
              </Field>
              <Field label={t("contractDeposit")}>
                <Input
                  type="number"
                  value={form.depositMad}
                  onChange={set("depositMad")}
                />
              </Field>
              <Field label={t("contractFuelPolicy")} className="sm:col-span-2">
                <Input value={form.fuelPolicy} onChange={set("fuelPolicy")} />
              </Field>
              <Field
                label={t("contractMileagePolicy")}
                className="sm:col-span-2"
              >
                <Input
                  value={form.mileagePolicy}
                  onChange={set("mileagePolicy")}
                />
              </Field>
              <Field label={t("contractSpecial")} className="sm:col-span-2">
                <textarea
                  value={form.specialConditions}
                  onChange={set("specialConditions")}
                  rows={3}
                  className="flex w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                  placeholder="…"
                />
              </Field>
            </div>
          </Section>

          {(booking?.client.licensePhotoUrl || booking?.client.idPhotoUrl) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {booking.client.licensePhotoUrl && (
                <div>
                  <p className="mb-1 text-xs font-medium text-navy-500">
                    {t("viewLicense")}
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={booking.client.licensePhotoUrl}
                    alt={t("viewLicense")}
                    className="h-28 w-full rounded-lg border border-navy-100 object-cover"
                  />
                </div>
              )}
              {booking.client.idPhotoUrl && (
                <div>
                  <p className="mb-1 text-xs font-medium text-navy-500">
                    {t("viewId")}
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={booking.client.idPhotoUrl}
                    alt={t("viewId")}
                    className="h-28 w-full rounded-lg border border-navy-100 object-cover"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {savedMsg && (
          <p className="text-sm text-emerald-700">{t("contractSaved")}</p>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t("close")}
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={printContract}>
              <Printer className="h-4 w-4" />
              {t("printContract")}
            </Button>
            <Button
              type="button"
              variant="gold"
              onClick={save}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t("saveContract")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-navy-100 bg-navy-50/40 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
