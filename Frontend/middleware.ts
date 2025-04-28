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

// Rate limiting configuration
const RATE_LIMIT = {
  WINDOW_MS: 60 * 1000, // 1 minute
  MAX_REQUESTS: 100, // Max requests per window
  IP_WHITELIST: [], // Add any IPs you want to exempt
  API_SLOWDOWN: {
    // More aggressive limits for API endpoints
    WINDOW_MS: 60 * 1000,
    MAX_REQUESTS: 30,
  },
};

// In-memory store for rate limiting (replace with Redis in production)
const rateLimits = new Map<string, { count: number; lastReset: number }>();

// Helper: Extract JWT token from request
function getToken(req: NextRequest): string | null {
  const cookieToken = req.cookies.get("token")?.value;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
}

// Helper: Validate JWT token
async function isTokenValid(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
    return true;
  } catch {
    return false;
  }
}

// Helper: Check and enforce rate limits
function checkRateLimit(req: NextRequest): NextResponse | null {
  const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const path = req.nextUrl.pathname;
  
  // Skip rate limiting for whitelisted IPs
  if (RATE_LIMIT.IP_WHITELIST.includes(ip)) {
    return null;
  }

  // Use stricter limits for API endpoints
  const isApiPath = path.startsWith("/api");
  const config = isApiPath ? RATE_LIMIT.API_SLOWDOWN : RATE_LIMIT;
  
  const now = Date.now();
  const key = `${ip}:${path}`;
  
  let rateLimit = rateLimits.get(key);
  
  // Initialize or reset rate limit tracking
  if (!rateLimit || now - rateLimit.lastReset > config.WINDOW_MS) {
    rateLimit = { count: 0, lastReset: now };
    rateLimits.set(key, rateLimit);
  }
  
  // Increment request count
  rateLimit.count += 1;
  
  // Check if limit exceeded
  if (rateLimit.count > config.MAX_REQUESTS) {
    const retryAfter = Math.ceil((config.WINDOW_MS - (now - rateLimit.lastReset)) / 1000);
    
    return new NextResponse(
      JSON.stringify({ 
        error: "Too many requests", 
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.` 
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": retryAfter.toString(),
        },
      }
    );
  }
  
  return null;
}

// Middleware
export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;
  
  // Apply rate limiting first
  const rateLimitResponse = checkRateLimit(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  
  const token = getToken(req);
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isAuthenticated = token ? await isTokenValid(token) : false;

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