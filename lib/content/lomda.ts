import "server-only";
import raw from "./lomda-content.json";
import {
  TRACK_KEYS,
  questionId,
  type Bitan,
  type LomdaState,
  type OgdanGate,
  type Procedure,
  type PublicUnit,
  type Track,
  type TrackKey,
  type Unit,
} from "./lomda-types";

/**
 * התוכן של לומדת הקליטה ושל "האוגדן בכיס".
 * המקור: אוגדן הנהלים תשפ״ז, כללי העבודה ונהלי העבודה בדרייב.
 * התוכן נשאר בשרת. לדפדפן נשלחות שאלות בלי התשובות.
 */
type Content = {
  core: Unit[];
  tracks: Record<TrackKey, Track>;
  bitans: Bitan[];
  commonChecklist: string[];
  ogdan: { gates: OgdanGate[]; procs: Procedure[] };
};

const content = raw as unknown as Content;

export const OGDAN_GATES = content.ogdan.gates;
export const OGDAN_PROCEDURES = content.ogdan.procs;

export function getProcedure(n: number): Procedure | undefined {
  return OGDAN_PROCEDURES.find((p) => p.n === n);
}

export function isTrackKey(value: unknown): value is TrackKey {
  return typeof value === "string" && (TRACK_KEYS as string[]).includes(value);
}

export const TRACKS = TRACK_KEYS.map((k) => content.tracks[k]);
export const BITANS = content.bitans;
export const COMMON_CHECKLIST = content.commonChecklist;

export function getTrack(key: TrackKey): Track {
  return content.tracks[key];
}

export function getBitan(key: string | null): Bitan | undefined {
  return key ? BITANS.find((b) => b.key === key) : undefined;
}

/** יחידות הליבה, יחידת הביתן (אם נבחר) ויחידות המסלול, לפי הסדר */
export function getUnits(track: TrackKey | null, bitan: string | null): { core: Unit[]; trackUnits: Unit[] } {
  const core = [...content.core];
  const b = getBitan(bitan);
  if (b) core.splice(2, 0, b.unit);
  return { core, trackUnits: track ? getTrack(track).units : [] };
}

export function getAllUnits(track: TrackKey | null, bitan: string | null): Unit[] {
  const { core, trackUnits } = getUnits(track, bitan);
  return [...core, ...trackUnits];
}

/** כל יחידה אפשרית, לחיפוש לפי מזהה */
export function findUnit(id: string): Unit | undefined {
  return (
    content.core.find((u) => u.id === id) ??
    BITANS.map((b) => b.unit).find((u) => u.id === id) ??
    TRACK_KEYS.flatMap((k) => content.tracks[k].units).find((u) => u.id === id)
  );
}

export function toPublicUnit(unit: Unit): PublicUnit {
  return { ...unit, quiz: unit.quiz.map((q) => ({ question: q.question, options: q.options })) };
}

export function isUnitDone(unit: Unit, state: LomdaState): boolean {
  return unit.quiz.every((_, i) => state.right[questionId(unit.id, i)]);
}

export function checklistFor(track: TrackKey | null): string[] {
  return track ? [...COMMON_CHECKLIST, ...getTrack(track).checklist] : COMMON_CHECKLIST;
}

export type LomdaSummary = {
  unitsDone: number;
  unitsTotal: number;
  firstCorrect: number;
  questionsTotal: number;
  allDone: boolean;
};

export function summarize(state: LomdaState): LomdaSummary {
  const units = getAllUnits(state.track, state.bitan);
  let firstCorrect = 0;
  let questionsTotal = 0;
  for (const u of units) {
    u.quiz.forEach((_, i) => {
      questionsTotal += 1;
      if (state.first[questionId(u.id, i)]) firstCorrect += 1;
    });
  }
  const unitsDone = units.filter((u) => isUnitDone(u, state)).length;
  return {
    unitsDone,
    unitsTotal: units.length,
    firstCorrect,
    questionsTotal,
    allDone: Boolean(state.track) && unitsDone === units.length,
  };
}
