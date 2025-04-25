// lib/security-config.ts
export const IP_HEADERS = [
  "X-Client-IP",
  "X-Forwarded-For",
  "CF-Connecting-IP",
  "Fastly-Client-Ip",
  "True-Client-Ip",
  "X-Real-IP",
  "X-Cluster-Client-IP",
  "X-Forwarded",
  "Forwarded-For",
  "Forwarded",
];

export const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/api/auth",
  "/api/public",
  "/favicon.ico",
];
