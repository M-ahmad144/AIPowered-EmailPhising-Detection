import mongoose, { Document, Schema, Model } from "mongoose";

// Define the OTP interface
export interface IOtp {
  email: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
}

// A separate interface for the model that extends Document
export interface IOtpDocument extends IOtp, Document {}

// Define the OTP schema
const OtpSchema = new Schema<IOtpDocument>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => Date.now() + 10 * 60 * 1000, // OTP expires in 10 minutes
    },
  },
  {
    timestamps: false,
  }
);

// Set up TTL index on the expiresAt field
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Properly type the model
const Otp: Model<IOtpDocument> =
  mongoose.models.Otp || mongoose.model<IOtpDocument>("Otp", OtpSchema);

export default Otp;
