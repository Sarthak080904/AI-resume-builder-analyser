import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  if (!env.mongodbUri) {
    console.log("MongoDB disabled: MONGODB_URI is not configured.");
    return;
  }

  await mongoose.connect(env.mongodbUri);
  console.log("MongoDB connected.");
}
