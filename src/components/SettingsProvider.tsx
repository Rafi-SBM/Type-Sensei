import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { SettingsContext } from "@/hooks/use-settings";
import { defaultSettings, parseSettings, SETTINGS_KEY } from "@/lib/settings";
import { readJson, writeJson } from "@/lib/storage";
import type { Settings } from "@/types";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(
    () => readJson(SETTINGS_KEY, parseSettings) ?? defaultSettings,
  );

  useEffect(() => {
    writeJson(SETTINGS_KEY, settings);
  }, [settings]);

  // Every change goes back through the parser, so a bad patch cannot take hold.
  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => parseSettings({ ...current, ...patch }));
  }, []);

  const reset = useCallback(() => setSettings(defaultSettings), []);

  const value = useMemo(() => ({ settings, update, reset }), [settings, update, reset]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
