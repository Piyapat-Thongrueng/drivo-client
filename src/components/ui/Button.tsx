"use client";

import Link from "next/link";
import type { MouseEventHandler } from "react";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  children: React.ReactNode;
  /** `primary` — brand red; `secondary` — white surface, dark text (e.g. hero CTAs). */
  variant?: ButtonVariant;
  /** Controls padding and text scale (see globals.css utilities). */
  size?: ButtonSize;
  /** Use for navigation (renders Next.js `Link` with the same styles). */
  href?: string;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-red-200 text-brand-white hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red-200 disabled:bg-brand-gray-300 disabled:text-brand-gray-500 disabled:opacity-100",
  secondary:
    "border border-white/25 bg-brand-white text-brand-gray-900 shadow-sm hover:bg-brand-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gray-700 disabled:border-brand-gray-200 disabled:bg-brand-gray-100 disabled:text-brand-gray-500 disabled:shadow-none disabled:opacity-100",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-2 body-3",
  md: "min-h-10 px-4 py-2.5 body-3 md:py-2",
  lg: "min-h-12 px-6 py-3 body-2",
};

/** Shared “pressed” micro-interaction: slight shrink while active, returns on release. */
const pressClasses =
  "inline-flex items-center justify-center rounded-lg font-medium transition-transform duration-150 ease-out will-change-transform active:scale-[0.96] active:brightness-95";

function mergeClasses(...parts: string[]): string {
  return parts.filter(Boolean).join(" ");
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  className = "",
  disabled = false,
  type = "button",
  onClick,
}: ButtonProps): React.JSX.Element {
  const styles = mergeClasses(
    pressClasses,
    variantClasses[variant],
    sizeClasses[size],
    "disabled:pointer-events-none disabled:active:scale-100",
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        className={mergeClasses(
          styles,
          disabled
            ? "pointer-events-none bg-brand-gray-300 text-brand-gray-500! opacity-100 active:scale-100"
            : "",
        )}
        onClick={onClick as MouseEventHandler<HTMLAnchorElement>}
        aria-disabled={disabled ? true : undefined}
        tabIndex={disabled ? -1 : undefined}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={styles} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
