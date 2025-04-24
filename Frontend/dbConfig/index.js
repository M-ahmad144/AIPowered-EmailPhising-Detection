import mongoose from "mongoose";

let isConnected = false;

export async function connect() {
  if (isConnected) return;

  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URL);

    mongoose.connection.on("connected", () => {
      console.log("✅ Connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    isConnected = true;
  } catch (err) {
    console.error("🚨 Error connecting to MongoDB:", err);
    throw err;
  }
}
