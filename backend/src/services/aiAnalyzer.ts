import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import type { AnalysisResult } from "../types/analysis.js";
import { heuristicAnalyze } from "./heuristicAnalyzer.js";

const ai = env.geminiApiKey
? new GoogleGenAI({
apiKey: env.geminiApiKey,
})
: null;

function normalizeAnalysis(result: Partial<AnalysisResult>, fallback: AnalysisResult): AnalysisResult {
return {
...fallback,
...result,
strengths: Array.isArray(result.strengths) ? result.strengths : fallback.strengths,
gaps: Array.isArray(result.gaps) ? result.gaps : fallback.gaps,
missingKeywords: Array.isArray(result.missingKeywords) ? result.missingKeywords : fallback.missingKeywords,
matchedKeywords: Array.isArray(result.matchedKeywords) ? result.matchedKeywords : fallback.matchedKeywords,
improvementPlan: Array.isArray(result.improvementPlan) ? result.improvementPlan : fallback.improvementPlan,
bulletRewrites: Array.isArray(result.bulletRewrites) ? result.bulletRewrites : fallback.bulletRewrites,
atsWarnings: Array.isArray(result.atsWarnings) ? result.atsWarnings : fallback.atsWarnings,
recommendedSkills: Array.isArray(result.recommendedSkills) ? result.recommendedSkills : fallback.recommendedSkills,
sectionScores: result.sectionScores && typeof result.sectionScores === "object" ? result.sectionScores : fallback.sectionScores,
bulletDiagnostics: Array.isArray(result.bulletDiagnostics) ? result.bulletDiagnostics : fallback.bulletDiagnostics,
applyReadyChecklist: Array.isArray(result.applyReadyChecklist) ? result.applyReadyChecklist : fallback.applyReadyChecklist,
topFiveActions: Array.isArray(result.topFiveActions) ? result.topFiveActions : fallback.topFiveActions,
keywordCoverage: result.keywordCoverage && typeof result.keywordCoverage === "object" ? result.keywordCoverage : fallback.keywordCoverage,
keywordRecommendations: Array.isArray(result.keywordRecommendations)
? result.keywordRecommendations
: fallback.keywordRecommendations
};
}

export async function analyzeResume(
resumeText: string,
jobDescription: string
): Promise<AnalysisResult & { mode: "ai" | "heuristic" }> {
try {
if (!ai) {
return {
...heuristicAnalyze(resumeText, jobDescription),
mode: "heuristic",
};
}

const fallback = heuristicAnalyze(resumeText, jobDescription);

const prompt = `

You are an ATS Resume Analyzer.

Analyze the resume against the job description.

IMPORTANT RULES:

1. Return ONLY valid JSON.
2. Do NOT include markdown.
3. Do NOT include code blocks.
4. Do NOT include explanations.
5. Do NOT write "Here's the analysis".
6. Do NOT write comments inside JSON.
7. Use double quotes for all strings.
8. Do NOT use trailing commas.
9. Output must start with { and end with }.
10. Every array item must be a plain string.
11. Except matchedKeywords, bulletDiagnostics, applyReadyChecklist, keywordCoverage, keywordRecommendations, and sectionScores, every array item must be a plain string.
12. If information is unavailable, return an empty array [] or empty string "".
13. Do not invent experience, employers, certifications, dates, metrics, or tools.

Return EXACTLY this structure:

{
"overallScore": 0,
"atsScore": 0,
"roleFitScore": 0,
"clarityScore": 0,
"impactScore": 0,
"summary": "",
"strengths": [],
"gaps": [],
"missingKeywords": [],
"matchedKeywords": [],
"improvementPlan": [],
"rewrittenSummary": "",
"bulletRewrites": [],
"atsWarnings": [],
"recommendedSkills": [],
"sectionScores": { "summary": 0, "skills": 0, "experience": 0, "projects": 0, "education": 0 },
"bulletDiagnostics": [{ "original": "", "issue": "", "rewrite": "" }],
"applyReadyChecklist": [{ "label": "", "passed": true, "guidance": "" }],
"topFiveActions": [],
"keywordCoverage": {
  "technical": { "matched": 0, "total": 0 },
  "soft": { "matched": 0, "total": 0 },
  "domain": { "matched": 0, "total": 0 },
  "tools": { "matched": 0, "total": 0 },
  "certification": { "matched": 0, "total": 0 }
},
"keywordRecommendations": [{
  "keyword": "",
  "category": "technical",
  "priority": "high",
  "suggestedSection": "experience",
  "guidance": ""
}]
}

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}
`;

const response = await ai.models.generateContent({
  model: env.geminiModel,
  contents: prompt,
});

console.log("========== GEMINI RESPONSE ==========");
console.log(response.text);
console.log("====================================");

const rawText = response.text ?? "{}";

const cleanedText = rawText
  .replace(/^```json\s*/i, "")
  .replace(/^```\s*/i, "")
  .replace(/\s*```$/i, "")
  .trim();

const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

if (!jsonMatch) {
  throw new Error("No JSON found in Gemini response");
}

try {
  const result = JSON.parse(jsonMatch[0]);

  return {
    ...normalizeAnalysis(result as Partial<AnalysisResult>, fallback),
    mode: "ai",
  };
} catch (parseError) {
  console.error("JSON Parse Failed:", parseError);

  return {
    ...heuristicAnalyze(resumeText, jobDescription),
    mode: "heuristic",
  };
}

} catch (error) {
console.error("Gemini failed:", error);

return {
  ...heuristicAnalyze(resumeText, jobDescription),
  mode: "heuristic",
};

}
}
