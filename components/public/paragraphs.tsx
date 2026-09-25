import { cn } from "@/lib/utils";

/** מפצל טקסט לפסקאות לפי שורה ריקה */
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function Paragraphs({ text, className }: { text: string; className?: string }) {
  const paragraphs = splitParagraphs(text);
  if (paragraphs.length === 0) return null;
  return (
    <div className={cn("space-y-5 text-lg leading-8 text-foreground/85", className)}>
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
