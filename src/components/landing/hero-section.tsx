"use client";

import { SearchWidget } from "./search-widget";

export function HeroSection() {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden">
      {/* Full-bleed cinematic background */}
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80')",
        }}
        aria-hidden
      />
      <div className="hero-gradient absolute inset-0" />

      {/* Subtle animated gold line accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-4 pb-10 pt-28 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
        <div className="mb-8 max-w-3xl animate-fade-in-up">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-gold-400">
            Morocco · Premium Car Rental
          </p>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            LuxuryCar{" "}
            <span className="text-gold-400">Driouch</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
            Airport delivery across Morocco. Instant booking. Trusted local
            service from Driouch to Casablanca, Marrakech, and beyond.
          </p>
        </div>

        <div className="animate-fade-in [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
          <SearchWidget />
        </div>
      </div>
    </section>
  );
}
