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
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({
    message: "AI Resume Analyser API",
    status: "running"
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    ai: Boolean(env.anthropicApiKey),
    model: env.anthropicModel,
    mongodb: Boolean(env.mongodbUri)
  });
});

app.use("/api/analyze", analyzeRoutes);
app.use("/api/resumes", resumeRoutes);

app.use(errorHandler);

await connectDatabase();

app.listen(env.port, () => {
  console.log(`API running on http://localhost:${env.port}`);
  console.log(
    `Anthropic configured: ${Boolean(env.anthropicApiKey)}`
  );
  console.log(`Model: ${env.anthropicModel}`);
});
