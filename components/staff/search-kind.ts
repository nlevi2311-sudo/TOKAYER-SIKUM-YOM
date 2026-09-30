import type { IconName } from "@/lib/icons";
import type { SearchResult } from "@/types";

export const SEARCH_KIND_META: Record<SearchResult["kind"], { label: string; icon: IconName }> = {
  system: { label: "מערכת", icon: "layout-grid" },
  procedure: { label: "נוהל", icon: "book-open" },
  form: { label: "טופס", icon: "clipboard-list" },
  document: { label: "מסמך", icon: "file-text" },
  link: { label: "קישור", icon: "link" },
  training: { label: "הדרכה", icon: "graduation-cap" },
  contact: { label: "איש קשר", icon: "phone" },
  category: { label: "קטגוריה", icon: "folder" },
  announcement: { label: "עדכון", icon: "megaphone" },
};
