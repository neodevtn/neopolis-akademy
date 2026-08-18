import { BookOpen, ChevronDown, ChevronUp, Copy, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createLesson, duplicateLesson, moveItem } from "@shared/lessonManagement";
import { DEFAULT_COMPETENCIES } from "@shared/competencyFramework";

function label(value: any, fallback: string) {
  return typeof value === "string" ? value : value?.fr || value?.en || fallback;
}

function updateFrenchTitle(lesson: any, title: string) {
  return { ...lesson, title: typeof lesson.title === "object" ? { ...lesson.title, fr: title } : { fr: title, en: lesson.title || title } };
}

export function LessonManager({ lessons, activeLessonIndex, onSelect, onChange }: {
  lessons: any[];
  activeLessonIndex: number;
  onSelect: (index: number) => void;
  onChange: (lessons: any[], activeIndex: number) => void;
  competencyDefinitions?: Array<{ id: string; title: any }>;
}) {
  const addLesson = () => {
    const next = [...lessons, createLesson()];
    onChange(next, next.length - 1);
  };
  const removeLesson = (index: number) => {
    if (lessons.length <= 1) return;
    if (!window.confirm(`Supprimer « ${label(lessons[index]?.title, "cette leçon")} » ? Ses chapitres et les quiz de chapitre associés seront retirés.`)) return;
    const next = lessons.filter((_: any, itemIndex: number) => itemIndex !== index);
    onChange(next, Math.max(0, Math.min(activeLessonIndex, next.length - 1)));
  };
  return <div className="space-y-2">
    <div className="flex items-center justify-between"><h4 className="text-sm font-semibold text-gray-700">Leçons</h4><Button type="button" size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs" onClick={addLesson}><Plus className="h-3.5 w-3.5" /> Ajouter</Button></div>
    {lessons.map((lesson, index) => <div key={lesson.id || index} className={`rounded-md border p-1.5 ${index === activeLessonIndex ? "border-emerald-200 bg-emerald-50" : "border-transparent hover:bg-gray-50"}`}>
      <div className="flex items-center gap-1"><button type="button" className="min-w-0 flex-1 truncate px-1 text-left text-xs font-medium text-gray-700" onClick={() => onSelect(index)}><BookOpen className="mr-1 inline h-3 w-3 text-emerald-600" />{index + 1}. {label(lesson.title, `Leçon ${index + 1}`)}</button><Button type="button" size="icon" variant="ghost" className="h-6 w-6" disabled={index === 0} onClick={() => onChange(moveItem(lessons, index, index - 1), index - 1)} aria-label="Monter la leçon"><ChevronUp className="h-3.5 w-3.5" /></Button><Button type="button" size="icon" variant="ghost" className="h-6 w-6" disabled={index === lessons.length - 1} onClick={() => onChange(moveItem(lessons, index, index + 1), index + 1)} aria-label="Descendre la leçon"><ChevronDown className="h-3.5 w-3.5" /></Button><Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={() => { const next = [...lessons]; next.splice(index + 1, 0, duplicateLesson(lesson)); onChange(next, index + 1); }} aria-label="Dupliquer la leçon"><Copy className="h-3.5 w-3.5" /></Button><Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-red-600 hover:text-red-700" disabled={lessons.length <= 1} onClick={() => removeLesson(index)} aria-label="Supprimer la leçon"><Trash2 className="h-3.5 w-3.5" /></Button></div>
      {index === activeLessonIndex && <div className="mt-1 space-y-2"><input className="h-7 w-full rounded border border-emerald-100 bg-white px-2 text-xs" value={label(lesson.title, "")} onChange={(event) => { const next = [...lessons]; next[index] = updateFrenchTitle(next[index], event.target.value); onChange(next, index); }} aria-label="Titre français de la leçon" /><div className="rounded border border-emerald-100 bg-white p-2"><p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">Tags de compétences de la leçon</p><div className="grid grid-cols-1 gap-1 sm:grid-cols-2">{DEFAULT_COMPETENCIES.map((competency) => { const checked = (lesson.competencyTags || []).includes(competency.id); return <label key={competency.id} className="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-700"><input type="checkbox" checked={checked} onChange={() => { const current = lesson.competencyTags || []; const tags = checked ? current.filter((tag: string) => tag !== competency.id) : [...current, competency.id]; const next = [...lessons]; next[index] = { ...lesson, competencyTags: tags }; onChange(next, index); }} /><span>{label(competency.title, competency.id)}</span></label>; })}</div><p className="mt-1 text-[10px] text-gray-500">Les évaluations réussies de cette leçon contribuent uniquement aux compétences sélectionnées.</p></div></div>}
    </div>)}
  </div>;
}
