import Link from "next/link";
import { ArrowUpLeft, CalendarDays, UserRound } from "lucide-react";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { IconBadge } from "@/components/shared/icon-badge";
import { PlaceholderBadge } from "@/components/shared/placeholder-badge";
import { docTypeLabel, RESOURCE_TYPE_LABELS, ROLE_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/text";
import { cn } from "@/lib/utils";
import type { IconName } from "@/lib/icons";
import type { Resource } from "@/types";
import { OPEN_LABEL, resourceHref } from "./resource-href";

const FALLBACK_ICON: Record<Resource["type"], IconName> = {
  procedure: "book-open",
  form: "clipboard-list",
  system: "layout-grid",
  document: "file-text",
  link: "link",
};

function OpenLink({ resource, className, children }: { resource: Resource; className?: string; children: React.ReactNode }) {
  const { href, external } = resourceHref(resource);
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener" : undefined}
      prefetch={external ? false : undefined}
      className={className}
    >
      {children}
    </Link>
  );
}

function Badges({ resource }: { resource: Resource }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {resource.is_important ? (
        <span className="rounded-full bg-warm-soft px-2 py-0.5 text-[11px] font-semibold text-warm">חשוב</span>
      ) : null}
      {resource.roles.length > 0 ? (
        <span
          className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
          title={resource.roles.map((r) => ROLE_LABELS[r]).join(", ")}
        >
          מוגבל לתפקידים
        </span>
      ) : null}
      <PlaceholderBadge url={resource.url} />
    </div>
  );
}

/** כרטיס משאב: נוהל, טופס, מערכת, מסמך או קישור */
export function ResourceCard({ resource, showType = false }: { resource: Resource; showType?: boolean }) {
  const isSystem = resource.type === "system";
  const isProcedure = resource.type === "procedure";
  const updated = resource.content_updated_at ?? null;

  return (
    <article className="card-lift group relative flex h-full flex-col gap-4 rounded-2xl border bg-card p-5">
      <div className="flex items-start gap-3">
        <IconBadge name={resource.icon} fallback={FALLBACK_ICON[resource.type]} size={isSystem ? "lg" : "md"} />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs text-muted-foreground">
            {showType ? RESOURCE_TYPE_LABELS[resource.type] : resource.category?.name}
            {showType && resource.category ? ` · ${resource.category.name}` : null}
          </p>
          <h3 className="font-bold leading-snug">
            <OpenLink resource={resource} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
              {resource.title}
            </OpenLink>
          </h3>
        </div>
        <FavoriteButton kind="resource" id={resource.id} title={resource.title} initial={Boolean(resource.isFavorite)} className="-me-2 -mt-1" />
      </div>

      {resource.description ? (
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{resource.description}</p>
      ) : null}

      <div className="mt-auto space-y-3">
        {isProcedure ? (
          <dl className="grid gap-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              <dt className="sr-only">תאריך עדכון</dt>
              <dd>{updated ? `עודכן ${formatDate(updated)}` : "תאריך עדכון לא הוזן"}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <UserRound className="size-3.5" aria-hidden="true" />
              <dt className="sr-only">אחראי</dt>
              <dd>{resource.owner ? `אחראי: ${resource.owner}` : "אחראי לא הוזן"}</dd>
            </div>
          </dl>
        ) : resource.doc_type && !isSystem ? (
          <p className="text-xs text-muted-foreground">{docTypeLabel(resource.doc_type)}</p>
        ) : null}
        <div className="flex items-center justify-between gap-2">
          <Badges resource={resource} />
          <span
            aria-hidden="true"
            className="ms-auto inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-semibold text-primary transition group-hover:gap-2"
          >
            {OPEN_LABEL[resource.type]}
            <ArrowUpLeft className="size-4" />
          </span>
        </div>
      </div>
    </article>
  );
}

/** שורה בתצוגת רשימה */
export function ResourceRow({ resource, showType = false }: { resource: Resource; showType?: boolean }) {
  const updated = resource.content_updated_at;
  return (
    <li className="group relative flex items-center gap-3 px-4 py-3 transition hover:bg-surface">
      <IconBadge name={resource.icon} fallback={FALLBACK_ICON[resource.type]} size="sm" />
      <div className="min-w-0 flex-1">
        <OpenLink
          resource={resource}
          className="block truncate font-semibold after:absolute after:inset-0 focus-visible:outline-none"
        >
          {resource.title}
        </OpenLink>
        <p className="truncate text-xs text-muted-foreground">
          {[
            showType ? RESOURCE_TYPE_LABELS[resource.type] : null,
            resource.category?.name,
            resource.owner ? `אחראי: ${resource.owner}` : null,
            updated ? `עודכן ${formatDate(updated)}` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <div className={cn("hidden sm:block")}>
        <Badges resource={resource} />
      </div>
      <FavoriteButton kind="resource" id={resource.id} title={resource.title} initial={Boolean(resource.isFavorite)} />
    </li>
  );
}
