import {
  accuracy,
  buildSamples,
  consistency,
  countChars,
  rawWpm,
  wpm,
} from "@/lib/stats";
import type {
  CharCounts,
  Keystroke,
  Sample,
  TestMode,
  TestStatus,
  WordState,
} from "@/types";

/** Hard cap on characters typed past the end of a word, so a stuck key cannot run away. */
const MAX_EXTRA_CHARS = 12;

export interface EngineConfig {
  mode: TestMode;
  /** Only meaningful in time mode. */
  timeLimitMs: number;
  stopOnError: boolean;
  noBackspace: boolean;
}

export interface EngineState {
  config: EngineConfig;
  status: TestStatus;
  words: WordState[];
  activeIndex: number;
  keystrokes: Keystroke[];
  startedAt: number | null;
  elapsedMs: number;
}

export type EngineAction =
  | { type: "reset"; words: string[]; config: EngineConfig }
  | { type: "type"; char: string; at: number }
  | { type: "space"; at: number }
  | { type: "backspace"; wholeWord?: boolean }
  | { type: "append"; words: string[] }
  | { type: "tick"; at: number }
  | { type: "finish"; at: number };

export function createState(words: string[], config: EngineConfig): EngineState {
  return {
    config,
    status: "idle",
    words: words.map((target) => ({ target, typed: "" })),
    activeIndex: 0,
    keystrokes: [],
    startedAt: null,
    elapsedMs: 0,
  };
}

export function reducer(state: EngineState, action: EngineAction): EngineState {
  switch (action.type) {
    case "reset":
      return createState(action.words, action.config);

    case "append": {
      if (action.words.length === 0) return state;
      return {
        ...state,
        words: [...state.words, ...action.words.map((target) => ({ target, typed: "" }))],
      };
    }

    case "type":
      return applyChar(state, action.char, action.at);

    case "space":
      return applySpace(state, action.at);

    case "backspace":
      return applyBackspace(state, action.wholeWord ?? false);

    case "tick": {
      if (state.status !== "running" || state.startedAt === null) return state;
      const elapsedMs = action.at - state.startedAt;

      if (state.config.mode === "time" && elapsedMs >= state.config.timeLimitMs) {
        return { ...state, status: "finished", elapsedMs: state.config.timeLimitMs };
      }
      return { ...state, elapsedMs };
    }

    case "finish": {
      if (state.status !== "running") return state;
      return { ...state, status: "finished", elapsedMs: elapsedAt(state, action.at) };
    }

    default:
      return state;
  }
}

function applyChar(state: EngineState, char: string, at: number): EngineState {
  if (state.status === "finished" || char.length !== 1) return state;

  const started = state.status === "idle";
  const startedAt = started ? at : (state.startedAt as number);
  const active = state.words[state.activeIndex];
  if (!active) return state;

  if (active.typed.length >= active.target.length + MAX_EXTRA_CHARS) return state;

  const expected = active.target[active.typed.length];
  const keystroke: Keystroke = { at: at - startedAt, correct: char === expected };

  const words = replaceWord(state.words, state.activeIndex, {
    ...active,
    typed: active.typed + char,
  });

  const next: EngineState = {
    ...state,
    status: "running",
    startedAt,
    words,
    keystrokes: [...state.keystrokes, keystroke],
    elapsedMs: at - startedAt,
  };

  // A fixed-length test ends the moment its final word is complete and correct.
  const isLast = state.activeIndex === words.length - 1;
  if (isLast && state.config.mode !== "time" && words[state.activeIndex].typed === active.target) {
    return { ...next, status: "finished" };
  }

  return next;
}

function applySpace(state: EngineState, at: number): EngineState {
  // Space never starts a test, and never commits an empty word.
  if (state.status !== "running" || state.startedAt === null) return state;

  const active = state.words[state.activeIndex];
  if (!active || active.typed.length === 0) return state;

  const isCorrect = active.typed === active.target;
  if (state.config.stopOnError && !isCorrect) return state;

  const keystrokes = [...state.keystrokes, { at: at - state.startedAt, correct: isCorrect }];
  const isLast = state.activeIndex === state.words.length - 1;

  if (isLast && state.config.mode !== "time") {
    return {
      ...state,
      keystrokes,
      status: "finished",
      activeIndex: state.activeIndex + 1,
      elapsedMs: elapsedAt(state, at),
    };
  }

  return {
    ...state,
    keystrokes,
    // Time mode keeps a refill buffer ahead of the cursor, so this clamp never bites.
    activeIndex: Math.min(state.activeIndex + 1, state.words.length - 1),
    elapsedMs: elapsedAt(state, at),
  };
}

function applyBackspace(state: EngineState, wholeWord: boolean): EngineState {
  if (state.status === "finished" || state.config.noBackspace) return state;

  const active = state.words[state.activeIndex];

  if (active && active.typed.length > 0) {
    const typed = wholeWord ? "" : active.typed.slice(0, -1);
    return { ...state, words: replaceWord(state.words, state.activeIndex, { ...active, typed }) };
  }

  // At the start of a word, step back only if the previous word was left imperfect.
  const previousIndex = state.activeIndex - 1;
  const previous = state.words[previousIndex];
  if (!previous || previous.typed === previous.target) return state;

  const typed = wholeWord ? "" : previous.typed;
  return {
    ...state,
    activeIndex: previousIndex,
    words: replaceWord(state.words, previousIndex, { ...previous, typed }),
  };
}

function replaceWord(words: WordState[], index: number, word: WordState): WordState[] {
  const next = words.slice();
  next[index] = word;
  return next;
}

function elapsedAt(state: EngineState, at: number): number {
  if (state.startedAt === null) return state.elapsedMs;
  const elapsed = at - state.startedAt;
  return state.config.mode === "time"
    ? Math.min(elapsed, state.config.timeLimitMs)
    : elapsed;
}

export interface EngineSummary {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  chars: CharCounts;
  samples: Sample[];
  durationMs: number;
}

/** Turns engine state into the numbers shown live and on the results panel. */
export function summarize(state: EngineState): EngineSummary {
  const chars = countChars(state.words, state.activeIndex);
  const durationMs = Math.max(0, state.elapsedMs);
  const samples = buildSamples(state.keystrokes, durationMs);

  return {
    wpm: wpm(chars.correct, durationMs),
    rawWpm: rawWpm(chars, durationMs),
    accuracy: accuracy(state.keystrokes),
    consistency: consistency(samples),
    chars,
    samples,
    durationMs,
  };
}

/** True when a time-mode test is close enough to the end of its text to need more. */
export function needsMoreWords(state: EngineState, lookahead = 20): boolean {
  return state.config.mode === "time" && state.words.length - state.activeIndex <= lookahead;
}

export function progress(state: EngineState): number {
  if (state.config.mode === "time") {
    if (state.config.timeLimitMs === 0) return 0;
    return Math.min(1, state.elapsedMs / state.config.timeLimitMs);
  }
  return state.words.length === 0 ? 0 : Math.min(1, state.activeIndex / state.words.length);
}
