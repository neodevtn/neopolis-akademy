import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

export function CourseFeedbackPanel({ certificationId, courseId }: { certificationId: string; courseId: string }) {
  const feedbackQuery = trpc.training.getMyCourseFeedback.useQuery({ courseId });
  const utils = trpc.useUtils();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const save = trpc.training.submitCourseFeedback.useMutation({
    onSuccess: () => utils.training.getMyCourseFeedback.invalidate({ courseId }),
  });

  useEffect(() => {
    if (!feedbackQuery.data) return;
    setRating(feedbackQuery.data.rating);
    setComment(feedbackQuery.data.comment || "");
  }, [feedbackQuery.data]);

  return (
    <section className="mt-5 w-full rounded-xl border border-border bg-background/70 p-4" aria-labelledby="course-feedback-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 id="course-feedback-title" className="text-sm font-semibold text-foreground">Votre avis sur ce cours</h4>
          <p className="mt-1 text-xs text-muted-foreground">Votre note et votre commentaire sont visibles uniquement par l’équipe administrative pour améliorer ce contenu.</p>
        </div>
        {feedbackQuery.data ? <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Avis enregistré</span> : null}
      </div>
      <div className="mt-3 flex items-center gap-1" role="radiogroup" aria-label="Note du cours de 1 à 3 étoiles">
        {[1, 2, 3].map((value) => <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} étoile${value > 1 ? "s" : ""} sur 3`} onClick={() => setRating(value)} className="rounded-md p-1 text-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Star className={`h-6 w-6 ${rating !== null && value <= rating ? "fill-current" : ""}`} /></button>)}
        <span className="ml-2 text-xs text-muted-foreground">{rating ? `${rating}/3` : "Choisissez une note"}</span>
      </div>
      <label className="mt-3 block text-xs font-medium text-foreground">Commentaire facultatif<textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={4000} placeholder="Ce qui vous a aidé, ce qui mérite d’être amélioré…" className="mt-1.5 min-h-20 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal text-foreground" /></label>
      <div className="mt-3 flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{comment.length}/4000</span><Button size="sm" disabled={!rating || save.isPending} onClick={() => rating && save.mutate({ certificationId, courseId, rating, comment: comment.trim() || undefined })}>{save.isPending ? "Enregistrement…" : feedbackQuery.data ? "Mettre à jour" : "Enregistrer mon avis"}</Button></div>
    </section>
  );
}
