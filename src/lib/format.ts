import type { Difficulty, Settings, TestMode } from "@/types";

export function formatClock(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safe / 60);
  return `${minutes}:${String(safe % 60).padStart(2, "0")}`;
}

export function formatDuration(ms: number): string {
  const seconds = ms / 1000;
  return seconds >= 60 ? formatClock(seconds) : `${seconds.toFixed(1)}s`;
}

export function formatTimeOption(seconds: number): string {
  if (seconds % 60 === 0 && seconds >= 60) return `${seconds / 60}m`;
  return `${seconds}s`;
}

/** Stable key used to track a personal best per configuration. */
export function configKey(settings: Settings): string {
  const limit =
    settings.mode === "time"
      ? settings.timeLimit
      : settings.mode === "words"
        ? settings.wordLimit
        : settings.quoteLength;

  const flags = [settings.punctuation ? "p" : "", settings.numbers ? "n" : ""].join("");
  return `${settings.mode}:${limit}:${settings.difficulty}${flags ? `:${flags}` : ""}`;
}

export function describeMode(mode: TestMode, limit: number | string, difficulty: Difficulty): string {
  const label = mode === "time" ? formatTimeOption(Number(limit)) : String(limit);
  return `${mode} ${label} · ${difficulty}`;
}

export function relativeTime(timestamp: number, now = Date.now()): string {
  const diff = Math.max(0, now - timestamp);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
