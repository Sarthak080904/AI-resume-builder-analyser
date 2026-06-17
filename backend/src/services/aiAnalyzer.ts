import OpenAI from "openai";
import { env } from "../config/env.js";
import type { AnalysisResult } from "../types/analysis.js";
import { heuristicAnalyze } from "./heuristicAnalyzer.js";

const client = env.openAiApiKey ? new OpenAI({ apiKey: env.openAiApiKey }) : null;

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    overallScore: { type: "number" },
    atsScore: { type: "number" },
    roleFitScore: { type: "number" },
    clarityScore: { type: "number" },
    impactScore: { type: "number" },
    summary: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    gaps: { type: "array", items: { type: "string" } },
    missingKeywords: { type: "array", items: { type: "string" } },
    matchedKeywords: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          keyword: { type: "string" },
          found: { type: "boolean" },
          category: {
            type: "string",
            enum: ["technical", "soft", "domain", "tools", "certification"]
          }
        },
        required: ["keyword", "found", "category"]
      }
    },
    improvementPlan: { type: "array", items: { type: "string" } },
    rewrittenSummary: { type: "string" },
    bulletRewrites: { type: "array", items: { type: "string" } },
    atsWarnings: { type: "array", items: { type: "string" } },
    recommendedSkills: { type: "array", items: { type: "string" } }
  },
  required: [
    "overallScore",
    "atsScore",
    "roleFitScore",
    "clarityScore",
    "impactScore",
    "summary",
    "strengths",
    "gaps",
    "missingKeywords",
    "matchedKeywords",
    "improvementPlan",
    "rewrittenSummary",
    "bulletRewrites",
    "atsWarnings",
    "recommendedSkills"
  ]
} as const;

export async function analyzeResume(
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResult & { mode: "ai" | "heuristic" }> {
  if (!client) {
    return { ...heuristicAnalyze(resumeText, jobDescription), mode: "heuristic" };
  }

  const response = await client.responses.create({
    model: env.openAiModel,
    instructions:
      "You are an expert ATS resume analyst and technical recruiter. Return only structured JSON that follows the schema. Be direct, practical, and truthful. Do not invent experience. Score strictly based on the resume text and target job description.",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Analyze this resume for ATS compatibility and job fit.\n\nTARGET JOB DESCRIPTION:\n${jobDescription}\n\nRESUME TEXT:\n${resumeText}`
          }
        ]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "resume_analysis",
        strict: true,
        schema: analysisSchema
      }
    }
  });

  const output = response.output_text;
  return { ...(JSON.parse(output) as AnalysisResult), mode: "ai" };
}
