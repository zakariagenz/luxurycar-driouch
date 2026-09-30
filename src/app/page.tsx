import { SiteHeader } from "@/components/landing/site-header";
import { HeroSection } from "@/components/landing/hero-section";
import { FleetCatalog } from "@/components/landing/fleet-catalog";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LocationsSection } from "@/components/landing/locations-section";
import { SiteFooter } from "@/components/landing/site-footer";

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <HeroSection />
      <FleetCatalog />
      <HowItWorks />
      <LocationsSection />
      <SiteFooter />
    </main>
  );
}
