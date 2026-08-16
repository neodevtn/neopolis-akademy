import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { MediaAsset } from "@shared/contentStudio";
import { toPreviewMediaUrl } from "@/lib/mediaUrl";

export function MediaPreviewDialog({ asset, onOpenChange }: { asset: MediaAsset | null; onOpenChange: (open: boolean) => void }) {
  if (!asset) return null;
  const src = toPreviewMediaUrl(asset.url, asset.kind);
  const content = asset.kind === "image" ? <img src={src} alt={asset.title} className="mx-auto max-h-[65vh] max-w-full object-contain" />
    : asset.kind === "pdf" || asset.kind === "slides" ? <iframe src={src} title={asset.title} className="h-[65vh] w-full rounded border" />
    : asset.kind === "video" ? <video className="max-h-[65vh] w-full rounded bg-black" controls preload="metadata"><source src={src} /></video>
    : asset.kind === "audio" ? <audio className="w-full" controls preload="metadata"><source src={src} /></audio>
    : asset.kind === "youtube" ? <iframe className="aspect-video w-full rounded" src={src} title={asset.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    : <div className="space-y-3 rounded border bg-muted/30 p-5 text-center"><p className="text-sm text-muted-foreground">Ce format n’a pas de prévisualisation intégrée.</p><Button asChild><a href={src} target="_blank" rel="noreferrer">Ouvrir / télécharger le fichier</a></Button></div>;
  return <Dialog open onOpenChange={onOpenChange}><DialogContent className="max-w-5xl"><DialogHeader><DialogTitle>{asset.title}</DialogTitle><DialogDescription className="truncate">{src}</DialogDescription></DialogHeader>{content}<div className="flex justify-end"><Button variant="outline" asChild><a href={src} target="_blank" rel="noreferrer">Ouvrir dans un nouvel onglet</a></Button></div></DialogContent></Dialog>;
}
