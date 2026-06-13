"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * localStorage-backed state. Falls back to in-memory on the server / first paint
 * so SSR stays stable. Used to persist module state (conversations, knowledge
 * bases, workflows, memories) until the corresponding backend epic is wired.
 */
export function useLocalState<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value, hydrated]);

  const set = useCallback((v: T | ((p: T) => T)) => setValue(v), []);
  return [value, set];
}
