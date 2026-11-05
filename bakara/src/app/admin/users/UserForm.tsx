"use client";

import { useActionState } from "react";
import { saveUserAction } from "@/app/actions/users";
import { FormError } from "@/components/ui";

type U = { id: string; username: string; fullName: string; role: string; active: boolean };

export default function UserForm({ user }: { user?: U }) {
  const [state, action, pending] = useActionState(saveUserAction, null);
  return (
    <form action={action} className="grid gap-2 sm:grid-cols-6 sm:items-end">
      {user ? <input type="hidden" name="id" value={user.id} /> : null}
      <div>
        <label className="label">שם משתמש</label>
        <input name="username" className="input" dir="ltr" defaultValue={user?.username} disabled={!!user} required={!user} />
      </div>
      <div>
        <label className="label">שם מלא</label>
        <input name="fullName" className="input" defaultValue={user?.fullName} required />
      </div>
      <div>
        <label className="label">תפקיד</label>
        <select name="role" className="input" defaultValue={user?.role ?? "DUTY"}>
          <option value="DUTY">מנהל תורן</option>
          <option value="DIRECTOR">מנהל הכפר</option>
          <option value="ADMIN">מנהל מערכת</option>
        </select>
      </div>
      <div>
        <label className="label">{user ? "סיסמה חדשה (ריק = ללא שינוי)" : "סיסמה"}</label>
        <input name="password" type="password" className="input" dir="ltr" autoComplete="new-password" />
      </div>
      <label className="flex min-h-12 items-center gap-2">
        <input type="checkbox" name="active" defaultChecked={user?.active ?? true} className="h-5 w-5" />
        <span className="font-semibold">פעיל</span>
      </label>
      <button className="btn-primary" disabled={pending}>
        {user ? "עדכון" : "יצירה"}
      </button>
      <div className="sm:col-span-6">
        <FormError error={state?.error} />
        {state?.ok ? <div className="text-sm font-bold text-ok">{state.ok}</div> : null}
      </div>
    </form>
  );
}
