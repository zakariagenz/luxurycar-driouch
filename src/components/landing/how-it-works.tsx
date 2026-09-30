import {
  CalendarCheck,
  MapPinned,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

const STEPS = [
  {
    icon: Smartphone,
    title: "Search & select",
    text: "Pick dates, location, and the car that fits your trip.",
  },
  {
    icon: MapPinned,
    title: "Airport or hotel delivery",
    text: "CMN, RAK, TNG, AGA, NDG, FEZ — or meet us at your hotel.",
  },
  {
    icon: CalendarCheck,
    title: "Confirm on WhatsApp",
    text: "Get your reference and chat directly with our team.",
  },
  {
    icon: ShieldCheck,
    title: "Drive with confidence",
    text: "Full coverage options, bilingual support, transparent MAD pricing.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-y border-navy-100 bg-navy-50/40 py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">
            Simple process
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold text-navy-900">
            Book in minutes
          </h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative">
              <span className="font-display text-5xl font-semibold text-navy-100">
                0{i + 1}
              </span>
              <step.icon className="mb-3 mt-2 h-6 w-6 text-gold-600" />
              <h3 className="font-display text-xl font-semibold text-navy-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-navy-600">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
