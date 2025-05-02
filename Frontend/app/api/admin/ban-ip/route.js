import Log from "@/models/logsModel";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Get the IP and reason from the request body
    const { ipAddress, reason } = await req.json();

    if (!ipAddress || !reason) {
      return NextResponse.json(
        { error: "IP Address and Reason are required" },
        { status: 400 }
      );
    }

    // Find the log entries for this IP address and update the banned status
    const logs = await Log.find({ ipAddress });

    if (logs.length === 0) {
      return NextResponse.json(
        { error: "No logs found for the given IP address." },
        { status: 404 }
      );
    }

    // Set banned field to true for all logs from this IP address
    await Log.updateMany(
      { ipAddress },
      { $set: { banned: true, meta: { reason } } }
    );

    return NextResponse.json(
      { message: `IP ${ipAddress} has been banned successfully.` },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error", message: err.message },
      { status: 500 }
    );
  }
}
