"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/auth-context";
import { useProfile } from "@/hooks/useProfile";

/**
 * Main nav links (center on desktop, list in mobile menu).
 * Change labels or paths here only.
 */
const PUBLIC_LINKS = [
  { label: "Home", href: "/" },
  { label: "Booking", href: "/booking" },
  { label: "Location", href: "/location" },
] as const;

const MY_BOOKINGS_LINK = { label: "My bookings", href: "/my-account" } as const;

const SIGN_IN_HREF = "/login";
const REGISTER_HREF = "/register";

function isActivePage(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

// ─── TextLink ─────────────────────────────────────────────────────────────────

interface TextLinkProps {
  label: string;
  href: string;
  active: boolean;
  onClick?: () => void;
}

function TextLink({
  label,
  href,
  active,
  onClick,
}: TextLinkProps): React.JSX.Element {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`body-3 font-medium transition-colors focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brand-red-200 ${
        active
          ? "border-b-2 border-brand-red-200 pb-0.5 text-brand-red-200"
          : "text-brand-gray-700 hover:text-brand-red-200"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

// ─── UserAvatar ───────────────────────────────────────────────────────────────

interface UserAvatarProps {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}

/**
 * วงกลมแสดงตัวย่อชื่อ user
 * ถ้ามี firstName + lastName → ใช้อักษรแรกของแต่ละคำ เช่น "PN"
 * ถ้าไม่มี profile → fallback ใช้ตัวแรกของ email เช่น "P"
 */
function UserAvatar({ firstName, lastName, email }: UserAvatarProps): React.JSX.Element {
  let initials = "U";
  if (firstName && lastName) {
    initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
  } else if (firstName) {
    initials = firstName[0].toUpperCase();
  } else if (email) {
    initials = email[0].toUpperCase();
  }

  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-red-200 text-sm font-bold text-white select-none"
      aria-label={`User account: ${initials}`}
      title={firstName ? `${firstName} ${lastName ?? ""}`.trim() : (email ?? "Account")}
    >
      {initials}
    </span>
  );
}

// ─── LogoutButton (Navbar inline) ─────────────────────────────────────────────

function NavLogoutButton({ onAfterLogout }: { onAfterLogout?: () => void }): React.JSX.Element {
  const { signOut } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout(): Promise<void> {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await signOut();
      onAfterLogout?.();
      router.push("/");
    } catch {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="body-3 font-medium text-brand-gray-700 transition-colors hover:text-brand-red-200 disabled:opacity-50 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brand-red-200"
    >
      {isLoading ? "Logging out…" : "Log out"}
    </button>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar(): React.JSX.Element {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const mobilePanelId = useId();
  const menuButtonId = useId();

  // ดึง session และ profile เพื่อแสดง avatar + logout
  const { session, user, isInitialized } = useAuth();
  const { profile } = useProfile();
  const isLoggedIn = !!session;

  const mainLinks = useMemo(
    () => (isLoggedIn ? [...PUBLIC_LINKS, MY_BOOKINGS_LINK] : [...PUBLIC_LINKS]),
    [isLoggedIn],
  );

  const closeMenu = useCallback((): void => {
    setMenuOpen(false);
  }, []);

  // Close mobile menu after navigation.
  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  // Escape closes the mobile menu.
  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    function handleKey(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/25 bg-white/35 backdrop-blur-xl backdrop-saturate-150 supports-backdrop-filter:bg-white/25">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-18 sm:px-6 lg:px-8"
        aria-label="Main"
      >
        <Link
          href="/"
          className="headline-3 sm:text-3xl shrink-0 text-brand-red-200 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red-200"
        >
          Drivo
        </Link>

        {/* Tablet and desktop: links in the middle */}
        <div className="hidden min-w-0 flex-1 items-center justify-center gap-8 md:flex lg:gap-10">
          <ul className="flex items-center gap-6 lg:gap-8">
            {mainLinks.map((link) => (
              <li key={link.href}>
                <TextLink
                  label={link.label}
                  href={link.href}
                  active={isActivePage(pathname, link.href)}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Desktop: auth section */}
        <div className="hidden items-center gap-4 md:flex">
          {!isInitialized ? (
            <div
              className="h-9 w-28 animate-pulse rounded-lg bg-brand-gray-200/80"
              aria-hidden
            />
          ) : isLoggedIn ? (
            <>
              <UserAvatar
                firstName={profile?.firstName}
                lastName={profile?.lastName}
                email={user?.email}
              />
              <NavLogoutButton />
            </>
          ) : (
            <>
              <TextLink
                label="Sign in"
                href={SIGN_IN_HREF}
                active={isActivePage(pathname, SIGN_IN_HREF)}
              />
              <Button href={REGISTER_HREF} variant="primary" size="md">
                Register
              </Button>
            </>
          )}
        </div>

        {/* Mobile: hamburger */}
        <button
          id={menuButtonId}
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-brand-gray-700 transition-colors hover:bg-black/5 hover:text-brand-red-200 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brand-red-200 md:hidden"
          aria-expanded={menuOpen}
          aria-controls={mobilePanelId}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X className="h-6 w-6" aria-hidden />
          ) : (
            <Menu className="h-6 w-6" aria-hidden />
          )}
        </button>
      </nav>

      {/* Mobile dropdown */}
      <div
        id={mobilePanelId}
        role="region"
        aria-labelledby={menuButtonId}
        hidden={!menuOpen}
        className="border-t border-white/20 bg-white/90 backdrop-blur-2xl md:hidden"
      >
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
          <ul className="flex flex-col gap-4">
            {mainLinks.map((link) => (
              <li key={link.href}>
                <TextLink
                  label={link.label}
                  href={link.href}
                  active={isActivePage(pathname, link.href)}
                  onClick={closeMenu}
                />
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 border-t border-white/25 pt-6">
            {!isInitialized ? (
              <div className="h-10 w-full animate-pulse rounded-lg bg-brand-gray-200/80" aria-hidden />
            ) : isLoggedIn ? (
              <>
                <div className="flex items-center gap-3">
                  <UserAvatar
                    firstName={profile?.firstName}
                    lastName={profile?.lastName}
                    email={user?.email}
                  />
                  <span className="body-3 font-semibold text-brand-gray-900">
                    {profile?.firstName
                      ? `${profile.firstName} ${profile.lastName ?? ""}`.trim()
                      : (user?.email ?? "Account")}
                  </span>
                </div>
                <NavLogoutButton onAfterLogout={closeMenu} />
              </>
            ) : (
              <>
                <TextLink
                  label="Sign in"
                  href={SIGN_IN_HREF}
                  active={isActivePage(pathname, SIGN_IN_HREF)}
                  onClick={closeMenu}
                />
                <Button
                  href={REGISTER_HREF}
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={closeMenu}
                >
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
