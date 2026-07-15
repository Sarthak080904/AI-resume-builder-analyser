import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import type { ResumeAssistantResult, ResumeData } from "../types/resume.js";

const ai = env.geminiApiKey
  ? new GoogleGenAI({
      apiKey: env.geminiApiKey
    })
  : null;

const emptyResume: ResumeData = {
  fullName: "",
  headline: "",
  email: "",
  phone: "",
  location: "",
  links: [],
  summary: "",
  skills: "",
  experience: [],
  projects: [],
  education: [],
  certifications: ""
};

function cleanJson(rawText: string) {
  const cleanedText = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in AI response");
  }
  return JSON.parse(jsonMatch[0]);
}

function toLines(text: string, limit = 4) {
  return text
    .split(/\n|•|-/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function fallbackFromText(resumeText: string, jobDescription = ""): ResumeAssistantResult {
  const lines = resumeText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const name = lines[0] || "Your Name";
  const email = resumeText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
  const phone = resumeText.match(/(\+?\d[\d\s().-]{7,}\d)/)?.[0] || "";
  const jobTerms =
    jobDescription
      .toLowerCase()
      .match(/[a-z][a-z+#.-]{2,}/g)
      ?.filter((term, index, array) => array.indexOf(term) === index)
      .slice(0, 12) || [];

  return {
    mode: "heuristic",
    suggestions: [
      "AI is not configured, so a structured draft was created from extracted resume text.",
      "Review every field before exporting because parsing can miss section boundaries.",
      "Add missing job-description keywords only where they truthfully describe your experience."
    ],
    resume: {
      ...emptyResume,
      fullName: name,
      headline: jobTerms.slice(0, 3).join(" / ") || "Target Role Candidate",
      email,
      phone,
      summary:
        "Results-focused professional with relevant experience for the target role. Skilled at turning requirements into clear outcomes and collaborating across teams.",
      skills: jobTerms.join(", "),
      experience: [
        {
          company: "Recent Organization",
          role: "Relevant Role",
          location: "",
          start: "",
          end: "",
          bullets: toLines(resumeText, 3).join("\n")
        }
      ]
    }
  };
}

function normalizeResume(value: Partial<ResumeData>): ResumeData {
  return {
    ...emptyResume,
    ...value,
    links: Array.isArray(value.links) ? value.links : [],
    experience: Array.isArray(value.experience) ? value.experience : [],
    projects: Array.isArray(value.projects) ? value.projects : [],
    education: Array.isArray(value.education) ? value.education : []
  };
}

async function generate(prompt: string): Promise<ResumeAssistantResult> {
  if (!ai) {
    throw new Error("AI is not configured");
  }

  const response = await ai.models.generateContent({
    model: env.geminiModel,
    contents: prompt
  });
  const parsed = cleanJson(response.text ?? "{}") as {
    resume?: Partial<ResumeData>;
    suggestions?: string[];
  };

  return {
    mode: "ai",
    resume: normalizeResume(parsed.resume || {}),
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
  };
}

export async function tailorResumeDraft(resumeText: string, jobDescription: string): Promise<ResumeAssistantResult> {
  const prompt = `
You are an ATS resume builder.

Create a truthful, editable resume draft from the uploaded resume text and target job description.

Rules:
1. Return ONLY valid JSON.
2. Do not invent employers, degrees, dates, certifications, metrics, or contact details.
3. Use the job description to tailor wording and skills, but only where supported by the resume text.
4. Use concise, achievement-focused bullets.
5. Keep formatting ATS-friendly: standard sections, no tables, no icons, no rating bars.

Return exactly this JSON shape:
{
  "resume": {
    "fullName": "",
    "headline": "",
    "email": "",
    "phone": "",
    "location": "",
    "links": [{ "id": "linkedin", "label": "LinkedIn", "url": "" }],
    "summary": "",
    "skills": "",
    "experience": [{ "company": "", "role": "", "location": "", "start": "", "end": "", "bullets": "" }],
    "projects": [{ "name": "", "tech": "", "bullets": "" }],
    "education": [{ "school": "", "degree": "", "year": "", "score": "" }],
    "certifications": ""
  },
  "suggestions": []
}

JOB DESCRIPTION:
${jobDescription}

RESUME TEXT:
${resumeText}
`;

  try {
    return await generate(prompt);
  } catch (error) {
    console.error("Resume tailoring failed:", error);
    return fallbackFromText(resumeText, jobDescription);
  }
}

export async function assistResumeBuilder(
  resume: ResumeData,
  instruction: string,
  jobDescription = ""
): Promise<ResumeAssistantResult> {
  const prompt = `
You are an AI resume writing assistant inside an ATS resume builder.

Improve the user's current resume according to the instruction.

Rules:
1. Return ONLY valid JSON.
2. Preserve truthful user-provided facts.
3. Do not invent companies, dates, degrees, certifications, metrics, or contact details.
4. Improve language, clarity, ATS keyword alignment, and bullet impact.
5. Keep the same JSON shape and keep bullets separated by newline characters.

Return exactly this JSON shape:
{
  "resume": {
    "fullName": "",
    "headline": "",
    "email": "",
    "phone": "",
    "location": "",
    "links": [{ "id": "", "label": "", "url": "" }],
    "summary": "",
    "skills": "",
    "experience": [{ "company": "", "role": "", "location": "", "start": "", "end": "", "bullets": "" }],
    "projects": [{ "name": "", "tech": "", "bullets": "" }],
    "education": [{ "school": "", "degree": "", "year": "", "score": "" }],
    "certifications": ""
  },
  "suggestions": []
}

INSTRUCTION:
${instruction}

TARGET JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME JSON:
${JSON.stringify(resume)}
`;

  try {
    return await generate(prompt);
  } catch (error) {
    console.error("Resume assistant failed:", error);
    return {
      mode: "heuristic",
      resume,
      suggestions: [
        "AI is not configured or did not return valid JSON.",
        "Use action verbs, add truthful metrics, and place target-role keywords in Summary, Skills, and Experience.",
        "Keep the downloaded resume single-column with standard section headings."
      ]
    };
  }
}
