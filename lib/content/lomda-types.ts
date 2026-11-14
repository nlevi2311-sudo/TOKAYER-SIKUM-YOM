/** טיפוסי התוכן של לומדת הקליטה והאוגדן. משותפים לשרת ולדפדפן. */

export type TrackKey = "guide" | "sw" | "em" | "shs" | "rk" | "night";
export const TRACK_KEYS: TrackKey[] = ["guide", "sw", "em", "shs", "rk", "night"];

export type ContentTable = { head: string[]; rows: string[][] };

export type UnitSection = { heading: string; points: string[]; table: ContentTable | null };

export type QuizQuestion = { question: string; options: string[]; answer: number; why: string };

export type Unit = {
  id: string;
  title: string;
  subtitle: string;
  sections: UnitSection[];
  rule: string;
  refs: number[];
  quiz: QuizQuestion[];
};

/** שאלה כפי שהיא נשלחת לדפדפן: בלי התשובה הנכונה */
export type PublicQuestion = { question: string; options: string[] };
export type PublicUnit = Omit<Unit, "quiz"> & { quiz: PublicQuestion[] };

export type Track = {
  key: TrackKey;
  name: string;
  label: string;
  description: string;
  units: Unit[];
  checklist: string[];
};

export type Bitan = { key: string; name: string; color: string; kind: string; ages: string; unit: Unit };

export type OgdanGate = { n: number; t: string; d: string };

export type Procedure = {
  n: number;
  t: string;
  g: number;
  meta: Partial<Record<"מטרת הנוהל" | "אחריות" | "מתי מפעילים" | "תיעוד וטפסים", string>>;
  acts: string[];
  tbl: ContentTable | null;
};

/** מצב ההתקדמות של עובד בלומדה */
export type LomdaState = {
  track: TrackKey | null;
  bitan: string | null;
  /** האם עניתי נכון בניסיון הראשון, לפי מזהה שאלה */
  first: Record<string, boolean>;
  /** שאלות שנענו נכון */
  right: Record<string, boolean>;
  checks: Record<string, boolean>;
  declared: boolean;
  completedAt: string | null;
};

export const EMPTY_LOMDA_STATE: LomdaState = {
  track: null,
  bitan: null,
  first: {},
  right: {},
  checks: {},
  declared: false,
  completedAt: null,
};

export function questionId(unitId: string, index: number): string {
  return `${unitId}-${index}`;
}
