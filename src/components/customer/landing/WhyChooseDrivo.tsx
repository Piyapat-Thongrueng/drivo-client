import { ShieldCheck, Headset, Tag } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// --- Types ---

interface FeatureCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

// --- Data ---

// Add or remove cards here without touching any JSX.
const FEATURE_CARDS: readonly FeatureCard[] = [
  {
    icon: ShieldCheck,
    title: "Ultimate Reliability",
    description:
      "Every vehicle in our fleet undergoes a rigorous 50-point inspection before every single rental.",
  },
  {
    icon: Headset,
    title: "24/7 Expert Support",
    description:
      "Our dedicated travel team is available around the clock to assist you with any questions or roadside needs.",
  },
  {
    icon: Tag,
    title: "No Hidden Fees",
    description:
      "What you see is what you pay. We pride ourselves on transparent pricing and clear insurance policies.",
  },
] as const;

// --- Sub-components ---

interface FeatureCardItemProps {
  card: FeatureCard;
}

function FeatureCardItem({ card }: FeatureCardItemProps): React.JSX.Element {
  const Icon = card.icon;

  return (
    <li className="flex flex-col items-center rounded-2xl border border-brand-gray-100 bg-brand-white p-8 text-center">
      {/* Icon circle */}
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-red-50">
        <Icon className="h-7 w-7 text-brand-red-200" aria-hidden />
      </div>

      <h3 className="headline-4 mt-6 text-brand-gray-900">{card.title}</h3>

      <p className="body-3 mt-3 max-w-xs text-brand-gray-700">
        {card.description}
      </p>
    </li>
  );
}

// --- Main component ---

export default function WhyChooseDrivo(): React.JSX.Element {
  return (
    <section
      aria-labelledby="why-choose-heading"
      className="bg-brand-gray-50 px-4 pt-16 pb-8 sm:px-6 sm:pt-20 sm:pb-10 lg:px-8"
    >
      {/* Heading block */}
      <div className="mx-auto max-w-2xl text-center">
        <h2
          id="why-choose-heading"
          className="headline-2 text-brand-gray-900"
        >
          Why Choose Drivo
        </h2>

        {/* Red underline accent — decorative */}
        <div
          className="mx-auto mt-3 h-1 w-12 rounded-full bg-brand-red-200"
          aria-hidden
        />
      </div>

      {/* Card grid: 1 col → 3 col on large screens */}
      <ul className="mx-auto mt-12 grid max-w-5xl list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURE_CARDS.map((card) => (
          <FeatureCardItem key={card.title} card={card} />
        ))}
      </ul>
    </section>
  );
}
