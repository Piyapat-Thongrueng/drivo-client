import type { Metadata } from "next"

import FleetCatalog from "@/components/customer/fleet/FleetCatalog"
import Footer from "@/components/layout/Footer"
import Navbar from "@/components/layout/Navbar"

export const metadata: Metadata = {
  title: "Our Fleet",
  description: "Browse all Drivo vehicles by country and start your booking.",
}

export default function FleetPage(): React.JSX.Element {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col bg-brand-gray-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <header className="mb-8 max-w-2xl">
            <h1 className="headline-2 text-brand-gray-900">Our Fleet</h1>
            <p className="body-1 mt-3 text-brand-gray-700">
              Explore every vehicle in our network. Filter by the country you plan
              to visit, then book your trip from the home page search bar.
            </p>
          </header>

          <FleetCatalog />
        </div>
      </main>
      <Footer />
    </>
  )
}
