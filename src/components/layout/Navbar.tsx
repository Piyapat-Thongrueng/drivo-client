"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/Button";

/**
 * Main nav links (center on desktop, list in mobile menu).
 * Change labels or paths here only.
 */
const MAIN_LINKS = [
  { label: "Home", href: "/" },
  { label: "Booking", href: "/booking" },
  { label: "Location", href: "/location" },
] as const;

const SIGN_IN_HREF = "/login";
const REGISTER_HREF = "/register";

function isActivePage(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

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
      className={`body-3 font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red-200 ${
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

export default function Navbar(): React.JSX.Element {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const mobilePanelId = useId();
  const menuButtonId = useId();

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
    <header className="sticky top-0 z-50 border-b border-brand-gray-100 bg-brand-white">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-18 sm:px-6 lg:px-8"
        aria-label="Main"
      >
        <Link
          href="/"
          className="headline-3 shrink-0 text-brand-red-200 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red-200"
        >
          Drivo
        </Link>

        {/* Tablet and desktop: links in the middle */}
        <div className="hidden min-w-0 flex-1 items-center justify-center gap-8 md:flex lg:gap-10">
          <ul className="flex items-center gap-6 lg:gap-8">
            {MAIN_LINKS.map((link) => (
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

        <div className="hidden items-center gap-6 md:flex">
          <TextLink
            label="Sign in"
            href={SIGN_IN_HREF}
            active={isActivePage(pathname, SIGN_IN_HREF)}
          />
          <Button href={REGISTER_HREF} variant="primary" size="md">
            Register
          </Button>
        </div>

        {/* Mobile: hamburger */}
        <button
          id={menuButtonId}
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-brand-gray-700 transition-colors hover:bg-brand-gray-50 hover:text-brand-red-200 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brand-red-200 md:hidden"
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
        className="border-t border-brand-gray-100 bg-brand-white md:hidden"
      >
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
          <ul className="flex flex-col gap-4">
            {MAIN_LINKS.map((link) => (
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
          <div className="flex flex-col gap-3 border-t border-brand-gray-100 pt-6">
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
          </div>
        </div>
      </div>
    </header>
  );
}
