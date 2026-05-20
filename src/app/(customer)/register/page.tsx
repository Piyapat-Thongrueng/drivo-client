import { Suspense } from "react";
import type { Metadata } from "next";

import RegisterForm from "@/components/auth/RegisterForm";
import RedirectIfAuthenticated from "@/components/auth/RedirectIfAuthenticated";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join Drivo and access exclusive car rental deals worldwide.",
};

export default function RegisterPage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-brand-gray-50 via-white to-brand-red-50 px-4 py-12">
      {/* ถ้า login แล้ว → redirect กลับหน้าหลักทันที */}
      <RedirectIfAuthenticated to="/" />

      <div className="w-full max-w-md">
        {/* Suspense required for useSearchParams inside RegisterForm */}
        <Suspense>
          <RegisterForm />
        </Suspense>
      </div>
    </main>
  );
}
