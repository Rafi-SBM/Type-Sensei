import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  createState,
  progress,
  reducer,
  REFILL_LOOKAHEAD,
  summarize,
  type EngineConfig,
} from "@/lib/engine";
import { configKey } from "@/lib/format";
import { bestFor } from "@/lib/history";
import { activeLimit } from "@/lib/settings";
import {
  buildTestText,
  buildWords,
  requestFromSettings,
  TIME_MODE_REFILL,
} from "@/lib/text-source";
import type { Settings, TestResult } from "@/types";

/** How often the clock and live stats refresh. */
const TICK_MS = 100;

function toConfig(settings: Settings): EngineConfig {
  return {
    mode: settings.mode,
    timeLimitMs: settings.timeLimit * 1000,
    stopOnError: settings.stopOnError,
    noBackspace: settings.noBackspace,
  };
}

export interface TypingTestOptions {
  settings: Settings;
  history: readonly TestResult[];
  onComplete: (result: TestResult) => void;
  onKeystroke?: (correct: boolean) => void;
}

export function useTypingTest({ settings, history, onComplete, onKeystroke }: TypingTestOptions) {
  const config = useMemo(() => toConfig(settings), [settings]);

  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => createState(buildTestText(requestFromSettings(settings)), toConfig(settings)),
  );

  const [seed, setSeed] = useState(0);
  const completedRef = useRef<string | null>(null);

  // Cosmetic settings (theme, caret, font size) must not restart a test in
  // progress, so the reset effect keys off this fingerprint instead of the
  // settings object, and reads the live values through a ref.
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const testFingerprint = [
    settings.mode,
    settings.timeLimit,
    settings.wordLimit,
    settings.quoteLength,
    settings.difficulty,
    settings.punctuation,
    settings.numbers,
    settings.stopOnError,
    settings.noBackspace,
  ].join("|");

  const restart = useCallback(() => {
    setSeed((value) => value + 1);
  }, []);

  // A new seed, or any change to the test configuration, lays out a fresh test.
  useEffect(() => {
    const current = settingsRef.current;
    dispatch({
      type: "reset",
      words: buildTestText(requestFromSettings(current)),
      config: toConfig(current),
    });
  }, [seed, testFingerprint]);

  // Clock. Runs only while a test is in progress.
  useEffect(() => {
    if (state.status !== "running") return;
    const id = window.setInterval(() => {
      dispatch({ type: "tick", at: performance.now() });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [state.status]);

  // Time mode never runs out of text.
  const remainingWords = state.words.length - state.activeIndex;
  const isTimeMode = state.config.mode === "time";
  const isFinished = state.status === "finished";

  useEffect(() => {
    if (isFinished || !isTimeMode || remainingWords > REFILL_LOOKAHEAD) return;
    const current = settingsRef.current;
    dispatch({
      type: "append",
      words: buildWords(TIME_MODE_REFILL, {
        difficulty: current.difficulty,
        punctuation: current.punctuation,
        numbers: current.numbers,
      }),
    });
  }, [isFinished, isTimeMode, remainingWords]);

  const summary = useMemo(() => summarize(state), [state]);

  const currentKey = configKey(settings);
  const bestSoFar = useMemo(
    () => bestFor(history, currentKey, (result) => resultKey(result)),
    [history, currentKey],
  );

  /**
   * The finished run is written to history immediately, which would otherwise
   * make it its own previous best. Freezing the figure while a result is on
   * screen keeps the comparison honest.
   */
  const frozenBestRef = useRef(0);
  if (state.status !== "finished") frozenBestRef.current = bestSoFar;
  const previousBest = state.status === "finished" ? frozenBestRef.current : bestSoFar;

  const [result, setResult] = useState<TestResult | null>(null);

  // Record the finished test exactly once.
  useEffect(() => {
    if (state.status !== "finished") {
      if (state.status === "idle") setResult(null);
      return;
    }

    const fingerprint = `${seed}:${state.keystrokes.length}:${Math.round(state.elapsedMs)}`;
    if (completedRef.current === fingerprint) return;
    completedRef.current = fingerprint;

    const finished: TestResult = {
      id: createId(),
      completedAt: Date.now(),
      mode: settings.mode,
      limit: limitValue(settings),
      difficulty: settings.difficulty,
      punctuation: settings.punctuation,
      numbers: settings.numbers,
      wpm: summary.wpm,
      rawWpm: summary.rawWpm,
      accuracy: summary.accuracy,
      consistency: summary.consistency,
      durationMs: summary.durationMs,
      chars: summary.chars,
      samples: summary.samples,
    };

    setResult(finished);
    onComplete(finished);
  }, [state.status, state.keystrokes.length, state.elapsedMs, seed, settings, summary, onComplete]);

  const press = useCallback(
    (key: string, modifiers: { ctrl: boolean; alt: boolean; meta: boolean }) => {
      if (state.status === "finished") return false;

      if (key === "Backspace") {
        dispatch({ type: "backspace", wholeWord: modifiers.ctrl || modifiers.alt });
        return true;
      }

      if (modifiers.ctrl || modifiers.meta || modifiers.alt) return false;

      if (key === " ") {
        dispatch({ type: "space", at: performance.now() });
        onKeystroke?.(true);
        return true;
      }

      if (key.length === 1) {
        const active = state.words[state.activeIndex];
        const expected = active?.target[active.typed.length];
        onKeystroke?.(key === expected);
        dispatch({ type: "type", char: key, at: performance.now() });
        return true;
      }

      return false;
    },
    [state.status, state.words, state.activeIndex, onKeystroke],
  );

  const timeLeft =
    settings.mode === "time" ? Math.max(0, settings.timeLimit - state.elapsedMs / 1000) : 0;

  return {
    state,
    summary,
    result,
    previousBest,
    isPersonalBest: result !== null && result.wpm > previousBest,
    timeLeft,
    progress: progress(state),
    config,
    press,
    restart,
  };
}

function limitValue(settings: Settings): number {
  const limit = activeLimit(settings);
  if (typeof limit === "number") return limit;
  // Quote mode stores its length band as 1, 2 or 3 so the field stays numeric.
  return limit === "short" ? 1 : limit === "medium" ? 2 : 3;
}

function resultKey(result: TestResult): string {
  const flags = [result.punctuation ? "p" : "", result.numbers ? "n" : ""].join("");
  const limit =
    result.mode === "quote"
      ? result.limit === 1
        ? "short"
        : result.limit === 2
          ? "medium"
          : "long"
      : result.limit;
  return `${result.mode}:${limit}:${result.difficulty}${flags ? `:${flags}` : ""}`;
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
