"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { clearCheckAction, saveCheckAction, type ExceptionInput } from "@/app/actions/shift";
import type { CheckStatus, Independence } from "@/lib/checks";

export type ItemView = {
  key: string;
  label: string;
  checkpoint: string;
  due: string;
  hint?: string;
  independence: boolean;
  overdue: boolean;
  inShift: boolean;
  entry: { status: string; independence: string | null; by: string; at: string } | null;
  exception: { id: string; status: string } | null;
};

const STATUS_BTNS: { key: CheckStatus; label: string; on: string; off: string }[] = [
  { key: "DONE", label: "בוצע", on: "bg-ok text-white ring-ok", off: "text-ok ring-green-300" },
  { key: "NOT_DONE", label: "לא בוצע", on: "bg-bad text-white ring-bad", off: "text-bad ring-red-300" },
  { key: "NEEDS_CARE", label: "דורש טיפול", on: "bg-orange-500 text-white ring-orange-500", off: "text-warn ring-orange-300" },
  { key: "NA", label: "לא רלוונטי", on: "bg-slate-500 text-white ring-slate-500", off: "text-slate-600 ring-slate-300" },
];

const IND_BTNS: { key: Independence; label: string }[] = [
  { key: "INDEPENDENT", label: "עצמאית" },
  { key: "REMINDER", label: "אחרי תזכורת" },
  { key: "ASSISTED", label: "אחרי ליווי" },
];

const IND_LABEL: Record<string, string> = { INDEPENDENT: "עצמאית", REMINDER: "אחרי תזכורת", ASSISTED: "אחרי ליווי", NONE: "" };

