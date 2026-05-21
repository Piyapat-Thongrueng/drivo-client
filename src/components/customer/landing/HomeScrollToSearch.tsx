"use client"

import { useEffect } from "react"

import { scrollToVehicleSearch, VEHICLE_SEARCH_SECTION_ID } from "@/lib/landing-scroll"

/** เลื่อนไป Search bar เมื่อเปิดหน้า Home ด้วย hash #vehicle-search */
export default function HomeScrollToSearch(): null {
  useEffect(() => {
    function scrollIfTargetHash(): void {
      if (window.location.hash !== `#${VEHICLE_SEARCH_SECTION_ID}`) return
      window.setTimeout(() => scrollToVehicleSearch(), 50)
    }

    scrollIfTargetHash()
    window.addEventListener("hashchange", scrollIfTargetHash)
    return () => window.removeEventListener("hashchange", scrollIfTargetHash)
  }, [])

  return null
}
