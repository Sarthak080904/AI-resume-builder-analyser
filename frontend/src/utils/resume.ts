import type { ResumeData } from "../types";

export const emptyResume: ResumeData = {
  fullName: "Sarthak Sharma",
  headline: "Full Stack Developer",
  email: "sarthak@example.com",
  phone: "+91 98765 43210",
  location: "India",
  links: [
    { id: "linkedin", label: "LinkedIn", url: "linkedin.com/in/sarthak" },
    { id: "github", label: "GitHub", url: "github.com/sarthak" }
  ],
  summary:
    "Full stack developer experienced in building reliable web applications with React, Node.js, Express, and MongoDB. Strong focus on clean user experiences, scalable APIs, and measurable product outcomes.",
  skills:
    "React, TypeScript, JavaScript, Node.js, Express, MongoDB, REST APIs, Tailwind CSS, Git, Agile, Testing",
  experience: [
    {
      company: "Example Technologies",
      role: "Full Stack Developer",
      location: "Remote",
      start: "Jan 2024",
      end: "Present",
      bullets:
        "Built responsive React dashboards that improved recruiter workflow speed by 30%.\nDeveloped Express APIs with MongoDB models for resume analysis and saved drafts.\nCollaborated with product stakeholders to ship accessible, ATS-focused resume tools."
    }
  ],
  projects: [
    {
      name: "AI Resume Analyser",
      tech: "React, Node.js, OpenAI, MongoDB",
      bullets:
        "Created an AI-powered analysis workflow that compares resumes with job descriptions.\nDesigned ATS-friendly scoring for keywords, clarity, impact, and role fit."
    }
  ],
  education: [
    {
      school: "Your University",
      degree: "B.Tech in Computer Science",
      year: "2025",
      score: "8.7 CGPA"
    }
  ],
  certifications: "MongoDB Developer Associate, AWS Cloud Practitioner"
};

export function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function formatResumeLinks(links: ResumeData["links"]) {
  return links
    .map((link) => {
      const label = link.label.trim();
      const url = link.url.trim();

      if (!url) return "";
      return label ? `${label}: ${url}` : url;
    })
    .filter(Boolean);
}

export function safeFileName(value: string, fallback = "resume") {
  return (value || fallback)
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || fallback;
}

export function resumeToPlainText(resume: ResumeData) {
  const contact = [
    resume.email,
    resume.phone,
    resume.location,
    ...formatResumeLinks(resume.links)
  ].filter(Boolean);

  const blocks = [
    resume.fullName,
    resume.headline,
    contact.join(" | "),
    "",
    "SUMMARY",
    resume.summary,
    "",
    "SKILLS",
    resume.skills,
    "",
    "EXPERIENCE",
    ...resume.experience.flatMap((item) => [
      `${item.role}, ${item.company}`,
      [item.location, [item.start, item.end].filter(Boolean).join(" - ")].filter(Boolean).join(" | "),
      ...lines(item.bullets).map((line) => `- ${line}`),
      ""
    ]),
    "PROJECTS",
    ...resume.projects.flatMap((item) => [
      `${item.name}${item.tech ? ` | ${item.tech}` : ""}`,
      ...lines(item.bullets).map((line) => `- ${line}`),
      ""
    ]),
    "EDUCATION",
    ...resume.education.flatMap((item) => [
      `${item.degree}, ${item.school}`,
      [item.year, item.score].filter(Boolean).join(" | "),
      ""
    ]),
    resume.certifications ? "CERTIFICATIONS" : "",
    resume.certifications
  ];

  return blocks.filter((block) => block !== undefined).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function downloadTextFile(fileName: string, content: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function resumeToWordHtml(resume: ResumeData) {
  const text = resumeToPlainText(resume);
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; color: #172026; font-size: 11pt; line-height: 1.35; }
    h1 { font-size: 22pt; margin: 0 0 4pt; }
    h2 { font-size: 12pt; margin: 14pt 0 4pt; border-bottom: 1pt solid #172026; text-transform: uppercase; }
    p { margin: 0 0 6pt; }
    pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
  </style>
</head>
<body>
  <pre>${escapeHtml(text)}</pre>
</body>
</html>`;
}
