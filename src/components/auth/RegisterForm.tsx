"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Headset,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";

import { sanitizeInternalReturnUrl } from "@/lib/return-url";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/auth-context";
import {
  flattenZodFieldErrors,
  registerFormSchema,
} from "@/lib/validation/auth-forms";

// --- Types ---

interface FormFields {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  agreedToTerms: boolean;
}

// --- Sub-components (keep JSX small and readable) ---

interface TextInputProps {
  id: string;
  label: string;
  type?: "text" | "email";
  placeholder: string;
  value: string;
  icon?: React.ReactNode;
  onChange: (value: string) => void;
  error?: string;
  maxLength?: number;
}

function TextInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  icon,
  onChange,
  error,
  maxLength,
}: TextInputProps): React.JSX.Element {
  const invalid = Boolean(error);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="body-3 font-semibold text-brand-gray-900">
        {label}
      </label>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-500">
            {icon}
          </span>
        ) : null}
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={type === "email" ? "email" : "off"}
          maxLength={maxLength}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={`body-2 w-full rounded-xl border bg-brand-white py-3 text-brand-gray-900 placeholder:text-brand-gray-500 transition-colors focus:outline-none focus:ring-1 ${
            invalid
              ? "border-red-400 focus:border-red-500 focus:ring-red-500"
              : "border-brand-gray-300 focus:border-brand-gray-700 focus:ring-brand-gray-700"
          } ${icon ? "pl-10 pr-4" : "px-4"}`}
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className="body-3 text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  hint,
  error,
}: PasswordInputProps): React.JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const invalid = Boolean(error);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="body-3 font-semibold text-brand-gray-900">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-500">
          <Lock className="h-4 w-4" aria-hidden />
        </span>
        <input
          id={id}
          type={isVisible ? "text" : "password"}
          value={value}
          placeholder="••••••••"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          aria-invalid={invalid}
          aria-describedby={
            invalid ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
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
        <p id={`${id}-error`} className="body-3 text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="body-3 text-brand-gray-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function TrustBadges(): React.JSX.Element {
  return (
    <div className="flex items-center justify-center gap-8 border-t border-brand-gray-100 pt-6">
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

// --- Main Form Component ---

export default function RegisterForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const { register } = useAuth();

  const [fields, setFields] = useState<FormFields>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    agreedToTerms: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<
    Record<keyof FormFields, string>
  >>({});

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  /** Blocks a second submit before React re-renders (double-click / Enter spam) → one register flow per click. */
  const registerInFlightRef = useRef(false);

  const canSubmit = useMemo(() => {
    return registerFormSchema.safeParse(fields).success;
  }, [fields]);

  function setField<K extends keyof FormFields>(
    key: K,
    value: FormFields[K],
  ): void {
    setFields((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setSubmitError(null);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    if (registerInFlightRef.current) {
      return;
    }
    setSubmitError(null);

    const parsed = registerFormSchema.safeParse(fields);
    if (!parsed.success) {
      setFieldErrors(
        flattenZodFieldErrors(parsed.error) as Partial<
          Record<keyof FormFields, string>
        >,
      );
      return;
    }

    setFieldErrors({});
    registerInFlightRef.current = true;
    setIsLoading(true);
    try {
      await register({
        email: parsed.data.email,
        password: parsed.data.password,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
      });
      // ถ้ามี returnUrl (มาจาก checkout guest flow) → กลับไปหน้านั้น
      // ถ้าไม่มี → ไปหน้า login (user ทั่วไป register แล้วให้ sign in)
      router.push(sanitizeInternalReturnUrl(returnUrl, "/login"));
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Something went wrong. Try again.";
      setSubmitError(message);
    } finally {
      registerInFlightRef.current = false;
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full rounded-2xl border border-brand-gray-100 bg-brand-white px-6 py-10 shadow-sm sm:px-10">
      {/* Heading */}
      <div className="mb-8 text-center">
        <h1 className="headline-3 text-brand-gray-900">Create Account</h1>
        <p className="body-3 mt-1.5 text-brand-gray-500">
          Join Drivo and access exclusive deals.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {submitError ? (
          <p
            className="body-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800"
            role="alert"
          >
            {submitError}
          </p>
        ) : null}
        <TextInput
          id="firstName"
          label="First Name"
          placeholder="John"
          value={fields.firstName}
          maxLength={100}
          icon={<User className="h-4 w-4" aria-hidden />}
          onChange={(v) => setField("firstName", v)}
          error={fieldErrors.firstName}
        />

        <TextInput
          id="lastName"
          label="Last Name"
          placeholder="Doe"
          value={fields.lastName}
          maxLength={100}
          icon={<User className="h-4 w-4" aria-hidden />}
          onChange={(v) => setField("lastName", v)}
          error={fieldErrors.lastName}
        />

        <TextInput
          id="email"
          label="Email Address"
          type="email"
          placeholder="john.doe@example.com"
          value={fields.email}
          maxLength={254}
          icon={<Mail className="h-4 w-4" aria-hidden />}
          onChange={(v) => setField("email", v)}
          error={fieldErrors.email}
        />

        <PasswordInput
          id="password"
          label="Password"
          value={fields.password}
          hint="Must be at least 8 characters long."
          onChange={(v) => setField("password", v)}
          error={fieldErrors.password}
        />

        {/* Terms checkbox */}
        <div className="flex flex-col gap-1.5">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={fields.agreedToTerms}
              aria-invalid={Boolean(fieldErrors.agreedToTerms)}
              aria-describedby={
                fieldErrors.agreedToTerms ? "terms-error" : undefined
              }
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-brand-red-200"
              onChange={(e) => setField("agreedToTerms", e.target.checked)}
            />
            <span className="body-3 text-brand-gray-700">
              I agree to Drivo&apos;s{" "}
              <Link
                href="/"
                className="font-semibold text-brand-red-200 hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/"
                className="font-semibold text-brand-red-200 hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {fieldErrors.agreedToTerms ? (
            <p id="terms-error" className="body-3 text-red-600" role="alert">
              {fieldErrors.agreedToTerms}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!canSubmit || isLoading}
          className="mt-1 w-full justify-center gap-2 rounded-xl font-bold"
        >
          {isLoading ? "Creating account…" : "Create Account"}
          {!isLoading ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
        </Button>
      </form>

      {/* Sign-in link */}
      <p className="body-3 mt-6 text-center text-brand-gray-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-red-200 hover:underline"
        >
          Sign In
        </Link>
      </p>

      {/* Trust badges */}
      <div className="mt-8">
        <TrustBadges />
      </div>
    </div>
  );
}
