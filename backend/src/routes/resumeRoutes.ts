import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { ResumeModel } from "../models/Resume.js";

const router = Router();

const resumeSchema = z.object({
  title: z.string().min(1).max(120),
  data: z.record(z.string(), z.unknown())
});

router.post("/", async (req, res, next) => {
  try {
    const payload = resumeSchema.parse(req.body);

    if (mongoose.connection.readyState !== 1) {
      res.status(202).json({
        message: "MongoDB is not configured. Resume is available in the browser only.",
        resume: payload
      });
      return;
    }

    const resume = await ResumeModel.create(payload);
    res.status(201).json(resume);
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

    const resumes = await ResumeModel.find().sort({ updatedAt: -1 }).limit(20);
    res.json(resumes);
  } catch (error) {
    next(error);
  }
});

export default router;
