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

export type ResumeAssistantResult = {
  resume: ResumeData;
  suggestions: string[];
  mode: "ai" | "heuristic";
};
