import { format } from "date-fns";
import { fr as frLocale, enUS } from "date-fns/locale";
import type { AppLocale } from "@/lib/i18n/dictionaries";
import type { AddonType, Booking, Car, Location } from "@/lib/types";
import { formatDualPrice } from "@/lib/currency";
import { calcRentalDays } from "@/lib/utils";
import { ADDONS } from "@/lib/mock-data";

/** Structured contract fields — edited via form, not free text */
export interface ContractFormData {
  reference: string;
  contractDate: string;
  lessorName: string;
  lessorAddress: string;
  lesseeName: string;
  lesseePhone: string;
  lesseeEmail: string;
  licenseNumber: string;
  idDocument: string;
  vehicleId: string;
  vehicleLabel: string;
  licensePlate: string;
  vehicleYear: string;
  pickupDatetime: string;
  pickupLocationId: string;
  pickupLocation: string;
  dropoffDatetime: string;
  dropoffLocationId: string;
  dropoffLocation: string;
  rentalDays: string;
  addons: string;
  dailyRateMad: string;
  totalMad: string;
  depositMad: string;
  fuelPolicy: string;
  mileagePolicy: string;
  specialConditions: string;
}

export interface ContractContext {
  booking: Booking;
  car: Car;
  pickup: Location;
  dropoff: Location;
  locale: AppLocale;
}

function locName(loc: Location, locale: AppLocale) {
  return locale === "fr" ? loc.nameFr : loc.name;
}

