import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AdminNavbar } from "@/components/AdminNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileImage, FileText, Film, Link2, Loader2, Music2, Pencil, Presentation, RefreshCw, Search, ShieldCheck, Trash2, Upload, Video } from "lucide-react";
import { toast } from "sonner";
import type { MediaAsset, MediaKind } from "@shared/contentStudio";
import { MediaPreviewDialog } from "@/components/admin/MediaPreviewDialog";
import { MediaCourseInsertionDialog } from "@/components/admin/MediaCourseInsertionDialog";
import { toBlockMediaUrl, toPreviewMediaUrl } from "@/lib/mediaUrl";
import { isAdministrativeRole } from "@shared/roles";

type CatalogAsset = MediaAsset & { managed?: boolean };

const kindMeta: Record<MediaKind, { label: string; icon: typeof Video; tone: string }> = {
  youtube: { label: "YouTube", icon: Video, tone: "bg-red-50 text-red-700" },
  video: { label: "Vidéo locale", icon: Film, tone: "bg-blue-50 text-blue-700" },
  audio: { label: "Audio", icon: Music2, tone: "bg-violet-50 text-violet-700" },
  pdf: { label: "PDF", icon: FileText, tone: "bg-rose-50 text-rose-700" },
  image: { label: "Image", icon: FileImage, tone: "bg-emerald-50 text-emerald-700" },
  download: { label: "Fichier", icon: Link2, tone: "bg-slate-100 text-slate-700" },
  slides: { label: "Slides", icon: Presentation, tone: "bg-amber-50 text-amber-700" },
};

const kinds = Object.keys(kindMeta) as MediaKind[];

function inferKind(file: File): MediaKind {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type === "application/pdf") return "pdf";
  return "download";
}

function asBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.readAsDataURL(file);
  });
}

