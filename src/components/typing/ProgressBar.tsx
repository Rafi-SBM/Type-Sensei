import { memo } from "react";

export const ProgressBar = memo(function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mb-6 h-0.5 w-full overflow-hidden rounded bg-surface-strong" aria-hidden="true">
      <div
        className="h-full bg-accent transition-[width] duration-150 ease-linear motion-reduce:transition-none"
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
      />
    </div>
  );
});
