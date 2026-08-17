import { ArrowDown, ArrowUp, Film, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RecommendedVideo, RecommendationType } from "@/components/VideoRecommendations";

const TYPES: { value: RecommendationType; label: string }[] = [
  { value: "tutorial", label: "Tutoriel" },
  { value: "deep_dive", label: "Approfondissement" },
  { value: "complementary", label: "Complémentaire" },
  { value: "masterclass", label: "Masterclass" },
];

export function normalizeYouTubeId(value: string): string {
  const trimmed = value.trim();
  const matched = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
  return matched?.[1] || trimmed.replace(/[^A-Za-z0-9_-]/g, "");
}

export function LessonRecommendationEditor({
  videos,
  onChange,
  onRequestMedia,
}: {
  videos: RecommendedVideo[];
  onChange: (videos: RecommendedVideo[]) => void;
  onRequestMedia: () => void;
}) {
  const update = (index: number, patch: Partial<RecommendedVideo>) => onChange(videos.map((video, current) => current === index ? { ...video, ...patch } : video));
  const move = (index: number, offset: -1 | 1) => {
    const destination = index + offset;
    if (destination < 0 || destination >= videos.length) return;
    const next = [...videos];
    [next[index], next[destination]] = [next[destination], next[index]];
    onChange(next);
  };
  const addManual = () => onChange([...videos, { videoId: "", title: "Nouvelle recommandation", channel: "", type: "complementary", topics: [] }]);

  return (
    <section className="mb-6 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-950"><Film className="h-4 w-4 text-amber-700" /> Vidéos recommandées à la fin du module</h3>
          <p className="mt-1 text-xs text-amber-800">Cette sélection est propre à la leçon actuelle. Elle est affichée à l’apprenant après le dernier écran du module.</p>
        </div>
        <div className="flex shrink-0 gap-2"><Button type="button" size="sm" variant="outline" onClick={onRequestMedia}><Film className="mr-1 h-3.5 w-3.5" /> Bibliothèque médias</Button><Button type="button" size="sm" onClick={addManual} className="bg-amber-700 hover:bg-amber-800"><Plus className="mr-1 h-3.5 w-3.5" /> Ajouter</Button></div>
      </div>

      {videos.length === 0 ? <p className="mt-4 rounded-lg border border-dashed border-amber-300 bg-white/70 p-3 text-xs text-amber-800">Aucune vidéo explicite. La plateforme appliquera temporairement une suggestion du catalogue selon le contenu du module ; ajoutez une sélection pour la maîtriser totalement.</p> : <div className="mt-4 space-y-3">{videos.map((video, index) => <div key={`${video.videoId}-${index}`} className="rounded-lg border border-amber-200 bg-white p-3">
        <div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold text-amber-900">Recommandation {index + 1}</span><div className="flex items-center gap-1"><Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Remonter la recommandation"><ArrowUp className="h-3.5 w-3.5" /></Button><Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={index === videos.length - 1} onClick={() => move(index, 1)} aria-label="Descendre la recommandation"><ArrowDown className="h-3.5 w-3.5" /></Button><Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => onChange(videos.filter((_, current) => current !== index))} aria-label="Supprimer la recommandation"><Trash2 className="h-3.5 w-3.5" /></Button></div></div>
        <div className="grid gap-2 md:grid-cols-2"><label className="grid gap-1 text-[11px] font-medium text-muted-foreground">URL ou identifiant YouTube<Input value={video.videoId} onChange={(event) => update(index, { videoId: normalizeYouTubeId(event.target.value) })} placeholder="https://youtu.be/… ou identifiant" /></label><label className="grid gap-1 text-[11px] font-medium text-muted-foreground">Titre<Input value={video.title} onChange={(event) => update(index, { title: event.target.value })} /></label><label className="grid gap-1 text-[11px] font-medium text-muted-foreground">Chaîne<Input value={video.channel} onChange={(event) => update(index, { channel: event.target.value })} placeholder="Nom de la chaîne" /></label><label className="grid gap-1 text-[11px] font-medium text-muted-foreground">Format<select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={video.type} onChange={(event) => update(index, { type: event.target.value as RecommendationType })}>{TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label><label className="grid gap-1 text-[11px] font-medium text-muted-foreground md:col-span-2">Thèmes (séparés par des virgules)<Input value={video.topics.join(", ")} onChange={(event) => update(index, { topics: event.target.value.split(",").map((topic) => topic.trim()).filter(Boolean) })} placeholder="Claude, API, prompt engineering" /></label></div>
      </div>)}</div>}
    </section>
  );
}
