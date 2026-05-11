import Image from "next/image";

import { Button } from "@/components/ui/Button";

/**
 * Full-width marketing hero with optimized background image and overlay.
 * Height fills the viewport below the sticky header (see min-height calc).
 */
export default function HeroSection(): React.JSX.Element {
  return (
    <section
      className="relative isolate w-full overflow-hidden bg-brand-gray-900"
      aria-labelledby="hero-heading"
    >
      <Image
        src="/herosection/hero1.png"
        alt="Premium rental vehicle on a cobblestone street at sunset"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_65%] sm:object-[center_60%] md:object-center"
      />
      <div
        className="absolute inset-0 bg-black/50 md:bg-black/45"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center sm:min-h-[calc(100svh-4.5rem)] sm:px-6 sm:py-20 md:py-24 lg:px-8">
        <h1
          id="hero-heading"
          className="max-w-4xl text-balance text-4xl font-bold leading-[1.12] tracking-tight text-brand-white sm:text-5xl sm:leading-[1.1] md:text-6xl md:leading-tight lg:text-7xl"
        >
          {/* Narrow screens: four-line stack; sm+: two-line headline */}
          <span className="flex flex-col sm:hidden">
            <span>Drive</span>
            <span>Anywhere.</span>
            <span>Explore</span>
            <span>Everywhere.</span>
          </span>
          <span className="hidden sm:block">
            <span className="block md:inline md:after:content-['\00a0']">
              Drive Anywhere.
            </span>
            <span className="block md:inline">Explore Everywhere.</span>
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-pretty text-base font-normal leading-relaxed text-white/95 sm:mt-6 sm:text-lg md:mt-8 md:text-xl">
          Experience the freedom of the open road with dependable vehicles and
          transparent pricing.
        </p>

        <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4 md:mt-12">
          <Button
            href="/booking"
            variant="primary"
            size="lg"
            className="w-full min-w-44 sm:w-auto sm:min-w-42"
          >
            Book Now
          </Button>
          <Button
            href="#how-to-book"
            variant="secondary"
            size="lg"
            className="w-full min-w-44 sm:w-auto sm:min-w-42"
          >
            How to Book
          </Button>
        </div>
      </div>
    </section>
  );
}
