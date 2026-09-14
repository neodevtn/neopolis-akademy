import { BadgeCheck, Sparkles } from "lucide-react";

type MediaProvenance = {
  origin?: string;
  official?: boolean;
  label?: string | { en?: string; fr?: string };
};

function resolveLabel(label: MediaProvenance["label"], lang: string) {
  if (typeof label === "string") return label;
  if (label && typeof label === "object") return label[lang as "en" | "fr"] || label.fr || label.en || "";
  return "";
}

export function MediaProvenanceBadge({ metadata, lang }: { metadata?: MediaProvenance; lang: string }) {
  if (!metadata) return null;
  const isOfficial = metadata.official === true || metadata.origin === "anthropic";
  const label = resolveLabel(metadata.label, lang) || (isOfficial
    ? (lang === "fr" ? "Source officielle" : "Official source")
    : (lang === "fr" ? "Complément Neopolis" : "Neopolis supplement"));
  const Icon = isOfficial ? BadgeCheck : Sparkles;
  const palette = isOfficial
    ? "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/70 dark:bg-sky-950/30 dark:text-sky-200"
    : "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/70 dark:bg-violet-950/30 dark:text-violet-200";

  return (
    <span className={`inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-tight ${palette}`}>
      <Icon aria-hidden="true" className="h-3 w-3 shrink-0" />
      <span className="truncate">{label}</span>
    </span>
  );
}
