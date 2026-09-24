import Link from "next/link";
import type { Color } from "@/lib/engine";

export const COLOR_STYLES: Record<Color, { dot: string; bg: string; text: string; label: string }> = {
  green: { dot: "bg-ok", bg: "bg-ok-bg", text: "text-ok", label: "תקין" },
  orange: { dot: "bg-orange-500", bg: "bg-warn-bg", text: "text-warn", label: "במעקב" },
  red: { dot: "bg-bad", bg: "bg-bad-bg", text: "text-bad", label: "חריגה פתוחה" },
  gray: { dot: "bg-slate-400", bg: "bg-idle-bg", text: "text-idle", label: "לא הושלם" },
};

export function ColorDot({ color, size = "h-4 w-4" }: { color: Color; size?: string }) {
  return <span className={`inline-block shrink-0 rounded-full ${size} ${COLOR_STYLES[color].dot}`} />;
}

export function StatTile({
  value,
  label,
  tone = "neutral",
  sub,
  href,
}: {
  value: number | string;
  label: string;
  tone?: "neutral" | "ok" | "warn" | "bad";
  sub?: React.ReactNode;
  href?: string;
}) {
  const tones = {
    neutral: "bg-white ring-slate-200 text-slate-900",
    ok: "bg-ok-bg ring-green-200 text-ok",
    warn: "bg-warn-bg ring-orange-200 text-warn",
    bad: "bg-bad-bg ring-red-200 text-bad",
  };
  const body = (
    <div className={`h-full rounded-2xl p-3 ring-1 ${tones[tone]}`}>
      <div className="text-3xl font-extrabold tabular-nums">{value}</div>
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      {sub ? <div className="mt-1 text-xs text-slate-600">{sub}</div> : null}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export function ExceptionStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    OPEN: "bg-bad-bg text-bad",
    FOLLOWUP: "bg-warn-bg text-warn",
    CLOSED: "bg-ok-bg text-ok",
  };
  const label: Record<string, string> = { OPEN: "פתוחה", FOLLOWUP: "במעקב", CLOSED: "סגורה" };
  return <span className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold ${map[status] ?? ""}`}>{label[status] ?? status}</span>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500">{children}</div>;
}

export function FormError({ error }: { error?: string | null }) {
  if (!error) return null;
  return <div className="rounded-xl bg-bad-bg p-3 text-sm font-semibold text-bad">{error}</div>;
}
