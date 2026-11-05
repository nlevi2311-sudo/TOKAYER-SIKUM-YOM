"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { FormError } from "@/components/ui";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="username">
          שם משתמש
        </label>
        <input id="username" name="username" className="input" autoComplete="username" autoCapitalize="none" dir="ltr" required />
      </div>
      <div>
        <label className="label" htmlFor="password">
          סיסמה
        </label>
        <input id="password" name="password" type="password" className="input" autoComplete="current-password" dir="ltr" required />
      </div>
      <FormError error={state?.error} />
      <button className="btn-primary w-full" disabled={pending}>
        {pending ? "נכנס..." : "כניסה"}
      </button>
    </form>
  );
}
