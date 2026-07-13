import mongoose from "mongoose";
import { env } from "./env.js";

// Monitor Mongoose connection events for better debugging
mongoose.connection.on("connected", () => {
  console.log("🟢 Mongoose connection established successfully");
});

mongoose.connection.on("error", (err) => {
  console.error("🔴 Mongoose connection error occurred:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ Mongoose connection was disconnected");
});

export const connectDB = async (): Promise<void> => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed", error);
    process.exit(1);
  }
};