import { Router } from "express";
import mongoose from "mongoose";
import multer from "multer";
import { z } from "zod";
import { AnalysisModel } from "../models/Analysis.js";
import { analyzeResume } from "../services/aiAnalyzer.js";
import { parseResumeFile } from "../services/fileParser.js";
import { HttpError } from "../utils/errors.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }
});

const bodySchema = z.object({
  jobDescription: z.string().min(80, "Paste a job description with at least 80 characters.")
});

router.post("/", upload.single("resume"), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new HttpError(400, "Resume file is required.");
    }

    const { jobDescription } = bodySchema.parse(req.body);
    const resumeText = await parseResumeFile(req.file);
    const result = await analyzeResume(resumeText, jobDescription);

    if (mongoose.connection.readyState === 1) {
      await AnalysisModel.create({
        fileName: req.file.originalname,
        jobDescription,
        resumeText,
        result
      });
    }

    res.json({
      fileName: req.file.originalname,
      resumeTextPreview: resumeText.slice(0, 700),
      result
    });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.json([]);
      return;
    }

    const analyses = await AnalysisModel.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select("fileName result.overallScore result.mode createdAt");

    res.json(analyses);
  } catch (error) {
    next(error);
  }
});

export default router;
