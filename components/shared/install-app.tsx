"use client";

import { useEffect, useState } from "react";
import { Download, Share, SquarePlus, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** התקנת האפליקציה במסך הבית. באנדרואיד וכרום: כפתור. באייפון: הוראות קצרות */
export function InstallApp() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<"ios" | "other" | "installed" | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- זיהוי פלטפורמה אפשרי רק בדפדפן
    setPlatform(standalone ? "installed" : ios ? "ios" : "other");

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setPlatform("installed");
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (platform === null) return null;

  return (
    <section className="rounded-2xl border bg-card p-5" aria-labelledby="install-title">
      <h2 id="install-title" className="flex items-center gap-2 font-bold">
        <Smartphone className="size-5 text-primary" aria-hidden="true" />
        התקנה בטלפון
      </h2>
      {platform === "installed" ? (
        <p className="mt-2 text-sm text-muted-foreground">האפליקציה כבר מותקנת במכשיר הזה.</p>
      ) : platform === "ios" ? (
        <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            1. בספארי לוחצים על <Share className="size-4 text-primary" aria-label="שיתוף" />
          </li>
          <li className="flex items-center gap-2">
            2. בוחרים <SquarePlus className="size-4 text-primary" aria-hidden="true" /> הוספה למסך הבית
          </li>
          <li>3. מאשרים. האייקון של טוקאייר יופיע במסך הבית.</li>
        </ol>
      ) : promptEvent ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-muted-foreground">אייקון במסך הבית, פתיחה במסך מלא, בלי לחפש את הקישור.</p>
          <Button
            className="rounded-xl"
            onClick={async () => {
              await promptEvent.prompt();
              const choice = await promptEvent.userChoice;
              if (choice.outcome === "accepted") setPlatform("installed");
              setPromptEvent(null);
            }}
          >
            <Download /> התקנת האפליקציה
          </Button>
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          בכרום בטלפון: תפריט (שלוש נקודות) ואז &quot;הוספה למסך הבית&quot; או &quot;התקנת אפליקציה&quot;.
        </p>
      )}
    </section>
  );
}
