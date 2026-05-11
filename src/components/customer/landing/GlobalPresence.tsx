import Image from "next/image";

interface CityCard {
  readonly name: string;
  readonly description: string;
  readonly imageSrc: string;
  readonly imageAlt: string;
}

const CITY_CARDS: readonly CityCard[] = [
  {
    name: "Bangkok",
    description:
      "Experience the vibrant culture and modern luxury of Thailand's capital.",
    imageSrc: "/cities/Bangkok.png",
    imageAlt: "Bangkok skyline and river at dusk",
  },
  {
    name: "Tokyo",
    description:
      "Navigate the neon-lit streets and timeless traditions of Japan.",
    imageSrc: "/cities/Tokyo.png",
    imageAlt: "Tokyo cityscape at night with tower lights",
  },
  {
    name: "London",
    description:
      "Discover the historic landmarks and cosmopolitan charm of the United Kingdom.",
    imageSrc: "/cities/London.png",
    imageAlt: "London skyline with historic architecture along the river",
  },
] as const;

interface CityCardItemProps {
  card: CityCard;
}

function CityCardItem({ card }: CityCardItemProps): React.JSX.Element {
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl bg-brand-white shadow-[0_4px_24px_rgba(58,59,70,0.08)] ring-1 ring-brand-gray-100/80">
      <div className="relative aspect-video w-full shrink-0">
        <Image
          src={card.imageSrc}
          alt={card.imageAlt}
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <h3 className="headline-3 text-brand-gray-900">{card.name}</h3>
        <p className="body-2 mt-3 text-brand-gray-700">{card.description}</p>
      </div>
    </li>
  );
}

export default function GlobalPresence(): React.JSX.Element {
  return (
    <section
      aria-labelledby="global-presence-heading"
      className="bg-brand-gray-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <header className="max-w-2xl text-left">
          <h2
            id="global-presence-heading"
            className="text-3xl font-bold tracking-tight text-brand-gray-900 sm:text-4xl"
          >
            Global Presence
          </h2>
          <p className="body-1 mt-3 text-brand-gray-700 sm:mt-4">
            Explore our branches across the world&apos;s most vibrant cities.
          </p>
        </header>

        <ul className="mt-10 grid list-none grid-cols-1 gap-6 sm:mt-12 md:grid-cols-2 md:gap-8 lg:mt-14 lg:grid-cols-3 lg:gap-8">
          {CITY_CARDS.map((card) => (
            <CityCardItem key={card.name} card={card} />
          ))}
        </ul>
      </div>
    </section>
  );
}
