import { describe, expect, it } from "vitest";
import {
  createState,
  needsMoreWords,
  progress,
  reducer,
  summarize,
  type EngineAction,
  type EngineConfig,
  type EngineState,
} from "@/lib/engine";

const config = (overrides: Partial<EngineConfig> = {}): EngineConfig => ({
  mode: "words",
  timeLimitMs: 30_000,
  stopOnError: false,
  noBackspace: false,
  ...overrides,
});

const start = (words: string[], overrides: Partial<EngineConfig> = {}) =>
  createState(words, config(overrides));

const run = (state: EngineState, actions: EngineAction[]) =>
  actions.reduce(reducer, state);

/** Types a string one character at a time, one millisecond apart. */
const typeText = (state: EngineState, text: string, from = 0): EngineState =>
  text.split("").reduce(
    (current, char, index) =>
      char === " "
        ? reducer(current, { type: "space", at: from + index })
        : reducer(current, { type: "type", char, at: from + index }),
    state,
  );

describe("engine", () => {
  it("starts idle and begins running on the first character", () => {
    const state = start(["hello", "world"]);
    expect(state.status).toBe("idle");

    const typed = reducer(state, { type: "type", char: "h", at: 1000 });
    expect(typed.status).toBe("running");
    expect(typed.startedAt).toBe(1000);
    expect(typed.words[0].typed).toBe("h");
  });

  it("records keystroke times relative to the start of the test", () => {
    const state = typeText(start(["ab"]), "ab", 5000);
    expect(state.keystrokes.map((k) => k.at)).toEqual([0, 1]);
  });

  it("does not start a test on the space bar", () => {
    const state = reducer(start(["hello"]), { type: "space", at: 10 });
    expect(state.status).toBe("idle");
    expect(state.activeIndex).toBe(0);
  });

  it("marks a keystroke incorrect when it does not match the target", () => {
    const state = typeText(start(["hello"]), "hb");
    expect(state.keystrokes.map((k) => k.correct)).toEqual([true, false]);
  });

  it("advances to the next word on space", () => {
    const state = typeText(start(["hello", "world"]), "hello ");
    expect(state.activeIndex).toBe(1);
  });

  it("ignores a space typed at the start of a word", () => {
    const state = run(start(["hello", "world"]), [
      { type: "type", char: "h", at: 0 },
      { type: "backspace" },
      { type: "space", at: 2 },
    ]);
    expect(state.activeIndex).toBe(0);
  });

  it("finishes a word-count test when the last word is completed", () => {
    const state = typeText(start(["go", "on"]), "go on");
    expect(state.status).toBe("finished");
  });

  it("finishes on space even when the last word was mistyped", () => {
    const state = typeText(start(["go", "on"]), "go xx ");
    expect(state.status).toBe("finished");
  });

  it("keeps going past the last word in time mode", () => {
    const state = typeText(start(["go", "on"], { mode: "time" }), "go on");
    expect(state.status).toBe("running");
  });

  it("deletes a character, then steps back into an imperfect previous word", () => {
    let state = typeText(start(["hello", "world"]), "helo ");
    expect(state.activeIndex).toBe(1);

    state = reducer(state, { type: "backspace" });
    expect(state.activeIndex).toBe(0);
    expect(state.words[0].typed).toBe("helo");

    state = reducer(state, { type: "backspace" });
    expect(state.words[0].typed).toBe("hel");
  });

  it("refuses to step back into a word that was typed correctly", () => {
    const state = reducer(typeText(start(["hello", "world"]), "hello "), { type: "backspace" });
    expect(state.activeIndex).toBe(1);
  });

  it("clears the whole word when backspace is held with a modifier", () => {
    const state = reducer(typeText(start(["hello"]), "hell"), {
      type: "backspace",
      wholeWord: true,
    });
    expect(state.words[0].typed).toBe("");
  });

  it("honours the no-backspace setting", () => {
    const state = reducer(typeText(start(["hello"], { noBackspace: true }), "hel"), {
      type: "backspace",
    });
    expect(state.words[0].typed).toBe("hel");
  });

  it("blocks the space bar on a wrong word when stop-on-error is set", () => {
    const state = typeText(start(["hello", "world"], { stopOnError: true }), "helo ");
    expect(state.activeIndex).toBe(0);
  });

  it("caps how far past the end of a word the user can type", () => {
    const state = typeText(start(["ab"]), "ab".padEnd(40, "x"));
    expect(state.words[0].typed.length).toBeLessThanOrEqual(2 + 12);
  });

  it("ends a time-mode test once the limit is reached", () => {
    const state = reducer(typeText(start(["a", "b"], { mode: "time", timeLimitMs: 5000 }), "a"), {
      type: "tick",
      at: 5100,
    });

    expect(state.status).toBe("finished");
    expect(state.elapsedMs).toBe(5000);
  });

  it("ignores input once the test has finished", () => {
    const finished = typeText(start(["go"]), "go");
    const after = reducer(finished, { type: "type", char: "x", at: 99 });
    expect(after).toBe(finished);
  });

  it("appends more words and reports when the buffer runs low", () => {
    const state = start(["a", "b"], { mode: "time" });
    expect(needsMoreWords(state)).toBe(true);

    const extended = reducer(state, { type: "append", words: Array(60).fill("word") });
    expect(extended.words).toHaveLength(62);
    expect(needsMoreWords(extended)).toBe(false);
  });

  it("reports progress by time in time mode and by word elsewhere", () => {
    const timed = reducer(typeText(start(["a", "b"], { mode: "time", timeLimitMs: 10_000 }), "a"), {
      type: "tick",
      at: 5000,
    });
    expect(progress(timed)).toBeCloseTo(0.5, 1);

    const counted = typeText(start(["a", "b", "c", "d"]), "a b ");
    expect(progress(counted)).toBe(0.5);
  });

  it("resets back to a clean idle state", () => {
    const state = reducer(typeText(start(["hello"]), "hel"), {
      type: "reset",
      words: ["fresh", "start"],
      config: config(),
    });

    expect(state.status).toBe("idle");
    expect(state.keystrokes).toHaveLength(0);
    expect(state.words.map((w) => w.target)).toEqual(["fresh", "start"]);
  });
});

describe("summarize", () => {
  it("scores a flawless run at 100 percent accuracy", () => {
    let state = typeText(start(["hello", "world"]), "hello world");
    state = { ...state, elapsedMs: 12_000 };

    const summary = summarize(state);
    expect(summary.accuracy).toBe(100);
    expect(summary.chars.incorrect).toBe(0);
    // 11 correct characters in 0.2 minutes is 11 fifths of a word per 0.2 min.
    expect(summary.wpm).toBe(11);
  });

  it("reflects mistakes in accuracy without crediting them as speed", () => {
    let state = typeText(start(["hello", "world"]), "hallo world");
    state = { ...state, elapsedMs: 12_000 };

    const summary = summarize(state);
    expect(summary.accuracy).toBeLessThan(100);
    expect(summary.chars.incorrect).toBe(1);
    expect(summary.rawWpm).toBeGreaterThan(summary.wpm);
  });

  it("never divides by zero on an untouched test", () => {
    const summary = summarize(start(["hello"]));
    expect(summary).toMatchObject({ wpm: 0, rawWpm: 0, accuracy: 100 });
  });
});
