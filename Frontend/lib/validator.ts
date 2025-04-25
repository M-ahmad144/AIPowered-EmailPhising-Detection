// lib/validators.ts
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12).max(256),
  otp: z.string().length(6).optional(),
});
