import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { RateLimiterMemory } from "rate-limiter-flexible";

// Constants
const PUBLIC_PATHS = new Set([
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
]);

// Rate limiters
const apiRateLimiter = new RateLimiterMemory({
  points: 30,
  duration: 60,
});

const webRateLimiter = new RateLimiterMemory({
  points: 100,
  duration: 60,
});

// Extract JWT token
function extractToken(req: NextRequest): string | null {
  return (
    req.cookies.get("token")?.value ||
    req.headers.get("Authorization")?.replace("Bearer ", "") ||
    null
  );
}

// Validate JWT token
async function validateToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
    return true;
  } catch {
    return false;
  }
}

// Get client IP
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

// Rate limiting
async function checkRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const ip = getClientIp(req);
  const isApiPath = req.nextUrl.pathname.startsWith("/api");
  const rateLimiter = isApiPath ? apiRateLimiter : webRateLimiter;

  try {
    await rateLimiter.consume(ip);
    return null;
  } catch (rejRes: any) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: `Rate limit exceeded. Try again in ${Math.ceil(
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

// Main middleware
export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // 1. Rate limiting
  const rateLimitResponse = await checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  // 2. Allow public paths
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // 3. Check authentication
  const token = extractToken(req);
  const isAuthenticated = token ? await validateToken(token) : false;

  // 4. Redirect authenticated users from auth pages
  if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(`${origin}/`);
  }

  // 5. Redirect/block unauthenticated users from protected paths
  if (!isAuthenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    } else {
      return NextResponse.redirect(`${origin}/login`);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
