// app/api/verify-otp/route.js

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connect } from "@/dbConfig";
import Otp from "@/models/otpModel";
import User from "@/models/userModel";

export async function POST(request) {
  try {
    // 1) parse body
    const { email, otp, password } = await request.json();

    // 2) validate presence
    if (!email || !otp || !password) {
      return NextResponse.json(
        { success: false, error: "Email, OTP and password are required." },
        { status: 400 }
      );
    }

    // 3) connect to DB
    await connect();

    // 4) look up OTP record
    const record = await Otp.findOne({ email });
    if (!record) {
      return NextResponse.json(
        { success: false, error: "OTP not found or expired." },
        { status: 400 }
      );
    }

    // 5) check expiration
    if (new Date() > record.expiresAt) {
      await Otp.deleteOne({ email });
      return NextResponse.json(
        { success: false, error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // 6) compare codes
    const match = await bcrypt.compare(otp, record.otp);
    if (!match) {
      return NextResponse.json(
        { success: false, error: "Invalid OTP." },
        { status: 400 }
      );
    }

    // 7) ensure user doesn’t already exist
    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json(
        { success: false, error: "User already exists. Please log in." },
        { status: 400 }
      );
    }

    // 8) hash password + create user
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    await new User({
      email,
      password: hashed,
      isGoogleAccount: false,
      isEmailVerified: true,
      role: "user",
    }).save();

    // 9) clean up OTP
    await Otp.deleteOne({ email });

    // 10) return success
    return NextResponse.json(
      { success: true, message: "User registered successfully!" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in /api/verify-otp:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
