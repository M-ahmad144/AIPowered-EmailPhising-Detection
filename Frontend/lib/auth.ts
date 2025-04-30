// lib/auth.ts
import { jwtVerify } from "jose";

export async function getUserFromToken(token?: string) {
  try {
    if (!token) return null;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}
