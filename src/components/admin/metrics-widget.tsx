"use client";

import {
  CalendarClock,
  CarFront,
  ClipboardList,
  LogIn,
  Wallet,
} from "lucide-react";
import type { DashboardMetrics } from "@/lib/types";
import { formatCurrency } from "@/lib/currency";
import { useLocale } from "@/components/i18n/locale-provider";
import type { TranslationKey } from "@/lib/i18n/dictionaries";

export function MetricsWidget({ metrics }: { metrics: DashboardMetrics }) {
  const { t } = useLocale();

  const ITEMS: {
    key: keyof DashboardMetrics;
    labelKey: TranslationKey;
    icon: typeof CarFront;
    format?: (n: number) => string;
  }[] = [
    { key: "todayPickups", labelKey: "metricPickups", icon: LogIn },
    { key: "todayDropoffs", labelKey: "metricDropoffs", icon: CalendarClock },
    { key: "activeRentals", labelKey: "metricActive", icon: CarFront },
    { key: "pendingRequests", labelKey: "metricPending", icon: ClipboardList },
    {
      key: "monthlyRevenueMad",
      labelKey: "metricRevenue",
      icon: Wallet,
      format: (n) => formatCurrency(n, "MAD"),
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {ITEMS.map((item) => (
        <div
          key={item.key}
          className="border border-navy-100 bg-white p-4 shadow-sm dark:border-navy-800 dark:bg-navy-900"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-navy-500 dark:text-navy-400">
              {t(item.labelKey)}
            </p>
            <item.icon className="h-4 w-4 text-gold-600" />
          </div>
          <p className="mt-2 font-sans text-3xl font-semibold tracking-tight text-navy-900 tabular-nums dark:text-navy-50">
            {item.format
              ? item.format(metrics[item.key])
              : metrics[item.key]}
          </p>
        </div>
      ))}
    </div>
  );
}
