import { useCallback, useEffect, useRef, useState } from "react";
import { AppFooter } from "@/components/typing/AppFooter";
import { AppHeader } from "@/components/typing/AppHeader";
import { LiveStats } from "@/components/typing/LiveStats";
import { ModeBar } from "@/components/typing/ModeBar";
import { ProgressBar } from "@/components/typing/ProgressBar";
import { Results } from "@/components/typing/Results";
import { SettingsDialog } from "@/components/typing/SettingsDialog";
import { ShortcutHints } from "@/components/typing/ShortcutHints";
import { StatsDialog } from "@/components/typing/StatsDialog";
import { TextDisplay } from "@/components/typing/TextDisplay";
import { useHistory } from "@/hooks/use-history";
import { useSettings } from "@/hooks/use-settings";
import { useSound } from "@/hooks/use-sound";
import { useTheme } from "@/hooks/use-theme";
import { useTypingTest } from "@/hooks/use-typing-test";

export default function Home() {
  const { settings, update, reset } = useSettings();
  const { history, add, clear } = useHistory();
  const playSound = useSound(settings.sound);

  useTheme(settings.theme);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [focused, setFocused] = useState(true);
  const [capsLock, setCapsLock] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const consumedRef = useRef(false);

  const onKeystroke = useCallback(
    (correct: boolean) => playSound(correct ? "key" : "error"),
    [playSound],
  );

  const test = useTypingTest({ settings, history, onComplete: add, onKeystroke });
  const { state, summary, result, restart } = test;

  const dialogOpen = settingsOpen || statsOpen;
  const running = state.status === "running";
  const finished = state.status === "finished";

  /**
   * Read by the window-level key handler. A keydown is a discrete event, so a
   * dialog closing in an earlier listener re-registers that handler before the
   * event finishes propagating; a ref is the only value guaranteed current.
   */
  const dialogOpenRef = useRef(dialogOpen);
  dialogOpenRef.current = dialogOpen;

  const focusInput = useCallback(() => {
    if (!dialogOpen) inputRef.current?.focus();
  }, [dialogOpen]);

  // Hold focus on the capture field whenever no dialog is in the way.
  useEffect(() => {
    if (dialogOpen) return;
    focusInput();
  }, [dialogOpen, focusInput, state.status]);

  // Global shortcuts. Tab restarts, Escape opens settings or closes a dialog.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (typeof event.getModifierState === "function") {
        setCapsLock(event.getModifierState("CapsLock"));
      }

      // Anything already handled, by a dialog or the browser, is not ours.
      if (event.defaultPrevented) return;

      if (event.key === "Tab" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        if (dialogOpenRef.current) return;
        event.preventDefault();
        restart();
        focusInput();
        return;
      }

      if (event.key === "Escape") {
        if (dialogOpenRef.current) return; // the dialog dismisses itself
        event.preventDefault();
        setSettingsOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [restart, focusInput]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Tab" || event.key === "Escape") return;

    if (event.key === "Backspace") {
      event.preventDefault();
      test.press("Backspace", {
        ctrl: event.ctrlKey,
        alt: event.altKey,
        meta: event.metaKey,
      });
      return;
    }

    if (event.key.length !== 1) return;

    event.preventDefault();
    consumedRef.current = true;
    test.press(event.key, { ctrl: event.ctrlKey, alt: event.altKey, meta: event.metaKey });
  };

  /**
   * Soft keyboards often report a keydown of "Unidentified", so characters are
   * also accepted here. The flag stops a desktop keypress counting twice.
   */
  const handleBeforeInput = (event: React.FormEvent<HTMLInputElement>) => {
    event.preventDefault();

    if (consumedRef.current) {
      consumedRef.current = false;
      return;
    }

    const data = (event as unknown as { data?: string }).data;
    if (data && data.length === 1) {
      test.press(data, { ctrl: false, alt: false, meta: false });
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10">
      <a
        href="#typing-area"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:text-accent-contrast"
      >
        Skip to typing area
      </a>

      <AppHeader
        theme={settings.theme}
        dimmed={running}
        onToggleTheme={() =>
          update({
            theme:
              settings.theme === "light" || settings.theme === "amber" ? "dark" : "light",
          })
        }
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenStats={() => setStatsOpen(true)}
      />

      <main className="flex flex-1 flex-col justify-center">
        <ModeBar settings={settings} onChange={update} dimmed={running} />

        {finished && result ? (
          <Results
            result={result}
            settings={settings}
            previousBest={test.previousBest}
            isPersonalBest={test.isPersonalBest}
            onRestart={() => {
              restart();
              focusInput();
            }}
          />
        ) : (
          <section id="typing-area" aria-label="Typing test">
            <LiveStats
              settings={settings}
              status={state.status}
              timeLeft={test.timeLeft}
              wordIndex={state.activeIndex}
              wordTotal={state.words.length}
              wpm={summary.wpm}
              accuracy={summary.accuracy}
              progress={test.progress}
            />

            <ProgressBar value={test.progress} />

            {/* The capture field is visually hidden but focusable and typeable. */}
            <div
              className="relative cursor-text"
              onMouseDown={(event) => {
                event.preventDefault();
                focusInput();
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value=""
                onChange={() => undefined}
                onKeyDown={handleKeyDown}
                onBeforeInput={handleBeforeInput}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="absolute inset-0 h-full w-full cursor-text opacity-0"
                aria-label="Type the displayed text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-gramm="false"
              />

              <div
                className={`transition-[filter,opacity] duration-200 ${
                  focused || dialogOpen ? "" : "blur-[3px] opacity-60"
                }`}
              >
                <TextDisplay
                  words={state.words}
                  activeIndex={state.activeIndex}
                  status={state.status}
                  fontSize={settings.fontSize}
                  caretStyle={settings.caretStyle}
                  smoothCaret={settings.smoothCaret}
                  blindMode={settings.blindMode}
                />
              </div>

              {!focused && !dialogOpen ? (
                <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium text-text">
                  Click or press any key to continue
                </p>
              ) : null}
            </div>

            {/* A text-only view of the current word for assistive technology. */}
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {state.words[state.activeIndex]?.target ?? ""}
            </p>

            <ShortcutHints hidden={running} capsLock={capsLock} />
          </section>
        )}
      </main>

      <AppFooter dimmed={running} />

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onChange={update}
        onReset={reset}
      />

      <StatsDialog
        open={statsOpen}
        onOpenChange={setStatsOpen}
        history={history}
        onClear={clear}
      />
    </div>
  );
}
