"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { completeLomda, setLomdaCheck } from "@/lib/actions/lomda";

export function FinishPanel({
  checklist,
  checked,
  allDone,
  declared,
  completedAt,
  certificate,
}: {
  checklist: string[];
  checked: boolean[];
  allDone: boolean;
  declared: boolean;
  completedAt: string | null;
  certificate: { name: string; track: string; bitan: string | null; firstCorrect: number; questionsTotal: number };
}) {
  const [checks, setChecks] = useState(checked);
  const [decl, setDecl] = useState(declared);
  const [doneAt, setDoneAt] = useState(completedAt);
  const [copied, setCopied] = useState("");
  const [pending, startTransition] = useTransition();

  function toggle(i: number, value: boolean) {
    setChecks((c) => c.map((x, j) => (j === i ? value : x)));
    startTransition(async () => {
      const res = await setLomdaCheck({ index: i, checked: value });
      if (!res.ok) {
        setChecks((c) => c.map((x, j) => (j === i ? !value : x)));
        toast.error(res.error);
      }
    });
  }

  function declare(value: boolean) {
    setDecl(value);
    startTransition(async () => {
      const res = await completeLomda({ declared: value });
      if (!res.ok) {
        setDecl(!value);
        toast.error(res.error);
        return;
      }
      setDoneAt(res.data?.completedAt ?? null);
    });
  }

  const date = doneAt ? new Date(doneAt).toLocaleDateString("he-IL") : "";
  const text = `אישור סיום לומדת קליטה, כפר הילדים והנוער טוקאייר, תשפ״ז. שם: ${certificate.name}. מסלול: ${certificate.track}${
    certificate.bitan ? `. ביתן: ${certificate.bitan}` : ""
  }. תאריך: ${date}. תשובות נכונות בניסיון ראשון: ${certificate.firstCorrect} מתוך ${certificate.questionsTotal}.`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied("הועתק. אפשר להדביק בהודעה לרכז.");
    } catch {
      setCopied(text);
    }
  }

  return (
    <div className="space-y-5" aria-busy={pending}>
      <section className="space-y-3 rounded-2xl border bg-card p-4 sm:p-5">
        <h2 className="text-lg font-bold text-primary">להשלים בחפיפה, לפני עבודה עצמאית</h2>
        {checklist.map((item, i) => (
          <label key={item} className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 size-5 shrink-0 accent-primary"
              checked={checks[i]}
              onChange={(e) => toggle(i, e.target.checked)}
            />
            <span>{item}</span>
          </label>
        ))}
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-4 sm:p-5">
        <h2 className="text-lg font-bold text-primary">הצהרה</h2>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 size-5 shrink-0 accent-primary"
            checked={decl}
            disabled={!allDone && !decl}
            onChange={(e) => declare(e.target.checked)}
          />
          <span>
            קראתי, הבנתי ואני פועל לפי כללי העבודה בטוקאייר. ידוע לי שהמסמך המחייב הוא אוגדן הנהלים, ושבכל ספק עוצרים ופונים למנהל
            התורן או למנהל הפנימייה.
          </span>
        </label>
        {!allDone ? <p className="text-sm text-muted-foreground">ההצהרה תיפתח אחרי שכל היחידות יושלמו.</p> : null}
      </section>

      {decl && doneAt ? (
        <section className="space-y-2 rounded-2xl border-2 border-primary bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">כפר הילדים והנוער טוקאייר · תשפ״ז</p>
          <p className="text-2xl font-extrabold text-primary">אישור סיום לומדת קליטה</p>
          <p className="text-lg font-bold">{certificate.name}</p>
          <p>
            מסלול: {certificate.track}
            {certificate.bitan ? ` · ביתן ${certificate.bitan}` : ""}
          </p>
          <p className="text-sm text-muted-foreground">
            {date} · תשובות נכונות בניסיון ראשון: {certificate.firstCorrect} מתוך {certificate.questionsTotal}
          </p>
          <p className="text-sm text-muted-foreground">
            הסיום נרשם במערכת וההנהלה רואה אותו. האישור אינו מחליף חפיפה מעשית ואינו מאשר עבודה עצמאית במשמרת.
          </p>
          <Button type="button" onClick={copy} className="mt-2">
            להעתיק את האישור ולשלוח לרכז
          </Button>
          {copied ? (
            <p role="status" className="text-sm text-muted-foreground">
              {copied}
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
