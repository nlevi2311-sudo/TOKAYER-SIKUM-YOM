"use client";

import { useState } from "react";
import { Mail, Phone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminList, AdminListItem } from "@/components/admin/admin-list";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { FieldGrid, FormDialog } from "@/components/admin/form-dialog";
import { SwitchField, TextField } from "@/components/admin/form-fields";
import { RowActions } from "@/components/admin/row-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { useActionForm } from "@/components/admin/use-action";
import { saveContact } from "@/lib/actions/admin";
import { matchesQuery, telHref } from "@/lib/text";
import { contactSchema } from "@/lib/validations/admin";
import type { Contact } from "@/types";

function ContactForm({ contact, onClose }: { contact: Contact | null; onClose: () => void }) {
  const { form, onSubmit, submitting } = useActionForm({
    schema: contactSchema,
    defaultValues: {
      id: contact?.id,
      full_name: contact?.full_name ?? "",
      role_title: contact?.role_title ?? "",
      responsibility: contact?.responsibility ?? "",
      department: contact?.department ?? "",
      phone: contact?.phone ?? "",
      email: contact?.email ?? "",
      is_emergency: contact?.is_emergency ?? false,
    },
    action: saveContact,
    onSuccess: onClose,
  });
  const { control } = form;

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={contact ? "עריכת איש קשר" : "איש קשר חדש"}
      description={contact?.full_name}
      onSubmit={onSubmit}
      submitting={submitting}
    >
      <FieldGrid>
        <TextField control={control} name="full_name" label="שם" required help="שם אדם או שם תפקיד, למשל כונן הנהלה" />
        <TextField control={control} name="role_title" label="תפקיד" />
        <TextField control={control} name="department" label="מחלקה" />
        <TextField control={control} name="responsibility" label="תחום אחריות" help="על מה פונים אליו" />
        <TextField control={control} name="phone" label="טלפון" ltr type="tel" inputMode="tel" placeholder="050 000 0000" />
        <TextField control={control} name="email" label="מייל" ltr type="email" inputMode="email" placeholder="name@example.com" />
      </FieldGrid>
      <SwitchField
        control={control}
        name="is_emergency"
        label="מופיע במסך החירום"
        help="לגורמים שצריך להשיג מהר: כונן, אחות, ביטחון"
      />
    </FormDialog>
  );
}

export function ContactsManager({ contacts }: { contacts: Contact[] }) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<{ contact: Contact | null } | null>(null);
  const searching = query.trim() !== "";
  const visible = contacts.filter((c) =>
    matchesQuery(query, c.full_name, c.role_title, c.department, c.responsibility, c.phone, c.email),
  );

  return (
    <div className="space-y-4">
      <DataToolbar query={query} onQueryChange={setQuery} placeholder="חיפוש לפי שם, תפקיד או מחלקה" count={visible.length}>
        <Button onClick={() => setEditing({ contact: null })}>
          <Plus aria-hidden="true" />
          איש קשר חדש
        </Button>
      </DataToolbar>

      {visible.length === 0 ? (
        <EmptyState icon="contact" title={searching ? "לא נמצאו אנשי קשר" : "אין עדיין אנשי קשר"} />
      ) : (
        <AdminList label="רשימת אנשי קשר">
          {visible.map((c, i) => (
            <AdminListItem
              key={c.id}
              icon={c.is_emergency ? "siren" : "user-round"}
              iconTone={c.is_emergency ? "emergency" : "teal"}
              title={c.full_name}
              titleExtra={c.is_emergency ? <StatusBadge tone="emergency">במסך החירום</StatusBadge> : null}
              subtitle={[c.role_title, c.department, c.responsibility].filter(Boolean).join(" · ") || null}
              meta={
                <>
                  {c.phone ? (
                    <a href={telHref(c.phone)} dir="ltr" className="inline-flex items-center gap-1 hover:text-primary">
                      <Phone className="size-3.5" aria-hidden="true" />
                      {c.phone}
                    </a>
                  ) : null}
                  {c.email ? (
                    <a href={`mailto:${c.email}`} dir="ltr" className="inline-flex items-center gap-1 hover:text-primary">
                      <Mail className="size-3.5" aria-hidden="true" />
                      {c.email}
                    </a>
                  ) : null}
                  {!c.phone && !c.email ? <StatusBadge tone="warning">אין פרטי קשר</StatusBadge> : null}
                </>
              }
              actions={
                <RowActions
                  label={c.full_name}
                  id={c.id}
                  onEdit={() => setEditing({ contact: c })}
                  deleteTable="contacts"
                  move={searching ? undefined : { table: "contacts", canUp: i > 0, canDown: i < visible.length - 1 }}
                />
              }
            />
          ))}
        </AdminList>
      )}

      {editing ? (
        <ContactForm key={editing.contact?.id ?? "new"} contact={editing.contact} onClose={() => setEditing(null)} />
      ) : null}
    </div>
  );
}
