import type { Metadata } from "next";
import "./globals.css";
import { BookingProvider } from "@/components/booking/booking-context";
import { BookingModal } from "@/components/booking/booking-modal";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";

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

const themeInitScript = `
(function(){
  try {
    var saved = localStorage.getItem('lcd_theme');
    var dark = saved === 'dark' || (saved !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen font-sans">
        <ThemeProvider>
          <LocaleProvider>
            <BookingProvider>
              {children}
              <BookingModal />
            </BookingProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
