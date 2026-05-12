import axios, { isAxiosError } from "axios";
import { publicApiUrl } from "@/lib/api/base-url";
import {
  isAuthWeakPasswordError,
  type AuthError,
  type SupabaseClient,
} from "@supabase/supabase-js";

export interface RegisterProfileInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface RegisterProfileResult {
  profile: unknown;
}

/** Supabase GoTrue codes when the identity/email already exists — sign-in is the right recovery. */
const EXISTING_ACCOUNT_CODES = new Set([
  "email_exists",
  "user_already_exists",
  "identity_already_exists",
  "phone_exists",
]);

function messageSuggestsExistingAccount(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("already registered") ||
    m.includes("user already exists") ||
    m.includes("email address is already registered") ||
    m.includes("already exists") ||
    m.includes("email already")
  );
}

/**
 * After failed signUp, decide whether to try password sign-in (existing confirmed user).
 * Handles HTTP 422 + error codes where message may be empty (browser only shows "422 ()").
 */
function shouldTrySignInAfterSignUpError(error: AuthError | undefined): boolean {
  if (!error) {
    return false;
  }
  if (isAuthWeakPasswordError(error)) {
    return false;
  }

  const code =
    typeof error.code === "string" ? error.code.toLowerCase() : "";
  if (EXISTING_ACCOUNT_CODES.has(code)) {
    return true;
  }

  if (messageSuggestsExistingAccount(error.message ?? "")) {
    return true;
  }

  // Unprocessable entity from GoTrue — often duplicate signup / validation; try sign-in unless weak password (handled above).
  if (error.status === 422) {
    return true;
  }

  return false;
}

async function signInAndGetAccessToken(
  supabase: SupabaseClient,
  email: string,
  password: string,
): Promise<string> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session?.access_token) {
    throw new Error(
      "User already exists, please try again with different email",
    );
  }

  return data.session.access_token;
}

async function getAccessTokenForRegister(
  supabase: SupabaseClient,
  email: string,
  password: string,
  signUpResult: Awaited<ReturnType<SupabaseClient["auth"]["signUp"]>>,
): Promise<string> {
  const fromSignUp = signUpResult.data.session?.access_token;
  if (fromSignUp) {
    return fromSignUp;
  }

  const authErr = signUpResult.error as AuthError | undefined;

  if (authErr && isAuthWeakPasswordError(authErr)) {
    throw new Error(authErr.message);
  }

  if (authErr && shouldTrySignInAfterSignUpError(authErr)) {
    return signInAndGetAccessToken(supabase, email, password);
  }

  if (authErr?.message) {
    throw new Error(authErr.message);
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }
  const token = data.session?.access_token;
  if (!token) {
    throw new Error(
      "No session after sign-up. If email confirmation is enabled in Supabase, confirm your email first.",
    );
  }
  return token;
}

/**
 * One Supabase sign-up (or sign-in if email already exists), then one POST /api/auth/register.
 * Backend register is idempotent (updates existing row instead of error on duplicate).
 */
export async function registerWithProfile(
  supabase: SupabaseClient,
  input: RegisterProfileInput,
): Promise<RegisterProfileResult> {
  const { email, password, firstName, lastName, phone } = input;

  const signUpResult = await supabase.auth.signUp({
    email,
    password,
  });

  const accessToken = await getAccessTokenForRegister(
    supabase,
    email,
    password,
    signUpResult,
  );

  const body: { firstName: string; lastName: string; phone?: string } = {
    firstName,
    lastName,
  };
  if (phone?.trim()) {
    body.phone = phone.trim();
  }

  try {
    const { data } = await axios.post<{
      success: boolean;
      message?: string;
      data?: unknown;
    }>(
      publicApiUrl("/api/auth/register"),
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!data.success || data.data === undefined) {
      throw new Error(data.message ?? "Could not create your profile.");
    }

    return { profile: data.data };
  } catch (err) {
    if (isAxiosError(err)) {
      const status = err.response?.status;
      const msg =
        (err.response?.data as { message?: string } | undefined)?.message ??
        err.message;

      if (status === 400 || status === 401) {
        throw new Error(
          `${msg} If your account was created, try submitting the form again to finish registration.`,
        );
      }
      if (status === 422) {
        throw new Error(
          msg?.trim()
            ? msg
            : "ข้อมูลไม่ถูกต้องหรือบัญชีนี้มีอยู่แล้ว — ลองเข้าสู่ระบบแทน",
        );
      }
      throw new Error(
        `${msg} You can try again — if your account was created, the next submit will complete your profile.`,
      );
    }
    throw err;
  }
}
