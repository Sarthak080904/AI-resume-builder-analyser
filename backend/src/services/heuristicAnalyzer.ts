import type { AnalysisResult, KeywordMatch } from "../types/analysis.js";

const stopWords = new Set([
  "the",
  "and",
  "with",
  "for",
  "you",
  "are",
  "will",
  "that",
  "this",
  "from",
  "have",
  "has",
  "into",
  "your",
  "our",
  "their",
  "team",
  "work",
  "role",
  "job",
  "years",
  "experience"
]);

const tools = [
  "react",
  "node",
  "express",
  "mongodb",
  "typescript",
  "javascript",
  "python",
  "aws",
  "docker",
  "kubernetes",
  "sql",
  "git",
  "tailwind",
  "redux",
  "next",
  "java",
  "spring",
  "azure",
  "gcp"
];

function uniqueTerms(text: string) {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .match(/[a-z][a-z+#.-]{2,}/g)
        ?.filter((word) => !stopWords.has(word)) || []
    )
  );
}

function classify(keyword: string): KeywordMatch["category"] {
  if (tools.includes(keyword)) return "tools";
  if (["communication", "leadership", "collaboration", "ownership"].includes(keyword)) {
    return "soft";
  }
  if (["certified", "certification", "pmp", "aws-certified"].includes(keyword)) {
    return "certification";
  }
  return "technical";
}

function clamp(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function heuristicAnalyze(resumeText: string, jobDescription: string): AnalysisResult {
  const resume = resumeText.toLowerCase();
  const jdTerms = uniqueTerms(jobDescription);
  const important = jdTerms
    .filter((term) => term.length > 3)
    .sort((a, b) => {
      const aBoost = tools.includes(a) ? 1 : 0;
      const bBoost = tools.includes(b) ? 1 : 0;
      return bBoost - aBoost;
    })
    .slice(0, 35);

  const matchedKeywords = important.map((keyword) => ({
    keyword,
    found: resume.includes(keyword),
    category: classify(keyword)
  }));

  const matchedCount = matchedKeywords.filter((item) => item.found).length;
  const keywordScore = important.length ? (matchedCount / important.length) * 100 : 50;
  const metricsScore = (resumeText.match(/\b\d+(\.\d+)?%?|\$\d+|\b\d+\+\b/g)?.length || 0) * 8;
  const actionVerbScore = [
    "built",
    "led",
    "improved",
    "reduced",
    "increased",
    "delivered",
    "designed",
    "launched",
    "optimized"
  ].filter((verb) => resume.includes(verb)).length * 7;
  const sectionScore = ["experience", "skills", "education", "projects"].filter((section) =>
    resume.includes(section)
  ).length * 12;

  const atsScore = clamp(keywordScore * 0.55 + sectionScore + 20);
  const impactScore = clamp(metricsScore + actionVerbScore + 25);
  const clarityScore = clamp(resumeText.length > 900 ? 78 : 62);
  const roleFitScore = clamp(keywordScore);
  const overallScore = clamp(
    atsScore * 0.35 + roleFitScore * 0.3 + clarityScore * 0.15 + impactScore * 0.2
  );

  const missingKeywords = matchedKeywords
    .filter((item) => !item.found)
    .map((item) => item.keyword)
    .slice(0, 16);

  return {
    overallScore,
    atsScore,
    roleFitScore,
    clarityScore,
    impactScore,
    summary:
      "Heuristic analysis completed. Add missing role keywords naturally, strengthen impact bullets with metrics, and keep formatting simple for ATS parsing.",
    strengths: [
      matchedCount > 8
        ? "The resume already includes several job-description keywords."
        : "The resume has a usable foundation for tailoring.",
      impactScore > 65
        ? "Some bullets appear to include measurable outcomes."
        : "The content can become stronger by adding measurable results.",
      "The extracted text is readable, which is important for ATS systems."
    ],
    gaps: [
      missingKeywords.length
        ? `Missing important keywords: ${missingKeywords.slice(0, 8).join(", ")}.`
        : "Keyword coverage is strong; focus on specificity and impact.",
      "Some experience bullets may need clearer action, scope, and result structure.",
      "Check that every target skill appears in the right context, not only in a skills list."
    ],
    missingKeywords,
    matchedKeywords,
    improvementPlan: [
      "Rewrite the top 3-5 bullets using action + tool/process + measurable result.",
      "Add missing keywords from the job description only where they are truthful.",
      "Place the most relevant technical skills near the top of the resume.",
      "Keep headings standard: Summary, Skills, Experience, Projects, Education.",
      "Avoid tables, columns, photos, icons, charts, and skill rating bars."
    ],
    rewrittenSummary:
      "Results-driven professional with experience aligned to the target role, combining relevant technical skills, cross-functional collaboration, and measurable delivery impact.",
    bulletRewrites: [
      "Built and improved a role-relevant workflow using target technologies, reducing manual effort and improving delivery speed.",
      "Collaborated with stakeholders to define requirements, ship reliable features, and measure adoption through clear success metrics.",
      "Optimized existing processes by identifying bottlenecks, applying data-driven changes, and documenting repeatable best practices."
    ],
    atsWarnings: [
      "Use a single-column PDF layout with standard section headings.",
      "Do not rely on icons, graphics, or visual skill meters to communicate important information.",
      "Mirror exact job-title and tool keywords when they accurately describe your background."
    ],
    recommendedSkills: missingKeywords.slice(0, 10)
  };
}
