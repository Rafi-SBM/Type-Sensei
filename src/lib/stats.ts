import type { CharCounts, Keystroke, Sample, WordState } from "@/types";

/** One "word" is five characters, the long-standing convention for WPM. */
export const CHARS_PER_WORD = 5;

export const emptyCharCounts: CharCounts = { correct: 0, incorrect: 0, extra: 0, missed: 0 };

/**
 * Compares what was typed against the target, word by word.
 *
 * A word before the cursor is settled: anything the user left off counts as
 * missed, and the space that committed it counts as one correct character. The
 * word under the cursor is still in progress, so its untyped tail is not
 * counted against the user yet.
 */
export function countChars(words: readonly WordState[], activeIndex: number): CharCounts {
  const counts: CharCounts = { ...emptyCharCounts };
  const last = Math.min(activeIndex, words.length - 1);

  for (let i = 0; i <= last; i += 1) {
    const { target, typed } = words[i];
    const overlap = Math.min(target.length, typed.length);

    for (let c = 0; c < overlap; c += 1) {
      if (typed[c] === target[c]) counts.correct += 1;
      else counts.incorrect += 1;
    }

    if (typed.length > target.length) {
      counts.extra += typed.length - target.length;
    } else if (i < activeIndex) {
      counts.missed += target.length - typed.length;
    }

    // Every settled word was committed with a space, and that space counts.
    if (i < activeIndex) counts.correct += 1;
  }

  return counts;
}

export function totalTypedChars(counts: CharCounts): number {
  return counts.correct + counts.incorrect + counts.extra;
}

export function wpm(correctChars: number, durationMs: number): number {
  if (durationMs <= 0) return 0;
  const minutes = durationMs / 60000;
  return round(correctChars / CHARS_PER_WORD / minutes);
}

export function rawWpm(counts: CharCounts, durationMs: number): number {
  return wpm(totalTypedChars(counts), durationMs);
}

/** Share of keystrokes that landed on the right character, ignoring backspaces. */
export function accuracy(keystrokes: readonly Keystroke[]): number {
  if (keystrokes.length === 0) return 100;
  const correct = keystrokes.reduce((sum, k) => sum + (k.correct ? 1 : 0), 0);
  return round((correct / keystrokes.length) * 100);
}

/**
 * How even the pace was, derived from the spread of per-second raw speed.
 * 100 means every second produced the same number of keystrokes.
 */
export function consistency(samples: readonly Sample[]): number {
  const values = samples.map((s) => s.raw).filter((v) => v > 0);
  if (values.length < 2) return values.length === 1 ? 100 : 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;

  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const coefficient = Math.sqrt(variance) / mean;
  return clamp(round((1 - coefficient) * 100), 0, 100);
}

/**
 * One data point per elapsed second, holding the speed achieved inside that
 * second alone. Both lines are measured the same way so they stay comparable:
 * net speed can never sit above raw speed.
 *
 * A trailing part-second is dropped once there is at least one whole second,
 * because a window that is only a fraction long always reads as a slowdown.
 */
export function buildSamples(keystrokes: readonly Keystroke[], durationMs: number): Sample[] {
  if (durationMs <= 0) return [];

  const wholeSeconds = Math.floor(durationMs / 1000);
  const windows = Math.max(1, wholeSeconds);
  const samples: Sample[] = [];
  let cursor = 0;

  for (let second = 1; second <= windows; second += 1) {
    const start = (second - 1) * 1000;
    const end = wholeSeconds === 0 ? durationMs : second * 1000;
    const windowMs = Math.max(1, end - start);

    let typed = 0;
    let errors = 0;

    // Windows are half-open so a keystroke on a boundary is counted once. Only
    // a final window that really reaches the end of the test closes
    // inclusively, so a dropped part-second does not skew the window before it.
    const isLast = second === windows && end >= durationMs;
    const belongsHere = (at: number) => (isLast ? at <= end : at < end);

    while (cursor < keystrokes.length && belongsHere(keystrokes[cursor].at)) {
      typed += 1;
      if (!keystrokes[cursor].correct) errors += 1;
      cursor += 1;
    }

    const perMinute = (count: number) => round((count / CHARS_PER_WORD) * (60000 / windowMs));

    samples.push({
      second,
      raw: perMinute(typed),
      wpm: perMinute(typed - errors),
      errors,
    });
  }

  return samples;
}

export function round(value: number): number {
  return Number.isFinite(value) ? Math.round(value) : 0;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
