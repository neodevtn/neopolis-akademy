import { useState } from "react";
import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const text = (value: unknown, lang: string) => typeof value === "string"
  ? value
  : value && typeof value === "object"
    ? String((value as Record<string, unknown>)[lang] || (value as Record<string, unknown>).fr || (value as Record<string, unknown>).en || "")
    : "";

function toSteps(value: unknown, lang: string): string[] {
  const source = text(value, lang);
  return source
    .split(/\n+/)
    .map((line) => line.trim().replace(/^(?:[-•*]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
}

/**
 * Reusable self-attested activity for a concrete, source-defined learner action.
 * Completion and the learner's evidence note are stored server-side before the
 * screen is unlocked.
 */
export function GuidedActionBlock({
  block,
  lang,
  completed = false,
  savedResponse = "",
  isSubmitting = false,
  onComplete,
}: {
  block: any;
  lang: string;
  completed?: boolean;
  savedResponse?: string;
  isSubmitting?: boolean;
  onComplete: (id: string, response: string) => Promise<void> | void;
}) {
  const steps = Array.isArray(block.steps) && block.steps.length
    ? block.steps.map((step: unknown) => text(step, lang)).filter(Boolean)
    : toSteps(block.body, lang);
  const expectedEvidence = text(block.expectedEvidence, lang);
  const actionId = String(block.id || "guided_action");
  const [response, setResponse] = useState(savedResponse);
  const [attested, setAttested] = useState(false);
  const canSave = response.trim().length >= 5 && attested && !isSubmitting;

  return (
    <section className="w-full min-w-0 max-w-full rounded-2xl border border-blue-200 bg-blue-50/60 p-5 sm:p-7">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800">
        <ClipboardCheck className="h-4 w-4" />
        {lang === "fr" ? "Action guidée" : "Guided action"}
      </p>
      {steps.length > 0 && (
        <ol className="mt-4 space-y-3">
          {steps.map((step: string, index: number) => (
            <li key={`${actionId}-${index}`} className="flex min-w-0 gap-3 rounded-xl bg-white/80 p-3 text-sm leading-relaxed text-slate-800">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">{index + 1}</span>
              <span className="min-w-0 break-words">{step}</span>
            </li>
          ))}
        </ol>
      )}
      {expectedEvidence && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-white p-4 text-sm leading-relaxed text-slate-700">
          <strong className="text-slate-900">{lang === "fr" ? "Preuve attendue :" : "Expected evidence:"}</strong> {expectedEvidence}
        </div>
      )}
      {completed ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800"><CheckCircle2 className="h-4 w-4" />{lang === "fr" ? "Travail enregistré — vous pouvez continuer." : "Work saved — you can continue."}</p>
          {savedResponse && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-emerald-950">{savedResponse}</p>}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${actionId}-response`}>{lang === "fr" ? "Votre note de réalisation" : "Your completion note"}</Label>
            <Textarea id={`${actionId}-response`} value={response} onChange={(event) => setResponse(event.target.value)} rows={4} maxLength={5000} placeholder={lang === "fr" ? "Décrivez brièvement ce que vous avez réalisé ou vérifié." : "Briefly describe what you completed or verified."} />
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-blue-200 bg-white p-3 text-sm leading-relaxed text-slate-700">
            <Checkbox checked={attested} onCheckedChange={(value) => setAttested(value === true)} className="mt-0.5" />
            <span>{lang === "fr" ? "J’atteste avoir réalisé cette action avec des données et un environnement autorisés." : "I confirm that I completed this action using authorized data and environment."}</span>
          </label>
          <Button disabled={!canSave} onClick={() => void onComplete(actionId, response.trim())}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {isSubmitting ? (lang === "fr" ? "Enregistrement…" : "Saving…") : (lang === "fr" ? "Enregistrer mon travail" : "Save my work")}
          </Button>
        </div>
      )}
    </section>
  );
}
