"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listAdminBookings,
  type ListAdminBookingsParams,
} from "@/lib/api/admin-bookings";
import type { Booking } from "@/types/booking";

export function useAdminBookings(
  token: string,
  params: ListAdminBookingsParams = {},
) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setBookings([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await listAdminBookings(params, token);
      setBookings(data);
    } catch {
      setError("Failed to load bookings. Please try again.");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, params.status, params.page, params.limit]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(t);
  }, [load]);

  return { bookings, isLoading, error, refetch: load };
}
