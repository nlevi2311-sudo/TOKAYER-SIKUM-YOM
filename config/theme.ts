/**
 * צבעי המותג של טוקאייר.
 * זה המקום היחיד שבו משנים צבעים. כל הרכיבים באפליקציה קוראים את הערכים האלה דרך משתני CSS.
 * אפשר להשתמש בכל פורמט צבע ש-CSS מכיר (hex, rgb, oklch).
 */
export const theme = {
  // לפי ספר המותג של קבוצת גיא: טורקיז כעוגן, לבן כאמון, צבע חם אחד במינון נמוך

  /** Guy Deep Teal: עוגן מותגי, כותרות, כפתורים ראשיים */
  primary: "#127187",
  primaryForeground: "#ffffff",
  /** גוון טורקיז בהיר מאוד לרקעים של אייקונים וכרטיסים */
  primarySoft: "#e6f2f4",
  /** Guy Teal Print / Aqua / Mint: מעברים, שכבות ורקעים */
  tealPrint: "#008d91",
  aqua: "#41b2cc",
  mint: "#72bcb1",
  /** Guy Lime: צמיחה והדגשה משנית */
  lime: "#bed45e",
  /** Guy Orange: כותרות משנה (eyebrow), גיוס וחום. במינון נמוך */
  accent: "#e45e2f",
  accentForeground: "#ffffff",
  accentSoft: "#fdeee8",
  /** Warm Yellow: נקודת אור וקריאה לפעולה */
  highlight: "#fbaa1a",
  /** רקע כללי: לבן */
  background: "#ffffff",
  /** רקע משני לאזורים, בהיר מאוד ונוטה לטורקיז */
  surface: "#f4f8f8",
  card: "#ffffff",
  /** טקסט עיקרי: כהה עם נגיעת טורקיז */
  foreground: "#16333b",
  muted: "#eef4f4",
  /** Neutral Gray: טקסט משני */
  mutedForeground: "#636366",
  border: "#dde9ea",
  /** כפתור חירום: בולט אבל לא אדום צועק */
  emergency: "#c2462a",
  emergencySoft: "#fbece7",
  destructive: "#c0392b",
  success: "#2f8f6b",
  warning: "#b7791f",
  /** עיגול פינות בסיסי */
  radius: "1rem",
  /** צבע שורת הסטטוס בטלפון ובאפליקציה המותקנת */
  themeColor: "#127187",
} as const;

export type Theme = typeof theme;

/** הופך את אובייקט הצבעים למשתני CSS. נטען פעם אחת ב-layout הראשי. */
export function themeToCssVars(t: Theme = theme): string {
  return `:root{
--brand-primary:${t.primary};
--brand-primary-foreground:${t.primaryForeground};
--brand-primary-soft:${t.primarySoft};
--brand-teal-print:${t.tealPrint};
--brand-aqua:${t.aqua};
--brand-mint:${t.mint};
--brand-lime:${t.lime};
--brand-highlight:${t.highlight};
--brand-surface:${t.surface};
--brand-accent:${t.accent};
--brand-accent-foreground:${t.accentForeground};
--brand-accent-soft:${t.accentSoft};
--brand-background:${t.background};
--brand-card:${t.card};
--brand-foreground:${t.foreground};
--brand-muted:${t.muted};
--brand-muted-foreground:${t.mutedForeground};
--brand-border:${t.border};
--brand-emergency:${t.emergency};
--brand-emergency-soft:${t.emergencySoft};
--brand-destructive:${t.destructive};
--brand-success:${t.success};
--brand-warning:${t.warning};
--radius:${t.radius};
}`;
}
