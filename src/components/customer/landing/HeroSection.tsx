"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";

const AUTO_ADVANCE_MS = 6000;

const HERO_SLIDES = [
  {
    src: "/herosection/car1.jpg",
    alt: "Drivo rental vehicle — scenic drive",
  },
  {
    src: "/herosection/car2.jpg",
    alt: "Drivo rental vehicle — open road",
  },
  {
    src: "/herosection/car3.jpg",
    alt: "Drivo rental vehicle — city and coast",
  },
] as const;

/**
 * Marketing hero with rotating background images (carousel), optional dot controls,
 * and crossfade between slides. Autoplay pauses when the user prefers reduced motion.
 */
export default function HeroSection(): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback((index: number): void => {
    const n = HERO_SLIDES.length;
    setActiveIndex(((index % n) + n) % n);
  }, []);

  const advance = useCallback((): void => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let intervalId: number | undefined;

    function startAutoplay(): void {
      if (mq.matches) {
        return;
      }
      intervalId = window.setInterval(advance, AUTO_ADVANCE_MS);
    }

    function stopAutoplay(): void {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
        intervalId = undefined;
      }
    }

    function syncAutoplay(): void {
      stopAutoplay();
      startAutoplay();
    }

    syncAutoplay();
    mq.addEventListener("change", syncAutoplay);
    return () => {
      mq.removeEventListener("change", syncAutoplay);
      stopAutoplay();
    };
  }, [advance]);

  return (
    <section
      className="relative isolate w-full overflow-hidden bg-brand-gray-900"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 z-0">
        {HERO_SLIDES.map((slide, index) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={index === activeIndex ? slide.alt : ""}
            fill
            priority={index === 0}
            sizes="100vw"
            className={`object-cover object-[center_65%] transition-opacity duration-700 ease-out motion-reduce:transition-none sm:object-[center_60%] md:object-center ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div
          className="absolute inset-0 bg-black/50 md:bg-black/45"
          aria-hidden
        />
      </div>

      <div className="pointer-events-none relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center sm:min-h-[calc(100svh-4.5rem)] sm:px-6 sm:py-20 md:py-24 lg:px-8">
        <h1
          id="hero-heading"
          className="max-w-4xl text-balance text-4xl font-bold leading-[1.12] tracking-tight text-brand-white sm:text-5xl sm:leading-[1.1] md:text-6xl md:leading-tight lg:text-7xl"
        >
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

        <div
          className="pointer-events-auto mt-6 flex items-center justify-center gap-2 sm:mt-7"
          role="radiogroup"
          aria-label="Hero images"
        >
          {HERO_SLIDES.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              role="radio"
              aria-checked={index === activeIndex}
              aria-label={`Show image ${index + 1} of ${HERO_SLIDES.length}`}
              className={`h-2.5 w-2.5 rounded-full transition-transform duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                index === activeIndex
                  ? "scale-125 bg-white"
                  : "bg-white/45 hover:bg-white/75"
              }`}
              onClick={() => goTo(index)}
            />
          ))}
        </div>

        <div className="pointer-events-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4 md:mt-12">
          <Button
            href="#vehicle-search"
            variant="primary"
            size="lg"
            className="w-full min-w-44 sm:w-auto sm:min-w-42"
          >
            Book Now
          </Button>
          <Button
            href="#vehicle-search"
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
