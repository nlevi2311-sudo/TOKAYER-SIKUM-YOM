"use client";

import { useEffect } from "react";

/** יציאה אוטומטית אחרי חוסר פעילות בדפדפן. השרת אוכף את אותו זמן גם בצד שלו. */
export default function IdleLogout({ minutes }: { minutes: number }) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        window.location.href = "/logout?idle=1";
      }, minutes * 60_000);
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [minutes]);
  return null;
}
