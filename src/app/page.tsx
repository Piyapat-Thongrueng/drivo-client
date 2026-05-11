import type { Metadata } from "next";

import HeroSection from "@/components/landing/HeroSection";
import HowToBookSection from "@/components/landing/HowToBookSection";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Drive anywhere with Drivo — dependable vehicles, transparent pricing, and booking in minutes.",
};

export default function HomePage(): React.JSX.Element {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col">
        <HeroSection />
        <HowToBookSection />
      </main>
    </>
  );
}
