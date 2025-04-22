import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { connect } from "../../../dbConfig";
import Otp from "../../../models/otpModel";
import User from "../../../models/userModel";

export async function POST(request) {
  try {
    await connect();

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    //  Step 1: Delete unverified user (if exists)
    await User.deleteOne({ email, isVerified: false });

    // 🔄 Step 2: Remove existing OTPs
    await Otp.deleteMany({ email });

    // 🔐 Step 3: Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = bcrypt.hashSync(otp, 10);

    const newOtp = new Otp({
      email,
      otp: hashedOtp,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    });

    await newOtp.save();

    // ✉️ Step 4: Send email
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Your New OTP Code",
      text: `Your new OTP code is ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #000;">Your New Verification Code</h2>
          <p>Use the following code to verify your account:</p>
          <div style="background-color: #f2f2f2; padding: 10px; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; letter-spacing: 5px;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, just ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({
      message: "OTP resent and unverified user removed",
    });
  } catch (error) {
    console.error("Error resending OTP:", error);
    return NextResponse.json(
      { message: "Failed to resend OTP" },
      { status: 500 }
    );
  }
}
