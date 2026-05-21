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
  {
    name: "New York",
    description:
      "Cruise past iconic towers and the energy of America's greatest metropolis.",
    imageSrc: "/cities/NY.jpg",
    imageAlt: "Lower Manhattan skyline and One World Trade Center at golden hour",
  },
  {
    name: "Osaka",
    description:
      "Dive into street food, canal walks, and the electric heart of Kansai.",
    imageSrc: "/cities/Osaka.png",
    imageAlt: "Dotonbori canal in Osaka with famous Glico sign and neon billboards",
  },
  {
    name: "Taipei",
    description:
      "Watch sunset glow over Taipei 101 and explore night markets after dark.",
    imageSrc: "/cities/Taipei.jpg",
    imageAlt: "Taipei skyline with Taipei 101 tower at sunset",
  },
] as const;

/** ทำสำเนาสองชุดเพื่อเลื่อนวนลูปไม่สะดุด */
const MARQUEE_CITIES = [...CITY_CARDS, ...CITY_CARDS] as const;

interface CityCardItemProps {
  card: CityCard;
}

function CityCardItem({ card }: CityCardItemProps): React.JSX.Element {
  return (
    <article className="flex w-[min(100%,20rem)] shrink-0 flex-col overflow-hidden rounded-2xl bg-brand-white shadow-[0_4px_24px_rgba(58,59,70,0.08)] ring-1 ring-brand-gray-100/80 sm:w-80">
      <div className="relative aspect-video w-full shrink-0">
        <Image
          src={card.imageSrc}
          alt={card.imageAlt}
          fill
          sizes="320px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <h3 className="headline-3 text-brand-gray-900">{card.name}</h3>
        <p className="body-2 mt-3 text-brand-gray-700">{card.description}</p>
      </div>
    </article>
  );
}

export default function GlobalPresence(): React.JSX.Element {
  return (
    <section
      aria-labelledby="global-presence-heading"
      className="overflow-hidden bg-brand-gray-50 px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pb-24"
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
      </div>

      {/* เลื่อนไปทางซ้าย — วนลูปไม่สิ้นสุด */}
      <div
        className="relative mt-10 sm:mt-12 lg:mt-14"
        aria-label="Cities we serve"
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-linear-to-r from-brand-gray-50 to-transparent sm:w-16"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-brand-gray-50 to-transparent sm:w-16"
          aria-hidden
        />

        <div className="overflow-hidden">
          <div className="global-presence-marquee flex w-max gap-6 px-4 sm:gap-8 sm:px-6 lg:px-8">
            {MARQUEE_CITIES.map((card, index) => (
              <CityCardItem
                key={`${card.name}-${index}`}
                card={card}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
