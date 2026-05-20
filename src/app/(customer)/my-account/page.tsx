import type { Metadata } from "next"

import MyBookingsClient from "@/components/customer/bookings/MyBookingsClient"

export const metadata: Metadata = {
  title: "My Bookings",
  description: "View and manage your Drivo rental reservations.",
}

export default function MyAccountPage(): React.JSX.Element {
  return <MyBookingsClient />
}