export default function AdminMediaLibrary() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAdministrativeRole(user?.role);
  const utils = trpc.useUtils();
  const mediaQuery = trpc.adminContent.listMediaAssets.useQuery(undefined, { enabled: isAuthenticated && isAdmin });
  const invalidate = () => utils.adminContent.listMediaAssets.invalidate();
  const saveMutation = trpc.adminContent.saveMediaAsset.useMutation({ onSuccess: invalidate });
  const uploadMutation = trpc.adminContent.uploadMediaAsset.useMutation({ onSuccess: invalidate });
  const replaceMutation = trpc.adminContent.replaceMediaAsset.useMutation({ onSuccess: invalidate });
  const removeMutation = trpc.adminContent.removeUnusedMediaAsset.useMutation({ onSuccess: invalidate });

  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<MediaKind | "all">("all");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<CatalogAsset | null>(null);
  const [previewing, setPreviewing] = useState<CatalogAsset | null>(null);
  const [inserting, setInserting] = useState<CatalogAsset | null>(null);
  const [title, setTitle] = useState("");
  const [editKind, setEditKind] = useState<MediaKind>("image");
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newKind, setNewKind] = useState<MediaKind>("image");
  const [replaceUrl, setReplaceUrl] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const assets = (mediaQuery.data || []) as CatalogAsset[];
  const previewParameter = useMemo(() => typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("preview"), []);
  useEffect(() => {
    if (previewParameter && assets.length) setPreviewing(assets.find((asset) => asset.url === previewParameter) || null);
  }, [previewParameter, assets]);

  const filtered = useMemo(() => assets.filter((asset) => {
    const haystack = `${asset.title} ${asset.url} ${asset.kind} ${asset.usedBy.join(" ")}`.toLowerCase();
    return (kind === "all" || asset.kind === kind) && haystack.includes(query.toLowerCase());
  }), [assets, kind, query]);

  const openEdit = (asset: CatalogAsset) => {
    setEditing(asset);
    setTitle(asset.title);
    setEditKind(asset.kind);
    setReplaceUrl("");
  };

  const save = async () => {
    if (!editing || !title.trim()) return;
    try {
      await saveMutation.mutateAsync({ url: editing.url, title: title.trim(), kind: editKind });
      toast.success("Métadonnées du média mises à jour");
      setEditing(null);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Mise à jour impossible."); }
  };

  const replace = async () => {
    if (!editing || !replaceUrl.trim()) return;
    if (editing.kind === "youtube" && !/^https?:\/\//i.test(replaceUrl.trim())) {
      toast.error("Pour remplacer une vidéo YouTube, saisissez son URL complète.");
      return;
    }
    try {
      const toUrl = editing.kind === "youtube" ? replaceUrl.trim() : toBlockMediaUrl(replaceUrl, editing.kind, "mediaUrl");
      const result = await replaceMutation.mutateAsync({ fromUrl: editing.url, toUrl });
      toast.success(`Référence mise à jour dans ${result.updatedCourses} cours`);
      setEditing(null);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Remplacement impossible."); }
  };

  const remove = async () => {
    if (!editing) return;
    try {
      const result = await removeMutation.mutateAsync({ url: editing.url });
      if (!result.success) { toast.error(`Ce média est encore utilisé ${result.usageCount} fois. Remplacez-le avant de le retirer.`); return; }
      toast.success("Média retiré du catalogue");
      setEditing(null);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Suppression impossible."); }
  };

  const addReference = async () => {
    if (!newUrl.trim() || !newTitle.trim()) return;
    try {
      await saveMutation.mutateAsync({ url: newKind === "youtube" ? newUrl.trim() : toBlockMediaUrl(newUrl, newKind, "mediaUrl"), title: newTitle.trim(), kind: newKind });
      toast.success("Média ajouté au catalogue");
      setAdding(false);
      setNewUrl("");
      setNewTitle("");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Ajout impossible."); }
  };

  const upload = async () => {
    if (!uploadFile) return;
    if (uploadFile.size > 8 * 1024 * 1024) { toast.error("Fichier supérieur à 8 Mo : utilisez une URL /api/assets/ pour les vidéos volumineuses."); return; }
    try {
      const base64 = await asBase64(uploadFile);
      await uploadMutation.mutateAsync({ filename: uploadFile.name, mimeType: uploadFile.type || "application/octet-stream", base64, title: newTitle.trim() || uploadFile.name, kind: newKind === "youtube" ? "video" : newKind });
      toast.success("Média importé et ajouté au catalogue");
      setAdding(false);
      setUploadFile(null);
      setNewTitle("");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Import impossible."); }
  };

  if (!isAuthenticated || !isAdmin) return <div className="p-8 text-center">Accès administrateur requis.</div>;

  return <div className="min-h-screen bg-slate-50">
    <AdminNavbar activePage="media" />
    <main className="container space-y-6 py-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Visual designer</p><h1 className="text-3xl font-bold tracking-tight">Bibliothèque médias</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Catalogue global des fichiers et liens utilisés dans les cours. Les aperçus s’ouvrent dans l’application et les remplacements mettent à jour les cours concernés.</p></div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => mediaQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Actualiser</Button><Button onClick={() => setAdding(true)}><Upload className="mr-2 h-4 w-4" />Ajouter un média</Button></div>
      </header>
      <Card><CardContent className="pt-6"><div className="grid gap-3 md:grid-cols-[1fr_auto]"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Rechercher un fichier, une URL, un cours…" /></div><Tabs value={kind} onValueChange={(value) => setKind(value as MediaKind | "all")}><TabsList className="h-auto flex-wrap"><TabsTrigger value="all">Tous ({assets.length})</TabsTrigger>{kinds.map((entry) => <TabsTrigger key={entry} value={entry}>{kindMeta[entry].label}</TabsTrigger>)}</TabsList></Tabs></div></CardContent></Card>
      {mediaQuery.isLoading ? <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div> : <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((asset) => { const meta = kindMeta[asset.kind]; const Icon = meta.icon; return <Card key={asset.id} className="overflow-hidden"><CardContent className="p-4"><div className="flex gap-3"><span className={`rounded-lg p-2 ${meta.tone}`}><Icon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="flex items-start gap-2"><p className="truncate font-semibold">{asset.title}</p>{asset.managed && <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />}</div><p className="mt-1 truncate text-xs text-muted-foreground">{toPreviewMediaUrl(asset.url, asset.kind)}</p><p className="mt-3 text-xs text-muted-foreground">{asset.usedBy.length} utilisation(s) · {meta.label}</p></div></div><div className="mt-4 flex items-center justify-between"><Button variant="link" className="h-auto px-0 text-xs" onClick={() => setPreviewing(asset)}>Prévisualiser</Button><Button size="sm" variant="outline" onClick={() => openEdit(asset)}><Pencil className="mr-1 h-3.5 w-3.5" />Gérer</Button></div></CardContent></Card>; })}{filtered.length === 0 && <div className="col-span-full py-20 text-center text-sm text-muted-foreground">Aucun média ne correspond à la recherche.</div>}</section>}
    </main>
    <Dialog open={adding} onOpenChange={setAdding}><DialogContent><DialogHeader><DialogTitle>Ajouter un média</DialogTitle><DialogDescription>Importez un fichier léger ou enregistrez une URL. Les URL locales sont normalisées vers le proxy d’actifs.</DialogDescription></DialogHeader><div className="space-y-4"><div className="grid gap-2"><Label>Type</Label><Select value={newKind} onValueChange={(value) => setNewKind(value as MediaKind)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{kinds.map((entry) => <SelectItem key={entry} value={entry}>{kindMeta[entry].label}</SelectItem>)}</SelectContent></Select></div><div className="grid gap-2"><Label>Titre</Label><Input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="Ex. Guide de démarrage n8n" /></div><div className="grid gap-2"><Label>URL existante</Label><Input value={newUrl} onChange={(event) => setNewUrl(event.target.value)} placeholder="/api/assets/... ou https://..." /></div><div className="flex items-center gap-2"><span className="h-px flex-1 bg-border" /><span className="text-xs text-muted-foreground">ou</span><span className="h-px flex-1 bg-border" /></div><input ref={uploadRef} className="hidden" type="file" onChange={(event) => { const file = event.target.files?.[0] || null; setUploadFile(file); if (file) setNewKind(inferKind(file)); }} /><Button type="button" variant="outline" onClick={() => uploadRef.current?.click()}>{uploadFile ? uploadFile.name : "Choisir un fichier (max. 8 Mo)"}</Button></div><DialogFooter><Button variant="outline" onClick={() => setAdding(false)}>Annuler</Button><Button disabled={(!newUrl.trim() && !uploadFile) || (!newTitle.trim() && !uploadFile) || saveMutation.isPending || uploadMutation.isPending} onClick={() => uploadFile ? upload() : addReference()}>{saveMutation.isPending || uploadMutation.isPending ? "Ajout…" : "Ajouter"}</Button></DialogFooter></DialogContent></Dialog>
    <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}><DialogContent className="max-w-xl"><DialogHeader><DialogTitle>Gérer le média</DialogTitle><DialogDescription>Les références utilisées par des cours sont protégées. Remplacez-les avant de retirer le média.</DialogDescription></DialogHeader>{editing && <div className="space-y-4"><div className="grid gap-2"><Label>Titre</Label><Input value={title} onChange={(event) => setTitle(event.target.value)} /></div><div className="grid gap-2"><Label>Type</Label><Select value={editKind} onValueChange={(value) => setEditKind(value as MediaKind)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{kinds.map((entry) => <SelectItem key={entry} value={entry}>{kindMeta[entry].label}</SelectItem>)}</SelectContent></Select></div><div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground break-all">{toPreviewMediaUrl(editing.url, editing.kind)}</div><div className="rounded-lg border p-3"><p className="text-sm font-medium">Utilisations ({editing.usedBy.length})</p><ul className="mt-2 max-h-24 space-y-1 overflow-y-auto text-xs text-muted-foreground">{editing.usedBy.length ? editing.usedBy.map((usage) => <li key={usage}>{usage}</li>) : <li>Ce média n’est pas encore utilisé.</li>}</ul></div><div className="rounded-lg border border-amber-200 bg-amber-50 p-3"><Label className="text-amber-900">Remplacer dans tous les cours concernés</Label><div className="mt-2 flex gap-2"><Input value={replaceUrl} onChange={(event) => setReplaceUrl(event.target.value)} placeholder="Nouvelle URL /api/assets/..." /><Button variant="outline" disabled={!replaceUrl.trim() || replaceMutation.isPending} onClick={replace}>Remplacer</Button></div></div></div>}<DialogFooter><Button variant="destructive" disabled={!editing || editing.usedBy.length > 0 || removeMutation.isPending} title={editing?.usedBy.length ? "Remplacez les usages avant suppression" : undefined} onClick={remove}><Trash2 className="mr-2 h-4 w-4" />Retirer</Button><Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button><Button disabled={saveMutation.isPending || !title.trim()} onClick={save}>Sauvegarder</Button></DialogFooter></DialogContent></Dialog>
    <MediaPreviewDialog asset={previewing} onOpenChange={(open) => !open && setPreviewing(null)} onInsert={(asset) => { setPreviewing(null); setInserting(asset as CatalogAsset); }} />
    <MediaCourseInsertionDialog asset={inserting} onOpenChange={(open) => !open && setInserting(null)} />
  </div>;
}
