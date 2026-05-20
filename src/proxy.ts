import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware-client";
import type { AppUserRole } from "@/lib/auth/login";
import { parseBookingId } from "@/lib/booking-id";

// ---------------------------------------------------------------------------
// Route maps
// ---------------------------------------------------------------------------

/** Each protected path prefix and the role required to enter it. */
const PROTECTED_ROUTES: Array<{ prefix: string; role: AppUserRole }> = [
  { prefix: "/customer", role: "user" },
  { prefix: "/branch", role: "branch_staff" },
  { prefix: "/admin", role: "super_admin" },
];

/** Where each role should land after login (mirrors server role-paths.ts). */
const ROLE_HOME: Record<AppUserRole, string> = {
  user: "/customer",
  branch_staff: "/branch",
  super_admin: "/admin",
};

/** Pages that authenticated users should not be able to visit. */
const AUTH_ONLY_PATHS = ["/login", "/register"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function matchProtectedRoute(
  pathname: string,
): { prefix: string; role: AppUserRole } | null {
  return (
    PROTECTED_ROUTES.find(
      ({ prefix }) =>
        pathname === prefix || pathname.startsWith(`${prefix}/`),
    ) ?? null
  );
}

function isAuthOnlyPath(pathname: string): boolean {
  return AUTH_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Invalid `/payment/:bookingId` (e.g. literal "undefined" from bad links) → My Bookings
  const paymentPrefix = "/payment/";
  if (pathname.startsWith(paymentPrefix)) {
    const afterPrefix = pathname.slice(paymentPrefix.length);
    const segment = afterPrefix.split("/")[0] ?? "";
    if (parseBookingId(segment) == null) {
      const url = request.nextUrl.clone();
      url.pathname = "/my-account";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();
  const supabase = createMiddlewareSupabaseClient(request, response);

  // getSession() reads the JWT from the cookie — fast (no extra network call).
  // Real auth validation still happens on the Express backend for every API call.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const storedRole = request.cookies.get("drivo-role")?.value as
    | AppUserRole
    | undefined;

  const matched = matchProtectedRoute(pathname);

  // ── Accessing a protected route ──────────────────────────────────────────
  if (matched) {
    // No session → send to login, remember where they wanted to go
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Has session + role cookie but wrong role → redirect to their own area
    if (storedRole && storedRole !== matched.role) {
      return NextResponse.redirect(
        new URL(ROLE_HOME[storedRole], request.url),
      );
    }

    // Has session (role unknown or correct) → allow through
    return response;
  }

  // ── Accessing /login or /register while already logged in ────────────────
  if (isAuthOnlyPath(pathname) && session && storedRole) {
    return NextResponse.redirect(new URL(ROLE_HOME[storedRole], request.url));
  }

  return response;
}

// Run middleware on every request except Next.js internals and static assets.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
