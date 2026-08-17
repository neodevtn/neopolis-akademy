import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { moveItem } from "@shared/lessonManagement";

const titleOf = (value: any, fallback: string) => typeof value === "string" ? value : value?.fr || value?.en || fallback;

function createChapter(seed = Date.now().toString(36)) {
  return { id: `chapter_${seed}`, title: { fr: "Nouvel écran", en: "New screen" }, type: "content", blocks: [{ type: "content", body: { fr: "", en: "" } }] };
}

function duplicateChapter(chapter: any, seed = Date.now().toString(36)) {
  const copy = JSON.parse(JSON.stringify(chapter));
  copy.id = `${chapter?.id || "chapter"}_copy_${seed}`;
  copy.title = typeof chapter?.title === "object" ? { ...chapter.title, fr: `${chapter.title.fr || chapter.title.en || "Écran"} — copie` } : { fr: `${chapter?.title || "Écran"} — copie`, en: chapter?.title || "Screen copy" };
  return copy;
}

export function ChapterManager({ chapters, activeChapterIndex, onSelect, onChange }: { chapters: any[]; activeChapterIndex: number; onSelect: (index: number) => void; onChange: (chapters: any[], activeIndex: number) => void }) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const add = () => { const next = [...chapters, createChapter()]; onChange(next, next.length - 1); };
  const remove = (index: number) => {
    if (chapters.length <= 1) return;
    if (!window.confirm(`Supprimer « ${titleOf(chapters[index]?.title, "cet écran")} » ?`)) return;
    const next = chapters.filter((_: any, itemIndex: number) => itemIndex !== index);
    onChange(next, Math.max(0, Math.min(activeChapterIndex, next.length - 1)));
  };
  return <div className="mt-2 space-y-1"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-emerald-800">Écrans / chapitres</span><Button type="button" size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs" onClick={add}><Plus className="h-3.5 w-3.5" /> Ajouter</Button></div><p className="text-xs text-muted-foreground">Glissez la poignée pour modifier l’ordre des écrans.</p>{chapters.map((chapter, index) => <div key={chapter.id || index} draggable onDragStart={() => setDraggedIndex(index)} onDragEnd={() => setDraggedIndex(null)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedIndex !== null && draggedIndex !== index) onChange(moveItem(chapters, draggedIndex, index), index); setDraggedIndex(null); }} className={`flex items-center gap-1 rounded p-1 ${draggedIndex === index ? "border border-emerald-400 opacity-50" : index === activeChapterIndex ? "bg-emerald-100" : "hover:bg-white/70"}`}><span className="cursor-grab px-1 text-emerald-700 active:cursor-grabbing" aria-label="Glisser pour réorganiser"><GripVertical className="h-3.5 w-3.5" /></span><button type="button" className="min-w-0 flex-1 truncate px-1 text-left text-xs text-gray-700" onClick={() => onSelect(index)}>{index + 1}. {titleOf(chapter.title, `Écran ${index + 1}`)}</button><Button type="button" size="icon" variant="ghost" className="h-6 w-6" disabled={index === 0} onClick={() => onChange(moveItem(chapters, index, index - 1), index - 1)} aria-label="Monter l’écran"><ChevronUp className="h-3.5 w-3.5" /></Button><Button type="button" size="icon" variant="ghost" className="h-6 w-6" disabled={index === chapters.length - 1} onClick={() => onChange(moveItem(chapters, index, index + 1), index + 1)} aria-label="Descendre l’écran"><ChevronDown className="h-3.5 w-3.5" /></Button><Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={() => { const next = [...chapters]; next.splice(index + 1, 0, duplicateChapter(chapter)); onChange(next, index + 1); }} aria-label="Dupliquer l’écran"><Copy className="h-3.5 w-3.5" /></Button><Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-red-600 hover:text-red-700" disabled={chapters.length <= 1} onClick={() => remove(index)} aria-label="Supprimer l’écran"><Trash2 className="h-3.5 w-3.5" /></Button></div>)}</div>;
}
