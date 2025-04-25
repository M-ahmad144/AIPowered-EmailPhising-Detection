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

export function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;
  const token = getToken(req);
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Check if the user is trying to access a public path while logged in
  if (isPublic && token && !isTokenExpired(token)) {
    return NextResponse.redirect(`${origin}/`);
  }

  const allowedPages = ["/login", "/signup", "/"];
  if (!allowedPages.some((page) => pathname.startsWith(page))) {
    const notFoundUrl = new URL("/404", origin);
    return NextResponse.redirect(notFoundUrl);
  }

  return NextResponse.next();
}

function getToken(req: NextRequest): string | null {
  return (
    req.cookies.get("token")?.value ??
    req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ??
    null
  );
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString("utf-8")
    );
    return payload.exp < Date.now() / 1000;
  } catch {
    return true;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|static|favicon\\.ico).*)"],
};
