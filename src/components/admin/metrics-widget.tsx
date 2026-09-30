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

const ITEMS: {
  key: keyof DashboardMetrics;
  label: string;
  icon: typeof CarFront;
  format?: (n: number) => string;
}[] = [
  { key: "todayPickups", label: "Today's pick-ups", icon: LogIn },
  { key: "todayDropoffs", label: "Today's drop-offs", icon: CalendarClock },
  { key: "activeRentals", label: "Active rentals", icon: CarFront },
  { key: "pendingRequests", label: "Pending requests", icon: ClipboardList },
  {
    key: "monthlyRevenueMad",
    label: "Pipeline revenue",
    icon: Wallet,
    format: (n) => formatCurrency(n, "MAD"),
  },
];

export function MetricsWidget({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {ITEMS.map((item) => (
        <div
          key={item.key}
          className="border border-navy-100 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-navy-500">
              {item.label}
            </p>
            <item.icon className="h-4 w-4 text-gold-600" />
          </div>
          <p className="mt-2 font-display text-3xl font-semibold text-navy-900">
            {item.format
              ? item.format(metrics[item.key])
              : metrics[item.key]}
          </p>
        </div>
      ))}
    </div>
  );
}
