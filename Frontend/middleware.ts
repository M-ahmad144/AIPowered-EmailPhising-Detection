import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { RateLimiterMemory } from "rate-limiter-flexible";

// Constants
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

// Rate limiters (in-memory)
const apiRateLimiter = new RateLimiterMemory({
  points: 30, // 30 requests
  duration: 60, // per 60 seconds
});

const webRateLimiter = new RateLimiterMemory({
  points: 100, // 100 requests
  duration: 60, // per 60 seconds
});

/**
 * Extracts JWT token from request
 */
function extractToken(req: NextRequest): string | null {
  return (
    req.cookies.get("token")?.value ||
    req.headers.get("Authorization")?.replace("Bearer ", "") ||
    null
  );
}

/**
 * Validates JWT token
 */
async function validateToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets client IP address
 */
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

/**
 * Applies rate limiting
 */
async function checkRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const ip = getClientIp(req);
  const isApiPath = req.nextUrl.pathname.startsWith("/api");
  const rateLimiter = isApiPath ? apiRateLimiter : webRateLimiter;

  try {
    await rateLimiter.consume(ip);
    return null;
  } catch (rejRes) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: `Rate limit exceeded. Please try again in ${Math.ceil(
          rejRes.msBeforeNext / 1000
        )} seconds.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(rejRes.msBeforeNext / 1000).toString(),
        },
      }
    );
  }
}

/**
 * Main middleware
 */
export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // Rate limiting
  const rateLimitResponse = await checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  // Public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Authentication check
  const token = extractToken(req);
  const isAuthenticated = token ? await validateToken(token) : false;

  // Redirect authenticated users from auth pages
  if (isAuthenticated && ["/login", "/signup"].includes(pathname)) {
    return NextResponse.redirect(`${origin}/`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
