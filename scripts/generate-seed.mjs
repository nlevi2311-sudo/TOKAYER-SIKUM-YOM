// מייצר את supabase/seed.sql מתוך lib/seed-data.ts
// הרצה: npm run seed:generate
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  seedAnnouncements,
  seedCategories,
  seedContacts,
  seedEmergency,
  seedOnboarding,
  seedResources,
  seedTraining,
} from "../lib/seed-data.ts";

const ENUM_ARRAY_COLUMNS = { roles: "public.app_role[]" };

function literal(value, column) {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    if (column === "call_list") return `${quote(JSON.stringify(value))}::jsonb`;
    const items = value.map((v) => quote(String(v))).join(", ");
    const cast = ENUM_ARRAY_COLUMNS[column] ?? "text[]";
    return `array[${items}]::${cast}`;
  }
  if (typeof value === "object") return `${quote(JSON.stringify(value))}::jsonb`;
  return quote(String(value));
}

function quote(s) {
  return `'${s.replace(/'/g, "''")}'`;
}

function insert(table, rows, omit = []) {
  if (rows.length === 0) return "";
  const columns = Object.keys(rows[0]).filter((c) => !omit.includes(c));
  const values = rows
    .map((row) => `  (${columns.map((c) => literal(row[c], c)).join(", ")})`)
    .join(",\n");
  return `insert into public.${table} (${columns.join(", ")}) values\n${values}\non conflict (id) do nothing;\n`;
}

const sql = `-- =====================================================================
-- נתוני דוגמה. נוצר אוטומטית מ-lib/seed-data.ts (npm run seed:generate)
-- אל תערכו את הקובץ ידנית. שנו את lib/seed-data.ts והריצו מחדש.
-- כתובות https://example.com/replace-me הן זמניות ויש להחליף אותן בממשק הניהול.
-- =====================================================================

${insert("categories", seedCategories)}
${insert("resources", seedResources)}
${insert("training_items", seedTraining)}
${insert("announcements", seedAnnouncements)}
${insert("contacts", seedContacts)}
${insert("emergency_protocols", seedEmergency)}
${insert("onboarding_items", seedOnboarding)}`;

const out = fileURLToPath(new URL("../supabase/seed.sql", import.meta.url));
writeFileSync(out, sql);
console.log(`seed.sql written (${sql.length} chars)`);
