# LuxuryCar Driouch

Modern car rental web app for a Moroccan agency — public booking flow + staff admin dashboard.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS** + Radix/Shadcn-style UI
- **Lucide React** icons
- **date-fns** for dates
- **Mock data service** (swap for Supabase later)

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Staff desk: [http://localhost:3000/admin](http://localhost:3000/admin).

## Features

- Full-bleed hero with quick search (locations, dates/times)
- Fleet catalog with category / gearbox / fuel filters
- 3-step booking modal → confirmation + WhatsApp deep link
- Admin: metrics, calendar, bookings (approve / times / WhatsApp), fleet CRUD
- MAD primary pricing with EUR reference (`src/lib/currency.ts`)
- i18n-ready location names (EN/FR/AR) + RTL CSS hook

## WhatsApp

Set the agency number in `src/lib/whatsapp.ts` → `BUSINESS_WHATSAPP` (digits only, e.g. `2126XXXXXXXX`).

## Supabase later

Replace `src/lib/booking-service.ts` implementations; keep the same TypeScript interfaces in `src/lib/types.ts`.
