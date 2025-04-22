import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { connect } from "../../../dbConfig";
import Otp from "../../../models/otpModel";

// API route handler for verifying OTP
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Connect to the MongoDB database
  await connect();

  // Extract email and OTP from the request body
  const { email, otp } = req.body;

  // Validate input: Ensure email and OTP are provided
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  // Find OTP record by email
  const otpRecord = await Otp.findOne({ email });

  // Check if OTP record exists
  if (!otpRecord) {
    return res.status(400).json({ message: "OTP not found or expired" });
  }

  // Compare provided OTP with the hashed OTP in the database
  const isMatch = bcrypt.compareSync(otp, otpRecord.otp);

  // If OTP does not match, return an error
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // Delete the OTP record after successful verification
  await Otp.deleteOne({ email });

  // Respond with a success message
  return res.status(200).json({ message: "OTP verified successfully" });
}
