"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/auth-context";
import { publicApiUrl } from "@/lib/api/base-url";

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  branchId: number | null;
}

interface UseProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
}

/**
 * Fetches the current user's app profile from GET /api/auth/me.
 * Waits until the Supabase session is ready before making the request.
 */
export function useProfile(): UseProfileResult {
  const { session, isInitialized } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait until AuthContext has finished reading the session from cookies.
    if (!isInitialized) return;

    const token = session?.access_token;

    if (!token) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    axios
      .get<{ success: boolean; data: UserProfile }>(
        publicApiUrl("/api/auth/me"),
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .then(({ data }) => {
        if (!cancelled) setProfile(data.data);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.access_token, isInitialized]);

  return { profile, isLoading };
}
