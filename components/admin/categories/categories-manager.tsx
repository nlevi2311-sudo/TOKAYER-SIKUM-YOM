"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminList, AdminListItem, ListGroup } from "@/components/admin/admin-list";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { FieldGrid, FormDialog } from "@/components/admin/form-dialog";
import { IconField, SelectField, TextField } from "@/components/admin/form-fields";
import { RowActions } from "@/components/admin/row-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { useActionForm } from "@/components/admin/use-action";
import { saveCategory } from "@/lib/actions/admin";
import { CATEGORY_SECTION_LABELS, CATEGORY_SECTIONS } from "@/lib/labels";
import { matchesQuery } from "@/lib/text";
import { categorySchema } from "@/lib/validations/admin";
import type { CategoryRow, CategorySection } from "@/types";

type Editing = { category: CategoryRow | null; section: CategorySection } | null;

function CategoryForm({ category, section, onClose }: { category: CategoryRow | null; section: CategorySection; onClose: () => void }) {
  const { form, onSubmit, submitting } = useActionForm({
    schema: categorySchema,
    defaultValues: {
      id: category?.id,
      section: category?.section ?? section,
      slug: category?.slug ?? "",
      name: category?.name ?? "",
      description: category?.description ?? "",
      icon: category?.icon ?? "",
    },
    action: saveCategory,
    onSuccess: onClose,
  });
  const { control } = form;

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={category ? "עריכת קטגוריה" : "קטגוריה חדשה"}
      description={category?.name}
      onSubmit={onSubmit}
      submitting={submitting}
    >
      <FieldGrid>
        <TextField control={control} name="name" label="שם" required />
        <SelectField
          control={control}
          name="section"
          label="אזור"
          options={CATEGORY_SECTIONS.map((s) => ({ value: s, label: CATEGORY_SECTION_LABELS[s] }))}
        />
      </FieldGrid>
      <TextField
        control={control}
        name="slug"
        label="מזהה באנגלית"
        required
        ltr
        placeholder="runaway"
        help="מופיע בכתובת העמוד. אותיות אנגליות קטנות, ספרות ומקף מפריד בין מילים."
      />
      <TextField control={control} name="description" label="תיאור" multiline rows={2} />
      <IconField control={control} name="icon" label="אייקון" />
    </FormDialog>
  );
}

export function CategoriesManager({
  categories,
  usage,
}: {
  categories: CategoryRow[];
  usage: Record<string, number>;
}) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Editing>(null);

  const grouped = useMemo(
    () =>
      CATEGORY_SECTIONS.map((section) => {
        const all = categories.filter((c) => c.section === section);
        const visible = all.filter((c) => matchesQuery(query, c.name, c.slug, c.description));
        return { section, all, visible };
      }),
    [categories, query],
  );
  const searching = query.trim() !== "";
  const total = grouped.reduce((n, g) => n + g.visible.length, 0);

  return (
    <div className="space-y-6">
      <DataToolbar query={query} onQueryChange={setQuery} placeholder="חיפוש קטגוריה" count={total}>
        <Button onClick={() => setEditing({ category: null, section: "procedures" })}>
          <Plus aria-hidden="true" />
          קטגוריה חדשה
        </Button>
      </DataToolbar>

      {searching && total === 0 ? <EmptyState icon="search" title="לא נמצאו קטגוריות" /> : null}

      {grouped
        .filter((g) => !searching || g.visible.length > 0)
        .map(({ section, visible }) => (
          <ListGroup
            key={section}
            id={`section-${section}`}
            title={CATEGORY_SECTION_LABELS[section]}
            count={visible.length}
            action={
              <Button variant="ghost" size="sm" className="text-primary" onClick={() => setEditing({ category: null, section })}>
                <Plus aria-hidden="true" />
                הוספה ל{CATEGORY_SECTION_LABELS[section]}
              </Button>
            }
          >
            {visible.length === 0 ? (
              <p className="rounded-2xl border border-dashed bg-card px-4 py-5 text-center text-sm text-muted-foreground">
                אין קטגוריות באזור הזה
              </p>
            ) : (
              <AdminList label={CATEGORY_SECTION_LABELS[section]}>
                {visible.map((c, i) => (
                  <AdminListItem
                    key={c.id}
                    icon={c.icon}
                    iconFallback="folder"
                    title={c.name}
                    titleExtra={
                      <StatusBadge tone="outline">
                        <span dir="ltr">{c.slug}</span>
                      </StatusBadge>
                    }
                    subtitle={c.description}
                    meta={<span>{usage[c.id] ? `${usage[c.id]} פריטים` : "אין פריטים"}</span>}
                    actions={
                      <RowActions
                        label={c.name}
                        id={c.id}
                        onEdit={() => setEditing({ category: c, section })}
                        deleteTable="categories"
                        deleteDescription={
                          usage[c.id]
                            ? `${usage[c.id]} פריטים בקטגוריה יישארו בלי קטגוריה. הם לא יימחקו.`
                            : "אי אפשר לבטל את הפעולה."
                        }
                        move={searching ? undefined : { table: "categories", canUp: i > 0, canDown: i < visible.length - 1 }}
                      />
                    }
                  />
                ))}
              </AdminList>
            )}
          </ListGroup>
        ))}

      {editing ? (
        <CategoryForm
          key={editing.category?.id ?? `new-${editing.section}`}
          category={editing.category}
          section={editing.section}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}
