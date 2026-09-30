import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";
import type { PublicContent } from "@/config/public-content";
import { telHref } from "@/lib/text";
import { cn } from "@/lib/utils";

type Contact = PublicContent["contact"];

type Row = { key: string; label: string; icon: ReactNode; value: string; href?: string };

export function contactRows(contact: Contact): Row[] {
  const rows: Row[] = [];
  if (contact.phone) rows.push({ key: "phone", label: "טלפון", icon: <Phone />, value: contact.phone, href: telHref(contact.phone) });
  if (contact.email) rows.push({ key: "email", label: "מייל", icon: <Mail />, value: contact.email, href: `mailto:${contact.email}` });
  if (contact.address) rows.push({ key: "address", label: "כתובת", icon: <MapPin />, value: contact.address });
  if (contact.hours) rows.push({ key: "hours", label: "שעות מענה", icon: <Clock />, value: contact.hours });
  return rows;
}

/** רשימת פרטי הקשר. פרט ריק לא מוצג */
export function ContactDetails({
  contact,
  tone = "default",
  className,
}: {
  contact: Contact;
  tone?: "default" | "onDark";
  className?: string;
}) {
  const rows = contactRows(contact);
  if (rows.length === 0) return null;
  const onDark = tone === "onDark";
  return (
    <dl className={cn("space-y-4", className)}>
      {rows.map((row) => (
        <div key={row.key} className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className={cn(
              "mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-xl [&_svg]:size-[18px]",
              onDark ? "bg-white/12 text-white" : "bg-brand-soft text-primary",
            )}
          >
            {row.icon}
          </span>
          <div className="min-w-0">
            <dt className={cn("text-sm", onDark ? "text-white/75" : "text-muted-foreground")}>{row.label}</dt>
            <dd className={cn("font-semibold break-words", onDark ? "text-white" : "text-foreground")}>
              {row.href ? (
                <a href={row.href} dir="ltr" className="rounded hover:underline">
                  {row.value}
                </a>
              ) : (
                row.value
              )}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
