export function LomdaProgressBar({ done, total, label }: { done: number; total: number; label: string }) {
  const percent = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {done} מתוך {total} יחידות
        </span>
      </div>
      <div
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="h-full rounded-full bg-gradient-to-l from-primary to-mint transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
