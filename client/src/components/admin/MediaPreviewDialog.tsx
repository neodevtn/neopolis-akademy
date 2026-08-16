import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { MediaAsset } from "@shared/contentStudio";
import { toPreviewMediaUrl } from "@/lib/mediaUrl";
import { Link2, PlusCircle } from "lucide-react";

export function MediaPreviewDialog({
  asset,
  onOpenChange,
  onInsert,
}: {
  asset: MediaAsset | null;
  onOpenChange: (open: boolean) => void;
  onInsert?: (asset: MediaAsset) => void;
}) {
  if (!asset) return null;
  const src = toPreviewMediaUrl(asset.url, asset.kind);
  const usages = asset.usedBy.map((usage) => {
    const separator = usage.indexOf(":");
    const lessonMatch = usage.match(/lessons\[(\d+)\]\.chapters\[(\d+)\]/);
    return {
      label: usage,
      courseId: separator > 0 ? usage.slice(0, separator) : usage,
      lessonIndex: lessonMatch?.[1],
      chapterIndex: lessonMatch?.[2],
    };
  });
  const content = asset.kind === "image"
    ? <img src={src} alt={asset.title} className="mx-auto max-h-[65vh] max-w-full object-contain" />
    : asset.kind === "pdf" || asset.kind === "slides"
      ? <iframe src={src} title={asset.title} className="h-[65vh] w-full rounded border" />
      : asset.kind === "video"
        ? <video className="max-h-[65vh] w-full rounded bg-black" controls preload="metadata"><source src={src} /></video>
        : asset.kind === "audio"
          ? <audio className="w-full" controls preload="metadata"><source src={src} /></audio>
          : asset.kind === "youtube"
            ? <iframe className="aspect-video w-full rounded" src={src} title={asset.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            : <div className="space-y-3 rounded border bg-muted/30 p-5 text-center"><p className="text-sm text-muted-foreground">Ce format n’a pas de prévisualisation intégrée.</p><Button asChild><a href={src} target="_blank" rel="noreferrer">Ouvrir / télécharger le fichier</a></Button></div>;

  return <Dialog open onOpenChange={onOpenChange}>
    <DialogContent className="max-w-5xl">
      <DialogHeader><DialogTitle>{asset.title}</DialogTitle><DialogDescription className="truncate">{src}</DialogDescription></DialogHeader>
      {content}
      <div className="rounded-lg border bg-muted/20 p-3">
        <p className="text-sm font-medium">Utilisé dans {usages.length} emplacement(s)</p>
        {usages.length ? <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto text-xs text-muted-foreground">{usages.map((usage) => <li key={usage.label}><a className="underline hover:text-primary" href={`/admin/content?courseId=${encodeURIComponent(usage.courseId)}&mode=edit${usage.lessonIndex ? `&lesson=${usage.lessonIndex}&chapter=${usage.chapterIndex}` : ""}`}>{usage.label}</a></li>)}</ul> : <p className="mt-1 text-xs text-muted-foreground">Ce média n’est pas encore utilisé dans un cours.</p>}
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        {onInsert && <Button onClick={() => onInsert(asset)}><PlusCircle className="mr-2 h-4 w-4" />Ajouter dans un cours</Button>}
        <Button variant="outline" asChild><a href={src} target="_blank" rel="noreferrer"><Link2 className="mr-2 h-4 w-4" />Ouvrir dans un nouvel onglet</a></Button>
      </div>
    </DialogContent>
  </Dialog>;
}
