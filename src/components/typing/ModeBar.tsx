import { Hash, Quote, Timer, Type } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import {
  DIFFICULTIES,
  MAX_CUSTOM_TIME,
  MAX_CUSTOM_WORDS,
  MIN_CUSTOM_TIME,
  MIN_CUSTOM_WORDS,
  QUOTE_LENGTHS,
  TIME_OPTIONS,
  WORD_OPTIONS,
} from "@/lib/settings";
import { formatTimeOption } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Settings, TestMode } from "@/types";

interface ModeBarProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  dimmed: boolean;
}

const MODE_ICONS: Record<TestMode, typeof Timer> = {
  time: Timer,
  words: Type,
  quote: Quote,
};

export const ModeBar = memo(function ModeBar({ settings, onChange, dimmed }: ModeBarProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const customRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (customOpen) customRef.current?.focus();
  }, [customOpen]);

  useEffect(() => {
    setCustomOpen(false);
  }, [settings.mode]);

  const isTime = settings.mode === "time";
  const presets = isTime ? TIME_OPTIONS : WORD_OPTIONS;
  const current = isTime ? settings.timeLimit : settings.wordLimit;
  const isCustom = !(presets as readonly number[]).includes(current);

  const commitCustom = () => {
    const parsed = Number.parseInt(customValue, 10);
    const min = isTime ? MIN_CUSTOM_TIME : MIN_CUSTOM_WORDS;
    const max = isTime ? MAX_CUSTOM_TIME : MAX_CUSTOM_WORDS;

    if (Number.isFinite(parsed) && parsed >= min && parsed <= max) {
      onChange(isTime ? { timeLimit: parsed } : { wordLimit: parsed });
    }
    setCustomValue("");
    setCustomOpen(false);
  };

  return (
    <nav
      aria-label="Test options"
      className={cn(
        "mb-8 flex flex-wrap items-center justify-center gap-x-1 gap-y-2 rounded-lg bg-surface px-3 py-2 text-sm transition-opacity duration-200",
        dimmed && "pointer-events-none opacity-0",
      )}
    >
      <Group label="Mode">
        {(["time", "words", "quote"] as const).map((mode) => {
          const Icon = MODE_ICONS[mode];
          return (
            <Option
              key={mode}
              active={settings.mode === mode}
              onClick={() => onChange({ mode })}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {mode}
            </Option>
          );
        })}
      </Group>

      <Divider />

      {settings.mode === "quote" ? (
        <Group label="Length">
          {QUOTE_LENGTHS.map((length) => (
            <Option
              key={length}
              active={settings.quoteLength === length}
              onClick={() => onChange({ quoteLength: length })}
            >
              {length}
            </Option>
          ))}
        </Group>
      ) : (
        <Group label={isTime ? "Seconds" : "Words"}>
          {presets.map((preset) => (
            <Option
              key={preset}
              active={current === preset && !customOpen}
              onClick={() => {
                setCustomOpen(false);
                onChange(isTime ? { timeLimit: preset } : { wordLimit: preset });
              }}
            >
              {isTime ? formatTimeOption(preset) : preset}
            </Option>
          ))}

          {customOpen ? (
            <input
              ref={customRef}
              type="number"
              inputMode="numeric"
              min={isTime ? MIN_CUSTOM_TIME : MIN_CUSTOM_WORDS}
              max={isTime ? MAX_CUSTOM_TIME : MAX_CUSTOM_WORDS}
              value={customValue}
              onChange={(event) => setCustomValue(event.target.value)}
              onBlur={commitCustom}
              onKeyDown={(event) => {
                if (event.key === "Enter") commitCustom();
                if (event.key === "Escape") {
                  setCustomValue("");
                  setCustomOpen(false);
                }
              }}
              placeholder={isTime ? "sec" : "num"}
              aria-label={isTime ? "Custom duration in seconds" : "Custom word count"}
              className="h-7 w-20 rounded-md border border-accent bg-background px-2 text-center font-mono text-sm text-text outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          ) : (
            <Option active={isCustom} onClick={() => setCustomOpen(true)}>
              <Hash className="h-3.5 w-3.5" aria-hidden="true" />
              {isCustom ? (isTime ? formatTimeOption(current) : current) : "custom"}
            </Option>
          )}
        </Group>
      )}

      <Divider />

      <Group label="Difficulty">
        {DIFFICULTIES.map((difficulty) => (
          <Option
            key={difficulty}
            active={settings.difficulty === difficulty}
            onClick={() => onChange({ difficulty })}
          >
            {difficulty}
          </Option>
        ))}
      </Group>

      {settings.mode !== "quote" ? (
        <>
          <Divider />
          <Group label="Extras">
            <Option
              active={settings.punctuation}
              onClick={() => onChange({ punctuation: !settings.punctuation })}
            >
              punctuation
            </Option>
            <Option active={settings.numbers} onClick={() => onChange({ numbers: !settings.numbers })}>
              numbers
            </Option>
          </Group>
        </>
      ) : null}
    </nav>
  );
});

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      {children}
    </div>
  );
}

function Divider() {
  return <span className="mx-1 hidden h-4 w-px bg-line sm:block" aria-hidden="true" />;
}

interface OptionProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function Option({ active, onClick, children }: OptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 font-mono text-xs lowercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "bg-accent text-accent-contrast" : "text-muted hover:bg-surface-strong hover:text-text",
      )}
    >
      {children}
    </button>
  );
}
