import axios from "axios";
import type { AnalysisResult, ResumeData } from "./types";

// In production, set VITE_API_URL to the deployed backend's URL (e.g. on Vercel
// env vars). Locally it falls back to a relative path, which works with Vite's
// dev server proxy.
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export async function analyzeResume(file: File, jobDescription: string, storeAnalysis = false) {
  const formData = new FormData();
  formData.append("resume", file);
  formData.append("jobDescription", jobDescription);
  formData.append("storeAnalysis", String(storeAnalysis));

  const { data } = await axios.post<{
    fileName: string;
    resumeTextPreview: string;
    result: AnalysisResult;
  }>(`${API_BASE_URL}/api/analyze`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return data;
}

export async function saveResume(title: string, resume: ResumeData) {
  const { data } = await axios.post(`${API_BASE_URL}/api/resumes`, { title, data: resume });
  return data;
}

export async function tailorResume(file: File, jobDescription: string) {
  const formData = new FormData();
  formData.append("resume", file);
  formData.append("jobDescription", jobDescription);

  const { data } = await axios.post<{
    fileName: string;
    resume: ResumeData;
    suggestions: string[];
    mode: "ai" | "heuristic";
  }>(`${API_BASE_URL}/api/builder/tailor`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return data;
}

export async function assistResume(
  resume: ResumeData,
  instruction: string,
  jobDescription = ""
) {
  const { data } = await axios.post<{
    resume: ResumeData;
    suggestions: string[];
    mode: "ai" | "heuristic";
  }>(`${API_BASE_URL}/api/builder/assist`, {
    resume,
    instruction,
    jobDescription
  });

  return data;
}
