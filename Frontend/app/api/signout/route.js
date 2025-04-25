import { NextResponse } from "next/server";

export const POST = async () => {
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
};
