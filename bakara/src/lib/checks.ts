// הגדרת תחומי הבקרה ונקודות הזמן. כאן משנים שעות יעד או מוסיפים תחום.

export type Checkpoint = "MORNING" | "NOON" | "EVENING" | "NIGHT";
export type ShiftType = "MORNING" | "NOON" | "EVENING" | "NIGHT" | "WEEKEND";
export type CheckStatus = "DONE" | "NOT_DONE" | "NA" | "NEEDS_CARE";
export type Independence = "INDEPENDENT" | "REMINDER" | "ASSISTED" | "NONE";
export type Role = "ADMIN" | "DIRECTOR" | "DUTY";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "מנהל מערכת",
  DIRECTOR: "מנהל הכפר",
  DUTY: "מנהל תורן",
};

export const CHECKPOINTS: { key: Checkpoint; label: string }[] = [
  { key: "MORNING", label: "בוקר" },
  { key: "NOON", label: "צהריים" },
  { key: "EVENING", label: "ערב" },
  { key: "NIGHT", label: "לילה" },
];

export const SHIFT_TYPES: { key: ShiftType; label: string; checkpoints: Checkpoint[] }[] = [
  { key: "MORNING", label: "בוקר", checkpoints: ["MORNING"] },
  { key: "NOON", label: "צהריים", checkpoints: ["NOON"] },
  { key: "EVENING", label: "ערב", checkpoints: ["EVENING"] },
  { key: "NIGHT", label: "לילה", checkpoints: ["NIGHT"] },
  { key: "WEEKEND", label: "חופש / שבת", checkpoints: ["MORNING", "NOON", "EVENING", "NIGHT"] },
];

export function shiftLabel(type: string): string {
  return SHIFT_TYPES.find((s) => s.key === type)?.label ?? type;
}

export function shiftCheckpoints(type: string): Checkpoint[] {
  return SHIFT_TYPES.find((s) => s.key === type)?.checkpoints ?? [];
}

export type CheckItem = {
  key: string;
  label: string;
  checkpoint: Checkpoint;
  /** שעת יעד HH:MM, או BEDTIME = חצי שעה אחרי שעת השינה של הילד */
  due: string;
  condition?: "medication" | "family";
  /** האם רלוונטי למדד העצמאות */
  independence: boolean;
  hint?: string;
};

export const CHECK_ITEMS: CheckItem[] = [
  { key: "wake", label: "קימה בזמן", checkpoint: "MORNING", due: "07:30", independence: true },
  { key: "clothes", label: "החלפת בגדים", checkpoint: "MORNING", due: "08:30", independence: true },
  { key: "meds_morning", label: "טיפול תרופתי בוקר", checkpoint: "MORNING", due: "09:00", condition: "medication", independence: true },
  { key: "breakfast", label: "ארוחת בוקר", checkpoint: "MORNING", due: "09:30", independence: true },
  { key: "room", label: "סידור חדר ומיטה", checkpoint: "MORNING", due: "10:00", independence: true },

  { key: "lunch", label: "ארוחת צהריים", checkpoint: "NOON", due: "14:30", independence: true },
  { key: "drink", label: "שתייה", checkpoint: "NOON", due: "16:00", independence: true },
  { key: "rest", label: "זמן מנוחה", checkpoint: "NOON", due: "16:30", independence: true },
  { key: "activity", label: "השתתפות בפעילות", checkpoint: "NOON", due: "18:00", independence: true },

  { key: "dinner", label: "ארוחת ערב", checkpoint: "EVENING", due: "19:30", independence: true },
  { key: "family", label: "קשר משפחה", checkpoint: "EVENING", due: "20:30", condition: "family", independence: false },
  { key: "emotional", label: "מצב רגשי", checkpoint: "EVENING", due: "21:00", independence: false, hint: "בוצע = נבדק ותקין" },
  { key: "staff", label: "קשר עם הצוות", checkpoint: "EVENING", due: "21:00", independence: false, hint: "בוצע = שיחה אישית עם איש צוות" },
  { key: "shower", label: "רחצה", checkpoint: "EVENING", due: "21:00", independence: true },
  { key: "meds_evening", label: "טיפול תרופתי ערב", checkpoint: "EVENING", due: "21:00", condition: "medication", independence: true },
  { key: "teeth", label: "צחצוח שיניים", checkpoint: "EVENING", due: "21:30", independence: true },
  { key: "sleep_prep", label: "התארגנות לשינה", checkpoint: "EVENING", due: "21:30", independence: true },

  { key: "bedtime", label: "שעת שינה", checkpoint: "NIGHT", due: "BEDTIME", independence: true, hint: "בוצע = נרדם בזמן" },
  { key: "presence", label: "נוכחות בפנימייה", checkpoint: "NIGHT", due: "22:30", independence: false, hint: "ספירת לילה" },
  { key: "incident", label: "אירוע חריג", checkpoint: "NIGHT", due: "23:00", independence: false, hint: "בוצע = נבדק ואין אירוע. דורש טיפול = היה אירוע" },
];

export const ITEM_BY_KEY: Record<string, CheckItem> = Object.fromEntries(CHECK_ITEMS.map((i) => [i.key, i]));

/** אירוע חריג שנפתח ידנית ולא מתוך תחום בדיקה */
export const MANUAL_INCIDENT = "INCIDENT";

export function itemLabel(key: string): string {
  if (key === MANUAL_INCIDENT) return "אירוע חריג";
  return ITEM_BY_KEY[key]?.label ?? key;
}

export function isIncidentKey(key: string) {
  return key === MANUAL_INCIDENT || key === "incident";
}

export const MEAL_KEYS = ["breakfast", "lunch", "dinner"];
export const MED_KEYS = ["meds_morning", "meds_evening"];

export const STATUS_LABELS: Record<CheckStatus, string> = {
  DONE: "בוצע",
  NOT_DONE: "לא בוצע",
  NA: "לא רלוונטי",
  NEEDS_CARE: "דורש טיפול",
};

export const INDEPENDENCE_LABELS: Record<Independence, string> = {
  INDEPENDENT: "עצמאית",
  REMINDER: "אחרי תזכורת",
  ASSISTED: "אחרי ליווי",
  NONE: "לא בוצע",
};

export const EXCEPTION_STATUS_LABELS: Record<string, string> = {
  OPEN: "פתוחה",
  FOLLOWUP: "במעקב",
  CLOSED: "סגורה",
};

type ChildLike = { hasMedication: boolean; familyContact: boolean; bedtime: string };

export function itemApplies(item: CheckItem, child: ChildLike): boolean {
  if (item.condition === "medication") return child.hasMedication;
  if (item.condition === "family") return child.familyContact;
  return true;
}

export function itemsFor(child: ChildLike, checkpoints: Checkpoint[]): CheckItem[] {
  return CHECK_ITEMS.filter((i) => checkpoints.includes(i.checkpoint) && itemApplies(i, child));
}

export function dueMinutes(item: CheckItem, child: ChildLike): number {
  if (item.due === "BEDTIME") {
    const [h, m] = child.bedtime.split(":").map(Number);
    return h * 60 + m + 30;
  }
  const [h, m] = item.due.split(":").map(Number);
  return h * 60 + m;
}

export function dueLabel(item: CheckItem, child: ChildLike): string {
  const min = dueMinutes(item, child);
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}
