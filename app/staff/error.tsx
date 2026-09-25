"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconBadge } from "@/components/shared/icon-badge";

export default function StaffError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <IconBadge name="triangle-alert" tone="warm" size="lg" />
      <h1 className="text-2xl font-bold">משהו לא נטען כמו שצריך</h1>
      <p className="text-muted-foreground">
        ייתכן שיש בעיית חיבור. אפשר לנסות שוב. אם זה חוזר, עדכנו את מנהל המערכת.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset} className="rounded-xl">
          <RotateCcw /> לנסות שוב
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/staff">לדף הבית</Link>
        </Button>
      </div>
      {error.digest ? <p className="text-xs text-muted-foreground" dir="ltr">{error.digest}</p> : null}
    </div>
  );
}
