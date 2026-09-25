"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconBadge } from "@/components/shared/icon-badge";

export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-12 text-center">
      <IconBadge name="triangle-alert" tone="warm" size="lg" />
      <div className="space-y-1.5">
        <h1 className="text-xl font-bold text-primary">לא הצלחנו לטעון את העמוד</h1>
        <p className="text-sm text-muted-foreground">
          ייתכן שיש תקלה זמנית בחיבור לבסיס הנתונים. נסו שוב בעוד רגע.
        </p>
        {error.digest ? (
          <p className="text-xs text-muted-foreground" dir="ltr">
            {error.digest}
          </p>
        ) : null}
      </div>
      <Button onClick={() => retry()}>
        <RotateCcw aria-hidden="true" />
        לנסות שוב
      </Button>
    </div>
  );
}
