import { memo, useId } from "react";
import type { Sample } from "@/types";

interface ResultChartProps {
  samples: readonly Sample[];
}

const WIDTH = 640;
const HEIGHT = 180;
const PADDING = { top: 12, right: 12, bottom: 24, left: 34 };

/**
 * Hand-drawn SVG chart: net speed as a line, raw speed as a lighter line, and a
 * marker wherever errors happened. Inline SVG keeps this dependency-free and
 * renders identically in both themes.
 */
export const ResultChart = memo(function ResultChart({ samples }: ResultChartProps) {
  const gradientId = useId();

  if (samples.length < 2) {
    return (
      <p className="rounded-lg bg-surface p-6 text-center text-sm text-muted">
        Run a test of a few seconds or more to see the speed graph.
      </p>
    );
  }

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const maxValue = Math.max(10, ...samples.map((s) => Math.max(s.wpm, s.raw)));
  const ceiling = Math.ceil(maxValue / 10) * 10;

  const x = (index: number) =>
    PADDING.left + (samples.length === 1 ? 0 : (index / (samples.length - 1)) * plotWidth);
  const y = (value: number) => PADDING.top + plotHeight - (value / ceiling) * plotHeight;

  const line = (key: "wpm" | "raw") =>
    samples.map((sample, index) => `${index === 0 ? "M" : "L"}${x(index)} ${y(sample[key])}`).join(" ");

  const area = `${line("wpm")} L${x(samples.length - 1)} ${PADDING.top + plotHeight} L${x(0)} ${
    PADDING.top + plotHeight
  } Z`;

  const gridValues = [0, ceiling / 2, ceiling];
  const tickEvery = Math.max(1, Math.ceil(samples.length / 8));

  return (
    <figure className="rounded-lg bg-surface p-4">
      <figcaption className="sr-only">
        Speed over time. Net speed peaked at {Math.max(...samples.map((s) => s.wpm))} words per
        minute across {samples.length} seconds.
      </figcaption>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-44 w-full"
        role="img"
        aria-label="Line chart of typing speed over the duration of the test"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" className="text-accent" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-accent" />
          </linearGradient>
        </defs>

        {gridValues.map((value) => (
          <g key={value}>
            <line
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={y(value)}
              y2={y(value)}
              className="stroke-line"
              strokeWidth={1}
            />
            <text
              x={PADDING.left - 8}
              y={y(value) + 4}
              textAnchor="end"
              className="fill-muted font-mono text-[10px]"
            >
              {Math.round(value)}
            </text>
          </g>
        ))}

        {samples.map((sample, index) =>
          index % tickEvery === 0 ? (
            <text
              key={sample.second}
              x={x(index)}
              y={HEIGHT - 6}
              textAnchor="middle"
              className="fill-muted font-mono text-[10px]"
            >
              {sample.second}
            </text>
          ) : null,
        )}

        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line("raw")}
          fill="none"
          className="stroke-muted"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          strokeLinejoin="round"
        />
        <path
          d={line("wpm")}
          fill="none"
          className="stroke-accent"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {samples.map((sample, index) =>
          sample.errors > 0 ? (
            <circle
              key={`error-${sample.second}`}
              cx={x(index)}
              cy={y(sample.raw)}
              r={3}
              className="fill-error"
            />
          ) : null,
        )}
      </svg>

      <ul className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-muted">
        <Legend className="bg-accent">net speed</Legend>
        <Legend className="bg-muted">raw speed</Legend>
        <Legend className="bg-error" round>
          errors
        </Legend>
      </ul>
    </figure>
  );
});

function Legend({
  className,
  round,
  children,
}: {
  className: string;
  round?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={`${className} ${round ? "h-2 w-2 rounded-full" : "h-0.5 w-4 rounded"}`}
        aria-hidden="true"
      />
      {children}
    </li>
  );
}
