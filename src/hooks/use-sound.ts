import { useCallback, useEffect, useRef } from "react";

/**
 * Short synthesised keypress click. Generated with the Web Audio API so the app
 * ships no audio files and stays silent until the user opts in.
 */
export function useSound(enabled: boolean) {
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (enabled) return;
    contextRef.current?.close().catch(() => undefined);
    contextRef.current = null;
  }, [enabled]);

  useEffect(
    () => () => {
      contextRef.current?.close().catch(() => undefined);
    },
    [],
  );

  return useCallback(
    (variant: "key" | "error" = "key") => {
      if (!enabled) return;

      try {
        const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;

        const context = (contextRef.current ??= new Ctor());
        if (context.state === "suspended") void context.resume();

        const now = context.currentTime;
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = variant === "error" ? "square" : "triangle";
        oscillator.frequency.setValueAtTime(variant === "error" ? 180 : 760, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(variant === "error" ? 0.06 : 0.035, now + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

        oscillator.connect(gain).connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.06);
      } catch {
        // Audio is a nicety; never let it break typing.
      }
    },
    [enabled],
  );
}
