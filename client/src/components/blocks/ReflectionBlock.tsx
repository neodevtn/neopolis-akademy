import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const text = (value: unknown, lang: string) => typeof value === "string"
  ? value
  : value && typeof value === "object"
    ? String((value as Record<string, unknown>)[lang] || (value as Record<string, unknown>).fr || (value as Record<string, unknown>).en || "")
    : "";

/** Generic learner reflection block; it never produces a hidden score or fabricated automated evaluation. */
export function ReflectionBlock({ block, lang, onComplete, onSubmit }: { block: any; lang: string; onComplete: (id: string) => void; onSubmit?: (input: { id: string; answer: string }) => Promise<unknown> }) {
  const id = String(block.id || "reflection");
  const storageKey = `neopolis-reflection:${id}`;
  const minimumCharacters = Math.max(1, Number(block.minimumCharacters || 1));
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (typeof saved?.answer === "string") setAnswer(saved.answer);
      if (saved?.submitted) { setSubmitted(true); onComplete(id); }
    } catch { /* Storage is an optional convenience only. */ }
  }, [id, onComplete, storageKey]);
  const submit = () => {
    if (answer.trim().length < minimumCharacters) return;
    setSubmitting(true);
    const persist = onSubmit ? onSubmit({ id, answer }) : Promise.resolve();
    void persist.then(() => {
      try { localStorage.setItem(storageKey, JSON.stringify({ answer, submitted: true, updatedAt: new Date().toISOString() })); } catch { /* Completion remains available in the session. */ }
      setSubmitted(true);
      onComplete(id);
    }).finally(() => setSubmitting(false));
  };
  return <section className="my-5 rounded-2xl border border-violet-200 bg-violet-50/40 p-5"><h3 className="text-lg font-bold text-foreground">{text(block.title, lang) || (lang === "fr" ? "Retour critique" : "Critical reflection")}</h3><p className="mt-2 leading-relaxed text-muted-foreground">{text(block.prompt, lang)}</p><textarea value={answer} onChange={(event) => setAnswer(event.target.value)} disabled={submitted || submitting} className="mt-4 min-h-36 w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground" placeholder={lang === "fr" ? "Décrivez votre analyse et vos limites…" : "Describe your analysis and limitations…"} />{!submitted && <p className="mt-2 text-xs text-muted-foreground">{lang === "fr" ? `Au moins ${minimumCharacters} caractères sont requis.` : `At least ${minimumCharacters} characters are required.`}</p>}<Button type="button" className="mt-3" disabled={submitted || submitting || answer.trim().length < minimumCharacters} onClick={submit}>{submitted ? <><CheckCircle2 className="mr-2 h-4 w-4" />{lang === "fr" ? "Réflexion enregistrée" : "Reflection saved"}</> : (submitting ? (lang === "fr" ? "Enregistrement…" : "Saving…") : (lang === "fr" ? "Enregistrer la réflexion" : "Save reflection"))}</Button></section>;
}
