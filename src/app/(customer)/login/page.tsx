import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import LoginForm from "@/components/auth/LoginForm";
import RedirectIfAuthenticated from "@/components/auth/RedirectIfAuthenticated";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to manage your bookings and explore new journeys.",
};

export default function LoginPage(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-brand-gray-50 via-white to-brand-red-50">
      {/* ถ้า login แล้ว → redirect กลับหน้าหลักทันที ไม่ให้เข้าหน้านี้ซ้ำ */}
      <RedirectIfAuthenticated to="/" />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Suspense required for useSearchParams inside LoginForm */}
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="px-6 py-5">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="body-3 text-brand-gray-600">
            <Link
              href="/"
              className="font-bold text-brand-red-200 hover:underline"
            >
              Drivo
            </Link>{" "}
            © {new Date().getFullYear()} Drivo Car Rentals. All rights reserved.
          </p>
          <nav className="flex gap-5" aria-label="Footer">
            <Link href="/" className="body-3 text-brand-gray-600 hover:text-brand-gray-900">
              Terms of Service
            </Link>
            <Link href="/" className="body-3 text-brand-gray-600 hover:text-brand-gray-900">
              Privacy Policy
            </Link>
            <Link href="/" className="body-3 text-brand-gray-600 hover:text-brand-gray-900">
              Support
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
