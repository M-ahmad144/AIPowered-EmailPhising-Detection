// app/api/admin/users/all/route.ts
import { connect } from "@/dbConfig";
import User from "@/models/userModel";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connect();

    // Get all users sorted by latest
    const users = await User.find().sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
