// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// const PUBLIC_PATHS = [
//   "/login",
//   "/signup",
//   "/login-otp",
//   "/otp",
//   "/api/login",
//   "/api/generate-otp",
//   "/api/resend-otp",
//   "/api/verify-login",
//   "/api/verify-otp",
//   "/favicon.ico",
//   "/api/signout",
// ];

// // Middleware
// export function middleware(req: NextRequest) {
//   const { pathname, origin } = req.nextUrl;
//   const token = getToken(req);
//   const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
//   const isAuthenticated = token && !isTokenExpired(token);

//   // Redirect unauthenticated users away from protected pages
//   if (!isPublicPath && !isAuthenticated) {
//     return NextResponse.redirect(`${origin}/login`);
//   }

//   // Redirect logged-in users away from auth pages
//   if (isAuthenticated && ["/login", "/signup"].includes(pathname)) {
//     return NextResponse.redirect(`${origin}/`);
//   }

//   // Allow access if authenticated or on public path
//   return NextResponse.next();
// }

// // Extract token from cookie or header
// function getToken(req: NextRequest): string | null {
//   return (
//     req.cookies.get("token")?.value ??
//     req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ??
//     null
//   );
// }

// // Check JWT expiration
// function isTokenExpired(token: string): boolean {
//   try {
//     const payload = JSON.parse(
//       Buffer.from(token.split(".")[1], "base64").toString("utf-8")
//     );
//     return payload.exp < Date.now() / 1000;
//   } catch {
//     return true; // If anything goes wrong, assume it's expired
//   }
// }

// // Apply middleware to all routes except Next.js static assets
// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
// };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/login-otp",
  "/otp",
  "/api/login",
  "/api/generate-otp",
  "/api/resend-otp",
  "/api/verify-login",
  "/api/verify-otp",
  "/favicon.ico",
  "/api/signout",
];

// Helper: Extract JWT token from request (cookie or Authorization header)
function getToken(req: NextRequest): string | null {
  // 1. Check cookies
  const cookieToken = req.cookies.get("token")?.value;
  if (cookieToken) return cookieToken;

  // 2. Check Authorization header (Bearer token)
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7); // Remove "Bearer " prefix
  }

  return null;
}

// Helper: Validate JWT token (signature + expiry)
async function isTokenValid(token: string): Promise<boolean> {
  try {
    await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    return true;
  } catch {
    return false;
  }
}

// Middleware
export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;
  const token = getToken(req); // Now properly defined
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isAuthenticated = token ? await isTokenValid(token) : false;

  // // Redirect unauthenticated users away from protected pages
  // if (!isPublicPath && !isAuthenticated) {
  //   return NextResponse.redirect(`${origin}/login`);
  // }

  // Redirect logged-in users away from auth pages
  if (isAuthenticated && ["/login", "/signup"].includes(pathname)) {
    return NextResponse.redirect(`${origin}/`);
  }

  return NextResponse.next();
}

// Config: Apply to all routes except static files
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};