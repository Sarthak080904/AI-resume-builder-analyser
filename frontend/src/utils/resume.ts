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
