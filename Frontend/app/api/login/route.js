import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConfig";
import User from "@/models/userModel";
import Otp from "@/models/otpModel";
import Log from "@/models/logsModel";

export async function POST(request) {
  try {
    await connect();
    const { email, password, otp } = await request.json();

    const ip = request.headers.get("x-forwarded-for") || "unknown";

    if (!email || (!password && !otp)) {
      await Log.create({
        userId: null,
        action: "LOGIN_FAILED_MISSING_FIELDS",
        ipAddress: ip,
      });
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
      await Log.create({
        userId: null,
        action: "LOGIN_FAILED_USER_NOT_FOUND",
        ipAddress: ip,
      });
      return NextResponse.json(
        { success: false, error: "User not found. Please sign up." },
        { status: 400 }
      );
    }

    await Otp.deleteMany({ email, expiresAt: { $lt: new Date() } });

    if (otp) {
      const latestOtp = await Otp.findOne({
        email,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });

      if (!latestOtp) {
        await Log.create({
          userId: user._id,
          action: "LOGIN_FAILED_OTP_EXPIRED",
          ipAddress: ip,
        });
        return NextResponse.json(
          { success: false, error: "OTP not found or expired." },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(otp, latestOtp.otp);
      if (!isMatch) {
        await Log.create({
          userId: user._id,
          action: "LOGIN_FAILED_OTP_INVALID",
          ipAddress: ip,
        });
        return NextResponse.json(
          { success: false, error: "Invalid OTP." },
          { status: 401 }
        );
      }

      await Otp.deleteMany({ email });
    } else if (password) {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        await Log.create({
          userId: user._id,
          action: "LOGIN_FAILED_PASSWORD_INVALID",
          ipAddress: ip,
        });
        return NextResponse.json(
          { success: false, error: "Incorrect password." },
          { status: 401 }
        );
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    const response = NextResponse.json(
      { success: true, message: "Login successful!" },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
      path: "/",
    });

    await Log.create({
      userId: user._id,
      action: "LOGIN_SUCCESS",
      ipAddress: ip,
    });

    return response;
  } catch (err) {
    console.error("verify-login error:", err);
    await Log.create({
      userId: null,
      action: "LOGIN_FAILED_SERVER_ERROR",
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      details: err.message,
    });

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
