import Link from "next/link";
import { IconBadge } from "@/components/shared/icon-badge";

export type SimpleItem = {
  key: string;
  title: string;
  subtitle?: string | null;
  icon: string | null;
  href: string;
  external?: boolean;
  meta?: string | null;
};

/** רשימה קומפקטית: מועדפים, אחרונים, הדרכות חדשות */
export function ItemList({ items }: { items: SimpleItem[] }) {
  return (
    <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
      {items.map((item) => (
        <li key={item.key}>
          <Link
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener" : undefined}
            prefetch={item.external ? false : undefined}
            className="flex items-center gap-3 px-4 py-3 transition hover:bg-surface"
          >
            <IconBadge name={item.icon} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{item.title}</span>
              {item.subtitle ? <span className="block truncate text-xs text-muted-foreground">{item.subtitle}</span> : null}
            </span>
            {item.meta ? <span className="shrink-0 text-xs text-muted-foreground">{item.meta}</span> : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
