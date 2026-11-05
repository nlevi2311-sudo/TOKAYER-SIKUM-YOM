"use client";

import { useActionState, useState } from "react";
import { addExceptionUpdateAction, closeExceptionAction } from "@/app/actions/exceptions";
import { FormError } from "@/components/ui";

export default function ExceptionActions({ id, handler }: { id: string; handler: string }) {
  const [upd, updAction, updPending] = useActionState(addExceptionUpdateAction, null);
  const [cls, clsAction, clsPending] = useActionState(closeExceptionAction, null);
  const [followup, setFollowup] = useState(false);
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <form action={updAction} className="card space-y-3">
        <h2 className="h2">התייחסות / עדכון</h2>
        <input type="hidden" name="id" value={id} />
        <textarea name="text" className="input min-h-24" placeholder="מה נעשה, מה המצב עכשיו" required />
        <div>
          <label className="label">מי מטפל</label>
          <input name="handler" className="input" defaultValue={handler} />
        </div>
        <label className="flex items-center gap-3">
          <input type="checkbox" name="followup" className="h-5 w-5" checked={followup} onChange={(e) => setFollowup(e.target.checked)} />
          <span className="font-semibold">להעביר למעקב עם בדיקה חוזרת</span>
        </label>
        {followup ? <input type="datetime-local" name="recheckAt" className="input" required /> : null}
        <FormError error={upd?.error} />
        {upd?.ok ? <div className="text-sm font-bold text-ok">נשמר</div> : null}
        <button className="btn-primary w-full" disabled={updPending}>
          שמירת התייחסות
        </button>
      </form>
      <form action={clsAction} className="card space-y-3">
        <h2 className="h2">סגירת חריגה</h2>
        <input type="hidden" name="id" value={id} />
        <textarea name="closureNote" className="input min-h-24" placeholder="איך זה טופל ומה המצב בסגירה (חובה)" required minLength={5} />
        <FormError error={cls?.error} />
        <button className="btn-ok w-full" disabled={clsPending}>
          סגירת חריגה
        </button>
      </form>
    </div>
  );
}
