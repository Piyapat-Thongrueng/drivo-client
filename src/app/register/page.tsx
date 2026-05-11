import type { Metadata } from "next";

import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join Drivo and access exclusive car rental deals worldwide.",
};

export default function RegisterPage(): React.JSX.Element {
  return (
    // min-h-screen + gradient background fills the full viewport
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-brand-gray-50 via-white to-brand-red-50 px-4 py-12">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </main>
  );
}
