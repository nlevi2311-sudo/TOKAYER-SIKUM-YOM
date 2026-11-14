"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { answerLomdaQuestion } from "@/lib/actions/lomda";
import { cn } from "@/lib/utils";
import type { PublicQuestion } from "@/lib/content/lomda-types";

type QState = { right: number | null; wrong: number[]; feedback: { ok: boolean; text: string } | null };

/** מצבים מהשטח: התשובה נבדקת בשרת, ההסבר מוצג מיד */
export function UnitQuiz({
  unitId,
  questions,
  answered,
  prev,
  next,
}: {
  unitId: string;
  questions: PublicQuestion[];
  /** לשאלות שכבר נענו נכון: מספר התשובה הנכונה וההסבר */
  answered: Array<{ option: number; why: string } | null>;
  prev: { href: string; label: string };
  next: { href: string; label: string };
}) {
  const [items, setItems] = useState<QState[]>(
    answered.map((a) => ({
      right: a ? a.option : null,
      wrong: [],
      feedback: a ? { ok: true, text: a.why } : null,
    })),
  );
  const [pending, startTransition] = useTransition();
  const allRight = items.every((i) => i.right !== null);

  function choose(qi: number, option: number) {
    if (items[qi].right !== null || pending) return;
    startTransition(async () => {
      const res = await answerLomdaQuestion({ unitId, index: qi, option });
      if (!res.ok || !res.data) {
        toast.error(res.ok ? "לא הצלחנו לבדוק את התשובה" : res.error);
        return;
      }
      const { correct, why } = res.data;
      setItems((cur) =>
        cur.map((it, i) =>
          i !== qi
            ? it
            : correct
              ? { right: option, wrong: it.wrong, feedback: { ok: true, text: why } }
              : { right: null, wrong: [...it.wrong, option], feedback: { ok: false, text: why } },
        ),
      );
    });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-5 rounded-2xl border bg-card p-4 sm:p-5" aria-label="מצבים מהשטח">
        <div>
          <h2 className="text-xl font-bold text-primary">מצבים מהשטח</h2>
          <p className="text-sm text-muted-foreground">
            בוחרים תשובה אחת. טעית? קוראים את ההסבר ובוחרים שוב. היחידה נסגרת כשכל התשובות נכונות.
          </p>
        </div>
        {questions.map((q, qi) => {
          const it = items[qi];
          return (
            <div key={qi} className="space-y-2">
              <p className="font-bold">
                {qi + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((o, oi) => {
                  const isRight = it.right === oi;
                  const isWrong = it.wrong.includes(oi);
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={it.right !== null || pending}
                      onClick={() => choose(qi, oi)}
                      className={cn(
                        "w-full rounded-xl border-2 px-3 py-2.5 text-start transition disabled:cursor-default",
                        isRight && "border-mint bg-mint/15",
                        isWrong && "border-destructive/60 bg-destructive/10",
                        !isRight && !isWrong && "hover:border-primary/60",
                        it.right !== null && !isRight && "opacity-60",
                      )}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
              {it.feedback ? (
                <p
                  role="status"
                  className={cn("rounded-lg px-3 py-2 text-sm", it.feedback.ok ? "bg-mint/15" : "bg-destructive/10")}
                >
                  <b className="block">{it.feedback.ok ? "נכון." : "לא מדויק."}</b>
                  {it.feedback.text}
                  {it.feedback.ok ? null : " בחר שוב."}
                </p>
              ) : null}
            </div>
          );
        })}
      </section>

      <nav className="flex flex-wrap justify-between gap-3" aria-label="ניווט בין יחידות">
        <Button asChild variant="outline" size="lg">
          <Link href={prev.href}>{prev.label}</Link>
        </Button>
        {allRight ? (
          <Button asChild size="lg">
            <Link href={next.href}>{next.label}</Link>
          </Button>
        ) : (
          <Button size="lg" disabled>
            {next.label}
          </Button>
        )}
      </nav>
    </div>
  );
}
