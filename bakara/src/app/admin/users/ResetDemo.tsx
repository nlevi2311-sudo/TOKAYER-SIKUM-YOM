"use client";

import { useTransition } from "react";
import { resetDemoAction } from "@/app/actions/demo";

export default function ResetDemo() {
  const [pending, start] = useTransition();
  return (
    <div className="card space-y-2 ring-2 ring-orange-200">
      <h2 className="h2">נתוני דמה</h2>
      <p className="muted">
        מוחק את כל הנתונים במערכת וטוען נתוני דמה חדשים סביב התאריך של היום. שימושי כשהדמה התיישנה. כל המשתמשים יתנתקו.
      </p>
      <button
        type="button"
        className="btn-danger"
        disabled={pending}
        onClick={() => {
          if (!confirm("למחוק את כל הנתונים ולטעון נתוני דמה חדשים?")) return;
          start(() => resetDemoAction());
        }}
      >
        {pending ? "טוען..." : "טעינה מחדש של נתוני הדמה"}
      </button>
    </div>
  );
}
