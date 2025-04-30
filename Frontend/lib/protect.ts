// lib/protects.ts

// Publicly accessible routes
export const PUBLIC_PATHS = new Set([
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

// Admin-only private routes
export function isAdminRoute(path: string): boolean {
  const ADMIN_PATHS = [
    "/dashboard",
    "/dashboard/users",
    "/api/admin/dashboard",
    "/api/admin/users/all",
    "/api/admin/users/recent",
    "/api/admin/users/deleteUser",
  ];

  return ADMIN_PATHS.includes(path) || path.startsWith("/api/admin");
}
