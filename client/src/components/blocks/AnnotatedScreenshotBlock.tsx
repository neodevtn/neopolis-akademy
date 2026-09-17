import { ExternalLink, ImageIcon, Landmark } from "lucide-react";

const text = (value: unknown, lang: string) => typeof value === "string"
  ? value
  : value && typeof value === "object"
    ? String((value as Record<string, unknown>)[lang] || (value as Record<string, unknown>).fr || (value as Record<string, unknown>).en || "")
    : "";

export type AnnotatedScreenshotBlockData = {
  title?: string | Record<string, string>;
  imageUrl: string;
  alt?: string | Record<string, string>;
  caption?: string | Record<string, string>;
  sourceRefs?: Array<{ id?: string; title?: string; url?: string }>;
};

/**
 * A reusable, attributed documentation-screenshot block. The image remains a
 * visual reference; the caption and source links make its origin explicit.
 */
export function AnnotatedScreenshotBlock({ block, lang }: { block: AnnotatedScreenshotBlockData; lang: string }) {
  const title = text(block.title, lang);
  const alt = text(block.alt, lang) || title || "Documentation screenshot";
  const caption = text(block.caption, lang);
  const sources = Array.isArray(block.sourceRefs) ? block.sourceRefs.filter((source) => source?.url && source?.title) : [];

  return (
    <figure className="my-5 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
        <ImageIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <figcaption className="min-w-0 text-sm font-semibold text-foreground">{title}</figcaption>
      </div>
      <div className="bg-muted/20 p-3 sm:p-5">
        <img src={block.imageUrl} alt={alt} className="mx-auto h-auto max-h-[560px] w-full rounded-xl border border-border object-contain" loading="lazy" />
      </div>
      {(caption || sources.length > 0) && (
        <div className="space-y-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
          {caption && <p className="leading-relaxed">{caption}</p>}
          {sources.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="inline-flex items-center gap-1 font-medium text-foreground"><Landmark className="h-3.5 w-3.5" />{lang === "fr" ? "Source" : "Source"}</span>
              {sources.map((source) => (
                <a key={`${source.id || source.url}`} href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline">
                  {source.title}<ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </figure>
  );
}
