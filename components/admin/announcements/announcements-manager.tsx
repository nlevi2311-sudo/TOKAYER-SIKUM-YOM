"use client";

import { useEffect, useMemo, useState } from "react";
import { Link2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminList, AdminListItem } from "@/components/admin/admin-list";
import { DataToolbar, FilterPills } from "@/components/admin/data-toolbar";
import { FieldGrid, FormDialog } from "@/components/admin/form-dialog";
import { FormSection, RolesField, SelectField, SwitchField, TextField } from "@/components/admin/form-fields";
import { OptimisticSwitch } from "@/components/admin/optimistic-switch";
import { RowActions } from "@/components/admin/row-actions";
import { RoleBadges, StatusBadge, type BadgeTone } from "@/components/admin/status-badge";
import { useActionForm } from "@/components/admin/use-action";
import { fromLocalInput, toLocalInput } from "@/components/admin/utils";
import { saveAnnouncement, toggleAnnouncementImportant } from "@/lib/actions/admin";
import { ANNOUNCEMENT_KIND_LABELS, ANNOUNCEMENT_KINDS } from "@/lib/labels";
import { formatDate, matchesQuery } from "@/lib/text";
import { announcementSchema } from "@/lib/validations/admin";
import type { AnnouncementRow } from "@/types";

export type AnnouncementStatus = "active" | "scheduled" | "expired";
export type AnnouncementWithStatus = AnnouncementRow & { status: AnnouncementStatus };

const STATUS: Record<AnnouncementStatus, { label: string; tone: BadgeTone }> = {
  active: { label: "מפורסמת", tone: "success" },
  scheduled: { label: "מתוזמנת", tone: "warning" },
  expired: { label: "פג תוקף", tone: "muted" },
};

function AnnouncementForm({ announcement, onClose }: { announcement: AnnouncementRow | null; onClose: () => void }) {
  const { form, onSubmit, submitting } = useActionForm({
    schema: announcementSchema,
    defaultValues: {
      id: announcement?.id,
      title: announcement?.title ?? "",
      body: announcement?.body ?? "",
      kind: announcement?.kind ?? "management",
      is_important: announcement?.is_important ?? false,
      roles: announcement?.roles ?? [],
      link_url: announcement?.link_url ?? "",
      published_at: toLocalInput(announcement?.published_at),
      expires_at: toLocalInput(announcement?.expires_at),
    },
    // השעה נשלחת כ ISO לפי אזור הזמן של הדפדפן
    transform: (v) => ({ ...v, published_at: fromLocalInput(v.published_at), expires_at: fromLocalInput(v.expires_at) }),
    action: saveAnnouncement,
    onSuccess: onClose,
  });
  const { control } = form;

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={announcement ? "עריכת הודעה" : "הודעה חדשה לצוות"}
      description={announcement?.title}
      onSubmit={onSubmit}
      submitting={submitting}
      submitLabel={announcement ? "שמירה" : "פרסום"}
      size="lg"
    >
      <FormSection title="תוכן">
        <TextField control={control} name="title" label="כותרת" required />
        <TextField control={control} name="body" label="נוסח ההודעה" multiline rows={6} help="שורה ריקה = פסקה חדשה" />
        <FieldGrid>
          <SelectField
            control={control}
            name="kind"
            label="סוג"
            options={ANNOUNCEMENT_KINDS.map((k) => ({ value: k, label: ANNOUNCEMENT_KIND_LABELS[k] }))}
          />
          <TextField
            control={control}
            name="link_url"
            label="קישור (אופציונלי)"
            ltr
            type="url"
            inputMode="url"
            placeholder="https://"
            help="למשל לנוהל או לטופס שההודעה מתייחסת אליו"
          />
        </FieldGrid>
        <SwitchField control={control} name="is_important" label="הודעה חשובה" help="מוצגת בראש דף הבית של הצוות, בולטת" />
      </FormSection>

      <FormSection title="תזמון" description="השעות לפי השעון במכשיר שלך.">
        <FieldGrid>
          <TextField control={control} name="published_at" label="פרסום" type="datetime-local" help="ריק = מיד" />
          <TextField control={control} name="expires_at" label="הסרה אוטומטית" type="datetime-local" help="ריק = ההודעה נשארת" />
        </FieldGrid>
      </FormSection>

      <FormSection title="למי">
        <RolesField control={control} name="roles" label="מי רואה את ההודעה" />
      </FormSection>
    </FormDialog>
  );
}

