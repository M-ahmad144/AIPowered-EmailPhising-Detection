// lib/auth.ts
import { jwtVerify } from "jose";

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    return payload; // you can get user info here if needed
  } catch (error) {
    return null;
  }
}
