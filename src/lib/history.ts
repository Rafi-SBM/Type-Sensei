import { asBoolean, asNumber, asOption, isRecord, readJson, writeJson } from "@/lib/storage";
import { DIFFICULTIES, MODES } from "@/lib/settings";
import { emptyCharCounts } from "@/lib/stats";
import type { Difficulty, TestResult } from "@/types";

export const HISTORY_KEY = "type-sensei:history:v1";

/** Keeping the last 200 results is plenty for the charts and well under quota. */
export const HISTORY_LIMIT = 200;

export function parseHistory(value: unknown): TestResult[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(parseResult)
    .filter((result): result is TestResult => result !== null)
    .slice(0, HISTORY_LIMIT);
}

function parseResult(value: unknown): TestResult | null {
  if (!isRecord(value)) return null;
  const chars = isRecord(value.chars) ? value.chars : {};

  const result: TestResult = {
    id: typeof value.id === "string" ? value.id : crypto.randomUUID(),
    completedAt: asNumber(value.completedAt, 0),
    mode: asOption(value.mode, MODES, "time"),
    limit: asNumber(value.limit, 0),
    difficulty: asOption<Difficulty>(value.difficulty, DIFFICULTIES, "medium"),
    punctuation: asBoolean(value.punctuation, false),
    numbers: asBoolean(value.numbers, false),
    wpm: asNumber(value.wpm, 0),
    rawWpm: asNumber(value.rawWpm, 0),
    accuracy: asNumber(value.accuracy, 0),
    consistency: asNumber(value.consistency, 0),
    durationMs: asNumber(value.durationMs, 0),
    chars: {
      correct: asNumber(chars.correct, emptyCharCounts.correct),
      incorrect: asNumber(chars.incorrect, emptyCharCounts.incorrect),
      extra: asNumber(chars.extra, emptyCharCounts.extra),
      missed: asNumber(chars.missed, emptyCharCounts.missed),
    },
    // Samples are only needed for the most recent result's chart, so a stored
    // entry without them is still perfectly usable.
    samples: Array.isArray(value.samples)
      ? value.samples.flatMap((sample) =>
          isRecord(sample)
            ? [
                {
                  second: asNumber(sample.second, 0),
                  wpm: asNumber(sample.wpm, 0),
                  raw: asNumber(sample.raw, 0),
                  errors: asNumber(sample.errors, 0),
                },
              ]
            : [],
        )
      : [],
  };

  return result.completedAt > 0 ? result : null;
}

export function loadHistory(): TestResult[] {
  return readJson(HISTORY_KEY, parseHistory) ?? [];
}

export function saveHistory(history: TestResult[]): void {
  writeJson(HISTORY_KEY, history.slice(0, HISTORY_LIMIT));
}

export interface HistorySummary {
  tests: number;
  averageWpm: number;
  averageAccuracy: number;
  bestWpm: number;
  totalTimeMs: number;
}

export function summarizeHistory(history: readonly TestResult[]): HistorySummary {
  if (history.length === 0) {
    return { tests: 0, averageWpm: 0, averageAccuracy: 0, bestWpm: 0, totalTimeMs: 0 };
  }

  const totals = history.reduce(
    (acc, result) => ({
      wpm: acc.wpm + result.wpm,
      accuracy: acc.accuracy + result.accuracy,
      best: Math.max(acc.best, result.wpm),
      time: acc.time + result.durationMs,
    }),
    { wpm: 0, accuracy: 0, best: 0, time: 0 },
  );

  return {
    tests: history.length,
    averageWpm: Math.round(totals.wpm / history.length),
    averageAccuracy: Math.round(totals.accuracy / history.length),
    bestWpm: totals.best,
    totalTimeMs: totals.time,
  };
}

/** Highest WPM recorded for one exact configuration. */
export function bestFor(history: readonly TestResult[], key: string, keyOf: (r: TestResult) => string): number {
  return history.reduce((best, result) => (keyOf(result) === key ? Math.max(best, result.wpm) : best), 0);
}
