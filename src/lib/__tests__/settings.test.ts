import { describe, expect, it } from "vitest";
import { configKey, formatClock, formatTimeOption, relativeTime } from "@/lib/format";
import { parseHistory, summarizeHistory } from "@/lib/history";
import { defaultSettings, parseSettings } from "@/lib/settings";
import type { TestResult } from "@/types";

describe("parseSettings", () => {
  it("falls back to the defaults for junk input", () => {
    expect(parseSettings(null)).toEqual(defaultSettings);
    expect(parseSettings("nope")).toEqual(defaultSettings);
    expect(parseSettings({ mode: "telepathy" }).mode).toBe(defaultSettings.mode);
  });

  it("keeps valid values and repairs invalid neighbours", () => {
    const parsed = parseSettings({ mode: "words", difficulty: "hard", fontSize: "big" });
    expect(parsed.mode).toBe("words");
    expect(parsed.difficulty).toBe("hard");
    expect(parsed.fontSize).toBe(defaultSettings.fontSize);
  });

  it("clamps numbers into the supported range", () => {
    expect(parseSettings({ timeLimit: 999_999 }).timeLimit).toBe(3600);
    expect(parseSettings({ timeLimit: -5 }).timeLimit).toBe(5);
    expect(parseSettings({ wordLimit: 1 }).wordLimit).toBe(5);
    expect(parseSettings({ fontSize: 400 }).fontSize).toBe(40);
  });
});

describe("configKey", () => {
  it("separates configurations that should not share a personal best", () => {
    const base = { ...defaultSettings, mode: "time" as const, timeLimit: 30 };
    expect(configKey(base)).not.toBe(configKey({ ...base, timeLimit: 60 }));
    expect(configKey(base)).not.toBe(configKey({ ...base, difficulty: "hard" }));
    expect(configKey(base)).not.toBe(configKey({ ...base, punctuation: true }));
  });

  it("ignores cosmetic settings", () => {
    const base = { ...defaultSettings };
    expect(configKey(base)).toBe(configKey({ ...base, theme: "amber", fontSize: 32 }));
  });
});

describe("formatting", () => {
  it("renders a clock", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(9)).toBe("0:09");
    expect(formatClock(75)).toBe("1:15");
    expect(formatClock(-4)).toBe("0:00");
  });

  it("labels durations the way the buttons do", () => {
    expect(formatTimeOption(15)).toBe("15s");
    expect(formatTimeOption(120)).toBe("2m");
  });

  it("describes recent timestamps in words", () => {
    const now = Date.UTC(2026, 0, 2, 12, 0, 0);
    expect(relativeTime(now - 30_000, now)).toBe("just now");
    expect(relativeTime(now - 5 * 60_000, now)).toBe("5m ago");
    expect(relativeTime(now - 3 * 3_600_000, now)).toBe("3h ago");
    expect(relativeTime(now - 2 * 86_400_000, now)).toBe("2d ago");
  });
});

describe("history", () => {
  const result = (overrides: Partial<TestResult> = {}): unknown => ({
    id: "a",
    completedAt: 1_700_000_000_000,
    mode: "time",
    limit: 30,
    difficulty: "medium",
    punctuation: false,
    numbers: false,
    wpm: 60,
    rawWpm: 65,
    accuracy: 96,
    consistency: 80,
    durationMs: 30_000,
    chars: { correct: 150, incorrect: 5, extra: 0, missed: 0 },
    samples: [],
    ...overrides,
  });

  it("drops entries that are not usable results", () => {
    expect(parseHistory([result(), null, 7, { nonsense: true }])).toHaveLength(1);
  });

  it("returns an empty list for anything that is not an array", () => {
    expect(parseHistory({ wpm: 100 })).toEqual([]);
  });

  it("summarises averages and the best run", () => {
    const parsed = parseHistory([
      result({ id: "a", wpm: 40, accuracy: 90 }),
      result({ id: "b", wpm: 80, accuracy: 100 }),
    ]);

    expect(summarizeHistory(parsed)).toMatchObject({
      tests: 2,
      averageWpm: 60,
      averageAccuracy: 95,
      bestWpm: 80,
    });
  });

  it("summarises an empty history without dividing by zero", () => {
    expect(summarizeHistory([])).toMatchObject({ tests: 0, averageWpm: 0, bestWpm: 0 });
  });
});
