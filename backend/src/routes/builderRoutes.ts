import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { assistResumeBuilder, tailorResumeDraft } from "../services/resumeAssistant.js";
import { parseResumeFile } from "../services/fileParser.js";
import type { ResumeData } from "../types/resume.js";
import { HttpError } from "../utils/errors.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }
});

const jobSchema = z.object({
  jobDescription: z.string().min(80, "Paste a job description with at least 80 characters.")
});

const assistSchema = z.object({
  resume: z.custom<ResumeData>(),
  instruction: z.string().min(8, "Tell the AI what to improve."),
  jobDescription: z.string().optional().default("")
});

router.post("/tailor", upload.single("resume"), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new HttpError(400, "Resume file is required.");
    }

    const { jobDescription } = jobSchema.parse(req.body);
    const resumeText = await parseResumeFile(req.file);
    const result = await tailorResumeDraft(resumeText, jobDescription);

    res.json({
      fileName: req.file.originalname,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

router.post("/assist", async (req, res, next) => {
  try {
    const { resume, instruction, jobDescription } = assistSchema.parse(req.body);
    const result = await assistResumeBuilder(resume, instruction, jobDescription);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
