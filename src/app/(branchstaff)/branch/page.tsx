import { LogoutButton } from "@/components/auth/LogoutButton";

export default function BranchStaffHomePage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-gray-50 p-8">
      <p className="text-2xl font-semibold text-brand-gray-900">You are Branch_staff</p>
      <p className="body-2 text-brand-gray-600">Branch staff area (placeholder)</p>
      <LogoutButton />
    </main>
  );
}
