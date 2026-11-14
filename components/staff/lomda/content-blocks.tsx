import type { ContentTable, Procedure } from "@/lib/content/lomda-types";

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function DataTable({ table }: { table: ContentTable }) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-surface">
          <tr>
            {table.head.map((h) => (
              <th key={h} className="border-b px-3 py-2 text-start font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i} className="border-b last:border-b-0 align-top">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const META_KEYS = ["מטרת הנוהל", "אחריות", "מתי מפעילים", "תיעוד וטפסים"] as const;

/** גוף נוהל: מטרה, אחריות, מתי, תיעוד, פעולות מפתח וטבלה */
export function ProcedureBody({ procedure }: { procedure: Procedure }) {
  return (
    <div className="space-y-4">
      <dl className="grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[auto_1fr]">
        {META_KEYS.map((k) =>
          procedure.meta[k] ? (
            <div key={k} className="contents">
              <dt className="font-bold text-muted-foreground">{k}</dt>
              <dd className="mb-1.5 sm:mb-0">{procedure.meta[k]}</dd>
            </div>
          ) : null,
        )}
      </dl>
      <div>
        <p className="mb-2 font-bold">פעולות מפתח</p>
        <ol className="list-decimal space-y-1.5 ps-5">
          {procedure.acts.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ol>
      </div>
      {procedure.tbl ? <DataTable table={procedure.tbl} /> : null}
    </div>
  );
}
