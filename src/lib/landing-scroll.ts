/** id ของส่วน Search and Filter บนหน้า Home */
export const VEHICLE_SEARCH_SECTION_ID = "vehicle-search"

/** เลื่อนหน้าจอไปยัง Search bar (ใช้กับ Navbar / Hero) */
export function scrollToVehicleSearch(): void {
  const el = document.getElementById(VEHICLE_SEARCH_SECTION_ID)
  if (!el) return
  el.scrollIntoView({ behavior: "smooth", block: "start" })
}

/** เลื่อนไปด้านบนสุดของหน้า (ใช้กับ Footer) */
export function scrollToPageTop(): void {
  window.scrollTo({ top: 0, behavior: "smooth" })
}
