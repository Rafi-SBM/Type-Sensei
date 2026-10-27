import { describe, expect, it } from "vitest";
import { wordPools } from "@/data/words";
import { buildTestText, buildWords, passageToWords } from "@/lib/text-source";
import { defaultSettings } from "@/lib/settings";

describe("buildWords", () => {
  it("returns exactly the requested number of words", () => {
    expect(buildWords(37, { difficulty: "medium", punctuation: false, numbers: false, seed: 1 }))
      .toHaveLength(37);
  });

  it("draws only from the pool for the chosen difficulty", () => {
    const words = buildWords(50, { difficulty: "easy", punctuation: false, numbers: false, seed: 7 });
    expect(words.every((word) => wordPools.easy.includes(word))).toBe(true);
  });

  it("is reproducible for a given seed", () => {
    const options = { difficulty: "hard", punctuation: true, numbers: true, seed: 42 } as const;
    expect(buildWords(20, options)).toEqual(buildWords(20, options));
  });

  it("never repeats a word back to back", () => {
    const words = buildWords(200, { difficulty: "easy", punctuation: false, numbers: false, seed: 3 });
    const repeats = words.filter((word, index) => index > 0 && word === words[index - 1]);
    expect(repeats).toHaveLength(0);
  });

  it("adds no punctuation or capitals when both extras are off", () => {
    const words = buildWords(100, { difficulty: "medium", punctuation: false, numbers: false, seed: 9 });
    expect(words.join(" ")).toMatch(/^[a-z ]+$/);
  });

  it("capitalises the first word and ends the text when punctuation is on", () => {
    const words = buildWords(40, { difficulty: "easy", punctuation: true, numbers: false, seed: 11 });
    expect(words[0][0]).toMatch(/[A-Z]/);
    expect(words.at(-1)).toMatch(/[.?!]$/);
  });

  it("mixes in numbers when asked", () => {
    const words = buildWords(200, { difficulty: "easy", punctuation: false, numbers: true, seed: 5 });
    expect(words.some((word) => /^\d+$/.test(word))).toBe(true);
  });

  it("contains no whitespace inside a word, so word splitting stays sound", () => {
    const words = buildWords(150, { difficulty: "hard", punctuation: true, numbers: true, seed: 13 });
    expect(words.every((word) => word.length > 0 && !/\s/.test(word))).toBe(true);
  });
});

describe("buildTestText", () => {
  it("stages a buffer for time mode rather than the word limit", () => {
    const words = buildTestText({
      mode: "time",
      difficulty: "medium",
      wordLimit: 10,
      quoteLength: "short",
      punctuation: false,
      numbers: false,
      seed: 1,
    });
    expect(words.length).toBeGreaterThan(10);
  });

  it("honours the word limit in words mode", () => {
    const words = buildTestText({
      mode: "words",
      difficulty: "medium",
      wordLimit: 25,
      quoteLength: "short",
      punctuation: false,
      numbers: false,
      seed: 1,
    });
    expect(words).toHaveLength(25);
  });

  it("returns a real passage in quote mode", () => {
    const words = buildTestText({
      mode: "quote",
      difficulty: "easy",
      wordLimit: 10,
      quoteLength: "short",
      punctuation: false,
      numbers: false,
      seed: 2,
    });
    expect(words.length).toBeGreaterThan(5);
    expect(words.at(-1)).toMatch(/[.?!]$/);
  });

  it("works with the shipped default settings", () => {
    const words = buildTestText({ ...defaultSettings, seed: 1 });
    expect(words.length).toBeGreaterThan(0);
  });
});

describe("passageToWords", () => {
  it("splits on any run of whitespace and keeps punctuation attached", () => {
    expect(passageToWords("  Hello,   world.  ")).toEqual(["Hello,", "world."]);
  });
});
