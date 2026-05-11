"use client";

import Link from "next/link";
import { useState } from "react";
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

import { Button } from "@/components/ui/Button";

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
}

function TextInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  icon,
  onChange,
}: TextInputProps): React.JSX.Element {
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
          onChange={(e) => onChange(e.target.value)}
          className={`body-2 w-full rounded-xl border border-brand-gray-300 bg-brand-white py-3 text-brand-gray-900 placeholder:text-brand-gray-500 transition-colors focus:border-brand-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-gray-700 ${
            icon ? "pl-10 pr-4" : "px-4"
          }`}
        />
      </div>
    </div>
  );
}

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  hint,
}: PasswordInputProps): React.JSX.Element {
  // Local state just for show/hide — lives here, doesn't affect parent
  const [isVisible, setIsVisible] = useState(false);

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
          onChange={(e) => onChange(e.target.value)}
          className="body-2 w-full rounded-xl border border-brand-gray-300 bg-brand-white py-3 pl-10 pr-12 text-brand-gray-900 placeholder:text-brand-gray-500 transition-colors focus:border-brand-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-gray-700"
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
      {hint ? (
        <p className="body-3 text-brand-gray-500">{hint}</p>
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
  const [fields, setFields] = useState<FormFields>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    agreedToTerms: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  function setField<K extends keyof FormFields>(
    key: K,
    value: FormFields[K],
  ): void {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setIsLoading(true);
    try {
      // TODO: call Supabase auth or POST /api/auth/register via clientApi
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setIsLoading(false);
    }
  }

  const canSubmit =
    fields.firstName.trim() !== "" &&
    fields.lastName.trim() !== "" &&
    fields.email.trim() !== "" &&
    fields.password.length >= 8 &&
    fields.agreedToTerms;

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
        <TextInput
          id="firstName"
          label="First Name"
          placeholder="John"
          value={fields.firstName}
          icon={<User className="h-4 w-4" aria-hidden />}
          onChange={(v) => setField("firstName", v)}
        />

        <TextInput
          id="lastName"
          label="Last Name"
          placeholder="Doe"
          value={fields.lastName}
          icon={<User className="h-4 w-4" aria-hidden />}
          onChange={(v) => setField("lastName", v)}
        />

        <TextInput
          id="email"
          label="Email Address"
          type="email"
          placeholder="john.doe@example.com"
          value={fields.email}
          icon={<Mail className="h-4 w-4" aria-hidden />}
          onChange={(v) => setField("email", v)}
        />

        <PasswordInput
          id="password"
          label="Password"
          value={fields.password}
          hint="Must be at least 8 characters long."
          onChange={(v) => setField("password", v)}
        />

        {/* Terms checkbox */}
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={fields.agreedToTerms}
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
