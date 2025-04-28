// app/api/admin/users/all/route.ts
import { connect } from "@/dbConfig";
import User from "@/models/userModel";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connect();

    const users = await User.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, users }); // ✅ Add success field
  } catch (error) {
    console.error("Error fetching all users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" }, // ✅ Also add success: false
      { status: 500 }
    );
  }
}
