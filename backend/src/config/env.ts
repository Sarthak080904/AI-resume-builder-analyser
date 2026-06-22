import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongodbUri: process.env.MONGODB_URI || "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  anthropicModel:
    process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514"
};
