import { useState } from "react";
import { Expand, ExternalLink, ImageIcon, Landmark, X, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const text = (value: unknown, lang: string) => typeof value === "string"
  ? value
  : value && typeof value === "object"
    ? String((value as Record<string, unknown>)[lang] || (value as Record<string, unknown>).fr || (value as Record<string, unknown>).en || "")
    : "";

export type AnnotatedScreenshotBlockData = {
  title?: unknown;
  imageUrl: string;
  alt?: unknown;
  caption?: unknown;
  purpose?: unknown;
  learnerAction?: unknown;
  interpretationWarning?: unknown;
  guidedZones?: Array<{ id: string; position?: string; label?: unknown; explanation?: unknown; check?: unknown }>;
  sourceRefs?: Array<{ id?: string; title?: string; url?: string }>;
  displayPolicy?: { allowZoom?: boolean; allowFullscreen?: boolean; max_initial_height_px?: number };
};

const markerPositions = [
  "left-[12%] top-[16%]",
  "left-1/2 top-[20%] -translate-x-1/2",
  "right-[12%] top-[16%]",
  "bottom-[15%] right-[16%]",
  "bottom-[15%] left-[16%]",
];

function ScreenshotImage({ block, lang, scale, fullscreen = false }: { block: AnnotatedScreenshotBlockData; lang: string; scale: number; fullscreen?: boolean }) {
  const zones = Array.isArray(block.guidedZones) ? block.guidedZones : [];
  const alt = text(block.alt, lang) || text(block.title, lang) || "Capture de documentation";
  const maxHeight = fullscreen ? undefined : Math.max(320, Number(block.displayPolicy?.max_initial_height_px) || 720);
  return <div className={`relative mx-auto overflow-auto rounded-xl border border-border bg-muted/30 ${fullscreen ? "max-h-[75vh]" : ""}`}>
    <div className="relative min-w-max origin-top-left transition-transform duration-200" style={{ transform: `scale(${scale})`, width: `${scale > 1 ? 100 / scale : 100}%` }}>
      <img src={block.imageUrl} alt={alt} className="mx-auto block h-auto w-full object-contain" style={{ maxHeight }} loading="lazy" />
      {zones.map((zone, index) => <span key={zone.id} aria-label={`${zone.id} : ${text(zone.label, lang)}`} className={`absolute z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-sm font-extrabold text-primary-foreground shadow-lg ${markerPositions[index % markerPositions.length]}`}>{zone.id}</span>)}
    </div>
  </div>;
}

/** Reusable, accessible documentation-image block with a textual guide, zoom and full-screen mode. */
export function AnnotatedScreenshotBlock({ block, lang }: { block: AnnotatedScreenshotBlockData; lang: string }) {
  const [scale, setScale] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const title = text(block.title, lang);
  const caption = text(block.caption, lang);
  const purpose = text(block.purpose, lang);
  const learnerAction = text(block.learnerAction, lang);
  const interpretationWarning = text(block.interpretationWarning, lang);
  const zones = Array.isArray(block.guidedZones) ? block.guidedZones : [];
  const sources = Array.isArray(block.sourceRefs) ? block.sourceRefs.filter((source) => source?.url && source?.title) : [];
  const allowZoom = block.displayPolicy?.allowZoom !== false;
  const allowFullscreen = block.displayPolicy?.allowFullscreen !== false;

  return <figure className="my-5 w-full min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
      <figcaption className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground"><ImageIcon className="h-4 w-4 shrink-0 text-primary" />{title}</figcaption>
      <div className="flex shrink-0 items-center gap-1">
        {allowZoom && <><Button type="button" variant="ghost" size="icon" aria-label="Réduire le zoom" disabled={scale <= 1} onClick={() => setScale((current) => Math.max(1, Number((current - 0.25).toFixed(2))))}><ZoomOut className="h-4 w-4" /></Button><Button type="button" variant="ghost" size="icon" aria-label="Augmenter le zoom" disabled={scale >= 2} onClick={() => setScale((current) => Math.min(2, Number((current + 0.25).toFixed(2))))}><ZoomIn className="h-4 w-4" /></Button></>}
        {allowFullscreen && <Button type="button" variant="ghost" size="icon" aria-label="Ouvrir l’image en plein écran" onClick={() => setFullscreen(true)}><Expand className="h-4 w-4" /></Button>}
      </div>
    </header>
    <div className="p-3 sm:p-5"><ScreenshotImage block={block} lang={lang} scale={scale} /></div>
    <section className="space-y-4 border-t border-border px-4 py-4 text-sm">
      {caption && <p className="leading-relaxed text-muted-foreground whitespace-pre-line">{caption}</p>}
      {purpose && <p className="rounded-xl border border-primary/15 bg-primary/5 p-3 leading-relaxed text-foreground"><strong>{lang === "fr" ? "Intérêt pédagogique : " : "Learning purpose: "}</strong>{purpose}</p>}
      {zones.length > 0 && <div><h3 className="font-semibold text-foreground">{lang === "fr" ? "Repères de lecture" : "Reading guide"}</h3><ol className="mt-3 grid gap-3 md:grid-cols-2">{zones.map((zone) => <li key={zone.id} className="min-w-0 rounded-xl border border-border bg-muted/20 p-3"><div className="flex items-start gap-2"><span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{zone.id}</span><div className="min-w-0"><p className="font-semibold text-foreground">{text(zone.label, lang)}</p>{zone.position && <p className="mt-0.5 text-xs text-muted-foreground">{zone.position}</p>}<p className="mt-2 leading-relaxed text-muted-foreground">{text(zone.explanation, lang)}</p><p className="mt-2 border-t border-border pt-2 text-xs leading-relaxed text-foreground"><strong>{lang === "fr" ? "À vérifier : " : "Check: "}</strong>{text(zone.check, lang)}</p></div></div></li>)}</ol></div>}
      {learnerAction && <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sky-950"><strong>{lang === "fr" ? "Action apprenant : " : "Learner action: "}</strong>{learnerAction}</div>}
      {interpretationWarning && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-950"><strong>{lang === "fr" ? "Attention d’interprétation : " : "Interpretation warning: "}</strong>{interpretationWarning}</div>}
      {sources.length > 0 && <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-muted-foreground"><span className="inline-flex items-center gap-1 font-medium text-foreground"><Landmark className="h-3.5 w-3.5" />{lang === "fr" ? "Source" : "Source"}</span>{sources.map((source) => <a key={source.id || source.url} href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline">{source.title}<ExternalLink className="h-3 w-3" /></a>)}</div>}
    </section>
    {fullscreen && <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"><div className="max-h-full w-full max-w-6xl overflow-auto rounded-2xl bg-card p-3 shadow-2xl"><div className="mb-3 flex items-center justify-between gap-3"><p className="truncate font-semibold text-foreground">{title}</p><Button type="button" variant="ghost" size="icon" aria-label="Fermer le plein écran" onClick={() => setFullscreen(false)}><X className="h-5 w-5" /></Button></div><ScreenshotImage block={block} lang={lang} scale={1} fullscreen /></div></div>}
  </figure>;
}
