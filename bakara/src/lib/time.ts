// כל החישובים לפי שעון ישראל, בלי קשר לאזור הזמן של השרת.
const TZ = "Asia/Jerusalem";

function parts(d: Date) {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
  const hour = p.hour === "24" ? "00" : p.hour;
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(hour), minute: Number(p.minute) };
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function fromMinutes(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** התאריך והשעה הנוכחיים בישראל. TIME_OVERRIDE (למשל 21:45) משמש לבדיקות בלבד. */
export function nowIL() {
  const p = parts(new Date());
  let minutes = p.hour * 60 + p.minute;
  const override = process.env.TIME_OVERRIDE;
  if (override && /^\d{1,2}:\d{2}$/.test(override)) minutes = toMinutes(override);
  return { date: p.date, minutes, hhmm: fromMinutes(minutes) };
}

export function dateIL(d: Date): string {
  return parts(d).date;
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): string[] {
  const out: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

export function fmtDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

const WEEKDAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
export function weekday(date: string): string {
  return WEEKDAYS[new Date(`${date}T12:00:00Z`).getUTCDay()];
}

export function fmtTime(d: Date | null | undefined): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("he-IL", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
}

export function fmtDateTime(d: Date | null | undefined): string {
  if (!d) return "";
  return `${fmtDate(dateIL(d))} ${fmtTime(d)}`;
}

/** המרת תאריך ושעה בשעון ישראל (מטופס) לאובייקט Date */
export function parseLocalDateTime(value: string): Date | null {
  if (!value) return null;
  // value בפורמט YYYY-MM-DDTHH:MM. מחשבים את ההפרש של ישראל מ-UTC באותו רגע.
  const guess = new Date(`${value}:00Z`);
  if (isNaN(guess.getTime())) return null;
  const p = parts(guess);
  const asIfUtc = Date.UTC(
    Number(p.date.slice(0, 4)),
    Number(p.date.slice(5, 7)) - 1,
    Number(p.date.slice(8, 10)),
    p.hour,
    p.minute,
  );
  const offset = asIfUtc - guess.getTime();
  return new Date(guess.getTime() - offset);
}

export function toLocalInputValue(d: Date | null | undefined): string {
  if (!d) return "";
  const p = parts(d);
  return `${p.date}T${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
}
