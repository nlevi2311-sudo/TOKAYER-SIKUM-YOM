"use client";

import { useEffect } from "react";

/** רושם את ה-Service Worker כדי שהאפליקציה תהיה ניתנת להתקנה ותעבוד גם בחיבור חלש */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // לא קריטי. האתר עובד גם בלי
    });
  }, []);
  return null;
}
