import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import type { AnalysisResult } from "../types/analysis.js";
import { heuristicAnalyze } from "./heuristicAnalyzer.js";

const ai = env.geminiApiKey
? new GoogleGenAI({
apiKey: env.geminiApiKey,
})
: null;

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
11. If information is unavailable, return an empty array [] or empty string "".

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
"sectionScores": {},
"bulletDiagnostics": [],
"applyReadyChecklist": [],
"topFiveActions": [],
"keywordCoverage": {}
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

const jsonMatch = cleanedText.match(/{[\s\S]*}/);

if (!jsonMatch) {
throw new Error("No JSON found in Gemini response");
}

try {
  const result = JSON.parse(jsonMatch[0]);

  return {
    ...(result as AnalysisResult),
    mode: "ai",
  };
} catch (parseError) {
  console.error("JSON Parse Failed:", parseError);

  return {
    ...heuristicAnalyze(resumeText, jobDescription),
    mode: "heuristic",
  };
}

return {
...(result as AnalysisResult),
mode: "ai",
};

} catch (error) {
console.error("Gemini failed:", error);


return {
  ...heuristicAnalyze(resumeText, jobDescription),
  mode: "heuristic",
};

}
}
