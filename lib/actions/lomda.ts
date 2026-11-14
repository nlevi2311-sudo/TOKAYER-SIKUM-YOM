"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertStaff, AuthError } from "@/lib/auth/session";
import { checklistFor, getAllUnits, getBitan, isUnitDone, summarize } from "@/lib/content/lomda";
import { TRACK_KEYS, questionId, type LomdaState } from "@/lib/content/lomda-types";
import { getLomdaState, saveLomdaState } from "@/lib/data/lomda";
import type { ActionResult } from "@/types";

function failure(e: unknown, context: string): { ok: false; error: string } {
  if (e instanceof AuthError) return { ok: false, error: e.message };
  console.error(`[${context}]`, e);
  return { ok: false, error: "לא הצלחנו לשמור. נסו שוב." };
}

function refresh() {
  revalidatePath("/staff/lomda", "layout");
}

const setupSchema = z.object({
  track: z.enum(TRACK_KEYS as [string, ...string[]]).nullable(),
  bitan: z.string().max(20).nullable(),
});

/** בחירת תפקיד וביתן. שינוי אחרי סיום מבטל את אישור הסיום. */
export async function chooseLomdaSetup(input: unknown): Promise<ActionResult<null>> {
  const parsed = setupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "בחירה לא תקינה" };
  try {
    const user = await assertStaff();
    const state = await getLomdaState(user);
    const bitan = parsed.data.bitan && getBitan(parsed.data.bitan) ? parsed.data.bitan : null;
    const next: LomdaState = {
      ...state,
      track: parsed.data.track as LomdaState["track"],
      bitan,
    };
    if (next.track !== state.track || next.bitan !== state.bitan) next.completedAt = null;
    await saveLomdaState(user, next);
    refresh();
    return { ok: true, data: null };
  } catch (e) {
    return failure(e, "chooseLomdaSetup");
  }
}

const answerSchema = z.object({
  unitId: z.string().min(1).max(20),
  index: z.number().int().min(0).max(20),
  option: z.number().int().min(0).max(10),
});

export type AnswerResult = { correct: boolean; why: string; unitDone: boolean };

/** בדיקת תשובה בצד השרת. התשובות הנכונות לא נשלחות לדפדפן. */
export async function answerLomdaQuestion(input: unknown): Promise<ActionResult<AnswerResult>> {
  const parsed = answerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "תשובה לא תקינה" };
  const { unitId, index, option } = parsed.data;
  try {
    const user = await assertStaff();
    const state = await getLomdaState(user);
    const unit = getAllUnits(state.track, state.bitan).find((u) => u.id === unitId);
    const q = unit?.quiz[index];
    if (!unit || !q) return { ok: false, error: "השאלה לא נמצאה" };

    const id = questionId(unitId, index);
    const correct = option === q.answer;
    const next: LomdaState = {
      ...state,
      first: id in state.first ? state.first : { ...state.first, [id]: correct },
      right: correct ? { ...state.right, [id]: true } : state.right,
    };
    if (next.first !== state.first || next.right !== state.right) {
      await saveLomdaState(user, next);
      refresh();
    }
    return { ok: true, data: { correct, why: q.why, unitDone: isUnitDone(unit, next) } };
  } catch (e) {
    return failure(e, "answerLomdaQuestion");
  }
}

const checkSchema = z.object({ index: z.number().int().min(0).max(40), checked: z.boolean() });

export async function setLomdaCheck(input: unknown): Promise<ActionResult<null>> {
  const parsed = checkSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "סימון לא תקין" };
  try {
    const user = await assertStaff();
    const state = await getLomdaState(user);
    if (parsed.data.index >= checklistFor(state.track).length) return { ok: false, error: "סימון לא תקין" };
    const key = `${state.track ?? "none"}:${parsed.data.index}`;
    await saveLomdaState(user, { ...state, checks: { ...state.checks, [key]: parsed.data.checked } });
    refresh();
    return { ok: true, data: null };
  } catch (e) {
    return failure(e, "setLomdaCheck");
  }
}

/** הצהרה וסיום. הסיום נרשם רק כשכל היחידות הושלמו. */
export async function completeLomda(input: unknown): Promise<ActionResult<{ completedAt: string | null }>> {
  const parsed = z.object({ declared: z.boolean() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "בקשה לא תקינה" };
  try {
    const user = await assertStaff();
    const state = await getLomdaState(user);
    const s = summarize(state);
    if (parsed.data.declared && !s.allDone) return { ok: false, error: "נשארו יחידות פתוחות" };
    const completedAt = parsed.data.declared ? (state.completedAt ?? new Date().toISOString()) : null;
    await saveLomdaState(user, { ...state, declared: parsed.data.declared, completedAt });
    refresh();
    revalidatePath("/admin/lomda");
    return { ok: true, data: { completedAt } };
  } catch (e) {
    return failure(e, "completeLomda");
  }
}
