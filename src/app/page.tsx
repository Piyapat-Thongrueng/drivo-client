import type { Metadata } from "next";

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
      <main className="flex flex-1 flex-col">
        <HeroSection />
        <VehicleSearchBar />
        <WhyChooseDrivo />
        <GlobalPresence />
      </main>
      <Footer />
    </>
  );
}
