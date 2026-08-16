import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { MediaAsset } from "@shared/contentStudio";
import { toast } from "sonner";
import { createMediaBlock, linkMediaToBlock } from "@/lib/mediaInsertion";

type Destination = "new" | "existing";

export function MediaCourseInsertionDialog({ asset, onOpenChange }: { asset: MediaAsset | null; onOpenChange: (open: boolean) => void }) {
  const coursesQuery = trpc.adminContent.listCourses.useQuery(undefined, { enabled: Boolean(asset) });
  const [courseId, setCourseId] = useState("");
  const [lessonIndex, setLessonIndex] = useState("0");
  const [chapterIndex, setChapterIndex] = useState("0");
  const [destination, setDestination] = useState<Destination>("new");
  const [targetBlockIndex, setTargetBlockIndex] = useState("");
  const courseQuery = trpc.adminContent.getCourse.useQuery({ courseId }, { enabled: Boolean(asset && courseId) });
  const updateMutation = trpc.adminContent.updateChapterBlocks.useMutation();

  const lessons = courseQuery.data?.lessons || [];
  const lesson = lessons[Number(lessonIndex)];
  const chapter = lesson?.chapters?.[Number(chapterIndex)];
  const compatibleBlocks = useMemo(() => (chapter?.blocks || []).map((block: any, index: number) => ({ block, index })).filter(({ block }: any) => ["content", "video", "download"].includes(block.type)), [chapter]);

  const resetCourse = (value: string) => { setCourseId(value); setLessonIndex("0"); setChapterIndex("0"); setTargetBlockIndex(""); };
  const insert = async () => {
    if (!asset || !courseId || !chapter) return;
    const blocks = [...(chapter.blocks || [])];
    if (destination === "existing") {
      const index = Number(targetBlockIndex);
      if (!Number.isInteger(index) || !blocks[index]) { toast.error("Sélectionnez un bloc compatible."); return; }
      blocks[index] = linkMediaToBlock(blocks[index], asset);
    } else {
      blocks.push(createMediaBlock(asset));
    }
    try {
      const result = await updateMutation.mutateAsync({ courseId, lessonIndex: Number(lessonIndex), chapterIndex: Number(chapterIndex), blocks });
      if (!result.success) throw new Error(result.error || "Le chapitre ciblé est introuvable.");
      toast.success(destination === "new" ? "Bloc média ajouté au chapitre." : "Média inséré dans le bloc existant.");
      onOpenChange(false);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Insertion impossible."); }
  };

  if (!asset) return null;
  return <Dialog open onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl">
      <DialogHeader><DialogTitle>Ajouter « {asset.title} » dans un cours</DialogTitle><DialogDescription>Choisissez le cours, le chapitre et la manière d’utiliser ce média. Aucun bloc manuel à recréer.</DialogDescription></DialogHeader>
      <div className="space-y-4">
        <div className="grid gap-2"><Label>Cours</Label><Select value={courseId} onValueChange={resetCourse}><SelectTrigger><SelectValue placeholder="Sélectionner un cours" /></SelectTrigger><SelectContent>{(coursesQuery.data || []).map((course) => <SelectItem value={course.courseId} key={course.courseId}>{course.title}</SelectItem>)}</SelectContent></Select></div>
        {courseId && <div className="grid gap-3 sm:grid-cols-2"><div className="grid gap-2"><Label>Leçon</Label><Select value={lessonIndex} onValueChange={(value) => { setLessonIndex(value); setChapterIndex("0"); setTargetBlockIndex(""); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{lessons.map((item: any, index: number) => <SelectItem key={index} value={String(index)}>{index + 1}. {typeof item.title === "string" ? item.title : item.title?.fr || item.title?.en || "Leçon"}</SelectItem>)}</SelectContent></Select></div><div className="grid gap-2"><Label>Chapitre</Label><Select value={chapterIndex} onValueChange={(value) => { setChapterIndex(value); setTargetBlockIndex(""); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(lesson?.chapters || []).map((item: any, index: number) => <SelectItem key={index} value={String(index)}>{index + 1}. {typeof item.title === "string" ? item.title : item.title?.fr || item.title?.en || "Chapitre"}</SelectItem>)}</SelectContent></Select></div></div>}
        {chapter && <><Separator /><RadioGroup value={destination} onValueChange={(value) => setDestination(value as Destination)} className="gap-3"><label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3"><RadioGroupItem value="new" className="mt-0.5" /><span><strong className="block text-sm">Créer un nouveau bloc média</strong><span className="text-xs text-muted-foreground">Crée automatiquement un bloc {asset.kind === "youtube" || asset.kind === "video" || asset.kind === "audio" ? "vidéo / audio" : asset.kind === "image" ? "contenu avec image" : "téléchargement"} à la fin du chapitre.</span></span></label><label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3"><RadioGroupItem value="existing" className="mt-0.5" /><span><strong className="block text-sm">Insérer dans un bloc existant</strong><span className="text-xs text-muted-foreground">Attache le média à un bloc texte, vidéo ou téléchargement compatible.</span></span></label></RadioGroup>{destination === "existing" && <div className="grid gap-2"><Label>Bloc cible compatible</Label><Select value={targetBlockIndex} onValueChange={setTargetBlockIndex}><SelectTrigger><SelectValue placeholder="Sélectionner un bloc" /></SelectTrigger><SelectContent>{compatibleBlocks.map(({ block, index }: any) => <SelectItem key={index} value={String(index)}>Bloc {index + 1} · {block.type} · {typeof block.title === "string" ? block.title : block.title?.fr || block.title?.en || "Sans titre"}</SelectItem>)}</SelectContent></Select>{compatibleBlocks.length === 0 && <p className="text-xs text-amber-700">Aucun bloc compatible : créez plutôt un nouveau bloc média.</p>}</div>}</>}
      </div>
      <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button><Button disabled={!courseId || !chapter || updateMutation.isPending || (destination === "existing" && !targetBlockIndex)} onClick={insert}>{updateMutation.isPending ? "Insertion…" : destination === "new" ? "Créer le bloc média" : "Insérer le média"}</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
