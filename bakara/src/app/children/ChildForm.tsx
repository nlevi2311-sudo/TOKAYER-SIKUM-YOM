"use client";

import { useActionState } from "react";
import type { Child, Unit } from "@prisma/client";
import { saveChildAction } from "@/app/actions/children";
import { FormError } from "@/components/ui";

export default function ChildForm({ child, units }: { child?: Child; units: Unit[] }) {
  const [state, action, pending] = useActionState(saveChildAction, null);
  return (
    <form action={action} className="card space-y-3">
      {child ? <input type="hidden" name="id" value={child.id} /> : null}
      <div className="rounded-xl bg-yellow-50 p-2 text-sm text-yellow-900">בשלב הזה משתמשים בנתוני דמה בלבד. לא להזין שמות או מידע רפואי אמיתי.</div>
      <div>
        <label className="label">שם מלא</label>
        <input name="fullName" className="input" defaultValue={child?.fullName} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">ביתן</label>
          <select name="unitId" className="input" defaultValue={child?.unitId ?? ""} required>
            <option value="">בחירה</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">גיל (לא חובה)</label>
          <input name="age" type="number" min={0} max={25} className="input" defaultValue={child?.age || ""} />
        </div>
      </div>
      <div>
        <label className="label">שעת שינה מומלצת</label>
        <input name="bedtime" type="time" className="input" defaultValue={child?.bedtime ?? "21:30"} required />
      </div>
      <Toggle name="present" label="נמצא כרגע בפנימייה" defaultChecked={child?.present ?? true} />
      <Toggle name="hasMedication" label="יש טיפול תרופתי" defaultChecked={child?.hasMedication ?? false} />
      <div>
        <label className="label">פרטי טיפול תרופתי (דמה)</label>
        <input name="medicationNotes" className="input" defaultValue={child?.medicationNotes} />
      </div>
      <Toggle name="familyContact" label="רלוונטי קשר משפחה יומי" defaultChecked={child?.familyContact ?? true} />
      <div>
        <label className="label">הערות חשובות</label>
        <textarea name="importantNotes" className="input min-h-20" defaultValue={child?.importantNotes} />
      </div>
      <div>
        <label className="label">מידע נוסף</label>
        <textarea name="extraInfo" className="input min-h-20" defaultValue={child?.extraInfo} />
      </div>
      {child ? (
        <div>
          <label className="label">מצב רשומה</label>
          <select name="active" className="input" defaultValue={child.active ? "on" : "off"}>
            <option value="on">פעיל</option>
            <option value="off">לא פעיל (עזב את הכפר)</option>
          </select>
        </div>
      ) : null}
      <FormError error={state?.error} />
      <button className="btn-primary w-full" disabled={pending}>
        שמירה
      </button>
    </form>
  );
}

function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl bg-slate-50 px-3 ring-1 ring-slate-200">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-5 w-5 accent-cyan-800" />
      <span className="font-semibold">{label}</span>
    </label>
  );
}
