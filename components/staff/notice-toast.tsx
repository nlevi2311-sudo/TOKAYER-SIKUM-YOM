"use client";

import { useEffect } from "react";
import { toast } from "sonner";

/** מציג הודעה חד פעמית שהגיעה מהשרת דרך הכתובת (למשל אחרי הפניה) */
export function NoticeToast({ message }: { message: string }) {
  useEffect(() => {
    toast.info(message);
    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState(null, "", url);
  }, [message]);
  return null;
}
