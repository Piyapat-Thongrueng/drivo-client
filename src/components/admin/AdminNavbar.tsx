"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { ADMIN_SIDEBAR_NAV } from "@/components/admin/AdminSidebar";
import { useProfile } from "@/hooks/useProfile";

/**
 * Returns the sidebar tab label that matches the current URL.
 * Falls back to "Dashboard" when on the root /admin path.
 */
function resolvePageTitle(pathname: string): string {
  if (pathname === "/admin" || pathname === "/admin/") {
    return "Dashboard";
  }
  const matched = ADMIN_SIDEBAR_NAV.find(
    (item) => item.href !== "/admin" && pathname.startsWith(item.href),
  );
  return matched?.label ?? "Dashboard";
}

export default function AdminNavbar(): React.JSX.Element {
  const pathname = usePathname();
  const { profile, isLoading } = useProfile();

  const pageTitle = resolvePageTitle(pathname);

  const displayName = isLoading
    ? "Loading..."
    : profile
      ? `${profile.firstName} ${profile.lastName}`
      : "—";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-brand-gray-100 bg-brand-white px-6">
      {/* Current page title — mirrors the active sidebar tab */}
      <h1 className="text-lg font-bold text-brand-gray-900">{pageTitle}</h1>

      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="relative hidden sm:block">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400">
            <Search className="h-4 w-4" aria-hidden />
          </span>
          <input
            type="search"
            placeholder="Search analytics..."
            className="body-3 h-9 w-52 rounded-lg border border-brand-gray-200 bg-brand-gray-50 pl-9 pr-3 text-brand-gray-900 placeholder:text-brand-gray-400 focus:border-brand-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-gray-400"
          />
        </div>

        {/* Notification bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-gray-500 transition-colors hover:bg-brand-gray-50 hover:text-brand-gray-900"
        >
          <Bell className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </button>

        {/* Admin name — replaces the avatar circle */}
        <span className="body-3 font-semibold text-brand-gray-900">
          {displayName}
        </span>
      </div>
    </header>
  );
}
