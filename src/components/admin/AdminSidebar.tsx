"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import {
  BookOpen,
  Car,
  ClipboardCheck,
  Globe,
  LayoutGrid,
  LogOut,
  Store,
  type LucideIcon,
} from "lucide-react";

export type AdminSidebarMode = "routes" | "demo";

export interface AdminSidebarNavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: LucideIcon;
}

export const ADMIN_SIDEBAR_NAV: readonly AdminSidebarNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutGrid },
  {
    label: "Booking Approval",
    href: "/admin/booking-approval",
    icon: ClipboardCheck,
  },
  { label: "All Bookings", href: "/admin/bookings", icon: BookOpen },
  { label: "Country Management", href: "/admin/countries", icon: Globe },
  { label: "Branch Management", href: "/admin/branches", icon: Store },
  { label: "Car Management", href: "/admin/cars", icon: Car },
] as const;

function navItemActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin" || pathname === "/admin/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export interface AdminSidebarProps {
  className?: string;
  /**
   * `demo` — design-system preview: no route changes, click toggles active row.
   * `routes` — real admin layout: `next/link` + URL-based active state.
   */
  mode?: AdminSidebarMode;
  /** Subtitle under the Drivo wordmark (e.g. role). */
  roleLabel?: string;
  /**
   * When `mode` is `routes`, optionally force which href counts as “current”
   * (e.g. static preview). Otherwise `usePathname()` is used.
   */
  activeHrefOverride?: string;
  /** Called when the user activates Logout (both modes). */
  onLogout?: () => void;
}

const navRowBase =
  "body-3 relative flex w-full items-center gap-3 rounded-lg py-3 pl-3 pr-4 text-left font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red-200";

export default function AdminSidebar({
  className = "",
  mode = "routes",
  roleLabel = "Super Admin",
  activeHrefOverride,
  onLogout,
}: AdminSidebarProps): React.JSX.Element {
  const pathname = usePathname();
  const activeBase = activeHrefOverride ?? pathname;
  const [demoIndex, setDemoIndex] = useState(0);

  const handleLogout = useCallback(() => {
    onLogout?.();
  }, [onLogout]);

  return (
    <aside
      className={`flex w-60 shrink-0 flex-col border-r border-brand-gray-100 bg-brand-white ${className}`}
      aria-label="Admin navigation"
    >
      <div className="px-5 pb-6 pt-8">
        <p className="font-serif text-xl font-bold leading-tight text-brand-red-200">
          Drivo
        </p>
        <p className="body-3 mt-1.5 text-brand-gray-500">{roleLabel}</p>
      </div>

      <nav className="flex flex-1 flex-col px-3 pb-4" aria-label="Main">
        <ul className="flex flex-col gap-1">
          {ADMIN_SIDEBAR_NAV.map((item, index) => {
            const Icon = item.icon;
            const active =
              mode === "demo"
                ? index === demoIndex
                : navItemActive(activeBase, item.href);

            const inactiveRow = `${navRowBase} text-brand-gray-700 hover:bg-brand-gray-50 hover:text-brand-gray-900`;
            const activeRow = `${navRowBase} bg-brand-gray-50 text-brand-red-200`;

            const content = (
              <>
                {active ? (
                  <span
                    className="absolute bottom-2 right-0 top-2 w-1 rounded-l-sm bg-brand-red-200"
                    aria-hidden
                  />
                ) : null}
                <Icon
                  className="h-5 w-5 shrink-0"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span>{item.label}</span>
              </>
            );

            return (
              <li key={item.href}>
                {mode === "demo" ? (
                  <button
                    type="button"
                    onClick={() => setDemoIndex(index)}
                    className={active ? activeRow : inactiveRow}
                    aria-current={active ? "page" : undefined}
                  >
                    {content}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={active ? activeRow : inactiveRow}
                    aria-current={active ? "page" : undefined}
                  >
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-auto border-t border-brand-gray-100 pt-4">
          <button
            type="button"
            onClick={handleLogout}
            className={`${navRowBase} text-brand-gray-700 hover:bg-brand-gray-50 hover:text-brand-red-200`}
          >
            <LogOut
              className="h-5 w-5 shrink-0"
              strokeWidth={1.75}
              aria-hidden
            />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
