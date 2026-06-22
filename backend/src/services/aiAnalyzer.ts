import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import type { AnalysisResult } from "../types/analysis.js";
import { heuristicAnalyze } from "./heuristicAnalyzer.js";

const ai = env.geminiApiKey
? new GoogleGenAI({
apiKey: env.geminiApiKey
})
: null;

export async function analyzeResume(
resumeText: string,
jobDescription: string
): Promise<AnalysisResult & { mode: "ai" | "heuristic" }> {
if (!ai) {
return {
...heuristicAnalyze(resumeText, jobDescription),
mode: "heuristic"
};
}

try {
const prompt = `
Analyze this resume for ATS compatibility and job fit.

Return ONLY valid JSON.

Required JSON structure:

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

````
const response = await ai.models.generateContent({
  model: env.geminiModel,
  contents: prompt
});

const rawText = response.text ?? "";

const cleanedText = rawText
  .replace(/^```json\s*/i, "")
  .replace(/^```\s*/i, "")
  .replace(/\s*```$/i, "")
  .trim();

const result = JSON.parse(cleanedText);

return {
  ...(result as AnalysisResult),
  mode: "ai"
};
````

} catch (error) {
console.error("Gemini failed. Falling back to heuristic mode.", error);

```
return {
  ...heuristicAnalyze(resumeText, jobDescription),
  mode: "heuristic"
};
```

}
}
