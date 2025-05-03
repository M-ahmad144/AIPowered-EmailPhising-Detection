// pages/api/check-ban.js
import mongoose from "mongoose";
import Log from "@/models/logsModel";
import { connect } from "@/dbConfig/index";

// Connect to your MongoDB database

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { ip } = req.query; // IP sent as a query parameter

      // Ensure database connection
      await connect();

      const bannedLog = await Log.findOne({ ipAddress: ip, banned: true });
      if (bannedLog) {
        return res.status(200).json({ banned: true });
      }

      return res.status(200).json({ banned: false });
    } catch (error) {
      console.error("Error checking ban status:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
