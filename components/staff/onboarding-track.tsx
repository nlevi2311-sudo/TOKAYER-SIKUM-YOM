"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Check, ArrowUpLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingEntry } from "@/lib/data/staff";

const STORAGE_KEY = "onboarding:done";

function readDone(): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

let cache: { raw: string | null; value: string[] } = { raw: null, value: [] };
function snapshot(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cache.raw) cache = { raw, value: readDone() };
  return cache.value;
}
const EMPTY: string[] = [];

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener("onboarding-change", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("onboarding-change", cb);
  };
}

function toggle(id: string) {
  const current = readDone();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // אחסון חסום: ההתקדמות לא תישמר
  }
  window.dispatchEvent(new Event("onboarding-change"));
}

/** מסלול הקליטה: שלבים עם סימון התקדמות אישי (נשמר במכשיר בלבד) */
export function OnboardingTrack({ stages }: { stages: Array<{ key: string; label: string; items: OnboardingEntry[] }> }) {
  const done = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  const all = stages.flatMap((s) => s.items);
  const completed = all.filter((i) => done.includes(i.id)).length;
  const percent = all.length ? Math.round((completed / all.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">ההתקדמות שלך</span>
          <span className="text-muted-foreground">
            {completed} מתוך {all.length}
          </span>
        </div>
        <div
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="התקדמות במסלול הקליטה"
        >
          <div className="h-full rounded-full bg-gradient-to-l from-primary to-mint transition-all" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">הסימון נשמר רק במכשיר הזה.</p>
      </div>

      <ol className="relative space-y-6 border-s-2 border-dashed border-primary/20 ps-6">
        {stages.map((stage, index) => (
          <li key={stage.key} className="relative">
            <span className="absolute -start-[37px] top-0 flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {index + 1}
            </span>
            <h3 className="text-lg font-bold text-primary">{stage.label}</h3>
            <ul className="mt-3 space-y-2">
              {stage.items.map((item) => {
                const isDone = done.includes(item.id);
                return (
                  <li key={item.id} className={cn("flex items-start gap-3 rounded-2xl border bg-card p-3.5 transition", isDone && "bg-surface")}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isDone}
                      aria-label={`סימון: ${item.title}`}
                      onClick={() => toggle(item.id)}
                      className={cn(
                        "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border-2 transition",
                        isDone ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary",
                      )}
                    >
                      {isDone ? <Check className="size-4" /> : null}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={cn("font-semibold", isDone && "text-muted-foreground line-through decoration-1")}>{item.title}</p>
                      {item.description ? <p className="text-sm text-muted-foreground">{item.description}</p> : null}
                    </div>
                    {item.href ? (
                      <Link
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener" : undefined}
                        prefetch={item.external ? false : undefined}
                        className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
                      >
                        פתיחה <ArrowUpLeft className="size-4" />
                      </Link>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
