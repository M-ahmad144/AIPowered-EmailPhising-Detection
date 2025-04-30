// app/api/logs/[userId]/route.ts
import { NextResponse } from "next/server";
import { connect } from "@/dbConfig";
import Log from "@/models/logsModel";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    await connect();

    // Authenticate and authorize
    const token = req.cookies.get("token")?.value;
    const user = await getUserFromToken(token);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden", message: "Admin access only" },
        { status: 403 }
      );
    }

    const logs = await Log.find({ userId: params.userId })
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    return NextResponse.json({ logs }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error", message: err.message },
      { status: 500 }
    );
  }
}
