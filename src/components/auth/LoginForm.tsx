"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Headset,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/auth-context";
import {
  flattenZodFieldErrors,
  loginFormSchema,
} from "@/lib/validation/auth-forms";
import LoginSuccessModal from "@/components/auth/LoginSuccessModal";

// --- Sub-components ---

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function EmailInput({
  value,
  onChange,
  error,
}: EmailInputProps): React.JSX.Element {
  const invalid = Boolean(error);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="email" className="body-3 font-semibold text-brand-gray-900">
        Email Address
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-500">
          <Mail className="h-4 w-4" aria-hidden />
        </span>
        <input
          id="email"
          type="email"
          value={value}
          placeholder="name@example.com"
          autoComplete="email"
          maxLength={254}
          aria-invalid={invalid}
          aria-describedby={invalid ? "email-error" : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={`body-2 w-full rounded-xl border bg-brand-white py-3 pl-10 pr-4 text-brand-gray-900 placeholder:text-brand-gray-500 transition-colors focus:outline-none focus:ring-1 ${
            invalid
              ? "border-red-400 focus:border-red-500 focus:ring-red-500"
              : "border-brand-gray-300 focus:border-brand-gray-700 focus:ring-brand-gray-700"
          }`}
        />
      </div>
      {error ? (
        <p id="email-error" className="body-3 text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function PasswordInput({
  value,
  onChange,
  error,
}: PasswordInputProps): React.JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const invalid = Boolean(error);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor="password" className="body-3 font-semibold text-brand-gray-900">
          Password
        </label>
        <Link
          href="/"
          className="body-3 font-semibold text-brand-red-200 hover:underline"
        >
          Forgot?
        </Link>
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-500">
          <Lock className="h-4 w-4" aria-hidden />
        </span>
        <input
          id="password"
          type={isVisible ? "text" : "password"}
          value={value}
          placeholder="••••••••"
          autoComplete="current-password"
          maxLength={128}
          aria-invalid={invalid}
          aria-describedby={invalid ? "password-error" : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={`body-2 w-full rounded-xl border bg-brand-white py-3 pl-10 pr-12 text-brand-gray-900 placeholder:text-brand-gray-500 transition-colors focus:outline-none focus:ring-1 ${
            invalid
              ? "border-red-400 focus:border-red-500 focus:ring-red-500"
              : "border-brand-gray-300 focus:border-brand-gray-700 focus:ring-brand-gray-700"
          }`}
        />
        <button
          type="button"
          aria-label={isVisible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-500 hover:text-brand-gray-900"
          onClick={() => setIsVisible((v) => !v)}
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4" aria-hidden />
          ) : (
            <Eye className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
      {error ? (
        <p id="password-error" className="body-3 text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function TrustBadges(): React.JSX.Element {
  return (
    <div className="flex items-center justify-center gap-8">
      <span className="flex items-center gap-1.5 body-3 text-brand-gray-500">
        <ShieldCheck className="h-4 w-4 text-brand-gray-400" aria-hidden />
        Secure AES-256
      </span>
      <span className="flex items-center gap-1.5 body-3 text-brand-gray-500">
        <Headset className="h-4 w-4 text-brand-gray-400" aria-hidden />
        24/7 Support
      </span>
    </div>
  );
}

function Divider(): React.JSX.Element {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-brand-gray-100" />
      <span className="body-3 text-brand-gray-400">OR</span>
      <div className="h-px flex-1 bg-brand-gray-100" />
    </div>
  );
}

// --- Main Component ---

export default function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  /** แสดง modal สำเร็จ (เฉพาะ role user) */
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/");
  /** Prevents double submit before React disables the button. */
  const loginInFlightRef = useRef(false);

  const formValues = useMemo(() => ({ email, password }), [email, password]);

  const canSubmit = useMemo(() => {
    return loginFormSchema.safeParse(formValues).success;
  }, [formValues]);

  function updateEmail(v: string): void {
    setEmail(v);
    setFieldErrors((p) => {
      const n = { ...p };
      delete n.email;
      return n;
    });
    setSubmitError(null);
  }

  function updatePassword(v: string): void {
    setPassword(v);
    setFieldErrors((p) => {
      const n = { ...p };
      delete n.password;
      return n;
    });
    setSubmitError(null);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    if (loginInFlightRef.current) {
      return;
    }
    setSubmitError(null);

    const parsed = loginFormSchema.safeParse(formValues);
    if (!parsed.success) {
      setFieldErrors(flattenZodFieldErrors(parsed.error));
      return;
    }

    setFieldErrors({});
    loginInFlightRef.current = true;
    setIsLoading(true);
    try {
      const result = await signIn(parsed.data.email, parsed.data.password);
      if (result.role === "user") {
        // user role → แสดง modal countdown ก่อน redirect ไปหน้าหลัก
        setRedirectPath("/");
        setShowSuccessModal(true);
      } else {
        // super_admin / branch_staff → redirect ทันที ไม่ต้อง modal
        router.push(result.defaultPath);
      }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Invalid user credentials or user not found.";
      setSubmitError(message);
    } finally {
      loginInFlightRef.current = false;
      setIsLoading(false);
    }
  }

  const handleModalConfirm = useCallback((): void => {
    router.push(redirectPath);
  }, [router, redirectPath]);

  return (
    <>
      {/* Modal ขึ้นด้านบนสุด — แสดงหลัง sign in สำเร็จ (role user) */}
      {showSuccessModal && (
        <LoginSuccessModal onConfirm={handleModalConfirm} />
      )}
    <div className="w-full rounded-2xl border border-brand-gray-100 bg-brand-white px-6 py-10 shadow-sm sm:px-10">
      {/* Heading */}
      <div className="mb-8 text-center">
        <h1 className="headline-3 text-brand-gray-900">Welcome Back</h1>
        <p className="body-3 mt-1.5 text-brand-gray-500">
          Sign in to manage your bookings and explore new journeys.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {submitError ? (
          <p
            className="body-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 font-medium text-red-600"
            role="alert"
          >
            {submitError}
          </p>
        ) : null}
        <EmailInput value={email} onChange={updateEmail} error={fieldErrors.email} />
        <PasswordInput
          value={password}
          onChange={updatePassword}
          error={fieldErrors.password}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!canSubmit || isLoading}
          className="mt-1 w-full justify-center gap-2 rounded-xl font-bold"
        >
          {isLoading ? "Signing in…" : "Sign In"}
          {!isLoading ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
        </Button>
      </form>

      <div className="mt-6 flex flex-col gap-6">
        <Divider />

        <p className="body-3 text-center text-brand-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand-red-200 hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>

      {/* Trust badges */}
      <div className="mt-8 border-t border-brand-gray-100 pt-6">
        <TrustBadges />
      </div>
    </div>
    </>
  );
}
