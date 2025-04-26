import { connect } from "@/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connect();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json(
        { error: "Missing 'type' query parameter" },
        { status: 400 }
      );
    }

    switch (type) {
      case "total-users": {
        const totalUsers = await User.countDocuments({});
        return NextResponse.json({ totalUsers });
      }

      case "new-signups": {
        // Get the start of the current month
        const startOfMonth = new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        );
        const newSignups = await User.countDocuments({
          createdAt: { $gte: startOfMonth },
        });
        return NextResponse.json({ newSignups });
      }

      case "admin-users": {
        const adminUsers = await User.countDocuments({ role: "admin" });
        return NextResponse.json({ adminUsers });
      }

      case "user-activity": {
        // Get user activity for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // It counts how many users signed up each day in the last 30 days, and formats the results into { date, count } pairs for graphing. 📈
        const userActivity = await User.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        ]);

        const formattedActivity = userActivity.map((item) => ({
          date: `${item._id.year}-${String(item._id.month).padStart(
            2,
            "0"
          )}-${String(item._id.day).padStart(2, "0")}`,
          count: item.count,
        }));

        return NextResponse.json({ userActivity: formattedActivity });
      }

      default:
        return NextResponse.json(
          { error: "Invalid 'type' value" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
