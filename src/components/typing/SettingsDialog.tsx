import { memo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  CARET_STYLES,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  THEMES,
} from "@/lib/settings";
import { cn } from "@/lib/utils";
import type { Settings } from "@/types";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onReset: () => void;
}

export const SettingsDialog = memo(function SettingsDialog({
  open,
  onOpenChange,
  settings,
  onChange,
  onReset,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Settings" description="Saved on this device as you change them.">
        <div className="space-y-6">
          <Field label="Theme">
            <div className="flex flex-wrap gap-1.5">
              {THEMES.map((theme) => (
                <Chip
                  key={theme}
                  active={settings.theme === theme}
                  onClick={() => onChange({ theme })}
                >
                  {theme}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Caret">
            <div className="flex flex-wrap gap-1.5">
              {CARET_STYLES.map((style) => (
                <Chip
                  key={style}
                  active={settings.caretStyle === style}
                  onClick={() => onChange({ caretStyle: style })}
                >
                  {style}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label={`Text size (${settings.fontSize}px)`}>
            <input
              type="range"
              min={MIN_FONT_SIZE}
              max={MAX_FONT_SIZE}
              step={2}
              value={settings.fontSize}
              onChange={(event) => onChange({ fontSize: Number(event.target.value) })}
              aria-label="Text size in pixels"
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-strong accent-accent"
            />
          </Field>

          <div className="space-y-1">
            <Toggle
              label="Smooth caret"
              hint="Animate the caret between characters."
              checked={settings.smoothCaret}
              onChange={(smoothCaret) => onChange({ smoothCaret })}
            />
            <Toggle
              label="Keypress sound"
              hint="A short synthesised click on every key."
              checked={settings.sound}
              onChange={(sound) => onChange({ sound })}
            />
            <Toggle
              label="Blind mode"
              hint="Hide per-character colouring while you type."
              checked={settings.blindMode}
              onChange={(blindMode) => onChange({ blindMode })}
            />
            <Toggle
              label="Stop on error"
              hint="Refuse to move on until the current word is correct."
              checked={settings.stopOnError}
              onChange={(stopOnError) => onChange({ stopOnError })}
            />
            <Toggle
              label="No backspace"
              hint="Disable corrections entirely. Restarts the test."
              checked={settings.noBackspace}
              onChange={(noBackspace) => onChange({ noBackspace })}
            />
          </div>

          <div className="border-t border-line pt-4">
            <button
              type="button"
              onClick={onReset}
              className="text-sm text-muted underline-offset-4 transition-colors hover:text-error hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Reset all settings
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-widest text-muted">{label}</p>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-8 rounded-md px-3 font-mono text-xs lowercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "bg-accent text-accent-contrast" : "bg-surface text-muted hover:text-text",
      )}
    >
      {children}
    </button>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-6 rounded-md py-2">
      <span>
        <span className="block text-sm text-text">{label}</span>
        <span className="block text-xs text-muted">{hint}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </label>
  );
}
