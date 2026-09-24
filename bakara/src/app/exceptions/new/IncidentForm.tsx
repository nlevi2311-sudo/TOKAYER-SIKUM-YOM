"use client";

import { useActionState, useState } from "react";
import { createIncidentAction } from "@/app/actions/exceptions";
import { FormError } from "@/components/ui";

export default function IncidentForm({ options, childId }: { options: { id: string; name: string }[]; childId?: string }) {
  const [state, action, pending] = useActionState(createIncidentAction, null);
  const [followup, setFollowup] = useState(false);
  return (
    <form action={action} className="card space-y-3">
      <div>
        <label className="label">ילד</label>
        <select name="childId" className="input" defaultValue={childId ?? ""} required>
          <option value="">בחירה</option>
          {options.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">מה קרה</label>
        <textarea name="whatHappened" className="input min-h-24" required />
      </div>
      <div>
        <label className="label">מה הסיבה</label>
        <input name="reason" className="input" required />
      </div>
      <div>
        <label className="label">מה נעשה עד עכשיו</label>
        <textarea name="actionsTaken" className="input min-h-20" required />
      </div>
      <div>
        <label className="label">מי מטפל</label>
        <input name="handler" className="input" required />
      </div>
      <label className="flex items-center gap-3">
        <input type="checkbox" name="needsFollowup" className="h-5 w-5" checked={followup} onChange={(e) => setFollowup(e.target.checked)} />
        <span className="font-semibold">צריך מעקב נוסף</span>
      </label>
      {followup ? (
        <div>
          <label className="label">מתי לבצע בדיקה חוזרת</label>
          <input type="datetime-local" name="recheckAt" className="input" required />
        </div>
      ) : null}
      <label className="flex items-center gap-3">
        <input type="checkbox" name="notifyDirector" className="h-5 w-5" />
        <span className="font-semibold">מנהל הכפר צריך לדעת</span>
      </label>
      <div>
        <label className="label">עדכון גורם נוסף (אופציונלי)</label>
        <input name="notifyOther" className="input" placeholder="הורים, עו״ס, משטרה..." />
      </div>
      <FormError error={state?.error} />
      <button className="btn-danger w-full" disabled={pending}>
        פתיחת אירוע חריג
      </button>
    </form>
  );
}
