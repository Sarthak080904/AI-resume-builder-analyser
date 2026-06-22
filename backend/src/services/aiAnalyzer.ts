import Anthropic from "@anthropic-ai/sdk";
import { env } from "../config/env.js";
import type { AnalysisResult } from "../types/analysis.js";
import { heuristicAnalyze } from "./heuristicAnalyzer.js";

const client = env.anthropicApiKey
  ? new Anthropic({
      apiKey: env.anthropicApiKey
    })
  : null;

export async function analyzeResume(
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResult & { mode: "ai" | "heuristic" }> {
  if (!client) {
    return {
      ...heuristicAnalyze(resumeText, jobDescription),
      mode: "heuristic"
    };
  }

  const prompt = `
Analyze this resume for ATS compatibility and job fit.

Return ONLY valid JSON.

Required JSON structure:

{
  "overallScore": number,
  "atsScore": number,
  "roleFitScore": number,
  "clarityScore": number,
  "impactScore": number,
  "summary": string,
  "strengths": string[],
  "gaps": string[],
  "missingKeywords": string[],
  "matchedKeywords": [],
  "improvementPlan": string[],
  "rewrittenSummary": string,
  "bulletRewrites": string[],
  "atsWarnings": string[],
  "recommendedSkills": string[],
  "sectionScores": {},
  "bulletDiagnostics": [],
  "applyReadyChecklist": [],
  "topFiveActions": string[],
  "keywordCoverage": {}
}

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}
`;

  const response = await client.messages.create({
    model: env.anthropicModel,
    max_tokens: 4000,
    temperature: 0.3,
    system:
      "You are an expert ATS resume analyst and recruiter. Return only valid JSON.",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const firstBlock = response.content[0];

  if (firstBlock.type !== "text") {
    throw new Error("Unexpected Claude response");
  }

  let text = firstBlock.text.trim();

  text = text.replace(/^```json/, "");
  text = text.replace(/^```/, "");
  text = text.replace(/```$/, "");

  const result = JSON.parse(text);

  return {
    ...(result as AnalysisResult),
    mode: "ai"
  };
}
