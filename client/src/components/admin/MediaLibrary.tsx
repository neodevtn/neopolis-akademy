import { useMemo, useState } from "react";
import { FileImage, FileText, Film, Link2, Music2, Presentation, Search, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MediaAsset, MediaKind } from "@shared/contentStudio";

const MEDIA_META: Record<MediaKind, { label: string; icon: typeof Video; color: string }> = {
  youtube: { label: "YouTube", icon: Video, color: "text-red-600 bg-red-50" },
  video: { label: "Vidéo locale", icon: Film, color: "text-blue-700 bg-blue-50" },
  audio: { label: "Audio", icon: Music2, color: "text-violet-700 bg-violet-50" },
  pdf: { label: "PDF", icon: FileText, color: "text-rose-700 bg-rose-50" },
  image: { label: "Image", icon: FileImage, color: "text-emerald-700 bg-emerald-50" },
  download: { label: "Fichier", icon: Link2, color: "text-slate-700 bg-slate-100" },
  slides: { label: "Slides", icon: Presentation, color: "text-amber-700 bg-amber-50" },
};

interface MediaLibraryProps {
  assets: MediaAsset[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (asset: MediaAsset) => void;
}

/** Reusable media selector. It references existing `/api/assets/` URLs and never moves learner media. */
export function MediaLibrary({ assets, open, onOpenChange, onSelect }: MediaLibraryProps) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<MediaKind | "all">("all");
  const [manualUrl, setManualUrl] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualKind, setManualKind] = useState<MediaKind>("video");

  const filteredAssets = useMemo(() => assets.filter((asset) => {
    const matchesKind = kind === "all" || asset.kind === kind;
    const search = `${asset.title} ${asset.url} ${asset.kind}`.toLowerCase();
    return matchesKind && search.includes(query.toLowerCase());
  }), [assets, kind, query]);

  const chooseManualAsset = () => {
    if (!manualUrl.trim()) return;
    onSelect({
      id: `manual:${manualKind}:${manualUrl.trim()}`,
      kind: manualKind,
      url: manualUrl.trim(),
      title: manualTitle.trim() || "Nouveau média",
      usedBy: [],
    });
    setManualUrl("");
    setManualTitle("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bibliothèque médias</DialogTitle>
          <DialogDescription>
            Sélectionnez une ressource déjà utilisée par le cours ou référencez une nouvelle URL. Les fichiers existants restent servis par <code>/api/assets/</code>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Rechercher un média, un fichier ou une URL…" />
          </div>
          <Tabs value={kind} onValueChange={(value) => setKind(value as MediaKind | "all")}>
            <TabsList className="h-auto flex-wrap justify-start">
              <TabsTrigger value="all">Tous ({assets.length})</TabsTrigger>
              <TabsTrigger value="video">Vidéos</TabsTrigger>
              <TabsTrigger value="pdf">PDF</TabsTrigger>
              <TabsTrigger value="image">Images</TabsTrigger>
              <TabsTrigger value="slides">Slides</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {filteredAssets.map((asset) => {
            const meta = MEDIA_META[asset.kind];
            const Icon = meta.icon;
            return (
              <button
                type="button"
                key={asset.id}
                onClick={() => { onSelect(asset); onOpenChange(false); }}
                className="group flex min-w-0 items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
              >
                <span className={`mt-0.5 rounded-md p-2 ${meta.color}`}><Icon className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{asset.title}</span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">{asset.url}</span>
                  <span className="mt-2 block text-[11px] text-muted-foreground">{meta.label} · {asset.usedBy.length} utilisation(s)</span>
                </span>
              </button>
            );
          })}
          {filteredAssets.length === 0 && <p className="col-span-full py-8 text-center text-sm text-muted-foreground">Aucun média correspondant.</p>}
        </div>

        <div className="border-t pt-5">
          <h3 className="text-sm font-semibold">Référencer un nouveau média</h3>
          <p className="mt-1 text-xs text-muted-foreground">Pour une nouvelle vidéo locale, utilisez une URL déjà disponible via <code>/api/assets/</code>. L’import de fichiers sera ajouté dans une étape dédiée afin de préserver les assets existants.</p>
          <div className="mt-3 grid gap-2 md:grid-cols-[150px_1fr_1fr_auto]">
            <Select value={manualKind} onValueChange={(value) => setManualKind(value as MediaKind)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(MEDIA_META).map(([value, meta]) => <SelectItem value={value} key={value}>{meta.label}</SelectItem>)}</SelectContent>
            </Select>
            <div><Label className="sr-only" htmlFor="media-title">Titre</Label><Input id="media-title" value={manualTitle} onChange={(event) => setManualTitle(event.target.value)} placeholder="Titre du média" /></div>
            <div><Label className="sr-only" htmlFor="media-url">URL</Label><Input id="media-url" value={manualUrl} onChange={(event) => setManualUrl(event.target.value)} placeholder="https://… ou /api/assets/…" /></div>
            <Button type="button" variant="outline" disabled={!manualUrl.trim()} onClick={chooseManualAsset}>Utiliser</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