type Filter = "all" | AnnouncementStatus;

export function AnnouncementsManager({
  announcements,
  openNew,
}: {
  announcements: AnnouncementWithStatus[];
  openNew: boolean;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState<{ announcement: AnnouncementRow | null } | null>(() =>
    openNew ? { announcement: null } : null,
  );

  useEffect(() => {
    if (!openNew) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("new");
    window.history.replaceState(window.history.state, "", url.toString());
  }, [openNew]);

  const counts = useMemo(() => {
    const c: Record<AnnouncementStatus, number> = { active: 0, scheduled: 0, expired: 0 };
    for (const a of announcements) c[a.status] += 1;
    return c;
  }, [announcements]);

  const visible = announcements.filter(
    (a) =>
      (filter === "all" || a.status === filter) &&
      matchesQuery(query, a.title, a.body, ANNOUNCEMENT_KIND_LABELS[a.kind], a.author_name),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterPills
          label="סינון לפי מצב"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "הכל", count: announcements.length },
            { value: "active", label: "מפורסמות", count: counts.active },
            { value: "scheduled", label: "מתוזמנות", count: counts.scheduled },
            { value: "expired", label: "פג תוקף", count: counts.expired },
          ]}
        />
        <Button onClick={() => setEditing({ announcement: null })}>
          <Plus aria-hidden="true" />
          הודעה חדשה
        </Button>
      </div>

      <DataToolbar query={query} onQueryChange={setQuery} placeholder="חיפוש בהודעות" count={visible.length} />

      {visible.length === 0 ? (
        <EmptyState
          icon="megaphone"
          title={query || filter !== "all" ? "לא נמצאו הודעות" : "אין עדיין הודעות"}
          description={query || filter !== "all" ? undefined : "הודעה ראשונה לצוות תופיע בדף הבית של אזור הצוות."}
        />
      ) : (
        <AdminList label="רשימת הודעות">
          {visible.map((a) => (
            <AdminListItem
              key={a.id}
              icon={a.is_important ? "bell" : "megaphone"}
              iconTone={a.is_important ? "warm" : "teal"}
              muted={a.status === "expired"}
              title={a.title}
              titleExtra={
                <>
                  <StatusBadge tone={STATUS[a.status].tone}>{STATUS[a.status].label}</StatusBadge>
                  {a.is_important ? <StatusBadge tone="warm">חשוב</StatusBadge> : null}
                </>
              }
              subtitle={a.body}
              meta={
                <>
                  <StatusBadge tone="teal">{ANNOUNCEMENT_KIND_LABELS[a.kind]}</StatusBadge>
                  <RoleBadges roles={a.roles} />
                  <span>
                    {a.status === "scheduled" ? "יתפרסם: " : "פורסם: "}
                    {formatDate(a.published_at)}
                  </span>
                  {a.expires_at ? <span>· {a.status === "expired" ? "הוסר: " : "יוסר: "}{formatDate(a.expires_at)}</span> : null}
                  {a.author_name ? <span>· {a.author_name}</span> : null}
                  {a.link_url ? <Link2 className="size-3.5" aria-label="כולל קישור" /> : null}
                </>
              }
              controls={
                <OptimisticSwitch
                  checked={a.is_important}
                  label="חשוב"
                  ariaLabel={`הודעה חשובה: ${a.title}`}
                  successMessage={(v) => (v ? "סומנה כחשובה" : "הסימון הוסר")}
                  onToggle={(value) => toggleAnnouncementImportant({ id: a.id, value })}
                />
              }
              actions={
                <RowActions
                  label={a.title}
                  id={a.id}
                  onEdit={() => setEditing({ announcement: a })}
                  deleteTable="announcements"
                />
              }
            />
          ))}
        </AdminList>
      )}

      {editing ? (
        <AnnouncementForm
          key={editing.announcement?.id ?? "new"}
          announcement={editing.announcement}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}
