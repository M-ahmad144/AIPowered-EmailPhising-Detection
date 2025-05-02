import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      default: "unknown",
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    banned: {
      type: Boolean,
      default: false, // Track banned status for each IP
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Log || mongoose.model("Log", logSchema);
