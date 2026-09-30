"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardCheck, Phone, ShieldAlert, Ban, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconBadge } from "@/components/shared/icon-badge";
import { telHref } from "@/lib/text";
import { cn } from "@/lib/utils";
import type { EmergencyProtocol } from "@/types";

/** תוכן שעדיין לא הוזן מסומן "להשלמה" ומוצג בעדינות כדי שלא ייראה כהנחיה */
function isPlaceholder(text: string): boolean {
  return text.trim().startsWith("להשלמה");
}

function Block({
  icon: Icon,
  title,
  children,
  tone = "default",
}: {
  icon: typeof Phone;
  title: string;
  children: React.ReactNode;
  tone?: "default" | "warn";
}) {
  return (
    <section className="space-y-2.5 rounded-2xl border bg-card p-4">
      <h3 className={cn("flex items-center gap-2 font-bold", tone === "warn" ? "text-emergency" : "text-primary")}>
        <Icon className="size-5" aria-hidden="true" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function Lines({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">לא הוזן תוכן.</p>;
  return (
    <ol className="space-y-2">
      {items.map((line, i) => (
        <li
          key={i}
          className={cn("flex gap-3 text-[15px] leading-relaxed", isPlaceholder(line) && "italic text-muted-foreground")}
        >
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-primary">
            {i + 1}
          </span>
          <span>{line}</span>
        </li>
      ))}
    </ol>
  );
}

export function EmergencyDetail({ protocol, onBack }: { protocol: EmergencyProtocol; onBack?: () => void }) {
  const calls = protocol.call_list.filter((c) => c.label);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {onBack ? (
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="חזרה לרשימת האירועים">
            <ArrowRight className="size-5" />
          </Button>
        ) : null}
        <IconBadge name={protocol.icon} tone="emergency" size="lg" />
        <h2 className="text-xl font-extrabold">{protocol.title}</h2>
      </div>

      <Block icon={ListChecks} title="מה עושים עכשיו">
        <Lines items={protocol.now_steps} />
      </Block>

      <Block icon={Phone} title="למי מתקשרים">
        {calls.length === 0 ? (
          <p className="text-sm text-muted-foreground">לא הוזנו אנשי קשר.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {calls.map((c, i) => (
              <li key={i}>
                {c.phone ? (
                  <a
                    href={telHref(c.phone)}
                    className="flex items-center justify-between gap-3 rounded-xl bg-emergency-soft px-4 py-3 font-semibold text-emergency transition hover:brightness-95"
                  >
                    <span>{c.label}</span>
                    <span className="flex items-center gap-1.5" dir="ltr">
                      {c.phone}
                      <Phone className="size-4" aria-hidden="true" />
                    </span>
                  </a>
                ) : (
                  <div className="rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">{c.label}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Block>

      <Block icon={Ban} title="מה אסור לעשות" tone="warn">
        <Lines items={protocol.dont_list} />
      </Block>

      <Block icon={ClipboardCheck} title="איזה דיווח צריך למלא">
        {protocol.report_text ? (
          <p className={cn("text-[15px]", isPlaceholder(protocol.report_text) && "italic text-muted-foreground")}>
            {protocol.report_text}
          </p>
        ) : null}
        {protocol.report_url ? (
          <Button asChild variant="outline" className="rounded-xl">
            <a href={protocol.report_url} target="_blank" rel="noopener">
              <ClipboardCheck /> פתיחת טופס הדיווח
            </a>
          </Button>
        ) : null}
      </Block>

      {protocol.procedure ? (
        <Button asChild className="h-12 w-full rounded-xl text-base">
          <Link href={`/staff/open/resource/${protocol.procedure.id}`} target="_blank" rel="noopener">
            <BookOpen /> לנוהל המלא: {protocol.procedure.title}
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

export function EmergencyGrid({
  protocols,
  onSelect,
  hrefFor,
}: {
  protocols: EmergencyProtocol[];
  onSelect?: (p: EmergencyProtocol) => void;
  hrefFor?: (p: EmergencyProtocol) => string;
}) {
  if (protocols.length === 0) {
    return <p className="text-sm text-muted-foreground">עדיין לא הוגדרו כרטיסי חירום. אפשר להוסיף אותם בממשק הניהול.</p>;
  }
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {protocols.map((p) => {
        const inner = (
          <>
            <IconBadge name={p.icon} tone="emergency" size="lg" />
            <span className="text-center text-sm font-semibold leading-tight">{p.title}</span>
          </>
        );
        const cls =
          "flex h-full w-full flex-col items-center justify-center gap-2.5 rounded-2xl border bg-card p-4 transition hover:border-emergency/40 hover:bg-emergency-soft/40 focus-visible:outline-2";
        return (
          <li key={p.id}>
            {hrefFor ? (
              <Link href={hrefFor(p)} className={cls}>
                {inner}
              </Link>
            ) : (
              <button type="button" className={cls} onClick={() => onSelect?.(p)}>
                {inner}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** התוכן של חלון החירום: רשימת אירועים, ובלחיצה פירוט */
export function EmergencyPanel({ protocols }: { protocols: EmergencyProtocol[] }) {
  const [selected, setSelected] = useState<EmergencyProtocol | null>(null);
  if (selected) return <EmergencyDetail protocol={selected} onBack={() => setSelected(null)} />;
  return (
    <div className="space-y-4">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldAlert className="size-4 text-emergency" aria-hidden="true" />
        בחרו את סוג האירוע. במצב מסכן חיים מתקשרים קודם למוקד החירום.
      </p>
      <EmergencyGrid protocols={protocols} onSelect={setSelected} />
    </div>
  );
}