function inTwoHours() {
  const d = new Date(Date.now() + 2 * 3600_000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

const emptyEx = (): ExceptionInput => ({
  whatHappened: "",
  reason: "",
  actionsTaken: "",
  handler: "",
  needsFollowup: false,
  recheckAt: inTwoHours(),
  notifyDirector: false,
  notifyOther: "",
  resolvedNow: false,
  closureNote: "",
});

export default function ChildChecks({
  childId,
  items,
  checkpoints,
}: {
  childId: string;
  items: ItemView[];
  checkpoints: { key: string; label: string; inShift: boolean }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [indFor, setIndFor] = useState<string | null>(null);
  const [exFor, setExFor] = useState<{ key: string; status: CheckStatus } | null>(null);
  const [ex, setEx] = useState<ExceptionInput>(emptyEx());
  const [error, setError] = useState<{ key: string; msg: string } | null>(null);
  const [showOthers, setShowOthers] = useState(false);

  function save(key: string, status: CheckStatus, independence?: Independence, exception?: ExceptionInput) {
    setError(null);
    start(async () => {
      const res = await saveCheckAction({ childId, itemKey: key, status, independence, exception });
      if (res.error) {
        setError({ key, msg: res.error });
        return;
      }
      setIndFor(null);
      setExFor(null);
      setEx(emptyEx());
      router.refresh();
    });
  }

  function onStatus(item: ItemView, status: CheckStatus) {
    setError(null);
    if (status === "DONE" && item.independence) {
      setExFor(null);
      setIndFor(item.key);
      return;
    }
    if ((status === "NOT_DONE" || status === "NEEDS_CARE") && !(item.exception && item.exception.status !== "CLOSED")) {
      setIndFor(null);
      setExFor({ key: item.key, status });
      setEx(emptyEx());
      return;
    }
    save(item.key, status);
  }

  function clear(item: ItemView) {
    if (!confirm(`לבטל את הסימון של "${item.label}"?`)) return;
    start(async () => {
      const res = await clearCheckAction(childId, item.key);
      if (res.error) setError({ key: item.key, msg: res.error });
      router.refresh();
    });
  }

  const renderItem = (item: ItemView) => {
    const current = item.entry?.status;
    return (
      <li key={item.key} className={`rounded-2xl bg-white p-3 ring-1 ${item.overdue ? "ring-2 ring-bad" : "ring-slate-200"}`}>
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <div className="text-base font-bold">
              {item.label}
              {item.overdue ? <span className="mr-2 rounded-full bg-bad px-2 py-0.5 text-xs text-white">חסר</span> : null}
            </div>
            <div className="text-xs text-slate-500">
              עד {item.due}
              {item.hint ? ` · ${item.hint}` : ""}
            </div>
          </div>
          {item.entry ? (
            <button type="button" onClick={() => clear(item)} className="text-left text-xs text-slate-500 underline">
              {IND_LABEL[item.entry.independence ?? ""] ? `${IND_LABEL[item.entry.independence ?? ""]} · ` : ""}
              {item.entry.by.split(" ")[0]} {item.entry.at}
            </button>
          ) : null}
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {STATUS_BTNS.map((b) => (
            <button
              key={b.key}
              type="button"
              disabled={pending}
              onClick={() => onStatus(item, b.key)}
              className={`min-h-12 rounded-xl px-1 text-sm font-bold ring-1 transition active:scale-95 ${current === b.key ? b.on : `bg-white ${b.off}`}`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {indFor === item.key ? (
          <div className="mt-2 rounded-xl bg-ok-bg p-2">
            <div className="mb-1 text-sm font-semibold text-ok">איך בוצע?</div>
            <div className="grid grid-cols-3 gap-1.5">
              {IND_BTNS.map((b) => (
                <button
                  key={b.key}
                  type="button"
                  disabled={pending}
                  onClick={() => save(item.key, "DONE", b.key)}
                  className="min-h-12 rounded-xl bg-white text-sm font-bold text-ok ring-1 ring-green-300 active:scale-95"
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {item.exception && item.exception.status !== "CLOSED" ? (
          <Link href={`/exceptions/${item.exception.id}`} className="mt-2 block text-sm font-semibold text-bad underline">
            יש חריגה {item.exception.status === "OPEN" ? "פתוחה" : "במעקב"} בתחום הזה ←
          </Link>
        ) : null}

        {exFor?.key === item.key ? (
          <form
            className="mt-3 space-y-3 rounded-xl bg-bad-bg/60 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              save(item.key, exFor.status, undefined, ex);
            }}
          >
            <div className="font-bold text-bad">תיעוד חריגה: חובה לפני שמירה</div>
            <Field label="מה קרה" value={ex.whatHappened} onChange={(v) => setEx({ ...ex, whatHappened: v })} textarea />
            <Field label="מה הסיבה" value={ex.reason} onChange={(v) => setEx({ ...ex, reason: v })} />
            <Field label="מה נעשה עד עכשיו" value={ex.actionsTaken} onChange={(v) => setEx({ ...ex, actionsTaken: v })} textarea />
            <div>
              <label className="label">מי מטפל</label>
              <input className="input" list="handlers" value={ex.handler} onChange={(e) => setEx({ ...ex, handler: e.target.value })} required />
              <datalist id="handlers">
                <option value="מדריך הביתן" />
                <option value="רכז/ת הביתן" />
                <option value="עו״ס הביתן" />
                <option value="אחות" />
                <option value="מנהל תורן" />
              </datalist>
            </div>
            <Check label="צריך מעקב נוסף" checked={ex.needsFollowup} onChange={(v) => setEx({ ...ex, needsFollowup: v, resolvedNow: v ? false : ex.resolvedNow })} />
            {ex.needsFollowup ? (
              <div>
                <label className="label">מתי לבצע בדיקה חוזרת</label>
                <input type="datetime-local" className="input" value={ex.recheckAt} onChange={(e) => setEx({ ...ex, recheckAt: e.target.value })} required />
              </div>
            ) : null}
            <Check label="מנהל הכפר צריך לדעת" checked={ex.notifyDirector} onChange={(v) => setEx({ ...ex, notifyDirector: v })} />
            <Field label="עדכון גורם נוסף (מי? אופציונלי)" value={ex.notifyOther} onChange={(v) => setEx({ ...ex, notifyOther: v })} required={false} />
            {!ex.needsFollowup ? (
              <>
                <Check label="טופל במקום, אפשר לסגור את החריגה" checked={ex.resolvedNow} onChange={(v) => setEx({ ...ex, resolvedNow: v })} />
                {ex.resolvedNow ? (
                  <Field label="איך זה טופל" value={ex.closureNote} onChange={(v) => setEx({ ...ex, closureNote: v })} />
                ) : null}
              </>
            ) : null}
            {error?.key === item.key ? <div className="rounded-lg bg-white p-2 text-sm font-bold text-bad">{error.msg}</div> : null}
            <div className="flex gap-2">
              <button className="btn-danger flex-1" disabled={pending}>
                {pending ? "שומר..." : "שמירת חריגה"}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setExFor(null)}>
                ביטול
              </button>
            </div>
          </form>
        ) : error?.key === item.key ? (
          <div className="mt-2 rounded-lg bg-bad-bg p-2 text-sm font-bold text-bad">{error.msg}</div>
        ) : null}
      </li>
    );
  };

  const shiftCps = checkpoints.filter((c) => c.inShift);
  const otherCps = checkpoints.filter((c) => !c.inShift);
  return (
    <div className="space-y-4">
      {shiftCps.map((cp) => (
        <section key={cp.key}>
          <h2 className="h2 mb-2">{cp.label}</h2>
          <ul className="space-y-2">{items.filter((i) => i.checkpoint === cp.key).map(renderItem)}</ul>
        </section>
      ))}
      {otherCps.length ? (
        <div>
          <button type="button" className="btn-secondary w-full" onClick={() => setShowOthers(!showOthers)}>
            {showOthers ? "הסתרת" : "הצגת"} תחומים של שאר היום ({items.filter((i) => !i.inShift).length})
          </button>
          {showOthers
            ? otherCps.map((cp) => (
                <section key={cp.key} className="mt-3">
                  <h2 className="h2 mb-2 text-slate-500">{cp.label}</h2>
                  <ul className="space-y-2">{items.filter((i) => i.checkpoint === cp.key).map(renderItem)}</ul>
                </section>
              ))
            : null}
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {textarea ? (
        <textarea className="input min-h-20" value={value} onChange={(e) => onChange(e.target.value)} required={required} />
      ) : (
        <input className="input" value={value} onChange={(e) => onChange(e.target.value)} required={required} />
      )}
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl bg-white px-3 ring-1 ring-slate-200">
      <input type="checkbox" className="h-5 w-5 accent-blue-800" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="font-semibold">{label}</span>
    </label>
  );
}
