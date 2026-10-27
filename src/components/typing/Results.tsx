import { RotateCcw, Trophy } from "lucide-react";
import { memo } from "react";
import { ResultChart } from "@/components/typing/ResultChart";
import { Button } from "@/components/ui/button";
import { describeMode, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Settings, TestResult } from "@/types";

interface ResultsProps {
  result: TestResult;
  settings: Settings;
  previousBest: number;
  isPersonalBest: boolean;
  onRestart: () => void;
}

export const Results = memo(function Results({
  result,
  settings,
  previousBest,
  isPersonalBest,
  onRestart,
}: ResultsProps) {
  const limit =
    settings.mode === "quote"
      ? settings.quoteLength
      : settings.mode === "time"
        ? settings.timeLimit
        : settings.wordLimit;

  return (
    <section
      className="animate-rise"
      aria-labelledby="results-heading"
      // Announced once, after the test ends.
      aria-live="polite"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="results-heading" className="text-lg font-semibold text-text">
            {isPersonalBest ? "Personal best" : "Result"}
          </h2>
          <p className="font-mono text-xs lowercase text-muted">
            {describeMode(settings.mode, limit, settings.difficulty)}
          </p>
        </div>

        {isPersonalBest ? (
          <p className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
            <Trophy className="h-4 w-4" aria-hidden="true" />
            {previousBest > 0 ? `Up from ${previousBest} wpm` : "First result for this setup"}
          </p>
        ) : previousBest > 0 ? (
          <p className="text-sm text-muted">
            Best for this setup: <span className="font-mono text-text">{previousBest}</span> wpm
          </p>
        ) : null}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="wpm" value={result.wpm} emphasis />
        <Metric label="accuracy" value={`${result.accuracy}%`} emphasis />
        <Metric label="raw" value={result.rawWpm} />
        <Metric label="consistency" value={`${result.consistency}%`} />
      </div>

      <div className="mb-6">
        <ResultChart samples={result.samples} />
      </div>

      <dl className="mb-8 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
        <Detail label="characters">
          <span className="text-success">{result.chars.correct}</span>
          <span className="text-muted"> / </span>
          <span className="text-error">{result.chars.incorrect}</span>
          <span className="text-muted"> / </span>
          <span className="text-muted">{result.chars.extra}</span>
          <span className="text-muted"> / </span>
          <span className="text-muted">{result.chars.missed}</span>
        </Detail>
        <Detail label="time">{formatDuration(result.durationMs)}</Detail>
        <Detail label="difficulty">{result.difficulty}</Detail>
        <Detail label="extras">
          {[result.punctuation && "punctuation", result.numbers && "numbers"]
            .filter(Boolean)
            .join(", ") || "none"}
        </Detail>
      </dl>

      <p className="mb-4 text-xs text-muted">
        Characters are shown as correct / incorrect / extra / missed.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" size="lg" onClick={onRestart} autoFocus>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Next test
        </Button>
        <p className="text-sm text-muted">
          or press <Key>Tab</Key> to go again
        </p>
      </div>
    </section>
  );
});

function Metric({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string | number;
  emphasis?: boolean;
}) {
  return (
    <div className="rounded-lg bg-surface px-4 py-3">
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      <p
        className={cn(
          "font-mono font-semibold tabular-nums",
          emphasis ? "text-4xl text-accent" : "text-2xl text-text",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-muted">{label}</dt>
      <dd className="font-mono text-text">{children}</dd>
    </div>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-xs text-text">
      {children}
    </kbd>
  );
}
