import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">טוען</span>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 bg-muted" />
        <Skeleton className="h-8 w-64 bg-muted" />
        <Skeleton className="h-4 w-80 max-w-full bg-muted" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-full max-w-sm rounded-xl bg-muted" />
        <Skeleton className="h-10 w-28 rounded-xl bg-muted" />
      </div>
      <div className="divide-y overflow-hidden rounded-2xl border bg-card">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <Skeleton className="size-9 rounded-lg bg-muted" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3 bg-muted" />
              <Skeleton className="h-3 w-1/2 bg-muted" />
            </div>
            <Skeleton className="hidden h-8 w-24 bg-muted sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
