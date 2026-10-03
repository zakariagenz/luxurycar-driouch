"use client";

import { useEffect, useState } from "react";
import { MapPin, Search } from "lucide-react";
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
import { locationService } from "@/lib/booking-service";
import type { Location } from "@/lib/types";
import { useBooking } from "@/components/booking/booking-context";
import { useLocale } from "@/components/i18n/locale-provider";

export function SearchWidget({ compact = false }: { compact?: boolean }) {
  const { openBooking, setSearch, state } = useBooking();
  const { t, locale } = useLocale();
  const [locations, setLocations] = useState<Location[]>([]);
  const [form, setForm] = useState(state.search);

  useEffect(() => {
    locationService.getAll().then(setLocations);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(form);
    openBooking(undefined, form);
    document.getElementById("fleet")?.scrollIntoView({ behavior: "smooth" });
  };

  const label = (loc: Location) => (locale === "fr" ? loc.nameFr : loc.name);

  return (
    <form
      onSubmit={onSubmit}
      className={
        compact
          ? "grid gap-3"
          : "grid gap-3 rounded-2xl border border-white/15 bg-white/95 p-4 shadow-2xl backdrop-blur sm:p-5 md:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1fr_1fr_auto]"
      }
    >
      <div className="space-y-1.5">
        <Label className="text-navy-600">{t("pickupLocation")}</Label>
        <Select
          value={form.pickupLocationId}
          onValueChange={(v) =>
            setForm((f) => ({
              ...f,
              pickupLocationId: v,
              dropoffLocationId: f.dropoffLocationId || v,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("selectLocation")} />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gold-600" />
                  {label(loc)}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-navy-600">{t("dropoffLocation")}</Label>
        <Select
          value={form.dropoffLocationId}
          onValueChange={(v) => setForm((f) => ({ ...f, dropoffLocationId: v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("selectLocation")} />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {label(loc)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-navy-600">{t("pickup")}</Label>
        <div className="flex gap-2">
          <Input
            type="date"
            value={form.pickupDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, pickupDate: e.target.value }))
            }
            required
          />
          <Input
            type="time"
            value={form.pickupTime}
            onChange={(e) =>
              setForm((f) => ({ ...f, pickupTime: e.target.value }))
            }
            className="w-[7.5rem]"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-navy-600">{t("dropoff")}</Label>
        <div className="flex gap-2">
          <Input
            type="date"
            value={form.dropoffDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, dropoffDate: e.target.value }))
            }
            required
          />
          <Input
            type="time"
            value={form.dropoffTime}
            onChange={(e) =>
              setForm((f) => ({ ...f, dropoffTime: e.target.value }))
            }
            className="w-[7.5rem]"
            required
          />
        </div>
      </div>

      <div className="flex items-end">
        <Button type="submit" variant="gold" size="lg" className="w-full lg:w-auto">
          <Search className="h-4 w-4" />
          {t("search")}
        </Button>
      </div>
    </form>
  );
}
