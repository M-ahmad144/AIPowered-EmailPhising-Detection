// lib/types.ts

export type Role = "user" | "admin";

export interface User {
  _id: string; // MongoDB ObjectId as string
  email: string;
  isGoogleAccount: boolean;
  isEmailVerified: boolean;
  role: Role;
  createdAt: string; // ISO string from backend
  updatedAt: string;
  otp?: {
    code: string;
    expiresAt: string;
  };
}
