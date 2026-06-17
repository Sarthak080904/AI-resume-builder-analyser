import { AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import type { AnalysisResult } from "../types";
import ScoreRing from "./ScoreRing";

type Props = {
  result: AnalysisResult | null;
  loading: boolean;
};

function ListBlock({
  title,
  items,
  icon
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-line p-4">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-bold text-ink">{title}</h3>
      </div>
      <ul className="space-y-2 text-sm text-ink">
        {items.map((item) => (
          <li key={item} className="leading-6">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function AnalysisPanel({ result, loading }: Props) {
  if (loading) {
    return (
      <div className="panel flex min-h-[460px] items-center justify-center p-8">
        <div className="text-center">
          <Sparkles className="mx-auto mb-3 h-8 w-8 animate-pulse text-accent" />
          <p className="font-semibold">Analysing resume and job fit</p>
          <p className="mt-1 text-sm text-muted">Parsing content, checking ATS signals, and preparing fixes.</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="panel flex min-h-[460px] items-center justify-center p-8 text-center">
        <div>
          <Sparkles className="mx-auto mb-3 h-9 w-9 text-accent" />
          <p className="font-semibold">Upload a resume to see the analysis</p>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Scores appear here with ATS warnings, missing keywords, and recruiter-style rewrite suggestions.
          </p>
        </div>
      </div>
    );
  }

  const matched = result.matchedKeywords.filter((item) => item.found);
  const missing = result.matchedKeywords.filter((item) => !item.found);

  return (
    <div className="panel p-5">
      <div className="flex flex-col gap-5 border-b border-line pb-5 lg:flex-row lg:items-center lg:justify-between">
        <ScoreRing label="Overall Match" score={result.overallScore} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ScoreRing compact label="ATS" score={result.atsScore} />
          <ScoreRing compact label="Role Fit" score={result.roleFitScore} />
          <ScoreRing compact label="Clarity" score={result.clarityScore} />
          <ScoreRing compact label="Impact" score={result.impactScore} />
        </div>
      </div>

      <div className="mt-5 rounded-md bg-paper p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <p className="text-sm font-bold">Analysis Mode: {result.mode === "ai" ? "AI" : "Heuristic fallback"}</p>
        </div>
        <p className="text-sm leading-6 text-ink">{result.summary}</p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ListBlock
          title="Strengths"
          items={result.strengths}
          icon={<CheckCircle2 className="h-4 w-4 text-accent" />}
        />
        <ListBlock
          title="Gaps"
          items={result.gaps}
          icon={<AlertTriangle className="h-4 w-4 text-coral" />}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="rounded-md border border-line p-4">
          <h3 className="mb-3 text-sm font-bold text-ink">Matched Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {matched.slice(0, 24).map((item) => (
              <span key={item.keyword} className="rounded-md bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">
                {item.keyword}
              </span>
            ))}
          </div>
        </section>
        <section className="rounded-md border border-line p-4">
          <h3 className="mb-3 text-sm font-bold text-ink">Missing Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {missing.slice(0, 24).map((item) => (
              <span key={item.keyword} className="rounded-md bg-coral/10 px-2 py-1 text-xs font-semibold text-coral">
                {item.keyword}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ListBlock
          title="Improvement Plan"
          items={result.improvementPlan}
          icon={<CheckCircle2 className="h-4 w-4 text-accent" />}
        />
        <ListBlock
          title="ATS Warnings"
          items={result.atsWarnings}
          icon={<AlertTriangle className="h-4 w-4 text-coral" />}
        />
      </div>

      <section className="mt-5 rounded-md border border-line p-4">
        <h3 className="mb-2 text-sm font-bold text-ink">AI Summary Rewrite</h3>
        <p className="text-sm leading-6 text-ink">{result.rewrittenSummary}</p>
      </section>

      <ListBlock
        title="Bullet Rewrite Examples"
        items={result.bulletRewrites}
        icon={<Sparkles className="h-4 w-4 text-accent" />}
      />
    </div>
  );
}
