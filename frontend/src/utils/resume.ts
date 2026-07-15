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
    .map((line) => line.trim().replace(/^([•*-]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
}

export function hasText(...values: Array<string | undefined>) {
  return values.some((value) => Boolean(value?.trim()));
}

export function visibleExperience(resume: ResumeData) {
  return resume.experience.filter((item) =>
    hasText(item.company, item.role, item.location, item.start, item.end, item.bullets)
  );
}

export function visibleProjects(resume: ResumeData) {
  return resume.projects.filter((item) => hasText(item.name, item.tech, item.bullets));
}

export function visibleEducation(resume: ResumeData) {
  return resume.education.filter((item) => hasText(item.school, item.degree, item.year, item.score));
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
    ...visibleExperience(resume).flatMap((item) => [
      `${item.role}, ${item.company}`,
      [item.location, [item.start, item.end].filter(Boolean).join(" - ")].filter(Boolean).join(" | "),
      ...lines(item.bullets).map((line) => `- ${line}`),
      ""
    ]),
    "PROJECTS",
    ...visibleProjects(resume).flatMap((item) => [
      `${item.name}${item.tech ? ` | ${item.tech}` : ""}`,
      ...lines(item.bullets).map((line) => `- ${line}`),
      ""
    ]),
    "EDUCATION",
    ...visibleEducation(resume).flatMap((item) => [
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
  const contact = [
    resume.email,
    resume.phone,
    resume.location,
    ...formatResumeLinks(resume.links)
  ].filter(Boolean);
  const renderBullets = (value: string) =>
    lines(value)
      .map((line) => `<li>${escapeHtml(line)}</li>`)
      .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; color: #172026; font-size: 10.5pt; line-height: 1.35; margin: 36pt; }
    h1 { font-size: 22pt; margin: 0 0 3pt; }
    .headline { font-weight: 700; margin: 0 0 5pt; }
    .contact { color: #4d5b63; font-size: 9pt; margin: 0 0 12pt; }
    h2 { font-size: 11pt; margin: 10pt 0 5pt; padding-bottom: 2pt; border-bottom: 1pt solid #172026; text-transform: uppercase; }
    p { margin: 0 0 5pt; }
    .row { margin: 0 0 7pt; }
    .row-top { display: flex; justify-content: space-between; gap: 10pt; }
    .muted { color: #4d5b63; }
    ul { margin: 3pt 0 0 16pt; padding: 0; }
    li { margin: 0 0 2pt; }
  </style>
</head>
<body>
  <h1>${escapeHtml(resume.fullName)}</h1>
  <p class="headline">${escapeHtml(resume.headline)}</p>
  <p class="contact">${escapeHtml(contact.join(" | "))}</p>

  <h2>Summary</h2>
  <p>${escapeHtml(resume.summary)}</p>

  <h2>Skills</h2>
  <p>${escapeHtml(resume.skills)}</p>

  <h2>Experience</h2>
  ${visibleExperience(resume)
    .map(
      (item) => `<div class="row">
        <div class="row-top"><strong>${escapeHtml([item.role, item.company].filter(Boolean).join(", "))}</strong><span class="muted">${escapeHtml([item.start, item.end].filter(Boolean).join(" - "))}</span></div>
        ${item.location ? `<p class="muted">${escapeHtml(item.location)}</p>` : ""}
        ${lines(item.bullets).length ? `<ul>${renderBullets(item.bullets)}</ul>` : ""}
      </div>`
    )
    .join("")}

  <h2>Projects</h2>
  ${visibleProjects(resume)
    .map(
      (item) => `<div class="row">
        <strong>${escapeHtml(`${item.name}${item.tech ? ` | ${item.tech}` : ""}`)}</strong>
        ${lines(item.bullets).length ? `<ul>${renderBullets(item.bullets)}</ul>` : ""}
      </div>`
    )
    .join("")}

  <h2>Education</h2>
  ${visibleEducation(resume)
    .map(
      (item) => `<div class="row row-top">
        <span><strong>${escapeHtml(item.degree)}</strong>${item.school ? `, ${escapeHtml(item.school)}` : ""}</span>
        <span class="muted">${escapeHtml([item.year, item.score].filter(Boolean).join(" | "))}</span>
      </div>`
    )
    .join("")}

  ${resume.certifications ? `<h2>Certifications</h2><p>${escapeHtml(resume.certifications)}</p>` : ""}
</body>
</html>`;
}
