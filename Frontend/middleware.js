import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { PUBLIC_PATHS, isAdminRoute } from "@/lib/protect";

// Rate limiting setup
const apiRateLimiter = new RateLimiterMemory({ points: 30, duration: 60 });
const webRateLimiter = new RateLimiterMemory({ points: 100, duration: 60 });

// Extract token from cookie or Authorization header
function extractToken(req) {
  const cookieToken = req.cookies.get("token")?.value;
  const authHeader = req.headers.get("Authorization");
  const headerToken = authHeader?.replace("Bearer ", "");
  return cookieToken || headerToken || null;
}

// Verify JWT and return decoded payload
async function validateToken(token) {
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

// Get client IP for rate limiting and banning check
function getClientIp(req) {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

// Handle rate limiting
async function checkRateLimit(req) {
  const ip = getClientIp(req);
  const isApiPath = req.nextUrl.pathname.startsWith("/api");
  const limiter = isApiPath ? apiRateLimiter : webRateLimiter;

  try {
    await limiter.consume(ip);
    return null;
  } catch (rejRes) {
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
export async function middleware(req) {
  const { pathname, origin } = req.nextUrl;
  const clientIp = getClientIp(req);



  // 2. Rate limiting
  const rateLimitResponse = await checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  // 3. Public paths (no auth required)
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // 4. Authenticated-only paths
  const token = extractToken(req);
  const { valid, payload } = token
    ? await validateToken(token)
    : { valid: false };

  // Prevent logged‐in users hitting /login or /signup
  if (valid && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(origin);
  }

  // Block unauthenticated
  if (!valid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(`${origin}/login`);
  }

  // 5. Admin-only routes
  if (isAdminRoute(pathname) && payload.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden", message: "Admin access only" },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
