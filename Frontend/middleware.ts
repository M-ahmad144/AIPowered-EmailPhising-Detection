import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { PUBLIC_PATHS, isAdminRoute } from "@/lib/protect";

// Rate limiting setup
const apiRateLimiter = new RateLimiterMemory({ points: 30, duration: 60 });
const webRateLimiter = new RateLimiterMemory({ points: 100, duration: 60 });

// Extract token from cookie or Authorization header
function extractToken(req: NextRequest): string | null {
  const cookieToken = req.cookies.get("token")?.value;
  const authHeader = req.headers.get("Authorization");
  const headerToken = authHeader?.replace("Bearer ", "");
  return cookieToken || headerToken || null;
}

// Verify JWT and return decoded payload
async function validateToken(
  token: string
): Promise<{ valid: boolean; payload?: any }> {
  try {
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) throw new Error("JWT_SECRET_KEY not set in env.");
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    return { valid: true, payload };
  } catch (err) {
    console.warn("JWT verification failed:", err);
    return { valid: false };
  }
}

// Get client IP for rate limiting
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

// Handle rate limiting
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

// Main middleware function
export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // 1. Rate limiting
  const rateLimitResponse = await checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  // 2. Allow public paths
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  // 3. Validate token
  const token = extractToken(req);
  const { valid, payload } = token
    ? await validateToken(token)
    : { valid: false };

  // 4. Redirect if authenticated user tries to access auth pages
  if (valid && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(`${origin}/`);
  }

  // 5. Block unauthenticated users
  if (!valid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    } else {
      return NextResponse.redirect(`${origin}/login`);
    }
  }

  // 6. Admin-only route protection
  const userRole = payload?.role;
  console.log(payload);
  if (isAdminRoute(pathname)) {
    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "Forbidden", message: "Admin access only" },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

// Apply middleware to all relevant paths
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
