import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { RateLimiterMemory } from "rate-limiter-flexible";

// PUBLIC ROUTES
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

// RATE LIMITING
const apiRateLimiter = new RateLimiterMemory({ points: 30, duration: 60 });
const webRateLimiter = new RateLimiterMemory({ points: 100, duration: 60 });

// Extract JWT token from cookies or headers
function extractToken(req: NextRequest): string | null {
  const cookieToken = req.cookies.get("token")?.value;
  const authHeader = req.headers.get("Authorization");
  const headerToken = authHeader?.replace("Bearer ", "");
  return cookieToken || headerToken || null;
}

// Validate token
async function validateToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) throw new Error("JWT_SECRET not set in env.");
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch (err) {
    console.warn("JWT verification failed:", err);
    return false;
  }
}

// Get IP
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

// Rate limit middleware
async function checkRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const ip = getClientIp(req);
  const isApiPath = req.nextUrl.pathname.startsWith("/api");
  const limiter = isApiPath ? apiRateLimiter : webRateLimiter;

  try {
    await limiter.consume(ip);
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

// MAIN MIDDLEWARE FUNCTION
export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  const token = extractToken(req);

  // 2. Rate limiting
  const rateLimitResponse = await checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  // 3. Skip public routes
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // 4. Check if authenticated
  const isAuthenticated = token ? await validateToken(token) : false;

  if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(`${origin}/`);
  }
  // 6. Block unauthenticated access
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
