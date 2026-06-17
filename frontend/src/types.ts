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
