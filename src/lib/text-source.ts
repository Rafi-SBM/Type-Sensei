import { passages } from "@/data/passages";
import { wordPools } from "@/data/words";
import { createRandom, pick } from "@/lib/random";
import type { Difficulty, QuoteLength, Settings, TestMode } from "@/types";

/** How many words to stage up front, and how many to append when running low. */
export const TIME_MODE_BUFFER = 80;
export const TIME_MODE_REFILL = 40;

const SENTENCE_ENDINGS = [".", ".", ".", "?", "!"] as const;
const INNER_MARKS = [",", ",", ",", ";", ":", "'"] as const;

export interface TextRequest {
  mode: TestMode;
  difficulty: Difficulty;
  wordLimit: number;
  quoteLength: QuoteLength;
  punctuation: boolean;
  numbers: boolean;
  seed?: number;
}

/**
 * Picks `count` words from the pool for the difficulty, never repeating a word
 * back to back, then optionally sprinkles in punctuation and numbers.
 */
export function buildWords(
  count: number,
  options: Pick<TextRequest, "difficulty" | "punctuation" | "numbers" | "seed">,
): string[] {
  const random = createRandom(options.seed);
  const pool = wordPools[options.difficulty];
  const words: string[] = [];

  for (let i = 0; i < count; i += 1) {
    let word = pick(pool, random);
    // Avoid an immediate repeat, which reads like a bug even when it is chance.
    for (let tries = 0; tries < 4 && word === words[words.length - 1]; tries += 1) {
      word = pick(pool, random);
    }
    words.push(word);
  }

  if (options.numbers) {
    withNumbers(words, random);
  }
  if (options.punctuation) {
    withPunctuation(words, random);
  }

  return words;
}

/** Replaces roughly one word in eight with a short number. */
function withNumbers(words: string[], random: () => number): void {
  for (let i = 0; i < words.length; i += 1) {
    if (random() < 0.12) {
      const digits = 1 + Math.floor(random() * 4);
      const max = 10 ** digits;
      words[i] = String(Math.floor(random() * max)).padStart(digits > 2 ? 2 : 1, "0");
    }
  }
}

/**
 * Adds sentence structure: a capital on the first word of each sentence, a
 * terminator every four to twelve words, and the occasional inner mark.
 */
function withPunctuation(words: string[], random: () => number): void {
  let sentenceStart = 0;
  let target = 4 + Math.floor(random() * 9);

  for (let i = 0; i < words.length; i += 1) {
    const isLast = i === words.length - 1;
    const length = i - sentenceStart + 1;

    if (sentenceStart === i) {
      words[i] = capitalize(words[i]);
    }

    if (length >= target || isLast) {
      words[i] += pick(SENTENCE_ENDINGS, random);
      sentenceStart = i + 1;
      target = 4 + Math.floor(random() * 9);
    } else if (length > 2 && random() < 0.1) {
      const mark = pick(INNER_MARKS, random);
      words[i] += mark === "'" ? "'s" : mark;
    }
  }
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** Splits a passage into words, preserving its own punctuation. */
export function passageToWords(passage: string): string[] {
  return passage.trim().split(/\s+/).filter(Boolean);
}

export function pickPassage(length: QuoteLength, seed?: number): string {
  return pick(passages[length], createRandom(seed));
}

/** Builds the full word list for a test from the current settings. */
export function buildTestText(request: TextRequest): string[] {
  if (request.mode === "quote") {
    return passageToWords(pickPassage(request.quoteLength, request.seed));
  }

  const count = request.mode === "time" ? TIME_MODE_BUFFER : request.wordLimit;
  return buildWords(count, request);
}

export function requestFromSettings(settings: Settings, seed?: number): TextRequest {
  return {
    mode: settings.mode,
    difficulty: settings.difficulty,
    wordLimit: settings.wordLimit,
    quoteLength: settings.quoteLength,
    punctuation: settings.punctuation,
    numbers: settings.numbers,
    seed,
  };
}
