"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setPresenceAction } from "@/app/actions/shift";

export default function PresenceToggle({ childId, present }: { childId: string; present: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      className="btn-secondary"
      disabled={pending}
      onClick={() => {
        const msg = present ? "לסמן שהילד יצא מהפנימייה (ביקור בית, אשפוז וכו׳)?" : "לסמן שהילד חזר לפנימייה?";
        if (!confirm(msg)) return;
        start(async () => {
          await setPresenceAction(childId, !present);
          router.push(present ? "/shift" : `/shift/child/${childId}`);
          router.refresh();
        });
      }}
    >
      {present ? "סימון: לא בפנימייה" : "סימון: חזר לפנימייה"}
    </button>
  );
}
