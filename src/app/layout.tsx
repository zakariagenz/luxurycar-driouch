import type { Metadata } from "next";
import "./globals.css";
import { BookingProvider } from "@/components/booking/booking-context";
import { BookingModal } from "@/components/booking/booking-modal";

export const metadata: Metadata = {
  title: "LuxuryCar Driouch | Premium Car Rental Morocco",
  description:
    "Rent economy, SUV, and luxury cars across Morocco. Airport delivery at CMN, RAK, TNG, AGA, NDG & FEZ. Book online and confirm via WhatsApp.",
  keywords: [
    "car rental Morocco",
    "location voiture Driouch",
    "airport car rental CMN RAK",
    "luxury car hire Morocco",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        <BookingProvider>
          {children}
          <BookingModal />
        </BookingProvider>
      </body>
    </html>
  );
}
