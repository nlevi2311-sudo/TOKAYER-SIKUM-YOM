"use client";

import { useEffect, useState } from "react";
import { searchAction, type SearchHit } from "@/lib/actions/search";
import { useDebouncedValue } from "./use-debounced-value";

type Response = { query: string; results: SearchHit[]; error?: string };

/** חיפוש חי עם השהייה קצרה. תוצאות ישנות לא דורסות חדשות */
export function useStaffSearch(query: string) {
  const debounced = useDebouncedValue(query.trim(), 220);
  const [response, setResponse] = useState<Response>({ query: "", results: [] });
  const active = debounced.length >= 2;

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    searchAction(debounced).then((res) => {
      if (cancelled) return;
      setResponse(res.ok ? { query: debounced, results: res.results } : { query: debounced, results: [], error: res.error });
    });
    return () => {
      cancelled = true;
    };
  }, [debounced, active]);

  const fresh = response.query === debounced;
  const status: "idle" | "loading" | "done" | "error" = !active
    ? "idle"
    : !fresh
      ? "loading"
      : response.error
        ? "error"
        : "done";

  return {
    status,
    results: active && fresh ? response.results : active ? response.results : [],
    error: response.error,
    query: debounced,
    pending: status === "loading" || query.trim() !== debounced,
  };
}
