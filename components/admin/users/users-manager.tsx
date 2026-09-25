"use client";

import { useOptimistic, useTransition } from "react";
import { Check, Loader2, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminList, AdminListItem, ListGroup, Notice } from "@/components/admin/admin-list";
import { SelectBox, SelectField, TextField } from "@/components/admin/form-fields";
import { OptimisticSwitch } from "@/components/admin/optimistic-switch";
import { RowActions } from "@/components/admin/row-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { useActionForm, useRunAction } from "@/components/admin/use-action";
import { addAllowlistRule, updateProfile } from "@/lib/actions/admin";
import { ROLE_LABELS, ROLES } from "@/lib/labels";
import { formatShortDate } from "@/lib/text";
import { allowlistSchema } from "@/lib/validations/admin";
import type { AccessAllowlistRow, AppRole, ProfileRow } from "@/types";

const ROLE_OPTIONS = ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }));

function profilePatch(p: ProfileRow, patch: Partial<Pick<ProfileRow, "role" | "active">>) {
  return { id: p.id, full_name: p.full_name ?? "", role: patch.role ?? p.role, active: patch.active ?? p.active };
}

function RoleSelect({ profile, disabled }: { profile: ProfileRow; disabled: boolean }) {
  const router = useRouter();
  const [role, setRole] = useOptimistic(profile.role);
  const [pending, startTransition] = useTransition();
  return (
    <SelectBox
      value={role}
      disabled={disabled || pending}
      ariaLabel={`תפקיד של ${profile.full_name || profile.email}`}
      className="h-8 w-40"
      options={ROLE_OPTIONS}
      onChange={(value) =>
        startTransition(async () => {
          setRole(value as AppRole);
          const result = await updateProfile(profilePatch(profile, { role: value as AppRole }));
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success(result.message ?? "עודכן");
          router.refresh();
        })
      }
    />
  );
}

function ApproveButton({ profile }: { profile: ProfileRow }) {
  const { run, pending } = useRunAction();
  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() => run(() => updateProfile(profilePatch(profile, { active: true })), "המשתמש אושר")}
      aria-label={`אישור ${profile.full_name || profile.email}`}
    >
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Check aria-hidden="true" />}
      אישור
    </Button>
  );
}

function ProfileItem({ profile, currentUserId }: { profile: ProfileRow; currentUserId: string }) {
  const isSelf = profile.id === currentUserId;
  const name = profile.full_name || profile.email.split("@")[0];
  return (
    <AdminListItem
      icon={profile.role === "admin" ? "shield-check" : "user-round"}
      iconTone={profile.active ? "teal" : "muted"}
      muted={!profile.active}
      title={name}
      titleExtra={
        <>
          {isSelf ? <StatusBadge tone="teal">זה אתה</StatusBadge> : null}
          {!profile.active ? <StatusBadge tone="warning">ממתין לאישור</StatusBadge> : null}
        </>
      }
      subtitle={<span dir="ltr">{profile.email}</span>}
      meta={<span>נרשם {formatShortDate(profile.created_at)}</span>}
      controls={
        <div className="flex flex-wrap items-center gap-3">
          <RoleSelect profile={profile} disabled={isSelf} />
          <OptimisticSwitch
            checked={profile.active}
            label="פעיל"
            ariaLabel={`משתמש פעיל: ${name}`}
            disabled={isSelf}
            successMessage={(v) => (v ? "המשתמש הופעל" : "המשתמש הושבת")}
            onToggle={(value) => updateProfile(profilePatch(profile, { active: value }))}
          />
        </div>
      }
      actions={!profile.active ? <ApproveButton profile={profile} /> : null}
    />
  );
}

function AllowlistForm() {
  const { form, onSubmit, submitting } = useActionForm({
    schema: allowlistSchema,
    defaultValues: { kind: "domain", value: "", default_role: "staff", note: "" },
    action: addAllowlistRule,
    resetOnSuccess: true,
  });
  const { control } = form;
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-2xl border bg-card p-4 sm:p-5">
      <h3 className="font-bold">הוספת כלל</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField
          control={control}
          name="kind"
          label="סוג"
          options={[
            { value: "domain", label: "דומיין שלם" },
            { value: "email", label: "כתובת מייל אחת" },
          ]}
        />
        <TextField
          control={control}
          name="value"
          label="ערך"
          required
          ltr
          placeholder="tokayer.org.il"
          help="דומיין בלבד, או כתובת מייל מלאה"
        />
        <SelectField control={control} name="default_role" label="תפקיד ברירת מחדל" options={ROLE_OPTIONS} />
        <TextField control={control} name="note" label="הערה" placeholder="למשל: כל עובדי הכפר" />
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Plus aria-hidden="true" />}
        הוספה לרשימה
      </Button>
    </form>
  );
}

export function UsersManager({
  profiles,
  allowlist,
  currentUserId,
}: {
  profiles: ProfileRow[];
  allowlist: AccessAllowlistRow[];
  currentUserId: string;
}) {
  const pending = profiles.filter((p) => !p.active);
  const active = profiles.filter((p) => p.active);

  return (
    <div className="space-y-10">
      {pending.length > 0 ? (
        <ListGroup id="pending" title="ממתינים לאישור" count={pending.length} description="התחברו עם Google ועדיין אין להם גישה.">
          <AdminList label="ממתינים לאישור" className="border-warm/30">
            {pending.map((p) => (
              <ProfileItem key={p.id} profile={p} currentUserId={currentUserId} />
            ))}
          </AdminList>
        </ListGroup>
      ) : null}

      <ListGroup id="users" title="משתמשים פעילים" count={active.length} description="התפקיד קובע אילו נהלים, טפסים והדרכות כל אחד רואה.">
        {active.length === 0 ? (
          <EmptyState icon="users" title="אין משתמשים פעילים" />
        ) : (
          <AdminList label="משתמשים פעילים">
            {active.map((p) => (
              <ProfileItem key={p.id} profile={p} currentUserId={currentUserId} />
            ))}
          </AdminList>
        )}
      </ListGroup>

      <ListGroup id="allowlist" title="אישור אוטומטי" count={allowlist.length}>
        <Notice icon={<ShieldCheck className="text-primary" />}>
          מי שמתחבר עם Google ומופיע ברשימה מאושר אוטומטית. אחרים ממתינים לאישור כאן.
        </Notice>
        {allowlist.length === 0 ? (
          <p className="rounded-2xl border border-dashed bg-card px-4 py-5 text-center text-sm text-muted-foreground">
            אין עדיין כללים. כל משתמש חדש ימתין לאישור ידני.
          </p>
        ) : (
          <AdminList label="כללי אישור">
            {allowlist.map((rule) => (
              <AdminListItem
                key={rule.id}
                icon={rule.kind === "domain" ? "globe" : "mail"}
                title={<span dir="ltr">{rule.kind === "domain" ? `@${rule.value}` : rule.value}</span>}
                titleExtra={<StatusBadge tone="outline">{rule.kind === "domain" ? "דומיין" : "מייל"}</StatusBadge>}
                subtitle={rule.note}
                meta={<span>תפקיד: {ROLE_LABELS[rule.default_role]}</span>}
                actions={
                  <RowActions
                    label={rule.value}
                    id={rule.id}
                    deleteTable="access_allowlist"
                    deleteDescription="משתמשים שכבר אושרו יישארו פעילים. משתמשים חדשים לא יאושרו אוטומטית."
                  />
                }
              />
            ))}
          </AdminList>
        )}
        <AllowlistForm />
      </ListGroup>
    </div>
  );
}
