// app/api/admin/users/[userId]/route.js
import { connect } from "@/dbConfig";
import User from "@/models/userModel";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function PUT(request) {
  try {
    await connect();

    // Get userId from URL
    const url = new URL(request.url);
    const userId = url.pathname.split("/").pop();

    // Alternative method if above doesn't work:
    // const segments = request.nextUrl.pathname.split('/');
    // const userId = segments[segments.length - 1];

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: "Invalid User ID format" },
        { status: 400 }
      );
    }

    const updateData = await request.json();

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}
