import { NextResponse } from "next/server";
import { connect } from "../../../dbConfig/index";
import User from "../../../models/userModel";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

connect();

export const POST = async (req) => {
  try {
    const { email, password } = await req.json();

    // ✅ Select password explicitly
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return NextResponse.json(
        { message: "User does not exist!" },
        { status: 400 }
      );
    }

    // ✅ Password is now guaranteed to be included
    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { message: "Invalid Password" },
        { status: 401 }
      );
    }

    const tokenData = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    const res = NextResponse.json(
      { message: "User logged in successfully!" },
      { status: 200 }
    );

    res.cookies.set("token", tokenData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
