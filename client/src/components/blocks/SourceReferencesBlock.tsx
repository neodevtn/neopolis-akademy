import { ExternalLink, Landmark } from "lucide-react";

const text = (value: unknown, lang: string) => typeof value === "string"
  ? value
  : value && typeof value === "object"
    ? String((value as Record<string, unknown>)[lang] || (value as Record<string, unknown>).fr || (value as Record<string, unknown>).en || "")
    : "";

/** Generic compact provenance block for sourced educational assertions. */
export function SourceReferencesBlock({ block, lang }: { block: any; lang: string }) {
  const sources = Array.isArray(block.sources) ? block.sources.filter((source: any) => source?.url && source?.title) : [];
  if (!sources.length) return null;
  return <aside className="my-4 rounded-xl border border-border bg-muted/30 p-4 text-sm"><p className="flex items-center gap-2 font-semibold text-foreground"><Landmark className="h-4 w-4 text-primary" />{text(block.title, lang) || (lang === "fr" ? "Références" : "References")}</p><ul className="mt-2 space-y-2">{sources.map((source: any) => <li key={source.id || source.url}><a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline">{source.title}<ExternalLink className="h-3 w-3" /></a></li>)}</ul></aside>;
}
