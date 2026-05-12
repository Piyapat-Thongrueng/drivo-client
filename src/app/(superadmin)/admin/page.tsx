import { LogoutButton } from "@/components/auth/LogoutButton";

export default function SuperAdminHomePage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-gray-50 p-8">
      <p className="text-2xl font-semibold text-brand-gray-900">You are Superadmin</p>
      <p className="body-2 text-brand-gray-600">Super admin area (placeholder)</p>
      <LogoutButton />
    </main>
  );
}
