import { memo } from "react";
import { formatClock } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Settings, TestStatus } from "@/types";

interface LiveStatsProps {
  settings: Settings;
  status: TestStatus;
  timeLeft: number;
  wordIndex: number;
  wordTotal: number;
  wpm: number;
  accuracy: number;
  progress: number;
}

export const LiveStats = memo(function LiveStats({
  settings,
  status,
  timeLeft,
  wordIndex,
  wordTotal,
  wpm,
  accuracy,
  progress,
}: LiveStatsProps) {
  const running = status === "running";
  const counter =
    settings.mode === "time"
      ? formatClock(timeLeft)
      : `${Math.min(wordIndex + 1, wordTotal)}/${wordTotal}`;

  return (
    <div className="mb-4 flex items-end justify-between gap-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted">
          {settings.mode === "time" ? "time left" : "word"}
        </p>
        <p
          className={cn(
            "font-mono text-4xl font-semibold tabular-nums transition-colors sm:text-5xl",
            running ? "text-accent" : "text-muted",
          )}
          aria-live="off"
        >
          {counter}
        </p>
      </div>

      <dl className="flex gap-6 text-right">
        <div>
          <dt className="text-xs uppercase tracking-widest text-muted">wpm</dt>
          <dd className="font-mono text-2xl font-semibold tabular-nums text-text">
            {running ? wpm : "--"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-muted">acc</dt>
          <dd className="font-mono text-2xl font-semibold tabular-nums text-text">
            {running ? `${accuracy}%` : "--"}
          </dd>
        </div>
      </dl>

      {/* Progress is announced politely so assistive tech is not spammed per keystroke. */}
      <div
        className="sr-only"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-label="Test progress"
      />
    </div>
  );
});
