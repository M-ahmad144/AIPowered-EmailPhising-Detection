// app/api/admin/users/deleteUser/route.ts
import { connect } from "@/dbConfig";
import User from "@/models/userModel";
import { NextResponse } from "next/server";
import mongoose from "mongoose"; 

export async function DELETE(request) {
  try {
    await connect();

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // ✅ validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: "Invalid User ID format" },
        { status: 400 }
      );
    }

    const deletedUser = await User.findByIdAndDelete(
      new mongoose.Types.ObjectId(userId)
    );

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
