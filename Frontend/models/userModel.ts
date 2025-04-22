import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: function () {
        return !this.isGoogleAccount; // Only require password if it's not a Google account
      },
      minlength: 8,
      select: false, // Don't return password in queries by default
    },

    isGoogleAccount: {
      type: Boolean,
      default: false,
    },

    otp: {
      code: {
        type: String,
        required: false,
      },
      expiresAt: {
        type: Date,
        required: false,
      },
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
