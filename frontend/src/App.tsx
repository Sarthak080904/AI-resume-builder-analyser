import { Brain, FileCheck2, PencilRuler } from "lucide-react";
import { useState } from "react";
import { analyzeResume } from "./api";
import AnalysisPanel from "./components/AnalysisPanel";
import AnalyzerForm from "./components/AnalyzerForm";
import ResumeBuilder from "./components/ResumeBuilder";
import type { AnalysisResult } from "./types";

const sampleJob =
  "We are hiring a Full Stack Developer with strong React, TypeScript, Node.js, Express, MongoDB, REST API design, Git, testing, and cloud deployment experience. The ideal candidate can build responsive interfaces, design scalable backend services, collaborate with stakeholders, optimize performance, and communicate clearly in an agile team.";

export default function App() {
  const [activeTab, setActiveTab] = useState<"analyze" | "build">("analyze");
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState(sampleJob);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitAnalysis = async () => {
    if (!file) {
      setError("Please upload a resume file.");
      return;
    }
    if (jobDescription.trim().length < 80) {
      setError("Paste a more complete job description.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await analyzeResume(file, jobDescription);
      setAnalysis(response.result);
    } catch (requestError) {
      const message =
        typeof requestError === "object" &&
        requestError !== null &&
        "response" in requestError &&
        typeof requestError.response === "object" &&
        requestError.response !== null &&
        "data" in requestError.response
          ? (requestError.response as { data?: { message?: string } }).data?.message
          : "";
      setError(message || "Analysis failed. Check the backend server and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-accent text-white">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-ink">AI Resume Analyser and Builder</h1>
              <p className="text-sm text-muted">ATS-focused analysis, targeted rewrites, and clean PDF export.</p>
            </div>
          </div>
          <div className="inline-flex rounded-md border border-line bg-paper p-1">
            <button
              type="button"
              onClick={() => setActiveTab("analyze")}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold ${
                activeTab === "analyze" ? "bg-white text-accent shadow-sm" : "text-muted"
              }`}
            >
              <FileCheck2 className="h-4 w-4" />
              Analyse
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("build")}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold ${
                activeTab === "build" ? "bg-white text-accent shadow-sm" : "text-muted"
              }`}
            >
              <PencilRuler className="h-4 w-4" />
              Build
            </button>
          </div>
        </div>
      </header>

  <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
    {activeTab === "analyze" ? (
      <div className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
        <AnalyzerForm
          file={file}
          jobDescription={jobDescription}
          loading={loading}
          error={error}
          onFileChange={setFile}
          onJobDescriptionChange={setJobDescription}
          onSubmit={submitAnalysis}
        />
        <AnalysisPanel result={analysis} loading={loading} />
      </div>
    ) : (
      <ResumeBuilder />
    )}
  </div>

  <footer className="border-t border-line bg-white py-6 text-center text-sm text-gray-600">
    <p>
      Created by <strong>Sarthak Bharat Bhujbal</strong>
    </p>

    <p className="mt-2">
      Email:{" "}
      <a
        href="mailto:sarthakbhujbal7305@gmail.com"
        className="text-blue-600 hover:underline"
      >
        sarthakbhujbal7305@gmail.com
      </a>
    </p>

    <p className="mt-2">
      <a
        href="https://github.com/Sarthak080904/AI-resume-builder-analyser"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        View Source Code
      </a>
    </p>

    <div className="mt-4">
      <a
        href="https://digitalheroesco.com"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800"
      >
        Built for Digital Heroes
      </a>
    </div>
  </footer>
</main>

  );
}

