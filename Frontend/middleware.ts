import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicPath = path === "/login" || path === "/signup";
  const token = req.cookies.get("token")?.value || "";

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  } else if (isPublicPath && token && !isTokenExpired(token)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

const isTokenExpired = (token: string): boolean => {
  try {
    if (!token) return true;
    const decodedToken: any = jwtDecode(token);
    return decodedToken.exp < Date.now() / 1000;
  } catch (err) {
    return true;
  }
};

export const config = {
  matcher: ["/", "/login", "/signup"],
};
