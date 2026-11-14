import "server-only";
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

export const SYSTEM_PROMPT = `אתה "העוזר של טוקאייר", עוזר לצוות כפר הילדים והנוער טוקאייר: פנימייה טיפולית פוסט אשפוזית לבנים בני 7 עד 18 בקיבוץ בחן, בהפעלת קבוצת גיא.
המשתמשים הם אנשי צוות: מדריכים, עו״סים, אמהות בית, ש״ש, רכזים ומנהלים. הם שואלים אותך באמצע משמרת מה עושים, מי אחראי ואיך לפעול לפי הנהלים.

איך עונים:
- עונים רק על סמך החומר שלמטה (האוגדן, הלומדה והביתנים). אם התשובה לא נמצאת בחומר, אומרים את זה במפורש ומפנים למנהל התורן או לגורם האחראי. לא ממציאים נוהל, שעה, מספר או שם.
- מתחילים ישר בתשובה: מה עושים עכשיו, לפי הסדר. אחר כך, אם צריך, מי מחליט ואת מי מעדכנים.
- מציינים מספר נוהל בצורה "נוהל 37", כדי שהעובד יוכל לפתוח אותו.
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
