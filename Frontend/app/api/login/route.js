import { NextResponse } from "next/server";
import { connect } from "@/dbConfig";
import User from "@/models/userModel";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

connect();

export const POST = async (req) => {
  try {
    const { email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user)
      return NextResponse.json(
        { message: "User does not exist!" },
        { status: 400 }
      );

    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword)
      return NextResponse.json(
        { message: "Invalid Password" },
        { status: 401 }
      );

    const tokenData = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    const res = NextResponse.json(
      { message: "User logged in successfully!" },
      { status: 200 }
    );
    res.cookies.set("token", tokenData, { httpOnly: true });

    return res;
  } catch (err) {
    console.log(err);
    return NextResponse.error();
  }
};
