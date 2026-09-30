"use client";

import { useCallback, useSyncExternalStore } from "react";

/** ערך קטן שנשמר בדפדפן (למשל תצוגת כרטיסים או רשימה). עובד גם כשהאחסון חסום */
export function useLocalStorage<T extends string>(key: string, fallback: T): [T, (value: T) => void] {
  const subscribe = useCallback(
    (callback: () => void) => {
      const handler = (e: StorageEvent | CustomEvent) => {
        if (!("key" in e) || e.key === key || e.key === null) callback();
      };
      window.addEventListener("storage", handler as EventListener);
      window.addEventListener(`local-storage:${key}`, callback);
      return () => {
        window.removeEventListener("storage", handler as EventListener);
        window.removeEventListener(`local-storage:${key}`, callback);
      };
    },
    [key],
  );

  const value = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return (window.localStorage.getItem(key) as T | null) ?? fallback;
      } catch {
        return fallback;
      }
    },
    () => fallback,
  );

  const setValue = useCallback(
    (next: T) => {
      try {
        window.localStorage.setItem(key, next);
      } catch {
        // אחסון חסום: הערך פשוט לא יישמר
      }
      window.dispatchEvent(new Event(`local-storage:${key}`));
    },
    [key],
  );

  return [value, setValue];
}
