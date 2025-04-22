import mongoose from "mongoose";

export async function connect() {
  try {
    mongoose.connect(process.env.MONGODB_URL);
    const connect = mongoose.connection;

    connect.on("connected", () => console.log("Connected to MongoDB"));
    connect.on("error", (err) => {
      console.log(err);
      process.exit();
    });
  } catch (err) {
    console.log(err);
  }
}
