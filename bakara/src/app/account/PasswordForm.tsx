"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/app/actions/account";
import { FormError } from "@/components/ui";

export default function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, null);
  return (
    <form action={action} className="card space-y-3">
      <h2 className="h2">החלפת סיסמה</h2>
      <div>
        <label className="label">סיסמה נוכחית</label>
        <input name="current" type="password" className="input" dir="ltr" autoComplete="current-password" required />
      </div>
      <div>
        <label className="label">סיסמה חדשה (לפחות 8 תווים)</label>
        <input name="next" type="password" className="input" dir="ltr" autoComplete="new-password" minLength={8} required />
      </div>
      <div>
        <label className="label">שוב את הסיסמה החדשה</label>
        <input name="again" type="password" className="input" dir="ltr" autoComplete="new-password" minLength={8} required />
      </div>
      <FormError error={state?.error} />
      {state?.ok ? <div className="rounded-xl bg-ok-bg p-3 text-sm font-bold text-ok">{state.ok}</div> : null}
      <button className="btn-primary w-full" disabled={pending}>
        שמירה
      </button>
    </form>
  );
}
