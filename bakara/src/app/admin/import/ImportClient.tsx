"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import readXlsxFile from "read-excel-file/browser";
import { importChildrenAction } from "@/app/actions/import";
import { autoMap, Cell, Field, FIELD_LABELS, findHeaderRow, Mapping, parseCsv, parseSheet } from "@/lib/import-parse";
import { FormError } from "@/components/ui";

type SheetState = { name: string; data: Cell[][]; headerRow: number; mapping: Mapping; use: boolean };

const FIELDS: Field[] = ["fullName", "firstName", "lastName", "unit", "age", "birth", "meds", "bedtime", "notes"];

export default function ImportClient({ disabled, isDemo, childCount }: { disabled: boolean; isDemo: boolean; childCount: number }) {
  const router = useRouter();
  const [sheets, setSheets] = useState<SheetState[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [replace, setReplace] = useState(true);
  const [result, setResult] = useState<{ error?: string; ok?: string } | null>(null);
  const [pending, start] = useTransition();

  async function onFile(file: File) {
    setFileError(null);
    setResult(null);
    try {
      let raw: { name: string; data: Cell[][] }[];
      if (/\.csv$/i.test(file.name)) raw = [{ name: file.name.replace(/\.csv$/i, ""), data: parseCsv(await file.text()) }];
      else raw = (await readXlsxFile(file)).map((s) => ({ name: s.sheet, data: s.data as Cell[][] }));
      const list = raw
        .filter((s) => s.data.length > 1)
        .map((s) => {
          const headerRow = findHeaderRow(s.data);
          const headers = (s.data[headerRow] ?? []).map((c) => String(c ?? "").trim());
          const mapping = autoMap(headers);
          return { ...s, headerRow, mapping, use: parseSheet(s.name, s.data, headerRow, mapping).length > 0 };
        });
      if (!list.length) setFileError("לא נמצאו נתונים בקובץ");
      setSheets(list);
    } catch {
      setFileError("לא הצלחתי לקרוא את הקובץ. צריך קובץ אקסל (xlsx) או CSV. מ-Google Sheets: קובץ > הורדה > Microsoft Excel.");
    }
  }

  const rows = useMemo(() => sheets.filter((s) => s.use).flatMap((s) => parseSheet(s.name, s.data, s.headerRow, s.mapping)), [sheets]);
  const byUnit = useMemo(() => {
    const m = new Map<string, number>();
    rows.forEach((r) => m.set(r.unit, (m.get(r.unit) ?? 0) + 1));
    return [...m.entries()];
  }, [rows]);
  const noUnit = rows.filter((r) => !r.unit).length;

  function update(i: number, patch: Partial<SheetState>) {
    setSheets((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  }

  return (
    <div className="space-y-3">
      <div className="card space-y-3">
        <h2 className="h2">1. בחירת קובץ</h2>
        <p className="text-sm text-slate-600">
          קובץ אקסל עם עמודת שם ועמודת ביתן. אם כל ביתן נמצא בגיליון נפרד, המערכת תיקח את שם הביתן משם הגיליון.
        </p>
        <input
          type="file"
          accept=".xlsx,.csv"
          disabled={disabled}
          className="input"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />
        <FormError error={fileError} />
      </div>

      {sheets.length ? (
        <div className="card space-y-3">
          <h2 className="h2">2. בדיקת העמודות</h2>
          <p className="text-sm text-slate-600">המערכת זיהתה את העמודות לבד. אם משהו לא נכון, מתקנים כאן.</p>
          {sheets.map((s, i) => {
            const headers = (s.data[s.headerRow] ?? []).map((c, j) => String(c ?? "").trim() || `עמודה ${j + 1}`);
            return (
              <div key={s.name} className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <label className="flex items-center gap-2 font-bold">
                  <input type="checkbox" className="h-5 w-5" checked={s.use} onChange={(e) => update(i, { use: e.target.checked })} />
                  גיליון: {s.name}
                </label>
                {s.use ? (
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {FIELDS.map((f) => (
                      <label key={f} className="text-sm">
                        <span className="font-semibold">{FIELD_LABELS[f]}</span>
                        <select
                          className="input mt-0.5 py-2"
                          value={s.mapping[f] ?? ""}
                          onChange={(e) =>
                            update(i, { mapping: { ...s.mapping, [f]: e.target.value === "" ? undefined : Number(e.target.value) } })
                          }
                        >
                          <option value="">{f === "unit" ? "לא נבחר" : "אין"}</option>
                          {f === "unit" ? <option value={-1}>שם הגיליון ({s.name})</option> : null}
                          {headers.map((h, j) => (
                            <option key={j} value={j}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {rows.length ? (
        <div className="card space-y-3">
          <h2 className="h2">3. תצוגה מקדימה</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-brand px-3 py-1 font-bold text-white">{rows.length} ילדים</span>
            {byUnit.map(([u, n]) => (
              <span key={u || "none"} className={`rounded-full px-3 py-1 font-semibold ${u ? "bg-slate-100" : "bg-bad-bg text-bad"}`}>
                {u || "בלי ביתן"} · {n}
              </span>
            ))}
          </div>
          {noUnit ? <FormError error={`ל-${noUnit} ילדים אין ביתן. צריך לבחור עמודת ביתן או להשתמש בשם הגיליון.`} /> : null}
          <div className="max-h-80 overflow-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>שם</th>
                  <th>ביתן</th>
                  <th>גיל</th>
                  <th>תרופות</th>
                  <th>שינה</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 200).map((r, i) => (
                  <tr key={i}>
                    <td className="font-semibold">{r.fullName}</td>
                    <td>{r.unit}</td>
                    <td>{r.age || ""}</td>
                    <td>{r.hasMedication ? "💊" : ""}</td>
                    <td>{r.bedtime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="h2 pt-2">4. ייבוא</h2>
          {childCount > 0 ? (
            <div className="space-y-2">
              <label className="flex items-start gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200">
                <input type="radio" className="mt-1 h-5 w-5" checked={replace} onChange={() => setReplace(true)} />
                <span>
                  <b>להחליף את כל מה שיש</b>
                  <span className="block text-sm text-slate-600">
                    {isDemo ? "מוחק את נתוני הדמה (ילדים, ביתנים, משמרות וחריגות) ומכניס את הרשימה. המשתמשים נשארים." : "מוחק את כל הילדים, המשמרות והחריגות הקיימים."}
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200">
                <input type="radio" className="mt-1 h-5 w-5" checked={!replace} onChange={() => setReplace(false)} />
                <span>
                  <b>להוסיף לקיימים</b>
                  <span className="block text-sm text-slate-600">מוסיף את הילדים מהקובץ בלי למחוק כלום.</span>
                </span>
              </label>
            </div>
          ) : null}
          <FormError error={result?.error} />
          {result?.ok ? <div className="rounded-xl bg-ok-bg p-3 font-bold text-ok">{result.ok}</div> : null}
          <button
            type="button"
            className="btn-primary w-full text-lg"
            disabled={disabled || pending || noUnit > 0 || !!result?.ok}
            onClick={() => {
              const msg = replace && childCount > 0 ? `למחוק את ${childCount} הילדים הקיימים וכל ההיסטוריה שלהם, ולייבא ${rows.length} ילדים?` : `לייבא ${rows.length} ילדים?`;
              if (!confirm(msg)) return;
              start(async () => {
                const res = await importChildrenAction({ replace: replace && childCount > 0, rows });
                setResult(res);
                if (res.ok) router.refresh();
              });
            }}
          >
            {pending ? "מייבא..." : `ייבוא ${rows.length} ילדים`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
