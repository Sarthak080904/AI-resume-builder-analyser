import dotenv from "dotenv";

dotenv.config();

export const env = {
port: Number(process.env.PORT || 5000),
clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
mongodbUri: process.env.MONGODB_URI || "",

geminiApiKey: process.env.GEMINI_API_KEY || "",
geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash"
};
