import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Eye, FileText, Link as LinkIcon, Plus, Save, Sparkles, Trash2, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { assistResume, saveResume } from "../api";
import type { ResumeData } from "../types";
import {
  downloadTextFile,
  emptyResume,
  formatResumeLinks,
  lines,
  resumeToPlainText,
  resumeToWordHtml,
  safeFileName
} from "../utils/resume";
import ResumePdf, { type ResumeTemplate } from "./ResumePdf";

type SectionName = "experience" | "projects" | "education";
type ResumeLink = ResumeData["links"][number];
type SavedVersion = {
  id: string;
  title: string;
  createdAt: string;
  resume: ResumeData;
};

function createLinkId() {
  return `link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ResumeBuilder({
  initialResume,
  jobDescription = "",
  notice,
  onNoticeClear
}: {
  initialResume?: ResumeData | null;
  jobDescription?: string;
  notice?: string;
  onNoticeClear?: () => void;
}) {
  const [resume, setResume] = useState<ResumeData>(emptyResume);
  const [saveState, setSaveState] = useState("");
  const [aiState, setAiState] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [customInstruction, setCustomInstruction] = useState("");
  const [template, setTemplate] = useState<ResumeTemplate>("classic");
  const [versionTitle, setVersionTitle] = useState("");
  const [versions, setVersions] = useState<SavedVersion[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (initialResume) {
      setResume(initialResume);
      setAiSuggestions([]);
    }
  }, [initialResume]);

  useEffect(() => {
    const saved = window.localStorage.getItem("resume-builder-versions");
    if (saved) {
      setVersions(JSON.parse(saved) as SavedVersion[]);
    }
  }, []);

  const persistVersions = (nextVersions: SavedVersion[]) => {
    setVersions(nextVersions);
    window.localStorage.setItem("resume-builder-versions", JSON.stringify(nextVersions.slice(0, 12)));
  };

  useEffect(() => {
    if (!previewOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [previewOpen]);

  const update = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => {
    setResume((current) => ({ ...current, [key]: value }));
  };

  const updateArray = <K extends SectionName>(section: K, index: number, value: ResumeData[K][number]) => {
    setResume((current) => ({
      ...current,
      [section]: current[section].map((item, itemIndex) => (itemIndex === index ? value : item))
    }));
  };

  const addItem = (section: SectionName) => {
    setResume((current) => {
      if (section === "experience") {
        return {
          ...current,
          experience: [
            ...current.experience,
            { company: "", role: "", location: "", start: "", end: "", bullets: "" }
          ]
        };
      }
      if (section === "projects") {
        return { ...current, projects: [...current.projects, { name: "", tech: "", bullets: "" }] };
      }
      return { ...current, education: [...current.education, { school: "", degree: "", year: "", score: "" }] };
    });
  };

  const removeItem = (section: SectionName, index: number) => {
    setResume((current) => ({
      ...current,
      [section]: current[section].filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  const addLink = () => {
    setResume((current) => ({
      ...current,
      links: [...current.links, { id: createLinkId(), label: "", url: "" }]
    }));
  };

  const updateLink = (id: string, key: keyof Omit<ResumeLink, "id">, value: string) => {
    setResume((current) => ({
      ...current,
      links: current.links.map((link) => (link.id === id ? { ...link, [key]: value } : link))
    }));
  };

  const removeLink = (id: string) => {
    setResume((current) => ({
      ...current,
      links: current.links.filter((link) => link.id !== id)
    }));
  };

  const handleSave = async () => {
    setSaveState("Saving...");
    const response = await saveResume(`${resume.fullName} Resume`, resume);
    setSaveState(response.message || "Saved");
    window.setTimeout(() => setSaveState(""), 2500);
  };

  const handleAiAssist = async (instruction: string) => {
    setAiState("Improving resume...");
    try {
      const response = await assistResume(resume, instruction, jobDescription);
      setResume(response.resume);
      setAiSuggestions(response.suggestions);
      setAiState(response.mode === "ai" ? "AI improvements applied." : "Fallback guidance returned.");
    } catch {
      setAiState("AI assist failed. Check the backend server and try again.");
    } finally {
      window.setTimeout(() => setAiState(""), 3000);
    }
  };

  const exportBaseName = safeFileName(resume.fullName);
  const saveVersion = () => {
    const title = versionTitle.trim() || `${resume.fullName || "Resume"} - ${new Date().toLocaleDateString()}`;
    persistVersions([
      {
        id: `version-${Date.now()}`,
        title,
        createdAt: new Date().toISOString(),
        resume
      },
      ...versions
    ]);
    setVersionTitle("");
  };

  return (
    <>
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,840px)_minmax(430px,1fr)] 2xl:items-start">
        <div className="panel overflow-hidden">
          <div className="border-b border-line bg-white px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold">ATS Resume Builder</h2>
                <p className="mt-1 text-sm text-muted">Build from scratch, use AI suggestions, then export ATS-safe files.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-bold hover:border-accent hover:text-accent"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-bold hover:border-accent hover:text-accent"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => downloadTextFile(`${exportBaseName}-ats.txt`, resumeToPlainText(resume))}
                  className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-bold hover:border-accent hover:text-accent"
                >
                  <FileText className="h-4 w-4" />
                  TXT
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadTextFile(
                      `${exportBaseName}.doc`,
                      resumeToWordHtml(resume),
                      "application/msword;charset=utf-8"
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-bold hover:border-accent hover:text-accent"
                >
                  <Download className="h-4 w-4" />
                  Word
                </button>
                <PDFDownloadLink
                  document={<ResumePdf resume={resume} template={template} />}
                  fileName={`${exportBaseName}.pdf`}
                  className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-bold text-white hover:bg-accent/90"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </PDFDownloadLink>
              </div>
            </div>
          </div>

          <div className="space-y-7 p-5 sm:p-6">
            {notice ? (
              <div className="flex flex-col gap-3 rounded-md border border-accent/20 bg-accent/10 p-3 text-sm font-semibold text-accent sm:flex-row sm:items-center sm:justify-between">
                <p>{notice}</p>
                <button type="button" className="text-left underline" onClick={onNoticeClear}>
                  Dismiss
                </button>
              </div>
            ) : null}
            {saveState ? (
              <p className="rounded-md border border-accent/20 bg-accent/10 p-3 text-sm font-semibold text-accent">
                {saveState}
              </p>
            ) : null}
            <section className="rounded-md border border-line bg-paper/60 p-4">
              <div className="mb-4 grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-end">
                <label className="block">
                  <span className="label">Template</span>
                  <select
                    className="field mt-1"
                    value={template}
                    onChange={(event) => setTemplate(event.target.value as ResumeTemplate)}
                  >
                    <option value="classic">Classic ATS</option>
                    <option value="compact">Compact One Page</option>
                    <option value="developer">Developer Accent</option>
                  </select>
                </label>
                <p className="text-xs leading-5 text-muted">
                  All templates keep ATS-safe structure. Compact reduces spacing; Developer adds a restrained accent.
                </p>
              </div>
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <div>
                  <h3 className="text-sm font-bold text-ink">AI Builder Assistant</h3>
                  <p className="text-xs text-muted">Improve the current draft without losing manual control.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleAiAssist("Rewrite the professional summary and headline for clarity, ATS fit, and recruiter readability.")}
                  className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-bold hover:border-accent hover:text-accent"
                >
                  <Sparkles className="h-4 w-4" />
                  Improve Summary
                </button>
                <button
                  type="button"
                  onClick={() => handleAiAssist("Rewrite weak experience and project bullets using action, scope, tools, and truthful results.")}
                  className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-bold hover:border-accent hover:text-accent"
                >
                  <Sparkles className="h-4 w-4" />
                  Strengthen Bullets
                </button>
                <button
                  type="button"
                  onClick={() => handleAiAssist("Tailor the resume to the target job description. Add missing keywords only where truthful.")}
                  className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-bold hover:border-accent hover:text-accent"
                >
                  <Sparkles className="h-4 w-4" />
                  Tailor to Job
                </button>
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                <input
                  className="field"
                  value={customInstruction}
                  onChange={(event) => setCustomInstruction(event.target.value)}
                  placeholder="Ask AI to improve a specific role, project, or keyword..."
                />
                <button
                  type="button"
                  disabled={customInstruction.trim().length < 8}
                  onClick={() => handleAiAssist(customInstruction)}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Apply AI
                </button>
              </div>
              {aiState ? <p className="mt-3 text-sm font-semibold text-accent">{aiState}</p> : null}
              {aiSuggestions.length ? (
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  {aiSuggestions.map((suggestion) => (
                    <li key={suggestion}>{suggestion}</li>
                  ))}
                </ul>
              ) : null}
            </section>

            <section className="rounded-md border border-line bg-paper/60 p-4">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-ink">Job-Specific Versions</h3>
                <p className="text-xs text-muted">Save tailored drafts locally for different applications.</p>
              </div>
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                <input
                  className="field"
                  value={versionTitle}
                  onChange={(event) => setVersionTitle(event.target.value)}
                  placeholder="Example: Frontend Developer - Acme"
                />
                <button
                  type="button"
                  onClick={saveVersion}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-bold hover:border-accent hover:text-accent"
                >
                  <Save className="h-4 w-4" />
                  Save Version
                </button>
              </div>
              {versions.length ? (
                <div className="mt-4 grid gap-2">
                  {versions.slice(0, 5).map((version) => (
                    <button
                      type="button"
                      key={version.id}
                      onClick={() => setResume(version.resume)}
                      className="flex items-center justify-between gap-3 rounded-md border border-line bg-white px-3 py-2 text-left text-sm hover:border-accent"
                    >
                      <span className="font-semibold text-ink">{version.title}</span>
                      <span className="text-xs text-muted">{new Date(version.createdAt).toLocaleDateString()}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </section>

            <FormGroup title="Contact Details">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name" value={resume.fullName} onChange={(value) => update("fullName", value)} />
                <Field label="Headline" value={resume.headline} onChange={(value) => update("headline", value)} />
                <Field label="Email" value={resume.email} onChange={(value) => update("email", value)} />
                <Field label="Phone" value={resume.phone} onChange={(value) => update("phone", value)} />
                <Field label="Location" value={resume.location} onChange={(value) => update("location", value)} />
              </div>
              <div className="rounded-md border border-line bg-paper/60 p-4">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-accent" />
                    <div>
                      <p className="text-sm font-bold text-ink">Profile Links</p>
                      <p className="text-xs text-muted">Add LinkedIn, GitHub, portfolio, WhatsApp, or any custom link.</p>
                    </div>
                  </div>
                  <AddButton label="Add Link" onClick={addLink} />
                </div>
                <div className="space-y-3">
                  {resume.links.map((link) => (
                    <div className="grid gap-3 rounded-md border border-line bg-white p-3 lg:grid-cols-[180px_minmax(0,1fr)_auto]" key={link.id}>
                      <Field
                        label="Label"
                        value={link.label}
                        placeholder="GitHub"
                        onChange={(value) => updateLink(link.id, "label", value)}
                      />
                      <Field
                        label="URL or Handle"
                        value={link.url}
                        placeholder="github.com/username"
                        onChange={(value) => updateLink(link.id, "url", value)}
                      />
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeLink(link.id)}
                          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold text-coral hover:bg-coral/10 lg:w-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FormGroup>

            <FormGroup title="Profile">
              <TextArea label="Summary" value={resume.summary} onChange={(value) => update("summary", value)} />
              <TextArea label="Skills" value={resume.skills} onChange={(value) => update("skills", value)} />
            </FormGroup>

            <FormGroup title="Experience" action={<AddButton onClick={() => addItem("experience")} />}>
              <div className="space-y-4">
                {resume.experience.map((item, index) => (
                  <EntryCard title={item.role || `Experience ${index + 1}`} onRemove={() => removeItem("experience", index)} key={index}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Role" value={item.role} onChange={(role) => updateArray("experience", index, { ...item, role })} />
                      <Field label="Company" value={item.company} onChange={(company) => updateArray("experience", index, { ...item, company })} />
                      <Field label="Location" value={item.location} onChange={(location) => updateArray("experience", index, { ...item, location })} />
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Start" value={item.start} onChange={(start) => updateArray("experience", index, { ...item, start })} />
                        <Field label="End" value={item.end} onChange={(end) => updateArray("experience", index, { ...item, end })} />
                      </div>
                    </div>
                    <TextArea label="Bullets" value={item.bullets} onChange={(bullets) => updateArray("experience", index, { ...item, bullets })} />
                  </EntryCard>
                ))}
              </div>
            </FormGroup>

            <FormGroup title="Projects" action={<AddButton onClick={() => addItem("projects")} />}>
              <div className="space-y-4">
                {resume.projects.map((item, index) => (
                  <EntryCard title={item.name || `Project ${index + 1}`} onRemove={() => removeItem("projects", index)} key={index}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Project Name" value={item.name} onChange={(name) => updateArray("projects", index, { ...item, name })} />
                      <Field label="Tech Stack" value={item.tech} onChange={(tech) => updateArray("projects", index, { ...item, tech })} />
                    </div>
                    <TextArea label="Bullets" value={item.bullets} onChange={(bullets) => updateArray("projects", index, { ...item, bullets })} />
                  </EntryCard>
                ))}
              </div>
            </FormGroup>

            <FormGroup title="Education" action={<AddButton onClick={() => addItem("education")} />}>
              <div className="space-y-4">
                {resume.education.map((item, index) => (
                  <EntryCard title={item.school || `Education ${index + 1}`} onRemove={() => removeItem("education", index)} key={index}>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <Field label="School" value={item.school} onChange={(school) => updateArray("education", index, { ...item, school })} />
                      <Field label="Degree" value={item.degree} onChange={(degree) => updateArray("education", index, { ...item, degree })} />
                      <Field label="Year" value={item.year} onChange={(year) => updateArray("education", index, { ...item, year })} />
                      <Field
                        label="CGPA / Percentage"
                        value={item.score || ""}
                        placeholder="8.7 CGPA or 82%"
                        onChange={(score) => updateArray("education", index, { ...item, score })}
                      />
                    </div>
                  </EntryCard>
                ))}
              </div>
            </FormGroup>

            <FormGroup title="Certifications">
              <TextArea
                label="Certifications"
                value={resume.certifications}
                onChange={(value) => update("certifications", value)}
              />
            </FormGroup>
          </div>
        </div>

        <aside className="panel hidden h-fit overflow-hidden 2xl:sticky 2xl:top-5 2xl:block">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="text-lg font-bold">Live ATS Preview</h2>
              <p className="mt-1 text-sm text-muted">A readable snapshot of the PDF content.</p>
            </div>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-bold hover:border-accent hover:text-accent"
            >
              <Eye className="h-4 w-4" />
              Open
            </button>
          </div>
          <div className="max-h-[calc(100vh-150px)] overflow-auto bg-paper p-5">
            <ResumePreview resume={resume} scale="compact" template={template} />
          </div>
        </aside>
      </div>

      {previewOpen ? (
        <PreviewModal resume={resume} template={template} onClose={() => setPreviewOpen(false)} />
      ) : null}
    </>
  );
}

function FormGroup({
  title,
  action,
  children
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4 border-b border-line pb-2">
        <h3 className="text-base font-bold text-ink">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function EntryCard({
  title,
  onRemove,
  children
}: {
  title: string;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-line bg-white p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="truncate text-sm font-bold text-ink">{title}</p>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex shrink-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-coral hover:bg-coral/10"
        >
          <Trash2 className="h-4 w-4" />
          Remove
        </button>
      </div>
      {children}
    </div>
  );
}

function AddButton({ label = "Add", onClick }: { label?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-1.5 text-sm font-bold hover:border-accent hover:text-accent"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
}

function PreviewModal({
  resume,
  template,
  onClose
}: {
  resume: ResumeData;
  template: ResumeTemplate;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-preview-title"
      onMouseDown={onClose}
    >
      <div
        className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-paper shadow-soft"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line bg-white px-4 py-3 sm:px-5">
          <div>
            <h2 id="resume-preview-title" className="text-lg font-bold">Resume Preview</h2>
            <p className="text-sm text-muted">This is the same structure used for the exported PDF.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-md border border-line bg-white hover:border-accent hover:text-accent"
            aria-label="Close preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-auto p-4 sm:p-8">
          <div className="mx-auto w-full max-w-[820px]">
            <ResumePreview resume={resume} scale="full" template={template} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input
        className="field mt-1"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <textarea className="field mt-1 min-h-24 resize-y" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ResumePreview({
  resume,
  scale,
  template
}: {
  resume: ResumeData;
  scale: "compact" | "full";
  template: ResumeTemplate;
}) {
  const compact = scale === "compact";
  const contactItems = [
    resume.email,
    resume.phone,
    resume.location,
    ...formatResumeLinks(resume.links)
  ].filter(Boolean);

  return (
    <article
      className={`mx-auto min-h-[720px] bg-white text-ink shadow-soft ${
        compact || template === "compact" ? "p-7 text-[12px] leading-5" : "p-7 text-[13px] leading-6 sm:p-10"
      }`}
    >
      <header className="border-b border-ink pb-4">
        <h1 className={`${compact ? "text-2xl" : "text-3xl"} font-bold ${template === "developer" ? "text-accent" : ""}`}>{resume.fullName}</h1>
        <p className="mt-1 font-semibold">{resume.headline}</p>
        <p className="mt-2 break-words text-xs text-muted">
          {contactItems.join(" | ")}
        </p>
      </header>

      <PreviewSection title="Summary">
        <p>{resume.summary}</p>
      </PreviewSection>
      <PreviewSection title="Skills">
        <p>{resume.skills}</p>
      </PreviewSection>
      <PreviewSection title="Experience">
        {resume.experience.map((item, index) => (
          <div className="mb-4 last:mb-0" key={`${item.company}-${item.role}-${index}`}>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <p className="font-bold">{item.role}, {item.company}</p>
              <p className="shrink-0 text-xs text-muted">{item.start} - {item.end}</p>
            </div>
            <p className="text-xs text-muted">{item.location}</p>
            <ul className="mt-1 ml-4 list-disc space-y-1">
              {lines(item.bullets).map((line) => <li key={line}>{line}</li>)}
            </ul>
          </div>
        ))}
      </PreviewSection>
      <PreviewSection title="Projects">
        {resume.projects.map((item, index) => (
          <div className="mb-4 last:mb-0" key={`${item.name}-${index}`}>
            <p className="font-bold">{item.name} {item.tech ? `| ${item.tech}` : ""}</p>
            <ul className="mt-1 ml-4 list-disc space-y-1">
              {lines(item.bullets).map((line) => <li key={line}>{line}</li>)}
            </ul>
          </div>
        ))}
      </PreviewSection>
      <PreviewSection title="Education">
        {resume.education.map((item, index) => (
          <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between" key={`${item.school}-${item.degree}-${index}`}>
            <p><strong>{item.degree}</strong>, {item.school}</p>
            <p className="text-xs text-muted">{[item.year, item.score].filter(Boolean).join(" | ")}</p>
          </div>
        ))}
      </PreviewSection>
      {resume.certifications ? (
        <PreviewSection title="Certifications">
          <p>{resume.certifications}</p>
        </PreviewSection>
      ) : null}
    </article>
  );
}

function PreviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="border-b border-ink pb-1 text-xs font-bold uppercase text-ink">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
