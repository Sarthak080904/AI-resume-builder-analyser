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


Analyze this resume for ATS compatibility and job fit.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}
`;

const response = await ai.models.generateContent({
  model: env.geminiModel,
  contents: prompt,
});

const rawText = response.text ?? "{}";

const cleanedText = rawText
  .replace(/^```json\s*/i, "")
  .replace(/^```\s*/i, "")
  .replace(/\s*```$/i, "")
  .trim();

const result = JSON.parse(cleanedText);

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
