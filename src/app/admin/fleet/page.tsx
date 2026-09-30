"use client";

import { useCallback, useEffect, useState } from "react";
import { FleetManager } from "@/components/admin/fleet-manager";
import { carService } from "@/lib/booking-service";
import type { Car } from "@/lib/types";

export default function AdminFleetPage() {
  const [cars, setCars] = useState<Car[]>([]);

  const load = useCallback(async () => {
    setCars(await carService.getAll());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-navy-900">
          Fleet management
        </h1>
        <p className="mt-1 text-sm text-navy-500">
          Add, edit, and update vehicle availability status.
        </p>
      </div>
      <FleetManager cars={cars} onChange={load} />
    </div>
  );
}
