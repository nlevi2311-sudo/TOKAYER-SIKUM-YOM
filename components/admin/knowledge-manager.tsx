"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { deleteKnowledge, setKnowledgeActive } from "@/lib/actions/knowledge";

export type KnowledgeDoc = {
  id: string;
  title: string;
  sourceName: string | null;
  chars: number;
  active: boolean;
  createdAt: string;
};

export function KnowledgeManager({ docs, totalChars, maxChars }: { docs: KnowledgeDoc[]; totalChars: number; maxChars: number }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const percent = Math.min(100, Math.round((totalChars / maxChars) * 100));

  async function upload() {
    if (!file && !text.trim()) {
      toast.error("צריך לבחור קובץ או להדביק טקסט");
      return;
    }
    const fd = new FormData();
    fd.set("title", title);
    if (file) fd.set("file", file);
    else fd.set("text", text);
    setUploading(true);
    try {
      const res = await fetch("/api/admin/knowledge", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { error?: string; chars?: number };
      if (!res.ok) throw new Error(data.error ?? "ההעלאה נכשלה");
      toast.success(`המסמך נוסף למאגר (${(data.chars ?? 0).toLocaleString("he-IL")} תווים)`);
      setTitle("");
      setText("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "ההעלאה נכשלה");
    } finally {
      setUploading(false);
    }
  }

  function toggle(id: string, active: boolean) {
    startTransition(async () => {
      const res = await setKnowledgeActive({ id, active });
      if (!res.ok) toast.error(res.error);
      router.refresh();
    });
  }

  function remove(id: string, t: string) {
    if (!window.confirm(`למחוק את "${t}" מהמאגר?`)) return;
    startTransition(async () => {
      const res = await deleteKnowledge({ id });
      if (!res.ok) toast.error(res.error);
      else toast.success("המסמך נמחק");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl border bg-card p-5">
        <h2 className="text-lg font-bold">הוספת מסמך</h2>
        <p className="rounded-xl border-s-4 border-highlight bg-highlight/10 px-4 py-3 text-sm">
          מעלים רק נהלים, הנחיות ומידע כללי לצוות. אסור להעלות מסמך עם שמות, אבחנות או פרטים מזהים של חניכים או משפחות.
        </p>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">כותרת</span>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="למשל: נוהל חלוקת תרופות מעודכן" maxLength={200} />
        </label>
        <div className="space-y-1.5">
          <span className="text-sm font-semibold">קובץ (Word, PDF או טקסט, עד 5MB)</span>
          <input
            ref={fileRef}
            type="file"
            accept=".docx,.pdf,.txt,.md,.csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:me-3 file:rounded-lg file:border file:bg-surface file:px-3 file:py-1.5"
          />
        </div>
        {!file ? (
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold">או להדביק טקסט</span>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder="הדביקו כאן את תוכן המסמך" />
          </label>
        ) : null}
        <Button type="button" onClick={upload} disabled={uploading}>
          <Upload className="size-4" />
          {uploading ? "מעלה..." : "הוספה למאגר"}
        </Button>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-lg font-bold">המסמכים במאגר</h2>
          <span className="text-sm text-muted-foreground tabular-nums">
            {totalChars.toLocaleString("he-IL")} מתוך {maxChars.toLocaleString("he-IL")} תווים ({percent}%)
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
        </div>
        {docs.length === 0 ? (
          <p className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
            עדיין אין מסמכים. העוזר עונה כרגע רק לפי אוגדן הנהלים, הלומדה ומה שמוזן באפליקציה.
          </p>
        ) : (
          <ul className="space-y-2" aria-busy={pending}>
            {docs.map((d) => (
              <li key={d.id} className="flex items-center gap-3 rounded-2xl border bg-card p-3.5">
                <FileText className="size-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{d.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.sourceName ? `${d.sourceName} · ` : ""}
                    {d.chars.toLocaleString("he-IL")} תווים · {new Date(d.createdAt).toLocaleDateString("he-IL")}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={d.active} onCheckedChange={(v) => toggle(d.id, v)} aria-label="פעיל בעוזר" />
                  <span className="hidden sm:inline">{d.active ? "פעיל" : "כבוי"}</span>
                </label>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(d.id, d.title)} aria-label="מחיקה">
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
