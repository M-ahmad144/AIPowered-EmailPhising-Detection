import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConfig";
import User from "@/models/userModel";
import Otp from "@/models/otpModel";

export async function POST(request) {
  try {
    await connect();
    const { email, password, otp } = await request.json();

    if (!email || (!password && !otp)) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and either password or OTP are required.",
        },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found. Please sign up." },
        { status: 400 }
      );
    }

    // 🧼 Clean up expired OTPs
    await Otp.deleteMany({
      email,
      expiresAt: { $lt: new Date() },
    });

    // 🔐 OTP login
    if (otp) {
      // Get most recent valid OTP
      const latestOtp = await Otp.findOne({
        email,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });

      if (!latestOtp) {
        return NextResponse.json(
          { success: false, error: "OTP not found or expired." },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(otp, latestOtp.otp);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, error: "Invalid OTP." },
          { status: 401 }
        );
      }

      // OTP is valid — delete it (one-time use)
      await Otp.deleteMany({ email });
    }

    // 🔑 Password login
    else if (password) {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return NextResponse.json(
          { success: false, error: "Incorrect password." },
          { status: 401 }
        );
      }
    }

    // 🎟 Create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    const response = NextResponse.json(
      { success: true, message: "Login successful!" },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds (604800s)
      expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("verify-login error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
