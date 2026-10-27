import { useCallback, useEffect, useState } from "react";
import { HISTORY_KEY, HISTORY_LIMIT, loadHistory, saveHistory } from "@/lib/history";
import { removeKey } from "@/lib/storage";
import type { TestResult } from "@/types";

export function useHistory() {
  const [history, setHistory] = useState<TestResult[]>([]);

  // Read on mount rather than during render, so the first paint is not blocked
  // by storage access and server-side rendering stays possible.
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const add = useCallback((result: TestResult) => {
    setHistory((current) => {
      const next = [result, ...current].slice(0, HISTORY_LIMIT);
      saveHistory(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    removeKey(HISTORY_KEY);
    setHistory([]);
  }, []);

  return { history, add, clear };
}
