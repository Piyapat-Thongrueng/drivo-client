import axios, { isAxiosError } from "axios";
import type { SupabaseClient } from "@supabase/supabase-js";

import { publicApiUrl } from "@/lib/api/base-url";

/** Matches `user_role` enum on the server. */
export type AppUserRole = "user" | "branch_staff" | "super_admin";

export interface LoginResult {
  role: AppUserRole;
  /** Where the Next.js app should send this user after login (from API). */
  defaultPath: string;
  profile: unknown;
}

const INVALID_CREDENTIALS_MESSAGE =
  "Invalid user credentials or user not found.";

/**
 * After Supabase accepts email/password, call our API to load the app profile
 * and learn the user's role + default redirect path.
 */
export async function signInWithBackend(
  supabase: SupabaseClient,
  email: string,
  password: string,
): Promise<LoginResult> {
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError || !authData.session?.access_token) {
    throw new Error(INVALID_CREDENTIALS_MESSAGE);
  }

  const token = authData.session.access_token;

  try {
    const { data } = await axios.post<{
      success: boolean;
      message?: string;
      data?: {
        profile: unknown;
        role: AppUserRole;
        branchId: number | null;
        defaultPath: string;
      };
    }>(
      publicApiUrl("/api/auth/login"),
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const payload = data.data;
    if (!data.success || !payload?.role || !payload.defaultPath) {
      throw new Error(data.message ?? "Login failed. Please try again.");
    }

    return {
      role: payload.role,
      defaultPath: payload.defaultPath,
      profile: payload.profile,
    };
  } catch (err) {
    if (isAxiosError(err)) {
      const status = err.response?.status;
      const serverMsg = (
        err.response?.data as { message?: string } | undefined
      )?.message;
      const lower = (serverMsg ?? "").toLowerCase();

      if (status === 401) {
        if (
          lower.includes("profile") ||
          lower.includes("registration") ||
          lower.includes("complete")
        ) {
          throw new Error(
            "Your account is not set up in the app. Please complete registration first.",
          );
        }
        throw new Error(INVALID_CREDENTIALS_MESSAGE);
      }

      throw new Error(
        serverMsg?.trim() ?? "Could not reach the server. Try again later.",
      );
    }
    throw err;
  }
}
