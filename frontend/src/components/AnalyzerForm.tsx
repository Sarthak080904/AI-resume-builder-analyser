import { FileText, Upload } from "lucide-react";

type Props = {
  file: File | null;
  jobDescription: string;
  loading: boolean;
  error: string;
  onFileChange: (file: File | null) => void;
  onJobDescriptionChange: (value: string) => void;
  onSubmit: () => void;
};

export default function AnalyzerForm({
  file,
  jobDescription,
  loading,
  error,
  onFileChange,
  onJobDescriptionChange,
  onSubmit
}: Props) {
  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Resume Analyser</h2>
          <p className="text-sm text-muted">Compare a resume with a target job description.</p>
        </div>
        <FileText className="h-5 w-5 text-accent" />
      </div>

      <label className="label">Resume File</label>
      <label className="mt-2 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-line bg-paper px-4 py-6 text-center transition hover:border-accent">
        <Upload className="mb-2 h-6 w-6 text-accent" />
        <span className="text-sm font-semibold">{file ? file.name : "Upload PDF, DOCX, or TXT"}</span>
        <span className="mt-1 text-xs text-muted">Maximum 8 MB</span>
        <input
          className="sr-only"
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(event) => onFileChange(event.target.files?.[0] || null)}
        />
      </label>

      <div className="mt-5">
        <label className="label" htmlFor="job-description">
          Target Job Description
        </label>
        <textarea
          id="job-description"
          className="field mt-2 min-h-72 resize-y"
          value={jobDescription}
          onChange={(event) => onJobDescriptionChange(event.target.value)}
          placeholder="Paste the complete job description here..."
        />
      </div>

      {error ? <p className="mt-3 rounded-md bg-coral/10 p-3 text-sm font-semibold text-coral">{error}</p> : null}

      <button
        type="button"
        disabled={loading}
        onClick={onSubmit}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-bold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Upload className="h-4 w-4" />
        {loading ? "Analysing..." : "Analyse Resume"}
      </button>
    </div>
  );
}
