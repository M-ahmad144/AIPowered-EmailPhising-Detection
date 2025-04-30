import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Log from "@/models/logsModel";
import { connect } from "@/dbConfig";

export const POST = async (request) => {
  await connect();

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  let userId = null;

  try {
    // Try extracting the token before removing it
    const token = request.cookies.get("token")?.value;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      userId = decoded.id;
    }

    await Log.create({
      userId,
      action: "LOGOUT_SUCCESS",
      ipAddress: ip,
    });

    const response = new NextResponse(
      JSON.stringify({ message: "Logged out successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
    });

    return response;
  } catch (err) {
    console.error("Logout error:", err);

    await Log.create({
      userId,
      action: "LOGOUT_FAILED",
      ipAddress: ip,
      details: err.message,
    });

    return NextResponse.json(
      { success: false, error: "Logout failed." },
      { status: 500 }
    );
  }
};
