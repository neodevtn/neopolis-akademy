import { useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AdminNavbar } from "@/components/AdminNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileImage, FileText, Film, Link2, Loader2, Music2, Pencil, Presentation, RefreshCw, Search, ShieldCheck, Trash2, Upload, Video } from "lucide-react";
import { toast } from "sonner";
import type { MediaKind } from "@shared/contentStudio";

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

function fileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.readAsDataURL(file);
  });
}

export default function AdminMediaLibrary() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const mediaQuery = trpc.adminContent.listMediaAssets.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const saveMutation = trpc.adminContent.saveMediaAsset.useMutation({ onSuccess: () => utils.adminContent.listMediaAssets.invalidate() });
  const uploadMutation = trpc.adminContent.uploadMediaAsset.useMutation({ onSuccess: () => utils.adminContent.listMediaAssets.invalidate() });
  const replaceMutation = trpc.adminContent.replaceMediaAsset.useMutation({ onSuccess: () => utils.adminContent.listMediaAssets.invalidate() });
  const removeMutation = trpc.adminContent.removeUnusedMediaAsset.useMutation({ onSuccess: () => utils.adminContent.listMediaAssets.invalidate() });
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<MediaKind | "all">("all");
  const [editing, setEditing] = useState<any | null>(null);
  const [title, setTitle] = useState("");
  const [editKind, setEditKind] = useState<MediaKind>("image");
  const [replaceUrl, setReplaceUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newKind, setNewKind] = useState<MediaKind>("image");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const assets = mediaQuery.data || [];
  const filtered = useMemo(() => assets.filter((asset) => {
    const visible = `${asset.title} ${asset.url} ${asset.kind} ${asset.usedBy.join(" ")}`.toLowerCase();
    return (kind === "all" || asset.kind === kind) && visible.includes(query.toLowerCase());
  }), [assets, kind, query]);

  const openEdit = (asset: any) => {
    setEditing(asset); setTitle(asset.title); setEditKind(asset.kind); setReplaceUrl("");
  };
  const save = async () => {
    if (!editing || !title.trim()) return;
    await saveMutation.mutateAsync({ url: editing.url, title: title.trim(), kind: editKind });
    toast.success("Média mis à jour"); setEditing(null);
  };
  const replace = async () => {
    if (!editing || !replaceUrl || replaceUrl === editing.url) return;
    const result = await replaceMutation.mutateAsync({ fromUrl: editing.url, toUrl: replaceUrl });
    toast.success(`Référence mise à jour dans ${result.updatedCourses} cours`); setEditing(null);
  };
  const remove = async () => {
    if (!editing) return;
    const result = await removeMutation.mutateAsync({ url: editing.url });
    if (!result.success) { toast.error(`Ce média est encore utilisé ${result.usageCount} fois. Remplacez-le avant de le retirer.`); return; }
    toast.success("Média retiré de la bibliothèque"); setEditing(null);
  };
  const addReference = async () => {
    if (!newUrl.trim() || !newTitle.trim()) return;
    await saveMutation.mutateAsync({ url: newUrl.trim(), title: newTitle.trim(), kind: newKind });
    toast.success("Média ajouté à la bibliothèque"); setAdding(false); setNewUrl(""); setNewTitle("");
  };
  const upload = async () => {
    if (!uploadFile) return;
    if (uploadFile.size > 8 * 1024 * 1024) { toast.error("Fichier supérieur à 8 Mo : utilisez d’abord un import /api/assets/ pour cette vidéo."); return; }
    const base64 = await fileAsBase64(uploadFile);
    await uploadMutation.mutateAsync({ filename: uploadFile.name, mimeType: uploadFile.type || "application/octet-stream", base64, title: newTitle.trim() || uploadFile.name, kind: newKind === "youtube" ? "video" : newKind });
    toast.success("Média importé et ajouté à la bibliothèque"); setAdding(false); setUploadFile(null); setNewTitle("");
  };

  if (!isAuthenticated || user?.role !== "admin") return <div className="p-8 text-center">Accès administrateur requis.</div>;

  return <div className="min-h-screen bg-slate-50">
    <AdminNavbar activePage="media" />
    <main className="container py-8 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Visual designer</p><h1 className="text-3xl font-bold tracking-tight">Bibliothèque médias</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Catalogue global des fichiers et liens utilisés dans les cours. Toute substitution actualise les cours concernés de manière contrôlée.</p></div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => mediaQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Actualiser</Button><Button onClick={() => setAdding(true)}><Upload className="mr-2 h-4 w-4" />Ajouter un média</Button></div>
      </div>
      <Card><CardContent className="pt-6"><div className="grid gap-3 md:grid-cols-[1fr_auto]"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Rechercher un fichier, une URL, un cours…" /></div><Tabs value={kind} onValueChange={(value) => setKind(value as MediaKind | "all")}><TabsList className="h-auto flex-wrap"><TabsTrigger value="all">Tous ({assets.length})</TabsTrigger>{kinds.map((entry) => <TabsTrigger key={entry} value={entry}>{kindMeta[entry].label}</TabsTrigger>)}</TabsList></Tabs></div></CardContent></Card>
      {mediaQuery.isLoading ? <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((asset) => { const meta = kindMeta[asset.kind]; const Icon = meta.icon; return <Card key={asset.id} className="overflow-hidden"><CardContent className="p-4"><div className="flex gap-3"><span className={`rounded-lg p-2 ${meta.tone}`}><Icon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="flex items-start gap-2"><p className="truncate font-semibold">{asset.title}</p>{asset.managed && <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />}</div><p className="mt-1 truncate text-xs text-muted-foreground">{asset.url}</p><p className="mt-3 text-xs text-muted-foreground">{asset.usedBy.length} utilisation(s) · {asset.kind}</p></div></div><div className="mt-4 flex items-center justify-between"><a className="text-xs font-medium text-primary hover:underline" href={asset.url} target="_blank" rel="noreferrer">Prévisualiser</a><Button size="sm" variant="outline" onClick={() => openEdit(asset)}><Pencil className="mr-1 h-3.5 w-3.5" />Gérer</Button></div></CardContent></Card>; })}{filtered.length === 0 && <div className="col-span-full py-20 text-center text-sm text-muted-foreground">Aucun média ne correspond à la recherche.</div>}</div>}
    </main>
    <Dialog open={adding} onOpenChange={setAdding}><DialogContent><DialogHeader><DialogTitle>Ajouter un média</DialogTitle><DialogDescription>Importez un fichier léger ou enregistrez une URL déjà disponible.</DialogDescription></DialogHeader><div className="space-y-4"><div className="grid gap-2"><Label>Type</Label><Select value={newKind} onValueChange={(value) => setNewKind(value as MediaKind)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{kinds.map((entry) => <SelectItem key={entry} value={entry}>{kindMeta[entry].label}</SelectItem>)}</SelectContent></Select></div><div className="grid gap-2"><Label>Titre</Label><Input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="Ex. Guide de démarrage n8n" /></div><div className="grid gap-2"><Label>URL existante</Label><Input value={newUrl} onChange={(event) => setNewUrl(event.target.value)} placeholder="/api/assets/... ou https://..." /></div><div className="flex items-center gap-2"><span className="h-px flex-1 bg-border" /><span className="text-xs text-muted-foreground">ou</span><span className="h-px flex-1 bg-border" /></div><input ref={uploadRef} className="hidden" type="file" onChange={(event) => { const file = event.target.files?.[0] || null; setUploadFile(file); if (file) setNewKind(inferKind(file)); }} /><Button type="button" variant="outline" onClick={() => uploadRef.current?.click()}>{uploadFile ? uploadFile.name : "Choisir un fichier (max. 8 Mo)"}</Button></div><DialogFooter><Button variant="outline" onClick={() => setAdding(false)}>Annuler</Button><Button disabled={(!newUrl.trim() && !uploadFile) || (!newTitle.trim() && !uploadFile) || saveMutation.isPending || uploadMutation.isPending} onClick={() => uploadFile ? upload() : addReference()}>{saveMutation.isPending || uploadMutation.isPending ? "Ajout…" : "Ajouter"}</Button></DialogFooter></DialogContent></Dialog>
    <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}><DialogContent className="max-w-xl"><DialogHeader><DialogTitle>Gérer le média</DialogTitle><DialogDescription>Les références utilisées par des cours sont protégées. Remplacez-les avant de retirer le média.</DialogDescription></DialogHeader>{editing && <div className="space-y-4"><div className="grid gap-2"><Label>Titre</Label><Input value={title} onChange={(event) => setTitle(event.target.value)} /></div><div className="grid gap-2"><Label>Type</Label><Select value={editKind} onValueChange={(value) => setEditKind(value as MediaKind)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{kinds.map((entry) => <SelectItem key={entry} value={entry}>{kindMeta[entry].label}</SelectItem>)}</SelectContent></Select></div><div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground break-all">{editing.url}</div><div className="rounded-lg border p-3"><p className="font-medium text-sm">Utilisations ({editing.usedBy.length})</p><ul className="mt-2 max-h-24 overflow-y-auto space-y-1 text-xs text-muted-foreground">{editing.usedBy.length ? editing.usedBy.map((usage: string) => <li key={usage}>{usage}</li>) : <li>Ce média n’est pas encore utilisé.</li>}</ul></div><div className="rounded-lg border border-amber-200 bg-amber-50 p-3"><Label className="text-amber-900">Remplacer dans tous les cours concernés</Label><div className="mt-2 flex gap-2"><Input value={replaceUrl} onChange={(event) => setReplaceUrl(event.target.value)} placeholder="Nouvelle URL /api/assets/..." /><Button variant="outline" disabled={!replaceUrl || replaceMutation.isPending} onClick={replace}>Remplacer</Button></div></div></div>}<DialogFooter><Button variant="destructive" disabled={!editing || editing.usedBy.length > 0 || removeMutation.isPending} title={editing?.usedBy.length ? "Remplacez les usages avant suppression" : undefined} onClick={remove}><Trash2 className="mr-2 h-4 w-4" />Retirer</Button><Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button><Button disabled={saveMutation.isPending || !title.trim()} onClick={save}>Sauvegarder</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}
