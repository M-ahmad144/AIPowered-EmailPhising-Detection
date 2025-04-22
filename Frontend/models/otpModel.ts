import mongoose, { Document, Schema, Model } from "mongoose";

export interface IOtp {
  email: string;
  otp: string;
  createdAt: Date;
}

// A separate interface for the model that extends Document
export interface IOtpDocument extends IOtp, Document {}

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
      index: { expires: "10m" },
    },
  },
  {
    timestamps: false,
  }
);

// Properly type the model
const Otp: Model<IOtpDocument> =
  mongoose.models.Otp || mongoose.model<IOtpDocument>("Otp", OtpSchema);

export default Otp;
