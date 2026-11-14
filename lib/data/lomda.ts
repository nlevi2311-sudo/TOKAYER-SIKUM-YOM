import "server-only";
import { cookies } from "next/headers";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { isTrackKey, summarize } from "@/lib/content/lomda";
import { EMPTY_LOMDA_STATE, type LomdaState } from "@/lib/content/lomda-types";
import type { SessionUser } from "@/types";

/**
 * שמירת ההתקדמות בלומדה.
 * בפרודקשן: טבלת lomda_progress ב-Supabase, עם RLS (כל עובד רק את שלו).
 * במצב הדגמה: cookie בדפדפן, כמו המועדפים.
 */
const DEMO_COOKIE = "demo_lomda";

function boolMap(value: unknown): Record<string, boolean> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === "boolean" && k.length <= 40) out[k] = v;
  }
  return out;
}

function normalize(value: Partial<LomdaState> | null | undefined): LomdaState {
  if (!value) return { ...EMPTY_LOMDA_STATE };
  return {
    track: isTrackKey(value.track) ? value.track : null,
    bitan: typeof value.bitan === "string" && value.bitan ? value.bitan : null,
    first: boolMap(value.first),
    right: boolMap(value.right),
    checks: boolMap(value.checks),
    declared: value.declared === true,
    completedAt: typeof value.completedAt === "string" ? value.completedAt : null,
  };
}

export async function getLomdaState(user: SessionUser): Promise<LomdaState> {
  if (isDemoMode()) {
    const raw = (await cookies()).get(DEMO_COOKIE)?.value;
    try {
      return normalize(raw ? (JSON.parse(raw) as Partial<LomdaState>) : null);
    } catch {
      return normalize(null);
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("lomda_progress").select("*").eq("user_id", user.id).maybeSingle();
  if (error) throw new Error(`lomda_progress: ${error.message}`);
  if (!data) return normalize(null);
  return normalize({
    track: data.track,
    bitan: data.bitan,
    first: data.answers?.first,
    right: data.answers?.right,
    checks: data.checks,
    declared: data.declared,
    completedAt: data.completed_at,
  });
}

export async function saveLomdaState(user: SessionUser, state: LomdaState): Promise<void> {
  const clean = normalize(state);

  if (isDemoMode()) {
    (await cookies()).set(DEMO_COOKIE, JSON.stringify(clean), {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
    });
    return;
  }

  const s = summarize(clean);
  const supabase = await createClient();
  const { error } = await supabase.from("lomda_progress").upsert({
    user_id: user.id,
    track: clean.track,
    bitan: clean.bitan,
    answers: { first: clean.first, right: clean.right },
    checks: clean.checks,
    declared: clean.declared,
    units_done: s.unitsDone,
    units_total: s.unitsTotal,
    first_correct: s.firstCorrect,
    questions_total: s.questionsTotal,
    completed_at: clean.completedAt,
  });
  if (error) throw new Error(`lomda_progress save: ${error.message}`);
}

export type LomdaReportRow = {
  userId: string;
  name: string;
  email: string;
  track: LomdaState["track"];
  bitan: string | null;
  unitsDone: number;
  unitsTotal: number;
  firstCorrect: number;
  questionsTotal: number;
  completedAt: string | null;
  updatedAt: string | null;
};

/** דוח לאדמין: כל העובדים הפעילים וההתקדמות שלהם */
export async function getLomdaReport(admin: SessionUser): Promise<LomdaReportRow[]> {
  if (isDemoMode()) {
    const state = await getLomdaState(admin);
    const s = summarize(state);
    return [
      {
        userId: admin.id,
        name: admin.fullName,
        email: admin.email,
        track: state.track,
        bitan: state.bitan,
        unitsDone: s.unitsDone,
        unitsTotal: s.unitsTotal,
        firstCorrect: s.firstCorrect,
        questionsTotal: s.questionsTotal,
        completedAt: state.completedAt,
        updatedAt: null,
      },
    ];
  }

  const supabase = await createClient();
  const [profiles, progress] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name, active").eq("active", true).order("full_name"),
    supabase.from("lomda_progress").select("*"),
  ]);
  if (profiles.error) throw new Error(`profiles: ${profiles.error.message}`);
  if (progress.error) throw new Error(`lomda_progress: ${progress.error.message}`);

  const byUser = new Map(progress.data.map((p) => [p.user_id, p]));
  return profiles.data.map((p) => {
    const row = byUser.get(p.id);
    return {
      userId: p.id,
      name: p.full_name || p.email,
      email: p.email,
      track: row?.track ?? null,
      bitan: row?.bitan ?? null,
      unitsDone: row?.units_done ?? 0,
      unitsTotal: row?.units_total ?? 0,
      firstCorrect: row?.first_correct ?? 0,
      questionsTotal: row?.questions_total ?? 0,
      completedAt: row?.completed_at ?? null,
      updatedAt: row?.updated_at ?? null,
    };
  });
}
