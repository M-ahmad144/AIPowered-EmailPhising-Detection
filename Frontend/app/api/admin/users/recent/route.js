// app/api/admin/users/recent/route.ts
import { connect } from "@/dbConfig"; // MongoDB connection
import User from "@/models/userModel";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connect();

    const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(5);

    return NextResponse.json({ users: recentUsers });
  } catch (error) {
    console.error("Error fetching recent users:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent users" },
      { status: 500 }
    );
  }
}
