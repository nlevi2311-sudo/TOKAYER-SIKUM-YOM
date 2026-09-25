"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PlaceholderBadge } from "@/components/shared/placeholder-badge";
import { AdminList, AdminListItem } from "@/components/admin/admin-list";
import { OptimisticSwitch } from "@/components/admin/optimistic-switch";
import { DataToolbar, FilterPills } from "@/components/admin/data-toolbar";
import { RowActions } from "@/components/admin/row-actions";
import { RoleBadges, StatusBadge } from "@/components/admin/status-badge";
import { RESOURCE_TYPE_PLURALS } from "@/components/admin/utils";
import { toggleResourceFlag } from "@/lib/actions/admin";
import { RESOURCE_TYPE_LABELS, RESOURCE_TYPES } from "@/lib/labels";
import { matchesQuery } from "@/lib/text";
import type { CategoryRow, Resource, ResourceType } from "@/types";
import { ResourceForm } from "./resource-form";

type Filter = ResourceType | "all";
type Editing = { resource: Resource | null; type: ResourceType } | null;
type InlineFlag = "is_quick_access" | "is_pinned" | "is_important";

const INLINE_FLAGS: Array<{ flag: InlineFlag; label: string }> = [
  { flag: "is_quick_access", label: "גישה מהירה" },
  { flag: "is_pinned", label: "מוצמד" },
  { flag: "is_important", label: "חשוב" },
];

export function ResourcesManager({
  resources,
  categories,
  initialType,
  openNew,
  editId,
}: {
  resources: Resource[];
  categories: CategoryRow[];
  initialType: ResourceType | null;
  openNew: boolean;
  editId: string | null;
}) {
  const [filter, setFilter] = useState<Filter>(initialType ?? "all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Editing>(() => {
    if (editId) {
      const resource = resources.find((r) => r.id === editId);
      if (resource) return { resource, type: resource.type };
    }
    return openNew ? { resource: null, type: initialType ?? "procedure" } : null;
  });

  // מנקה את new/edit מהכתובת, כדי שרענון לא יפתח שוב את החלון
  useEffect(() => {
    if (!openNew && !editId) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("new");
    url.searchParams.delete("edit");
    window.history.replaceState(window.history.state, "", url.toString());
  }, [openNew, editId]);

  function changeFilter(value: Filter) {
    setFilter(value);
    const url = new URL(window.location.href);
    if (value === "all") url.searchParams.delete("type");
    else url.searchParams.set("type", value);
    window.history.replaceState(window.history.state, "", url.toString());
  }

  const counts = useMemo(() => {
    const map = new Map<ResourceType, number>();
    for (const r of resources) map.set(r.type, (map.get(r.type) ?? 0) + 1);
    return map;
  }, [resources]);

  const visible = useMemo(
    () =>
      resources.filter(
        (r) =>
          (filter === "all" || r.type === filter) &&
          matchesQuery(query, r.title, r.description, r.owner, r.category?.name, r.keywords, r.url),
      ),
    [resources, filter, query],
  );

  // סידור אפשרי רק בתוך סוג אחד וכשאין חיפוש, כי השרת מסדר בתוך הסוג
  const canReorder = filter !== "all" && query.trim() === "";
  const newType: ResourceType = filter === "all" ? "procedure" : filter;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterPills
          label="סינון לפי סוג"
          value={filter}
          onChange={changeFilter}
          options={[
            { value: "all", label: "הכל", count: resources.length },
            ...RESOURCE_TYPES.map((t) => ({ value: t, label: RESOURCE_TYPE_PLURALS[t], count: counts.get(t) ?? 0 })),
          ]}
        />
        <Button onClick={() => setEditing({ resource: null, type: newType })}>
          <Plus aria-hidden="true" />
          {filter === "all" ? "פריט חדש" : `${RESOURCE_TYPE_LABELS[filter]} חדש`}
        </Button>
      </div>

      <DataToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="חיפוש לפי שם, קטגוריה, אחראי או מילת מפתח"
        count={visible.length}
      >
        {!canReorder && visible.length > 1 ? (
          <p className="text-xs text-muted-foreground">כדי לשנות סדר, בוחרים סוג ומנקים את החיפוש.</p>
        ) : null}
      </DataToolbar>

      {visible.length === 0 ? (
        <EmptyState
          icon="search"
          title={query ? "לא נמצאו פריטים" : "אין עדיין פריטים מהסוג הזה"}
          description={query ? "נסו מילה אחרת, או חפשו בכל הסוגים." : "אפשר להוסיף את הפריט הראשון עכשיו."}
          action={
            query ? undefined : (
              <Button variant="outline" onClick={() => setEditing({ resource: null, type: newType })}>
                <Plus aria-hidden="true" />
                הוספה
              </Button>
            )
          }
        />
      ) : (
        <AdminList label="רשימת משאבים">
          {visible.map((r, i) => (
            <AdminListItem
              key={r.id}
              icon={r.icon}
              iconFallback="link"
              title={r.title}
              titleExtra={
                <>
                  <PlaceholderBadge url={r.url} />
                  {r.is_public ? <StatusBadge tone="teal">גלוי לכולם</StatusBadge> : null}
                </>
              }
              subtitle={
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  dir="ltr"
                  className="inline-flex max-w-full items-center gap-1 truncate text-xs hover:text-primary hover:underline"
                >
                  <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{r.url}</span>
                  <span className="sr-only">(נפתח בחלון חדש)</span>
                </a>
              }
              meta={
                <>
                  <StatusBadge tone="teal">{RESOURCE_TYPE_LABELS[r.type]}</StatusBadge>
                  <StatusBadge tone="outline">{r.category?.name ?? "ללא קטגוריה"}</StatusBadge>
                  <RoleBadges roles={r.roles} />
                  {r.owner ? <span>אחראי: {r.owner}</span> : null}
                </>
              }
              controls={
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  {INLINE_FLAGS.map((f) => (
                    <OptimisticSwitch
                      key={f.flag}
                      checked={r[f.flag]}
                      label={f.label}
                      ariaLabel={`${f.label}: ${r.title}`}
                      successMessage={(v) => `${f.label}: ${v ? "פעיל" : "כבוי"}`}
                      onToggle={(value) => toggleResourceFlag({ id: r.id, flag: f.flag, value })}
                    />
                  ))}
                </div>
              }
              actions={
                <RowActions
                  label={r.title}
                  id={r.id}
                  onEdit={() => setEditing({ resource: r, type: r.type })}
                  deleteTable="resources"
                  deleteDescription="הפריט יוסר מאזור הצוות, מהמועדפים ומהחיפוש."
                  move={canReorder ? { table: "resources", canUp: i > 0, canDown: i < visible.length - 1 } : undefined}
                />
              }
            />
          ))}
        </AdminList>
      )}

      {editing ? (
        <ResourceForm
          key={editing.resource?.id ?? `new-${editing.type}`}
          resource={editing.resource}
          defaultType={editing.type}
          categories={categories}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}
