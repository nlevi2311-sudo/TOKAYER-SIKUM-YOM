"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addExceptionUpdateAction, closeExceptionAction } from "@/app/actions/exceptions";

/** התייחסות מהירה לחריגה בלי לצאת ממסך סגירת המשמרת */
export default function QuickAddress({ id, title, sub, closeOnly }: { id: string; title: string; sub: string; closeOnly?: boolean }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function run(kind: "update" | "close") {
    setError(null);
    const fd = new FormData();
    fd.set("id", id);
    fd.set(kind === "update" ? "text" : "closureNote", text);
    start(async () => {
      const res = kind === "update" ? await addExceptionUpdateAction(null, fd) : await closeExceptionAction(null, fd);
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <li className="space-y-2 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <span className="font-bold">{title}</span> <span className="text-sm text-slate-600">· {sub}</span>
        </div>
        <Link href={`/exceptions/${id}`} className="text-xs text-brand underline">
          פרטים
        </Link>
      </div>
      <input className="input py-2" placeholder="מה המצב עכשיו / מה נעשה" value={text} onChange={(e) => setText(e.target.value)} />
      {error ? <div className="text-sm font-bold text-bad">{error}</div> : null}
      <div className="grid grid-cols-2 gap-2">
        {closeOnly ? (
          <Link href={`/exceptions/${id}`} className="btn-secondary min-h-10 text-sm">
            להעביר למעקב
          </Link>
        ) : (
          <button type="button" className="btn-secondary min-h-10 text-sm" disabled={pending || text.trim().length < 3} onClick={() => run("update")}>
            עדכון, נשאר פתוח
          </button>
        )}
        <button type="button" className="btn-ok min-h-10 text-sm" disabled={pending || text.trim().length < 5} onClick={() => run("close")}>
          טופל, לסגור
        </button>
      </div>
    </li>
  );
}
