"use client";

import {
  CalendarCheck,
  MapPinned,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";

export function HowItWorks() {
  const { t } = useLocale();

  const STEPS = [
    { icon: Smartphone, title: t("step1Title"), text: t("step1Text") },
    { icon: MapPinned, title: t("step2Title"), text: t("step2Text") },
    { icon: CalendarCheck, title: t("step3Title"), text: t("step3Text") },
    { icon: ShieldCheck, title: t("step4Title"), text: t("step4Text") },
  ];

  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-y border-navy-100 bg-navy-50/40 py-20 dark:border-navy-800 dark:bg-navy-900/50"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">
            {t("simpleProcess")}
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold text-navy-900 dark:text-navy-50">
            {t("bookInMinutes")}
          </h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative">
              <span className="font-display text-5xl font-semibold text-navy-100 dark:text-navy-800">
                0{i + 1}
              </span>
              <step.icon className="mb-3 mt-2 h-6 w-6 text-gold-600" />
              <h3 className="font-display text-xl font-semibold text-navy-900 dark:text-navy-50">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-navy-600 dark:text-navy-300">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
