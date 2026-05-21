"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";
import { useAuth } from "@/contexts/auth-context";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps): React.JSX.Element {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await signOut();
    router.push("/");
  }, [signOut, router]);

  return (
    <div className="flex h-screen overflow-hidden bg-brand-gray-50">
      {/* ── Sidebar (fixed left) ── */}
      <AdminSidebar mode="routes" onLogout={handleLogout} />

      {/* ── Right panel: navbar + scrollable page content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminNavbar />

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
