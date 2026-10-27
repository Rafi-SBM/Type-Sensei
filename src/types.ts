export type TestMode = "time" | "words" | "quote";

export type Difficulty = "easy" | "medium" | "hard";

export type QuoteLength = "short" | "medium" | "long";

export type CaretStyle = "line" | "block" | "underline";

export type ThemeName = "system" | "light" | "dark" | "slate" | "amber" | "forest";

export type TestStatus = "idle" | "running" | "finished";

/** One rendered word, paired with whatever the user typed for it. */
export interface WordState {
  /** The target word. */
  target: string;
  /** What the user actually typed, which may be longer than the target. */
  typed: string;
}

export interface Keystroke {
  /** Milliseconds since the test started. */
  at: number;
  correct: boolean;
}

/**
 * A one-second snapshot used by the results chart and the consistency figure.
 * Both speeds describe that second alone, not a running total.
 */
export interface Sample {
  second: number;
  /** Speed counting only correct keystrokes in this second. */
  wpm: number;
  /** Speed counting every keystroke in this second. */
  raw: number;
  errors: number;
}

export interface CharCounts {
  correct: number;
  incorrect: number;
  /** Characters typed past the end of a word. */
  extra: number;
  /** Characters skipped by moving to the next word early. */
  missed: number;
}

export interface TestResult {
  id: string;
  /** Epoch milliseconds. */
  completedAt: number;
  mode: TestMode;
  /** Seconds for time mode, word count for words mode, character count for quotes. */
  limit: number;
  difficulty: Difficulty;
  punctuation: boolean;
  numbers: boolean;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  durationMs: number;
  chars: CharCounts;
  samples: Sample[];
}

export interface Settings {
  mode: TestMode;
  timeLimit: number;
  wordLimit: number;
  quoteLength: QuoteLength;
  difficulty: Difficulty;
  punctuation: boolean;
  numbers: boolean;
  theme: ThemeName;
  caretStyle: CaretStyle;
  smoothCaret: boolean;
  fontSize: number;
  sound: boolean;
  /** Hide per-character colouring while typing. */
  blindMode: boolean;
  /** Refuse to advance past an incorrect word. */
  stopOnError: boolean;
  /** Disable backspace entirely. */
  noBackspace: boolean;
}
