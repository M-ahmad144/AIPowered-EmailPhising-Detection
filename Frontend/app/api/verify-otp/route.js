import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connect } from "../../../dbConfig";
import Otp from "../../../models/otpModel";
import User from "../../../models/userModel";

export async function POST(request) {
  try {
    await connect();

    const { email, otp, password } = await request.json();

    // Validate required fields
    if (!email || !otp || !password) {
      return NextResponse.json(
        { message: "Email, OTP, and Password are required" },
        { status: 400 }
      );
    }

    // Get OTP record
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return NextResponse.json(
        { message: "OTP not found or expired" },
        { status: 400 }
      );
    }

    // Check expiration
    if (otpRecord.expiresAt && new Date() > new Date(otpRecord.expiresAt)) {
      await Otp.deleteOne({ email });
      return NextResponse.json(
        { message: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Match OTP
    const isOtpMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isOtpMatch) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists. Please log in." },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user according to schema
    const newUser = new User({
      email,
      password: hashedPassword,
      isGoogleAccount: false,
      isEmailVerified: true,
      role: "user",
    });

    await newUser.save();

    // Optionally, delete the OTP after successful signup
    await Otp.deleteOne({ email });

    return NextResponse.json(
      { message: "User registered successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("OTP and password verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
