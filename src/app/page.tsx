import type { Metadata } from "next";

import HomeScrollToSearch from "@/components/customer/landing/HomeScrollToSearch";
import HeroSection from "@/components/customer/landing/HeroSection";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VehicleSearchBar from "@/components/customer/landing/VehicleSearchBar";
import WhyChooseDrivo from "@/components/customer/landing/WhyChooseDrivo";
import GlobalPresence from "@/components/customer/landing/GlobalPresence";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Drive anywhere with Drivo — dependable vehicles, transparent pricing, and booking in minutes.",
};

export default function HomePage(): React.JSX.Element {
  return (
    <>
      <Navbar />
      <HomeScrollToSearch />
      <main className="flex flex-1 flex-col">
        <HeroSection />
        <section
          id="vehicle-search"
          className="scroll-mt-20 sm:scroll-mt-18"
          aria-label="Search and filter vehicles"
        >
          <VehicleSearchBar />
        </section>
        <WhyChooseDrivo />
        <GlobalPresence />
      </main>
      <Footer />
    </>
  );
}
