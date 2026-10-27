import { memo, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatDuration, formatTimeOption, relativeTime } from "@/lib/format";
import { summarizeHistory } from "@/lib/history";
import type { TestResult } from "@/types";

interface StatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: readonly TestResult[];
  onClear: () => void;
}

export const StatsDialog = memo(function StatsDialog({
  open,
  onOpenChange,
  history,
  onClear,
}: StatsDialogProps) {
  const [confirming, setConfirming] = useState(false);
  const summary = useMemo(() => summarizeHistory(history), [history]);
  const recent = history.slice(0, 20);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setConfirming(false);
        onOpenChange(next);
      }}
    >
      <DialogContent
        title="Statistics"
        description={
          summary.tests === 0
            ? "Finish a test and it will show up here."
            : `${summary.tests} test${summary.tests === 1 ? "" : "s"} recorded on this device.`
        }
      >
        {summary.tests === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No results yet.</p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Tile label="best" value={summary.bestWpm} />
              <Tile label="average" value={summary.averageWpm} />
              <Tile label="accuracy" value={`${summary.averageAccuracy}%`} />
              <Tile label="typed" value={formatDuration(summary.totalTimeMs)} />
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-muted">Recent tests</p>
              <div className="overflow-hidden rounded-lg border border-line">
                <table className="w-full text-sm">
                  <caption className="sr-only">Your twenty most recent results</caption>
                  <thead className="bg-surface text-xs uppercase tracking-widest text-muted">
                    <tr>
                      <Th>wpm</Th>
                      <Th>acc</Th>
                      <Th>mode</Th>
                      <Th align="right">when</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((result) => (
                      <tr key={result.id} className="border-t border-line">
                        <Td className="font-mono text-text">{result.wpm}</Td>
                        <Td className="font-mono text-muted">{result.accuracy}%</Td>
                        <Td className="font-mono text-xs lowercase text-muted">
                          {label(result)}
                        </Td>
                        <Td align="right" className="text-xs text-muted">
                          {relativeTime(result.completedAt)}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-line pt-4">
              {confirming ? (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm text-text">Delete all {summary.tests} results?</p>
                  <Button
                    size="sm"
                    className="bg-error text-accent-contrast hover:brightness-110"
                    onClick={() => {
                      onClear();
                      setConfirming(false);
                    }}
                  >
                    Delete
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="text-sm text-muted underline-offset-4 transition-colors hover:text-error hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Clear history
                </button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});

function label(result: TestResult): string {
  if (result.mode === "time") return `time ${formatTimeOption(result.limit)}`;
  if (result.mode === "words") return `words ${result.limit}`;
  const lengths = ["", "short", "medium", "long"];
  return `quote ${lengths[result.limit] ?? ""}`.trim();
}

function Tile({ label: name, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-surface px-3 py-2">
      <p className="text-xs uppercase tracking-widest text-muted">{name}</p>
      <p className="font-mono text-xl font-semibold tabular-nums text-text">{value}</p>
    </div>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: "right" }) {
  return (
    <th scope="col" className={`px-3 py-2 font-medium ${align === "right" ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}

function Td({
  children,
  align,
  className = "",
}: {
  children: React.ReactNode;
  align?: "right";
  className?: string;
}) {
  return (
    <td className={`px-3 py-2 ${align === "right" ? "text-right" : "text-left"} ${className}`}>
      {children}
    </td>
  );
}