function addonList(ids: AddonType[], locale: AppLocale) {
  if (!ids.length) return locale === "fr" ? "Aucune" : "None";
  return ids
    .map((id) => {
      const a = ADDONS.find((x) => x.id === id);
      if (!a) return id;
      return locale === "fr" ? a.nameFr : a.name;
    })
    .join(", ");
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Prefill contract form from booking data */
export function buildContractForm(ctx: ContractContext): ContractFormData {
  const { booking, car, pickup, dropoff, locale } = ctx;
  const days = calcRentalDays(booking.pickupDatetime, booking.dropoffDatetime);
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");

  return {
    reference: booking.reference,
    contractDate: `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`,
    lessorName: "LuxuryCar Driouch",
    lessorAddress:
      locale === "fr"
        ? "Agence Driouch, Maroc"
        : "Driouch Agency, Morocco",
    lesseeName: booking.client.fullName,
    lesseePhone: booking.client.phone,
    lesseeEmail: booking.client.email,
    licenseNumber: booking.client.licenseNumber,
    idDocument: booking.client.idDocument,
    vehicleId: car.id,
    vehicleLabel: `${car.make} ${car.model}`,
    licensePlate: car.licensePlate,
    vehicleYear: String(car.year),
    pickupDatetime: toLocalInput(booking.pickupDatetime),
    pickupLocationId: pickup.id,
    pickupLocation: locName(pickup, locale),
    dropoffDatetime: toLocalInput(booking.dropoffDatetime),
    dropoffLocationId: dropoff.id,
    dropoffLocation: locName(dropoff, locale),
    rentalDays: String(days),
    addons: addonList(booking.addons, locale),
    dailyRateMad: String(car.dailyRateMad),
    totalMad: String(booking.totalMad),
    depositMad: "0",
    fuelPolicy:
      locale === "fr"
        ? "Restituer avec le même niveau de carburant"
        : "Return with the same fuel level",
    mileagePolicy:
      locale === "fr"
        ? "Kilométrage illimité sauf indication contraire"
        : "Unlimited mileage unless otherwise stated",
    specialConditions: "",
  };
}

/** Render printable HTML from form fields */
export function renderContractPrintHtml(
  form: ContractFormData,
  locale: AppLocale,
  extras?: { licensePhotoUrl?: string; idPhotoUrl?: string; titleDocs?: string; titleLicense?: string; titleId?: string }
): string {
  const df = locale === "fr" ? frLocale : enUS;
  const fmtDate = (value: string) => {
    try {
      return format(new Date(value), "dd MMMM yyyy HH:mm", { locale: df });
    } catch {
      return value;
    }
  };
  const fmtDay = (value: string) => {
    try {
      return format(new Date(value), "dd MMMM yyyy", { locale: df });
    } catch {
      return value;
    }
  };

  const title =
    locale === "fr"
      ? "CONTRAT DE LOCATION DE VÉHICULE"
      : "VEHICLE RENTAL AGREEMENT";

  const rows =
    locale === "fr"
      ? [
          ["Référence", form.reference],
          ["Date du contrat", fmtDay(form.contractDate)],
          ["Loueur", `${form.lessorName} — ${form.lessorAddress}`],
          ["Locataire", form.lesseeName],
          ["Téléphone", form.lesseePhone],
          ["E-mail", form.lesseeEmail],
          ["N° permis", form.licenseNumber],
          ["CIN / Passeport", form.idDocument],
          ["Véhicule", `${form.vehicleLabel} (${form.vehicleYear})`],
          ["Immatriculation", form.licensePlate],
          ["Prise en charge", `${fmtDate(form.pickupDatetime)} — ${form.pickupLocation}`],
          ["Restitution", `${fmtDate(form.dropoffDatetime)} — ${form.dropoffLocation}`],
          ["Durée", `${form.rentalDays} jour(s)`],
          ["Options", form.addons],
          ["Tarif journalier", `${form.dailyRateMad} MAD`],
          ["Total", `${form.totalMad} MAD`],
          ["Caution", `${form.depositMad} MAD`],
          ["Carburant", form.fuelPolicy],
          ["Kilométrage", form.mileagePolicy],
          ["Conditions particulières", form.specialConditions || "—"],
        ]
      : [
          ["Reference", form.reference],
          ["Contract date", fmtDay(form.contractDate)],
          ["Lessor", `${form.lessorName} — ${form.lessorAddress}`],
          ["Lessee", form.lesseeName],
          ["Phone", form.lesseePhone],
          ["Email", form.lesseeEmail],
          ["License no.", form.licenseNumber],
          ["ID / Passport", form.idDocument],
          ["Vehicle", `${form.vehicleLabel} (${form.vehicleYear})`],
          ["Plate", form.licensePlate],
          ["Pick-up", `${fmtDate(form.pickupDatetime)} — ${form.pickupLocation}`],
          ["Drop-off", `${fmtDate(form.dropoffDatetime)} — ${form.dropoffLocation}`],
          ["Duration", `${form.rentalDays} day(s)`],
          ["Add-ons", form.addons],
          ["Daily rate", `${form.dailyRateMad} MAD`],
          ["Total", formatDualPrice(Number(form.totalMad) || 0)],
          ["Deposit", `${form.depositMad} MAD`],
          ["Fuel policy", form.fuelPolicy],
          ["Mileage", form.mileagePolicy],
          ["Special conditions", form.specialConditions || "—"],
        ];

  const table = rows
    .map(
      ([k, v]) =>
        `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(String(v))}</td></tr>`
    )
    .join("");

  const sig =
    locale === "fr"
      ? `<div class="sigs"><div><p>Locataire</p><div class="line"></div></div><div><p>Loueur</p><div class="line"></div></div></div>`
      : `<div class="sigs"><div><p>Lessee</p><div class="line"></div></div><div><p>Lessor</p><div class="line"></div></div></div>`;

  const docs = `
    ${
      extras?.licensePhotoUrl
        ? `<div class="doc"><h3>${escapeHtml(extras.titleLicense ?? "License")}</h3><img src="${extras.licensePhotoUrl}" /></div>`
        : ""
    }
    ${
      extras?.idPhotoUrl
        ? `<div class="doc"><h3>${escapeHtml(extras.titleId ?? "ID")}</h3><img src="${extras.idPhotoUrl}" /></div>`
        : ""
    }
  `;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${escapeHtml(form.reference)}</title>
  <style>
    body{font-family:Georgia,serif;padding:36px;color:#102a43;line-height:1.45;max-width:800px;margin:0 auto}
    h1{font-size:22px;margin:0 0 4px;letter-spacing:.02em}
    .brand{color:#c9922e;font-size:13px;margin-bottom:24px;text-transform:uppercase;letter-spacing:.12em}
    table{width:100%;border-collapse:collapse;margin:16px 0 28px}
    th,td{border-bottom:1px solid #d9e2ec;padding:10px 8px;text-align:left;vertical-align:top;font-size:13px}
    th{width:34%;color:#627d98;font-weight:600}
    .sigs{display:flex;gap:40px;margin-top:48px}
    .sigs > div{flex:1}
    .line{margin-top:48px;border-bottom:1px solid #102a43}
    .doc{margin-top:28px;page-break-inside:avoid}
    .doc img{max-width:100%;max-height:300px;border:1px solid #ccc}
    .doc h3{font-size:13px;margin:0 0 8px}
  </style></head><body>
  <h1>${title}</h1>
  <div class="brand">${escapeHtml(form.lessorName)}</div>
  <table>${table}</table>
  ${sig}
  ${docs}
  </body></html>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Keep a readable summary string for storage / WhatsApp */
export function contractFormToSummary(
  form: ContractFormData,
  locale: AppLocale
): string {
  if (locale === "fr") {
    return `Contrat ${form.reference} — ${form.lesseeName} — ${form.vehicleLabel} (${form.licensePlate}) — ${form.pickupLocation} → ${form.dropoffLocation} — Total ${form.totalMad} MAD — Caution ${form.depositMad} MAD`;
  }
  return `Contract ${form.reference} — ${form.lesseeName} — ${form.vehicleLabel} (${form.licensePlate}) — ${form.pickupLocation} → ${form.dropoffLocation} — Total ${form.totalMad} MAD — Deposit ${form.depositMad} MAD`;
}
