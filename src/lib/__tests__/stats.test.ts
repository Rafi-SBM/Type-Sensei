import { describe, expect, it } from "vitest";
import {
  accuracy,
  buildSamples,
  consistency,
  countChars,
  rawWpm,
  wpm,
} from "@/lib/stats";
import type { WordState } from "@/types";

const word = (target: string, typed: string): WordState => ({ target, typed });

describe("countChars", () => {
  it("counts a perfectly typed, settled word plus its space", () => {
    const counts = countChars([word("hello", "hello"), word("world", "")], 1);
    expect(counts).toEqual({ correct: 6, incorrect: 0, extra: 0, missed: 0 });
  });

  it("separates incorrect, extra and missed characters", () => {
    const counts = countChars(
      [
        word("hello", "hallo"), // one wrong letter, settled
        word("world", "worldly"), // two extra letters, settled
        word("again", "ag"), // in progress
      ],
      2,
    );

    expect(counts.incorrect).toBe(1);
    expect(counts.extra).toBe(2);
    expect(counts.missed).toBe(0);
    // 4 right in "hello", 5 in "world", 2 in "again", plus 2 spaces.
    expect(counts.correct).toBe(13);
  });

  it("counts characters skipped by moving on early as missed", () => {
    const counts = countChars([word("hello", "hel"), word("world", "")], 1);
    expect(counts.missed).toBe(2);
    expect(counts.correct).toBe(4); // "hel" plus the space
  });

  it("does not charge the in-progress word for letters not yet typed", () => {
    const counts = countChars([word("hello", "he")], 0);
    expect(counts).toEqual({ correct: 2, incorrect: 0, extra: 0, missed: 0 });
  });
});

describe("wpm", () => {
  it("uses the five-character word convention", () => {
    expect(wpm(300, 60_000)).toBe(60);
    expect(wpm(150, 30_000)).toBe(60);
  });

  it("returns zero rather than infinity for a zero-length test", () => {
    expect(wpm(100, 0)).toBe(0);
  });

  it("counts every typed character for the raw figure", () => {
    const counts = { correct: 200, incorrect: 50, extra: 50, missed: 10 };
    expect(rawWpm(counts, 60_000)).toBe(60);
  });
});

describe("accuracy", () => {
  it("is 100 percent before anything is typed", () => {
    expect(accuracy([])).toBe(100);
  });

  it("is the share of correct keystrokes", () => {
    const keystrokes = [
      { at: 0, correct: true },
      { at: 1, correct: true },
      { at: 2, correct: false },
      { at: 3, correct: true },
    ];
    expect(accuracy(keystrokes)).toBe(75);
  });
});

describe("buildSamples", () => {
  it("produces one sample per elapsed second", () => {
    const keystrokes = Array.from({ length: 20 }, (_, i) => ({
      at: i * 150,
      correct: true,
    }));
    const samples = buildSamples(keystrokes, 3000);

    expect(samples).toHaveLength(3);
    expect(samples[0].second).toBe(1);
    expect(samples.at(-1)?.second).toBe(3);
  });

  it("reports errors in the second they happened", () => {
    const samples = buildSamples(
      [
        { at: 100, correct: true },
        { at: 1500, correct: false },
      ],
      2000,
    );

    expect(samples[0].errors).toBe(0);
    expect(samples[1].errors).toBe(1);
  });

  it("scales keystrokes in a second to a per-minute rate", () => {
    const keystrokes = Array.from({ length: 5 }, (_, i) => ({ at: i * 100, correct: true }));
    // Five characters in one second is one word per second, so 60 wpm.
    expect(buildSamples(keystrokes, 1000)[0].raw).toBe(60);
  });

  it("never reports net speed above raw speed", () => {
    const keystrokes = [
      { at: 100, correct: true },
      { at: 300, correct: false },
      { at: 1200, correct: true },
      { at: 1800, correct: false },
      { at: 2400, correct: true },
    ];

    for (const sample of buildSamples(keystrokes, 3000)) {
      expect(sample.wpm).toBeLessThanOrEqual(sample.raw);
    }
  });

  it("drops a trailing part-second so the last point is not an artificial dip", () => {
    const keystrokes = Array.from({ length: 30 }, (_, i) => ({ at: i * 100, correct: true }));
    const samples = buildSamples(keystrokes, 2900);

    expect(samples).toHaveLength(2);
    expect(samples[0].raw).toBe(samples[1].raw);
  });

  it("still charts a test shorter than a second", () => {
    const samples = buildSamples([{ at: 100, correct: true }], 500);
    expect(samples).toHaveLength(1);
    expect(samples[0].raw).toBe(24); // one character in half a second
  });

  it("returns nothing for a test with no elapsed time", () => {
    expect(buildSamples([], 0)).toEqual([]);
  });
});

describe("consistency", () => {
  it("is 100 for a perfectly even pace", () => {
    const samples = [1, 2, 3].map((second) => ({ second, wpm: 60, raw: 60, errors: 0 }));
    expect(consistency(samples)).toBe(100);
  });

  it("drops as the pace varies", () => {
    const samples = [
      { second: 1, wpm: 20, raw: 20, errors: 0 },
      { second: 2, wpm: 90, raw: 90, errors: 0 },
      { second: 3, wpm: 30, raw: 30, errors: 0 },
    ];
    const value = consistency(samples);
    expect(value).toBeGreaterThan(0);
    expect(value).toBeLessThan(70);
  });

  it("is zero when there is nothing to compare", () => {
    expect(consistency([])).toBe(0);
  });
});
