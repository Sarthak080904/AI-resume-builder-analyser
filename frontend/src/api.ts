import axios from "axios";
import type { AnalysisResult, ResumeData } from "./types";

export async function analyzeResume(file: File, jobDescription: string) {
  const formData = new FormData();
  formData.append("resume", file);
  formData.append("jobDescription", jobDescription);

  const { data } = await axios.post<{
    fileName: string;
    resumeTextPreview: string;
    result: AnalysisResult;
  }>("/api/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return data;
}

export async function saveResume(title: string, resume: ResumeData) {
  const { data } = await axios.post("/api/resumes", { title, data: resume });
  return data;
}
