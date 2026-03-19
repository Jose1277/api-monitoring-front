import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register", "/"];

//restricted routes
const AUTH_ROUTES = ["/login", "/register"];

// Global rate limits
const RATE_LIMIT = 60;
const WINDOW_MS = 60_000; 

// rates for anti ddos and brute-force protection on auth routes
const AUTH_RATE_LIMIT = 10;
const AUTH_WINDOW_MS = 60_000;

interface RateEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateEntry>();

function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (entry.count >= limit) return true;

  entry.count++;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

 // anti ddos and brute-force protection
  if (isAuthRoute) {
    if (isRateLimited(`auth:${ip}`, AUTH_RATE_LIMIT, AUTH_WINDOW_MS)) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  } else if (isRateLimited(`global:${ip}`, RATE_LIMIT, WINDOW_MS)) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

//redirect to home if auth
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

//protected routes
  if (!isPublicRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  if (!isPublicRoute) {
    response.headers.set("Cache-Control", "no-store");
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
