"use client";

import Link from "next/link";
import { BUSINESS_WHATSAPP } from "@/lib/whatsapp";
import { useLocale } from "@/components/i18n/locale-provider";

export function SiteFooter() {
  const { t } = useLocale();

  return (
    <footer className="bg-navy-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-display text-2xl font-semibold">
            LuxuryCar <span className="text-gold-400">Driouch</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-white/65">{t("footerBlurb")}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
            {t("explore")}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li>
              <a href="#fleet" className="hover:text-white">
                {t("navFleet")}
              </a>
            </li>
            <li>
              <a href="#locations" className="hover:text-white">
                {t("navLocations")}
              </a>
            </li>
            <li>
              <Link href="/admin" className="hover:text-white">
                {t("staffDashboard")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
            {t("contact")}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li>Driouch, Morocco</li>
            <li>
              <a
                href={`https://wa.me/${BUSINESS_WHATSAPP}`}
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("whatsappLine")}
              </a>
            </li>
            <li>hello@luxurycar-driouch.ma</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/45">
        © {new Date().getFullYear()} LuxuryCar Driouch. {t("rights")} ·{" "}
        {t("langReady")}
      </div>
    </footer>
  );
}
