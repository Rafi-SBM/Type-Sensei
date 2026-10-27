import { memo } from "react";
import { cn } from "@/lib/utils";

interface ShortcutHintsProps {
  hidden: boolean;
  capsLock: boolean;
}

export const ShortcutHints = memo(function ShortcutHints({ hidden, capsLock }: ShortcutHintsProps) {
  return (
    <div className="mt-6 flex min-h-6 flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted">
      {capsLock ? (
        <p className="inline-flex items-center gap-2 rounded-full bg-error/10 px-3 py-1 font-medium text-error" role="status">
          Caps Lock is on
        </p>
      ) : null}

      {/* Physical-keyboard shortcuts, so they are hidden on phone layouts. */}
      <p className={cn("hidden transition-opacity duration-200 sm:block", hidden && "opacity-0")}>
        <Key>Tab</Key> restart · <Key>Esc</Key> settings · <Key>Ctrl</Key>+<Key>Backspace</Key>{" "}
        delete word
      </p>
    </div>
  );
});

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[11px] text-text">
      {children}
    </kbd>
  );
}
