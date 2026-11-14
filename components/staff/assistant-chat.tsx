"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { Send, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "חניך מסרב לקחת את התרופה של הערב. מה עושים?",
  "בספירת ערב חסר חניך. מה הסדר?",
  "מי מאשר טיפול SOS?",
  "מה מעבירים בהעברת משמרת?",
  "חניך אמר לי שהוא לא רוצה לחיות. מה עושים עכשיו?",
  "איך מגישים בקשה ללינה בבית לחניך בצו?",
];

/** הופך "נוהל 37" לקישור לנוהל באוגדן */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(נוהל\s\d{1,2})/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^נוהל\s(\d{1,2})$/);
        if (m && Number(m[1]) >= 1 && Number(m[1]) <= 86) {
          return (
            <Link key={i} href={`/staff/ogdan/${m[1]}`} className="font-semibold text-primary underline underline-offset-2">
              {part}
            </Link>
          );
        }
        return <Fragment key={i}>{part.replace(/\*\*/g, "")}</Fragment>;
      })}
    </>
  );
}

export function AssistantChat({ firstName }: { firstName: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const history: Msg[] = [...messages, { role: "user" as const, content: q }].slice(-20);
    if (history[0].role !== "user") history.shift();
    setMessages([...history, { role: "assistant" as const, content: "" }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error ?? "לא הצלחתי לענות כרגע");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((cur) => [...cur.slice(0, -1), { role: "assistant" as const, content: acc }]);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "לא הצלחתי לענות כרגע";
      setMessages((cur) => [...cur.slice(0, -1), { role: "assistant", content: `${msg}. במקרה דחוף פנו למנהל התורן.` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col gap-4">
      {messages.length === 0 ? (
        <div className="space-y-4 rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-surface text-primary">
              <Sparkles className="size-5" />
            </span>
            <p className="font-bold">שלום {firstName}, מה תרצה לדעת?</p>
          </div>
          <p className="text-sm text-muted-foreground">
            אני עונה לפי אוגדן הנהלים תשפ״ז והלומדה, ומפנה לנוהל הרלוונטי. בחרו שאלה או כתבו בעצמכם.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-xl border px-3 py-2.5 text-start text-sm transition hover:border-primary hover:bg-surface"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3" aria-live="polite">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[92%] whitespace-pre-wrap rounded-2xl px-4 py-3 leading-relaxed",
                m.role === "user" ? "ms-auto bg-primary text-primary-foreground" : "me-auto border bg-card",
              )}
            >
              {m.role === "assistant" ? (
                m.content ? <RichText text={m.content} /> : <span className="text-muted-foreground">חושב...</span>
              ) : (
                m.content
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-20 mt-auto space-y-2 rounded-2xl border bg-card p-3 shadow-sm lg:bottom-4"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={2}
            maxLength={4000}
            placeholder="כתבו שאלה על נוהל, על המשמרת או על הלומדה..."
            className="min-h-11 flex-1 resize-none bg-transparent px-1 py-2 outline-none"
            aria-label="שאלה לעוזר"
          />
          <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="שליחה">
            <Send className="size-4 -scale-x-100" />
          </Button>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>לא כותבים כאן שמות או פרטים מזהים של חניכים. העוזר לא מחליף את המנהל התורן.</span>
          {messages.length ? (
            <button type="button" onClick={() => setMessages([])} className="inline-flex shrink-0 items-center gap-1 hover:text-primary">
              <RotateCcw className="size-3" /> שיחה חדשה
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
