import { useEffect, useState } from "react";
import { Lightbulb, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

export function CourseFeedbackPanel({ certificationId, courseId }: { certificationId: string; courseId: string }) {
  const feedbackQuery = trpc.training.getMyCourseFeedback.useQuery({ courseId });
  const utils = trpc.useUtils();
  const [rating, setRating] = useState<number | null>(null);
  const [contentRating, setContentRating] = useState<number | null>(null);
  const [experienceRating, setExperienceRating] = useState<number | null>(null);
  const [difficultyRating, setDifficultyRating] = useState<number | null>(null);
  const [category, setCategory] = useState<"content" | "exercise" | "media" | "technical" | "suggestion" | "other">("content");
  const [comment, setComment] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const save = trpc.training.submitCourseFeedback.useMutation({
    onSuccess: () => utils.training.getMyCourseFeedback.invalidate({ courseId }),
  });

  useEffect(() => {
    if (!feedbackQuery.data) return;
    setRating(feedbackQuery.data.rating);
    setContentRating(feedbackQuery.data.contentRating || null);
    setExperienceRating(feedbackQuery.data.experienceRating || null);
    setDifficultyRating(feedbackQuery.data.difficultyRating || null);
    setCategory(feedbackQuery.data.category || "content");
    setComment(feedbackQuery.data.comment || "");
    setSuggestion(feedbackQuery.data.suggestion || "");
  }, [feedbackQuery.data]);

  const RatingControl = ({ label, value, onChange }: { label: string; value: number | null; onChange: (rating: number) => void }) => (
    <div>
      <p className="text-xs font-medium text-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-0.5" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((item) => <button key={item} type="button" role="radio" aria-checked={value === item} aria-label={`${item} étoiles sur 5`} onClick={() => onChange(item)} className="rounded-md p-0.5 text-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Star className={`h-5 w-5 ${value !== null && item <= value ? "fill-current" : ""}`} /></button>)}
      </div>
    </div>
  );

  return (
    <section className="mt-5 w-full rounded-xl border border-border bg-background/70 p-4" aria-labelledby="course-feedback-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 id="course-feedback-title" className="text-sm font-semibold text-foreground">Votre avis sur ce cours</h4>
          <p className="mt-1 text-xs text-muted-foreground">Votre évaluation et vos suggestions sont privées : elles sont visibles uniquement par l’équipe pédagogique.</p>
        </div>
        {feedbackQuery.data ? <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Avis enregistré</span> : null}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3"><RatingControl label="Satisfaction globale" value={rating} onChange={setRating} /><RatingControl label="Qualité du contenu" value={contentRating} onChange={setContentRating} /><RatingControl label="Expérience d’apprentissage" value={experienceRating} onChange={setExperienceRating} /></div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center"><label className="text-xs font-medium text-foreground">Difficulté perçue</label><select value={difficultyRating || ""} onChange={(event) => setDifficultyRating(event.target.value ? Number(event.target.value) : null)} className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"><option value="">Non précisée</option><option value="1">Très facile</option><option value="2">Facile</option><option value="3">Adaptée</option><option value="4">Difficile</option><option value="5">Très difficile</option></select><label className="text-xs font-medium text-foreground">Sujet</label><select value={category} onChange={(event) => setCategory(event.target.value as typeof category)} className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"><option value="content">Contenu</option><option value="exercise">Exercices</option><option value="media">Médias</option><option value="technical">Technique</option><option value="suggestion">Suggestion</option><option value="other">Autre</option></select></div>
      <label className="mt-4 block text-xs font-medium text-foreground">Votre retour<textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={4000} placeholder="Ce qui vous a aidé, ce qui mérite d’être amélioré…" className="mt-1.5 min-h-20 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal text-foreground" /></label>
      <label className="mt-3 block text-xs font-medium text-foreground"><span className="inline-flex items-center gap-1"><Lightbulb className="h-3.5 w-3.5 text-amber-500" />Suggestion d’amélioration</span><textarea value={suggestion} onChange={(event) => setSuggestion(event.target.value)} maxLength={4000} placeholder="Une idée concrète pour améliorer ce cours…" className="mt-1.5 min-h-20 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal text-foreground" /></label>
      <div className="mt-3 flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{comment.length + suggestion.length}/8000</span><Button size="sm" disabled={!rating || save.isPending} onClick={() => rating && save.mutate({ certificationId, courseId, rating, contentRating: contentRating || undefined, experienceRating: experienceRating || undefined, difficultyRating: difficultyRating || undefined, category, comment: comment.trim() || undefined, suggestion: suggestion.trim() || undefined })}>{save.isPending ? "Enregistrement…" : feedbackQuery.data ? "Mettre à jour mon avis" : "Envoyer mon avis"}</Button></div>
    </section>
  );
}
