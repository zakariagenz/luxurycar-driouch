import type { Currency } from "./types";

/** Approximate MAD → EUR rate (update when wiring live FX) */
export const MAD_TO_EUR = 0.093;

export function convertMadToEur(amountMad: number): number {
  return Math.round(amountMad * MAD_TO_EUR * 100) / 100;
}

export function formatCurrency(
  amountMad: number,
  currency: Currency = "MAD",
  locale = "fr-MA"
): string {
  if (currency === "EUR") {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(convertMadToEur(amountMad));
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(amountMad);
}

/** Dual display: "850 MAD (~79 €)" */
export function formatDualPrice(amountMad: number): string {
  const mad = formatCurrency(amountMad, "MAD");
  const eur = formatCurrency(amountMad, "EUR");
  return `${mad} (~${eur})`;
}
