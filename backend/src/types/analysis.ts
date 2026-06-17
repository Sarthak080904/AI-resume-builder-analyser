export type KeywordMatch = {
  keyword: string;
  found: boolean;
  category: "technical" | "soft" | "domain" | "tools" | "certification";
};

export type AnalysisResult = {
  overallScore: number;
  atsScore: number;
  roleFitScore: number;
  clarityScore: number;
  impactScore: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  missingKeywords: string[];
  matchedKeywords: KeywordMatch[];
  improvementPlan: string[];
  rewrittenSummary: string;
  bulletRewrites: string[];
  atsWarnings: string[];
  recommendedSkills: string[];
};
