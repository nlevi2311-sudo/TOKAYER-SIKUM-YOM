"use client";

import { useMemo, useState } from "react";
import { Mail, Phone, Siren } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { initialsOf, matchesQuery, telHref } from "@/lib/text";
import type { Contact } from "@/types";
import { FilterChips } from "./filter-chips";
import { ListToolbar } from "./list-toolbar";

export function ContactsBrowser({ contacts }: { contacts: Contact[] }) {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");

  const departments = useMemo(
    () => Array.from(new Set(contacts.map((c) => c.department).filter((d): d is string => Boolean(d)))),
    [contacts],
  );

  const filtered = contacts.filter(
    (c) =>
      (!department || (department === "__emergency" ? c.is_emergency : c.department === department)) &&
      matchesQuery(query, c.full_name, c.role_title, c.responsibility, c.department),
  );

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <ListToolbar query={query} onQuery={setQuery} placeholder="חיפוש לפי שם או תפקיד" />
        <FilterChips
          label="מחלקה"
          value={department}
          onChange={setDepartment}
          chips={[
            ...(contacts.some((c) => c.is_emergency) ? [{ value: "__emergency", label: "מוקד וחירום" }] : []),
            ...departments.map((d) => ({ value: d, label: d })),
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="contact" title={contacts.length ? "לא נמצאו אנשי קשר" : "עדיין אין אנשי קשר"} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <li key={c.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft font-bold text-primary">
                  {initialsOf(c.full_name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{c.full_name}</p>
                  {c.role_title ? <p className="text-sm text-primary">{c.role_title}</p> : null}
                  {c.responsibility ? <p className="text-sm text-muted-foreground">{c.responsibility}</p> : null}
                </div>
                {c.is_emergency ? (
                  <span title="מוקד וחירום" className="rounded-full bg-emergency-soft p-1.5 text-emergency">
                    <Siren className="size-4" aria-label="מוקד וחירום" />
                  </span>
                ) : null}
              </div>
              <div className="mt-auto flex gap-2">
                {c.phone ? (
                  <a
                    href={telHref(c.phone)}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                    aria-label={`חיוג אל ${c.full_name}`}
                  >
                    <Phone className="size-4" /> <span dir="ltr">{c.phone}</span>
                  </a>
                ) : (
                  <span className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                    טלפון לא הוזן
                  </span>
                )}
                {c.email ? (
                  <a
                    href={`mailto:${c.email}`}
                    className="inline-flex size-10 items-center justify-center rounded-xl border hover:border-primary/40 hover:text-primary"
                    aria-label={`מייל אל ${c.full_name}`}
                    title={c.email}
                  >
                    <Mail className="size-4" />
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
