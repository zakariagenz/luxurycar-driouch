import { Plane, Building2, Hotel } from "lucide-react";
import { LOCATIONS } from "@/lib/mock-data";

export function LocationsSection() {
  const airports = LOCATIONS.filter((l) => l.type === "airport");
  const others = LOCATIONS.filter((l) => l.type !== "airport");

  return (
    <section id="locations" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">
            Morocco coverage
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold text-navy-900">
            Pick-up anywhere that matters
          </h2>
          <p className="mt-3 text-navy-600">
            Major airports, our Driouch agency, city centers, and hotel delivery
            nationwide.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-navy-500">
              <Plane className="h-4 w-4 text-gold-600" />
              Airports
            </h3>
            <ul className="divide-y divide-navy-100 border-y border-navy-100">
              {airports.map((loc) => (
                <li
                  key={loc.id}
                  className="flex items-center justify-between py-3.5"
                >
                  <div>
                    <p className="font-medium text-navy-900">{loc.name}</p>
                    <p className="text-xs text-navy-500">{loc.city}</p>
                  </div>
                  <span className="text-xs text-navy-500">
                    {loc.deliveryFeeMad === 0
                      ? "Included"
                      : `+${loc.deliveryFeeMad} MAD`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-navy-500">
              <Building2 className="h-4 w-4 text-gold-600" />
              Agency & delivery
            </h3>
            <ul className="divide-y divide-navy-100 border-y border-navy-100">
              {others.map((loc) => (
                <li
                  key={loc.id}
                  className="flex items-center justify-between py-3.5"
                >
                  <div className="flex items-start gap-2">
                    {loc.type === "hotel" ? (
                      <Hotel className="mt-0.5 h-4 w-4 text-terracotta-500" />
                    ) : null}
                    <div>
                      <p className="font-medium text-navy-900">{loc.name}</p>
                      <p className="text-xs text-navy-500">{loc.city}</p>
                    </div>
                  </div>
                  <span className="text-xs text-navy-500">
                    {loc.deliveryFeeMad === 0
                      ? "Free"
                      : `+${loc.deliveryFeeMad} MAD`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
