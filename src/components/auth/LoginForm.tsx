"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Headset, Lock, Mail, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/Button";

// --- Sub-components ---

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
}

function EmailInput({ value, onChange }: EmailInputProps): React.JSX.Element {
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
          onChange={(e) => onChange(e.target.value)}
          className="body-2 w-full rounded-xl border border-brand-gray-300 bg-brand-white py-3 pl-10 pr-4 text-brand-gray-900 placeholder:text-brand-gray-500 transition-colors focus:border-brand-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-gray-700"
        />
      </div>
    </div>
  );
}

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
}

function PasswordInput({ value, onChange }: PasswordInputProps): React.JSX.Element {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor="password" className="body-3 font-semibold text-brand-gray-900">
          Password
        </label>
        {/* Forgot password link — goes to / until that route exists */}
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = email.trim() !== "" && password.length > 0;

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setIsLoading(true);
    try {
      // TODO: call Supabase auth.signInWithPassword() or POST clientApi
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full rounded-2xl border border-brand-gray-100 bg-brand-white px-6 py-10 shadow-sm sm:px-10">
      {/* Heading */}
      <div className="mb-8 text-center">
        <h1 className="headline-3 text-brand-gray-900">Welcome Back</h1>
        <p className="body-3 mt-1.5 text-brand-gray-500">
          Sign in to manage your bookings and explore new journeys.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <EmailInput value={email} onChange={setEmail} />
        <PasswordInput value={password} onChange={setPassword} />

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
  );
}
