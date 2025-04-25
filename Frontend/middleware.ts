import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/login-otp",
  "/api/login",
  "/api/generate-otp",
  "/api/resend-otp",
  "/api/verify-login",
  "/api/verify-otp",
  "/favicon.ico",
  "/api/signout",
];

// Middleware
export function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;
  const token = getToken(req);
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isAuthenticated = token && !isTokenExpired(token);

  // Redirect unauthenticated users away from protected pages
  if (!isPublicPath && !isAuthenticated) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // Redirect logged-in users away from auth pages
  if (isAuthenticated && ["/login", "/signup"].includes(pathname)) {
    return NextResponse.redirect(`${origin}/`);
  }

  // Allow access if authenticated or on public path
  return NextResponse.next();
}

// Extract token from cookie or header
function getToken(req: NextRequest): string | null {
  return (
    req.cookies.get("token")?.value ??
    req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ??
    null
  );
}

// Check JWT expiration
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString("utf-8")
    );
    return payload.exp < Date.now() / 1000;
  } catch {
    return true; // If anything goes wrong, assume it's expired
  }
}

// Apply middleware to all routes except Next.js static assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
