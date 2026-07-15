export type KeywordMatch = {
  keyword: string;
  found: boolean;
  category: "technical" | "soft" | "domain" | "tools" | "certification";
};

export type KeywordRecommendation = {
  keyword: string;
  category: KeywordMatch["category"];
  priority: "high" | "medium" | "low";
  suggestedSection: "summary" | "skills" | "experience" | "projects" | "education" | "certifications";
  guidance: string;
};

export type BulletDiagnostic = {
  original: string;
  issue: string;
  rewrite: string;
};

export type ChecklistItem = {
  label: string;
  passed: boolean;
  guidance: string;
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
  sectionScores: Record<string, number>;
  bulletDiagnostics: BulletDiagnostic[];
  applyReadyChecklist: ChecklistItem[];
  topFiveActions: string[];
  keywordCoverage: Record<KeywordMatch["category"], { matched: number; total: number }>;
  keywordRecommendations: KeywordRecommendation[];
};
