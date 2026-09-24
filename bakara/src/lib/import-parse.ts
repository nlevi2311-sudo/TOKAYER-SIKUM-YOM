// זיהוי עמודות וקריאת שורות מקובץ אקסל של רשימת ילדים. רץ בדפדפן.

export type Cell = string | number | boolean | Date | null | undefined;
export type Field = "fullName" | "firstName" | "lastName" | "unit" | "age" | "birth" | "meds" | "bedtime" | "notes";
export type Mapping = Partial<Record<Field, number>>; // אינדקס עמודה. unit = -1 פירושו שם הגיליון

export const FIELD_LABELS: Record<Field, string> = {
  fullName: "שם מלא",
  firstName: "שם פרטי",
  lastName: "שם משפחה",
  unit: "ביתן",
  age: "גיל",
  birth: "תאריך לידה",
  meds: "טיפול תרופתי",
  bedtime: "שעת שינה",
  notes: "הערות",
};

const PATTERNS: [Field, RegExp][] = [
  ["firstName", /שם\s*פרטי|first/i],
  ["lastName", /שם\s*משפחה|last|surname/i],
  ["fullName", /שם\s*מלא|שם\s*ה?(ילד|חניך|נער|תלמיד|דייר)|^\s*שם\s*$|^name$|full\s*name/i],
  ["unit", /ביתן|^\s*בית\s*$|קבוצה|מבנה|דירה|יחידה|unit|house|group/i],
  ["birth", /לידה|birth/i],
  ["age", /גיל|age/i],
  ["meds", /תרופ|medic/i],
  ["bedtime", /שינה|השכבה|bed/i],
  ["notes", /הער|notes?|remark/i],
];

const str = (c: Cell) => (c === null || c === undefined ? "" : c instanceof Date ? c.toISOString() : String(c)).trim();

/** מוצא את שורת הכותרות: השורה הראשונה (מתוך 15) שיש בה עמודת שם */
export function findHeaderRow(data: Cell[][]): number {
  for (let i = 0; i < Math.min(15, data.length); i++) {
    const row = data[i].map(str);
    if (row.some((h) => /שם|name/i.test(h))) return i;
  }
  return 0;
}

/** עמודות שלא ממפים אוטומטית: ספירות ומספור */
const SKIP = /סה"?כ|מסד|מספר|^מס['׳]?\s|#/;

export function autoMap(headers: string[]): Mapping {
  const m: Mapping = {};
  headers.forEach((h, i) => {
    if (SKIP.test(h)) return;
    for (const [f, re] of PATTERNS) {
      // הערות לא נלקחות אוטומטית: הן עלולות להכיל מידע רגיש. אפשר לבחור ידנית.
      if (f === "notes") continue;
      if (m[f] === undefined && re.test(h)) {
        m[f] = i;
        return;
      }
    }
  });
  if (m.fullName === undefined && m.firstName === undefined && m.lastName === undefined) {
    const i = headers.findIndex((h) => /שם/.test(h) && !/ביתן|הורה|אב|אם|מדריך|עו"ס|קבוצה/.test(h));
    if (i >= 0) m.fullName = i;
  }
  if (m.unit === undefined) m.unit = -1;
  return m;
}

function toAge(c: Cell): number {
  const n = typeof c === "number" ? c : Number(str(c));
  return Number.isFinite(n) && n > 0 && n < 30 ? Math.floor(n) : 0;
}

function birthToAge(c: Cell): number {
  let d: Date | null = null;
  if (c instanceof Date) d = c;
  else if (typeof c === "number" && c > 3000) d = new Date(Math.round((c - 25569) * 86400000)); // מספר סידורי של אקסל
  else {
    const m = str(c).match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
    if (m) {
      const y = Number(m[3]) < 100 ? 2000 + Number(m[3]) : Number(m[3]);
      d = new Date(Date.UTC(y, Number(m[2]) - 1, Number(m[1])));
    }
  }
  if (!d || isNaN(d.getTime())) return 0;
  const now = new Date();
  let age = now.getUTCFullYear() - d.getUTCFullYear();
  if (now.getUTCMonth() < d.getUTCMonth() || (now.getUTCMonth() === d.getUTCMonth() && now.getUTCDate() < d.getUTCDate())) age--;
  return age > 0 && age < 30 ? age : 0;
}

function toBedtime(c: Cell, age: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  if (c instanceof Date) return `${pad(c.getUTCHours())}:${pad(c.getUTCMinutes())}`;
  if (typeof c === "number" && c > 0 && c < 1) {
    const min = Math.round(c * 1440);
    return `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
  }
  const m = str(c).match(/^(\d{1,2})[:.](\d{2})/);
  if (m && Number(m[1]) < 24) return `${pad(Number(m[1]))}:${m[2]}`;
  if (!age) return "21:30";
  return age < 12 ? "21:00" : age < 15 ? "21:30" : "22:00";
}

function yes(c: Cell): boolean {
  if (typeof c === "boolean") return c;
  const s = str(c).toLowerCase();
  return !!s && !["לא", "אין", "no", "0", "-", "false", "x", "לא רלוונטי"].includes(s);
}

export type ParsedRow = { fullName: string; unit: string; age: number; hasMedication: boolean; bedtime: string; notes: string };

export function parseSheet(sheetName: string, data: Cell[][], headerRow: number, m: Mapping): ParsedRow[] {
  const out: ParsedRow[] = [];
  const get = (row: Cell[], i: number | undefined) => (i === undefined || i < 0 ? null : row[i]);
  let lastUnit = "";
  for (const row of data.slice(headerRow + 1)) {
    let name = str(get(row, m.fullName));
    if (!name) {
      // בלי שם פרטי זו לא שורה של ילד (למשל מקום פנוי)
      if (m.firstName !== undefined && !str(get(row, m.firstName))) continue;
      name = [str(get(row, m.firstName)), str(get(row, m.lastName))].filter(Boolean).join(" ");
    }
    if (!name || /^סה"?כ|^total/i.test(name) || /^\d+$/.test(name)) continue;
    // ביתן ריק: לוקחים מהשורה הקודמת (רשימות ממוינות לפי ביתן)
    let unit = m.unit === -1 || m.unit === undefined ? sheetName.trim() : str(get(row, m.unit));
    if (!unit && m.unit !== undefined && m.unit >= 0) unit = lastUnit;
    lastUnit = unit;
    const age = m.age !== undefined ? toAge(get(row, m.age)) : m.birth !== undefined ? birthToAge(get(row, m.birth)) : 0;
    out.push({
      fullName: name.replace(/\s+/g, " "),
      unit: unit.replace(/\s+/g, " "),
      age,
      hasMedication: m.meds !== undefined ? yes(get(row, m.meds)) : false,
      bedtime: toBedtime(get(row, m.bedtime), age),
      notes: str(get(row, m.notes)),
    });
  }
  return out;
}

/** CSV פשוט (כולל מרכאות) */
export function parseCsv(text: string): Cell[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") {
      row.push(cur);
      cur = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
    } else cur += ch;
  }
  if (cur || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim()));
}
