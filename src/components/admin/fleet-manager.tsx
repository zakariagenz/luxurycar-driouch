"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  Car,
  CarCategory,
  CarStatus,
  FuelType,
  Transmission,
} from "@/lib/types";
import { carService } from "@/lib/booking-service";
import { formatDualPrice } from "@/lib/currency";

const emptyForm = (): Omit<Car, "id"> => ({
  make: "",
  model: "",
  year: new Date().getFullYear(),
  licensePlate: "",
  category: "economy",
  transmission: "automatic",
  fuelType: "diesel",
  seats: 5,
  bags: 2,
  dailyRateMad: 300,
  status: "available",
  imageUrl:
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
  features: ["A/C"],
  description: "",
});

const statusVariant: Record<
  CarStatus,
  "success" | "warning" | "info" | "secondary"
> = {
  available: "success",
  rented: "info",
  maintenance: "warning",
};

interface FleetManagerProps {
  cars: Car[];
  onChange: () => void;
}

export function FleetManager({ cars, onChange }: FleetManagerProps) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setOpen(true);
  };

  const openEdit = (car: Car) => {
    setEditingId(car.id);
    setForm({
      make: car.make,
      model: car.model,
      year: car.year,
      licensePlate: car.licensePlate,
      category: car.category,
      transmission: car.transmission,
      fuelType: car.fuelType,
      seats: car.seats,
      bags: car.bags,
      dailyRateMad: car.dailyRateMad,
      status: car.status,
      imageUrl: car.imageUrl,
      features: car.features,
      description: car.description,
    });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await carService.update(editingId, form);
      } else {
        await carService.create(form);
      }
      setOpen(false);
      onChange();
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (id: string, status: CarStatus) => {
    await carService.setStatus(id, status);
    onChange();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="gold" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add vehicle
        </Button>
      </div>

      <div className="overflow-x-auto border border-navy-100 bg-white">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-navy-100 bg-navy-50/80 text-xs uppercase tracking-wider text-navy-500">
            <tr>
              <th className="px-4 py-3 font-medium">Vehicle</th>
              <th className="px-4 py-3 font-medium">Plate</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Daily rate</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50">
            {cars.map((car) => (
              <tr key={car.id} className="hover:bg-navy-50/40">
                <td className="px-4 py-3">
                  <p className="font-medium text-navy-900">
                    {car.make} {car.model}
                  </p>
                  <p className="text-xs text-navy-500">
                    {car.year} · {car.transmission} · {car.fuelType}
                  </p>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{car.licensePlate}</td>
                <td className="px-4 py-3 capitalize">{car.category}</td>
                <td className="px-4 py-3">{formatDualPrice(car.dailyRateMad)}</td>
                <td className="px-4 py-3">
                  <Select
                    value={car.status}
                    onValueChange={(v) => setStatus(car.id, v as CarStatus)}
                  >
                    <SelectTrigger className="h-8 w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant[car.status]} className="capitalize">
                      {car.status}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => openEdit(car)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit vehicle" : "Add vehicle"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Make</Label>
              <Input
                value={form.make}
                onChange={(e) => setForm({ ...form, make: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Model</Label>
              <Input
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Year</Label>
              <Input
                type="number"
                value={form.year}
                onChange={(e) =>
                  setForm({ ...form, year: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>License plate</Label>
              <Input
                value={form.licensePlate}
                onChange={(e) =>
                  setForm({ ...form, licensePlate: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Daily rate (MAD)</Label>
              <Input
                type="number"
                value={form.dailyRateMad}
                onChange={(e) =>
                  setForm({ ...form, dailyRateMad: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm({ ...form, category: v as CarCategory })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Transmission</Label>
              <Select
                value={form.transmission}
                onValueChange={(v) =>
                  setForm({ ...form, transmission: v as Transmission })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fuel</Label>
              <Select
                value={form.fuelType}
                onValueChange={(v) =>
                  setForm({ ...form, fuelType: v as FuelType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="essence">Essence</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" onClick={save} disabled={saving || !form.make || !form.model}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
