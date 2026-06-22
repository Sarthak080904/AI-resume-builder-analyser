import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

import analyzeRoutes from "./routes/analyzeRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";

import { errorHandler } from "./utils/errors.js";

const app = express();

app.use(helmet());

app.use(
cors({
origin: env.clientUrl,
credentials: true
})
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.get("/", (_req, res) => {
res.json({
name: "AI Resume Analyser API",
status: "running",
version: "1.0.0"
});
});

app.get("/api/health", (_req, res) => {
res.json({
status: "ok",
ai: Boolean(env.geminiApiKey),
model: env.geminiModel,
mongodb: Boolean(env.mongodbUri)
});
});

app.use("/api/analyze", analyzeRoutes);
app.use("/api/resumes", resumeRoutes);

app.use(errorHandler);

try {
await connectDatabase();
} catch (error) {
console.error("Database connection failed:", error);
}

app.listen(env.port, () => {
console.log(`API running on http://localhost:${env.port}`);
console.log(`Gemini configured: ${Boolean(env.geminiApiKey)}`);
console.log(`Model: ${env.geminiModel}`);

if (!env.mongodbUri) {
console.log("MongoDB disabled: MONGODB_URI is not configured.");
}
});
