import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const getTokenData = (req) => {
  try {
    const token = req.cookies.get("token")?.value || null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return decoded.id;
  } catch (err) {
    return NextResponse.json({ message: "Invalid Token" }, { status: 500 });
  }
};
