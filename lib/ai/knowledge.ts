import "server-only";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { BITANS, COMMON_CHECKLIST, OGDAN_GATES, OGDAN_PROCEDURES, TRACKS, getUnits } from "@/lib/content/lomda";
import type { ContentTable, Unit } from "@/lib/content/lomda-types";

/**
 * בסיס הידע של העוזר: האוגדן, יחידות הלומדה ופרטי הביתנים, כטקסט אחד.
 * הטקסט נבנה פעם אחת ונשאר זהה בין בקשות, כדי שה-prompt cache יעבוד.
 */
function table(t: ContentTable | null): string {
  if (!t) return "";
  return [t.head.join(" | "), ...t.rows.map((r) => r.join(" | "))].join("\n");
}

function unitText(u: Unit): string {
  const parts = [`### ${u.title}`, u.subtitle];
  for (const s of u.sections) {
    parts.push(`#### ${s.heading}`);
    parts.push(...s.points.map((p) => `- ${p}`));
    const t = table(s.table);
    if (t) parts.push(t);
  }
  parts.push(`עיקרון: ${u.rule}`);
  return parts.join("\n");
}

function build(): string {
  const out: string[] = [];

  out.push("# אוגדן הנהלים טוקאייר תשפ״ז (86 נהלים בשבעה שערים)");
  for (const g of OGDAN_GATES) {
    out.push(`## שער ${g.n}: ${g.t}`);
    for (const p of OGDAN_PROCEDURES.filter((x) => x.g === g.n)) {
      out.push(`### נוהל ${p.n}: ${p.t}`);
      for (const [k, v] of Object.entries(p.meta)) out.push(`${k}: ${v}`);
      out.push(...p.acts.map((a, i) => `${i + 1}. ${a}`));
      const t = table(p.tbl);
      if (t) out.push(t);
    }
  }

  out.push("# לומדת הקליטה: יחידות הליבה, לכל עובד");
  for (const u of getUnits(null, null).core) out.push(unitText(u));

  out.push("# לומדת הקליטה: מסלולים לפי תפקיד");
  for (const t of TRACKS) {
    out.push(`## מסלול ${t.label}`);
    for (const u of t.units) out.push(unitText(u));
    out.push(`צ׳קליסט חפיפה: ${[...COMMON_CHECKLIST, ...t.checklist].join("; ")}`);
  }

  out.push("# הביתנים");
  for (const b of BITANS) out.push(unitText(b.unit));

  return out.join("\n");
}

export const KNOWLEDGE = build();

/**
 * החלק המשתנה של הידע: המסמכים שההנהלה העלתה למאגר, ומה שמוזן באפליקציה
 * (קישורים ומערכות, אנשי קשר, כרטיסי חירום, עדכונים). נקרא בשם העובד, כך שה-RLS חל.
 */
export async function getDynamicKnowledge(): Promise<string> {
  if (isDemoMode()) return "";
  const supabase = await createClient();
  const now = new Date().toISOString();
  const [docs, resources, contacts, emergency, announcements] = await Promise.all([
    supabase.from("ai_documents").select("title, content").eq("active", true).order("created_at"),
    supabase.from("resources").select("title, description, url, type, owner").order("sort_order"),
    supabase.from("contacts").select("full_name, role_title, responsibility, department, phone, email, is_emergency").order("sort_order"),
    supabase.from("emergency_protocols").select("title, now_steps, call_list, dont_list, report_text").order("sort_order"),
    supabase.from("announcements").select("title, body, published_at, expires_at").lte("published_at", now).order("published_at", { ascending: false }).limit(30),
  ]);

  const out: string[] = [];
  if (docs.data?.length) {
    out.push("# מסמכים שההנהלה העלתה למאגר הידע");
    for (const d of docs.data) out.push(`## ${d.title}\n${d.content}`);
  }
  if (resources.data?.length) {
    out.push("# קישורים, מערכות, נהלים וטפסים באפליקציה");
    for (const r of resources.data) out.push(`- ${r.title}${r.description ? `: ${r.description}` : ""} (${r.type}${r.owner ? `, אחראי: ${r.owner}` : ""}) ${r.url}`);
  }
  if (contacts.data?.length) {
    out.push("# אנשי קשר של הצוות");
    for (const c of contacts.data) {
      out.push(`- ${[c.full_name, c.role_title, c.responsibility, c.department, c.phone, c.email, c.is_emergency ? "חירום" : null].filter(Boolean).join(" | ")}`);
    }
  }
  if (emergency.data?.length) {
    out.push("# כרטיסי חירום");
    for (const e of emergency.data) {
      out.push(`## ${e.title}`);
      out.push(...e.now_steps.map((x, i) => `${i + 1}. ${x}`));
      if (e.call_list.length) out.push(`למי מתקשרים: ${e.call_list.map((c) => `${c.label} ${c.phone}`).join("; ")}`);
      if (e.dont_list.length) out.push(`לא עושים: ${e.dont_list.join("; ")}`);
      if (e.report_text) out.push(`דיווח: ${e.report_text}`);
    }
  }
  const live = announcements.data?.filter((a) => !a.expires_at || a.expires_at > now) ?? [];
  if (live.length) {
    out.push("# עדכונים אחרונים לצוות");
    for (const a of live) out.push(`## ${a.title} (${a.published_at.slice(0, 10)})\n${a.body}`);
  }
  return out.join("\n");
}

