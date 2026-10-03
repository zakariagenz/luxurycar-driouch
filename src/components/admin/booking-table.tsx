"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Check, Clock, FileText, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookingStatusBadge } from "./admin-calendar";
import { ContractEditorModal } from "./contract-editor-modal";
import type { Booking, BookingStatus, Car, Location } from "@/lib/types";
import { formatDualPrice } from "@/lib/currency";
import { buildWhatsAppReminderLink } from "@/lib/whatsapp";
import { bookingService } from "@/lib/booking-service";
import { useLocale } from "@/components/i18n/locale-provider";

interface BookingTableProps {
  bookings: Booking[];
  cars: Car[];
  locations: Location[];
  onChange: () => void;
}

export function BookingTable({
  bookings,
  cars,
  locations,
  onChange,
}: BookingTableProps) {
  const { t, locale } = useLocale();
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [adjusting, setAdjusting] = useState<string | null>(null);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [contractBooking, setContractBooking] = useState<Booking | null>(null);

  const filtered =
    filter === "all"
      ? bookings
      : bookings.filter((b) => b.status === filter);

  const carOf = (id: string) => cars.find((x) => x.id === id) ?? null;
  const locOf = (id: string) => locations.find((l) => l.id === id) ?? null;

  const carLabel = (id: string) => {
    const c = carOf(id);
    return c ? `${c.make} ${c.model}` : "—";
  };
  const locLabel = (id: string) => {
    const l = locOf(id);
    if (!l) return "—";
    return locale === "fr" ? l.nameFr : l.name;
  };

  const setStatus = async (id: string, status: BookingStatus) => {
    const updated = await bookingService.updateStatus(id, status);
    onChange();
    return updated;
  };

  const approveAndContract = async (b: Booking) => {
    const updated = await setStatus(b.id, "confirmed");
    setContractBooking(updated ?? { ...b, status: "confirmed" });
  };

  const openContract = (b: Booking) => setContractBooking(b);

  const saveTimes = async (id: string) => {
    if (!pickup || !dropoff) return;
    await bookingService.updateTimes(
      id,
      new Date(pickup).toISOString(),
      new Date(dropoff).toISOString()
    );
    setAdjusting(null);
    onChange();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            "all",
            "pending",
            "confirmed",
            "picked_up",
            "completed",
            "cancelled",
          ] as const
        ).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={
              filter === s
                ? "bg-navy-900 px-3 py-1.5 text-xs font-medium text-white"
                : "bg-white px-3 py-1.5 text-xs font-medium text-navy-600 border border-navy-200"
            }
          >
            {s === "all" ? t("all") : s.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto border border-navy-100 bg-white">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="border-b border-navy-100 bg-navy-50/80 text-xs uppercase tracking-wider text-navy-500">
            <tr>
              <th className="px-4 py-3 font-medium">{t("reference")}</th>
              <th className="px-4 py-3 font-medium">{t("client")}</th>
              <th className="px-4 py-3 font-medium">{t("vehicle")}</th>
              <th className="px-4 py-3 font-medium">{t("pickup")}</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">{t("total")}</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50">
            {filtered.map((b) => (
              <tr key={b.id} className="align-top hover:bg-navy-50/40">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-navy-900">
                  {b.reference}
                  {b.contractText && (
                    <span className="mt-1 block text-[10px] font-sans font-medium text-emerald-700">
                      ✓ Contrat
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-navy-900">{b.client.fullName}</p>
                  <p className="text-xs text-navy-500">{b.client.phone}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {b.client.licensePhotoUrl && (
                      <a
                        href={b.client.licensePhotoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-medium text-gold-700 underline"
                      >
                        {t("viewLicense")}
                      </a>
                    )}
                    {b.client.idPhotoUrl && (
                      <a
                        href={b.client.idPhotoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-medium text-gold-700 underline"
                      >
                        {t("viewId")}
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-navy-700">{carLabel(b.carId)}</td>
                <td className="px-4 py-3 text-xs text-navy-600">
                  {adjusting === b.id ? (
                    <div className="space-y-2">
                      <Input
                        type="datetime-local"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                      />
                      <Input
                        type="datetime-local"
                        value={dropoff}
                        onChange={(e) => setDropoff(e.target.value)}
                      />
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => saveTimes(b.id)}>
                          {t("save")}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setAdjusting(null)}
                        >
                          {t("cancel")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p>
                        ↑ {format(new Date(b.pickupDatetime), "dd MMM HH:mm")}
                      </p>
                      <p className="text-navy-400">{locLabel(b.pickupLocationId)}</p>
                      <p className="mt-1">
                        ↓ {format(new Date(b.dropoffDatetime), "dd MMM HH:mm")}
                      </p>
                    </>
                  )}
                </td>
                <td className="px-4 py-3">
                  <BookingStatusBadge status={b.status} />
                </td>
                <td className="px-4 py-3 font-medium">
                  {formatDualPrice(b.totalMad)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {b.status === "pending" && (
                      <Button
                        size="sm"
                        variant="gold"
                        onClick={() => approveAndContract(b)}
                      >
                        <Check className="h-3.5 w-3.5" />
                        {t("approve")}
                      </Button>
                    )}
                    {b.status === "confirmed" && (
                      <Button
                        size="sm"
                        onClick={() => setStatus(b.id, "picked_up")}
                      >
                        {t("pickUp")}
                      </Button>
                    )}
                    {b.status === "picked_up" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setStatus(b.id, "completed")}
                      >
                        {t("complete")}
                      </Button>
                    )}
                    {(b.status === "confirmed" ||
                      b.status === "picked_up" ||
                      !!b.contractText) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openContract(b)}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        {t("generateContract")}
                      </Button>
                    )}
                    {(b.status === "pending" || b.status === "confirmed") && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAdjusting(b.id);
                            setPickup(
                              format(
                                new Date(b.pickupDatetime),
                                "yyyy-MM-dd'T'HH:mm"
                              )
                            );
                            setDropoff(
                              format(
                                new Date(b.dropoffDatetime),
                                "yyyy-MM-dd'T'HH:mm"
                              )
                            );
                          }}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          {t("times")}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setStatus(b.id, "cancelled")}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="whatsapp" asChild>
                      <a
                        href={buildWhatsAppReminderLink(
                          b.client.phone,
                          b.reference,
                          `${format(new Date(b.pickupDatetime), "dd MMM HH:mm")} @ ${locLabel(b.pickupLocationId)}`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-navy-500"
                >
                  —
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ContractEditorModal
        open={!!contractBooking}
        onOpenChange={(o) => !o && setContractBooking(null)}
        booking={contractBooking}
        car={contractBooking ? carOf(contractBooking.carId) : null}
        pickup={contractBooking ? locOf(contractBooking.pickupLocationId) : null}
        dropoff={
          contractBooking ? locOf(contractBooking.dropoffLocationId) : null
        }
        cars={cars}
        locations={locations}
        onSaved={onChange}
      />
    </div>
  );
}
