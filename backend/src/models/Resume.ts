import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Untitled Resume" },
    data: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  { timestamps: true }
);

export const ResumeModel =
  mongoose.models.Resume || mongoose.model("Resume", ResumeSchema);
