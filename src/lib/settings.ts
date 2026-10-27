import { asBoolean, asNumber, asOption, isRecord } from "@/lib/storage";
import { clamp } from "@/lib/stats";
import type {
  CaretStyle,
  Difficulty,
  QuoteLength,
  Settings,
  TestMode,
  ThemeName,
} from "@/types";

export const SETTINGS_KEY = "type-sensei:settings:v1";

export const TIME_OPTIONS = [15, 30, 60, 120] as const;
export const WORD_OPTIONS = [10, 25, 50, 100] as const;
export const MODES: readonly TestMode[] = ["time", "words", "quote"];
export const DIFFICULTIES: readonly Difficulty[] = ["easy", "medium", "hard"];
export const QUOTE_LENGTHS: readonly QuoteLength[] = ["short", "medium", "long"];
export const CARET_STYLES: readonly CaretStyle[] = ["line", "block", "underline"];
export const THEMES: readonly ThemeName[] = ["system", "light", "dark", "slate", "amber", "forest"];

export const MIN_CUSTOM_TIME = 5;
export const MAX_CUSTOM_TIME = 3600;
export const MIN_CUSTOM_WORDS = 5;
export const MAX_CUSTOM_WORDS = 500;
export const MIN_FONT_SIZE = 16;
export const MAX_FONT_SIZE = 40;

export const defaultSettings: Settings = {
  mode: "time",
  timeLimit: 30,
  wordLimit: 25,
  quoteLength: "medium",
  difficulty: "medium",
  punctuation: false,
  numbers: false,
  theme: "system",
  caretStyle: "line",
  smoothCaret: true,
  fontSize: 24,
  sound: false,
  blindMode: false,
  stopOnError: false,
  noBackspace: false,
};

/** Accepts anything, returns settings the app can safely run on. */
export function parseSettings(value: unknown): Settings {
  if (!isRecord(value)) return defaultSettings;

  return {
    mode: asOption(value.mode, MODES, defaultSettings.mode),
    timeLimit: clamp(
      Math.round(asNumber(value.timeLimit, defaultSettings.timeLimit)),
      MIN_CUSTOM_TIME,
      MAX_CUSTOM_TIME,
    ),
    wordLimit: clamp(
      Math.round(asNumber(value.wordLimit, defaultSettings.wordLimit)),
      MIN_CUSTOM_WORDS,
      MAX_CUSTOM_WORDS,
    ),
    quoteLength: asOption(value.quoteLength, QUOTE_LENGTHS, defaultSettings.quoteLength),
    difficulty: asOption(value.difficulty, DIFFICULTIES, defaultSettings.difficulty),
    punctuation: asBoolean(value.punctuation, defaultSettings.punctuation),
    numbers: asBoolean(value.numbers, defaultSettings.numbers),
    theme: asOption(value.theme, THEMES, defaultSettings.theme),
    caretStyle: asOption(value.caretStyle, CARET_STYLES, defaultSettings.caretStyle),
    smoothCaret: asBoolean(value.smoothCaret, defaultSettings.smoothCaret),
    fontSize: clamp(
      Math.round(asNumber(value.fontSize, defaultSettings.fontSize)),
      MIN_FONT_SIZE,
      MAX_FONT_SIZE,
    ),
    sound: asBoolean(value.sound, defaultSettings.sound),
    blindMode: asBoolean(value.blindMode, defaultSettings.blindMode),
    stopOnError: asBoolean(value.stopOnError, defaultSettings.stopOnError),
    noBackspace: asBoolean(value.noBackspace, defaultSettings.noBackspace),
  };
}

/** The limit that identifies the current configuration, for labels and bests. */
export function activeLimit(settings: Settings): number | string {
  if (settings.mode === "time") return settings.timeLimit;
  if (settings.mode === "words") return settings.wordLimit;
  return settings.quoteLength;
}
