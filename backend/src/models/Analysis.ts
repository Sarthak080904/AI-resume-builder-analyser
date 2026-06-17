import mongoose from "mongoose";

const AnalysisSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    jobDescription: { type: String, required: true },
    resumeText: { type: String, required: true },
    result: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  { timestamps: true }
);

export const AnalysisModel =
  mongoose.models.Analysis || mongoose.model("Analysis", AnalysisSchema);
