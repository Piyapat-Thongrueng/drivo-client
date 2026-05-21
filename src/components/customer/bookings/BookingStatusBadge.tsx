import type { BookingStatus } from "@/types/booking"

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  pending_approval: {
    label: "Awaiting approval",
    className: "bg-amber-100 text-amber-800",
  },
  approved: {
    label: "Approved",
    className: "bg-blue-100 text-blue-800",
  },
  pending_payment: {
    label: "Pending payment",
    className: "bg-red-100 text-brand-red-200",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-green-100 text-green-800",
  },
  active: {
    label: "Active",
    className: "bg-green-100 text-green-800",
  },
  completed: {
    label: "Completed",
    className: "bg-brand-gray-100 text-brand-gray-700",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-brand-gray-100 text-brand-gray-500",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800",
  },
}

interface BookingStatusBadgeProps {
  status: BookingStatus
}

/** ป้ายสถานะการจอง — สีและข้อความตาม booking.status */
export default function BookingStatusBadge({
  status,
}: BookingStatusBadgeProps): React.JSX.Element {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={`body-3 inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  )
}
