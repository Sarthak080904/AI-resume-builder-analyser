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
  mode: "ai" | "heuristic";
};

export type ResumeData = {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  links: Array<{
    id: string;
    label: string;
    url: string;
  }>;
  summary: string;
  skills: string;
  experience: Array<{
    company: string;
    role: string;
    location: string;
    start: string;
    end: string;
    bullets: string;
  }>;
  projects: Array<{
    name: string;
    tech: string;
    bullets: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    year: string;
    score: string;
  }>;
  certifications: string;
};