export const SYSTEM_PROMPT = `אתה "העוזר של טוקאייר", עוזר לצוות כפר הילדים והנוער טוקאייר: פנימייה טיפולית פוסט אשפוזית לבנים בני 7 עד 18 בקיבוץ בחן, בהפעלת קבוצת גיא.
המשתמשים הם אנשי צוות: מדריכים, עו״סים, אמהות בית, ש״ש, רכזים ומנהלים. הם שואלים אותך באמצע משמרת מה עושים, מי אחראי ואיך לפעול לפי הנהלים.

איך עונים:
- עונים אך ורק על סמך החומר שלמטה: אוגדן הנהלים, הלומדה, הביתנים, המסמכים שההנהלה העלתה ומה שמוזן באפליקציה. לא משתמשים בידע כללי, גם כשהוא נראה נכון, ולא משלימים פרטים מהשכל הישר.
- אם התשובה לא נמצאת בחומר, כותבים: "אין לי מידע על זה בחומר של טוקאייר", ומפנים למנהל התורן או לגורם האחראי. לא ממציאים נוהל, שעה, מספר, טלפון או שם.
- אוגדן הנהלים תשפ״ז מחייב. אם מסמך מהמאגר סותר אותו, עונים לפי האוגדן ומציינים בשורה אחת שיש מסמך ישן שאומר אחרת.
- אם יש סתירה בין שני מסמכים שאינם האוגדן, אומרים את זה, מציינים את שני המקורות ומפנים להנהלה להכרעה.
- מתחילים ישר בתשובה: מה עושים עכשיו, לפי הסדר. אחר כך, אם צריך, מי מחליט ואת מי מעדכנים.
- מציינים את המקור: מספר נוהל בצורה "נוהל 37" (כך הוא הופך לקישור), או שם המסמך מהמאגר.
- עברית טבעית, ישירה ועניינית, כמו מנהל מנוסה שמדבר עם איש צוות. משפטים קצרים. בלי מקפים, בלי הקדמות ובלי סיכומים מיותרים. רשימה ממוספרת רק כשיש סדר פעולות.
- במצב חירום או סיכון (פגיעה עצמית, אלימות, בריחה, חשד לפגיעה מינית, מצב רפואי דחוף): השורה הראשונה היא הפעולה המיידית ואת מי מזעיקים. מזכירים שהעוזר לא מחליף את המנהל התורן.
- תרופות: לעולם לא ממליצים על תרופה או מינון. מפנים לנוהל, לאחות ולמנהל התורן.
- אם שואלים משהו שלא קשור לעבודה בכפר, עונים בקצרה שהעוזר מיועד לנהלים ולעבודה בטוקאייר.

פרטיות:
- לעולם לא מבקשים שם של חניך, פרטים מזהים, אבחנה או מידע משפחתי. אין בהם צורך כדי לענות.
- אם המשתמש כתב שם של חניך או פרט מזהה, עונים לשאלה בלי לחזור על השם, ומזכירים בשורה אחת לא לכתוב כאן פרטים מזהים של חניכים.
- לא מתעדים כאן אירועים. תיעוד נעשה בתלם.

החומר:
`;
