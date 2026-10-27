import { forwardRef, memo, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { CaretStyle, TestStatus, WordState } from "@/types";

/** Lines of text kept visible at once; the rest scrolls up out of view. */
const VISIBLE_LINES = 3;

interface TextDisplayProps {
  words: readonly WordState[];
  activeIndex: number;
  status: TestStatus;
  fontSize: number;
  caretStyle: CaretStyle;
  smoothCaret: boolean;
  blindMode: boolean;
}

interface CaretPosition {
  left: number;
  top: number;
  height: number;
  width: number;
}

/**
 * Renders the target text with per-character state and drives the caret.
 *
 * Only a window of words around the cursor is mounted, which keeps a long time
 * mode test from growing into thousands of spans.
 */
export const TextDisplay = memo(function TextDisplay({
  words,
  activeIndex,
  status,
  fontSize,
  caretStyle,
  smoothCaret,
  blindMode,
}: TextDisplayProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  const [caret, setCaret] = useState<CaretPosition | null>(null);
  const [offset, setOffset] = useState(0);
  // Measured rather than assumed, because the font size is clamped on narrow
  // screens and the viewport must stay exactly three lines tall either way.
  const [lineHeight, setLineHeight] = useState(fontSize * 1.6);

  const windowStart = Math.max(0, activeIndex - 60);
  const windowEnd = Math.min(words.length, activeIndex + 120);
  const visible = words.slice(windowStart, windowEnd);
  const active = words[activeIndex];
  const typedLength = active?.typed.length ?? 0;

  // Position the caret and scroll the track so the active line stays in view.
  useLayoutEffect(() => {
    const word = activeWordRef.current;
    const track = trackRef.current;
    if (!word || !track) return;

    const chars = word.querySelectorAll<HTMLElement>("[data-char]");
    const target = chars[Math.min(typedLength, chars.length - 1)];
    if (!target) return;

    const atEnd = typedLength >= chars.length - 1;
    const measured = word.offsetHeight || fontSize * 1.6;
    setLineHeight(measured);

    setCaret({
      left: target.offsetLeft + word.offsetLeft + (atEnd ? target.offsetWidth : 0),
      top: target.offsetTop + word.offsetTop,
      height: measured,
      width: Math.max(2, Math.round(fontSize / 12)),
    });

    const line = Math.round(word.offsetTop / measured);
    setOffset(Math.max(0, line - 1) * measured);
  }, [activeIndex, typedLength, fontSize, words.length, visible.length]);

  const caretTransition = smoothCaret
    ? "left 90ms ease-out, top 140ms ease-out"
    : "top 140ms ease-out";

  return (
    <div
      ref={viewportRef}
      className="relative overflow-hidden"
      style={{ height: `${VISIBLE_LINES * lineHeight}px` }}
      aria-hidden="true"
    >
      <div
        ref={trackRef}
        className="relative flex flex-wrap content-start gap-x-[1ch] font-mono transition-transform duration-150 motion-reduce:transition-none"
        style={{
          // Never wider than the chosen size, but shrinks to fit a phone.
          fontSize: `clamp(15px, 4.6vw, ${fontSize}px)`,
          lineHeight: 1.6,
          transform: `translateY(-${offset}px)`,
        }}
      >
        {visible.map((word, index) => {
          const wordIndex = windowStart + index;
          const isActive = wordIndex === activeIndex;
          return (
            <Word
              key={wordIndex}
              ref={isActive ? activeWordRef : undefined}
              word={word}
              isPast={wordIndex < activeIndex}
              blindMode={blindMode}
            />
          );
        })}

        {caret ? (
          <span
            className={cn(
              "pointer-events-none absolute bg-caret",
              status === "running" ? "" : "animate-caret-blink motion-reduce:animate-none",
              caretStyle === "block" && "opacity-40",
            )}
            style={{
              left: caret.left,
              top: caretStyle === "underline" ? caret.top + caret.height - 2 : caret.top,
              width: caretStyle === "line" ? caret.width : "1ch",
              height:
                caretStyle === "line"
                  ? caret.height * 0.85
                  : caretStyle === "underline"
                    ? 2
                    : caret.height * 0.85,
              borderRadius: caret.width,
              transition: caretTransition,
            }}
          />
        ) : null}
      </div>
    </div>
  );
});

interface WordProps {
  word: WordState;
  isPast: boolean;
  blindMode: boolean;
}

const Word = memo(
  forwardRef<HTMLSpanElement, WordProps>(function Word({ word, isPast, blindMode }, ref) {
    const { target, typed } = word;
    const hasError = isPast && typed !== target;

    return (
      <span
        ref={ref}
        className={cn(
          "relative inline-flex whitespace-nowrap",
          hasError && !blindMode && "underline decoration-error decoration-2 underline-offset-[0.35em]",
        )}
      >
        {target.split("").map((char, index) => {
          const typedChar = typed[index];
          const state =
            typedChar === undefined
              ? isPast
                ? "missed"
                : "pending"
              : typedChar === char
                ? "correct"
                : "incorrect";

          return (
            <span key={index} data-char className={charClass(state, blindMode)}>
              {char}
            </span>
          );
        })}

        {typed.length > target.length
          ? typed
              .slice(target.length)
              .split("")
              .map((char, index) => (
                <span key={`extra-${index}`} data-char className={charClass("extra", blindMode)}>
                  {char}
                </span>
              ))
          : null}

        {/* Zero-width anchor so the caret always has an element to sit after. */}
        <span data-char className="inline-block w-0" />
      </span>
    );
  }),
);

type CharState = "pending" | "correct" | "incorrect" | "extra" | "missed";

function charClass(state: CharState, blindMode: boolean): string {
  if (blindMode) return "text-muted";

  switch (state) {
    case "correct":
      return "text-text";
    case "incorrect":
      return "text-error";
    case "extra":
      return "text-error/70";
    case "missed":
      return "text-error/50";
    default:
      return "text-muted";
  }
}
