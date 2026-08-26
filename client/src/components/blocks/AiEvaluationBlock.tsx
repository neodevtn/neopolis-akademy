import { useState } from "react";
import { BrainCircuit, Send, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

interface AiEvaluationBlockProps {
  block: any;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  onComplete?: (id: string) => void;
  blockIdx: number;
  evaluationContext?: { certificationId: string; courseId: string; lessonIndex: number; chapterIndex: number };
}

export function AiEvaluationBlock({ block, lang, t, onComplete, blockIdx, evaluationContext }: AiEvaluationBlockProps) {
  const title = typeof block.title === "object" ? (block.title[lang] || block.title.en || "") : (block.title || "");
  const prompt = typeof block.prompt === "object" ? (block.prompt[lang] || block.prompt.en || "") : (block.prompt || "");
  const sampleAnswer = typeof block.sampleAnswer === "object" ? (block.sampleAnswer[lang] || block.sampleAnswer.en || "") : (block.sampleAnswer || "");
  const rubric = block.rubric || "";
  const maxScore = block.maxScore || 10;
  const minWords = block.minWords || 50;
  const passingScore = block.passingScore ?? maxScore * 0.7;
  const rubricCriteria = Array.isArray(block.rubricCriteria) ? block.rubricCriteria : [];
  const usesTrackedRubric = rubricCriteria.length > 0 && Boolean(evaluationContext);
  const resolvedRubricCriteria = rubricCriteria.map((criterion: any) => ({
    ...criterion,
    label: typeof criterion.label === "object" ? (criterion.label[lang] || criterion.label.en || criterion.label.fr || "") : criterion.label,
    description: typeof criterion.description === "object" ? (criterion.description[lang] || criterion.description.en || criterion.description.fr || "") : criterion.description,
  }));

  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<{ score: number; feedback: string; strengths: string[]; improvements: string[]; passed?: boolean; attemptNumber?: number } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showSample, setShowSample] = useState(false);

  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  // Use tRPC to call AI evaluation
  const evaluateMutation = trpc.training.evaluateAnswer.useMutation({
    onSuccess: (data: any) => {
      setEvaluation(data);
      setIsEvaluating(false);
      if (data.score >= passingScore && onComplete) {
        onComplete(block.id || `ai_eval_${blockIdx}`);
      }
    },
    onError: () => {
      setIsEvaluating(false);
      setEvaluation({ score: 0, feedback: t({ en: "Evaluation failed. Please try again.", fr: "Évaluation échouée. Veuillez réessayer." }), strengths: [], improvements: [] });
    },
  });
  const trackedEvaluationMutation = trpc.training.evaluateFreeResponse.useMutation({
    onSuccess: (data: any) => {
      setEvaluation(data);
      setIsEvaluating(false);
      if (data.passed && onComplete) onComplete(block.id || `ai_eval_${blockIdx}`);
    },
    onError: () => {
      setIsEvaluating(false);
      setEvaluation({ score: 0, feedback: t({ en: "The evaluation could not be completed. Please try again.", fr: "L’évaluation n’a pas pu être effectuée. Veuillez réessayer." }), strengths: [], improvements: [] });
    },
  });

  const handleEvaluate = () => {
    if (wordCount < minWords) return;
    setIsEvaluating(true);
    if (usesTrackedRubric && evaluationContext) {
      trackedEvaluationMutation.mutate({
        ...evaluationContext,
        blockId: block.id || `ai_eval_${blockIdx}`,
        answer,
        prompt,
        rubric: resolvedRubricCriteria,
        maxScore,
        passingScore,
        lang: lang === "en" ? "en" : "fr",
      });
      return;
    }
    evaluateMutation.mutate({ answer, rubric, prompt, maxScore, lang });
  };

  const handleReset = () => {
    setAnswer("");
    setEvaluation(null);
    setShowSample(false);
  };

  const scoreColor = evaluation
    ? evaluation.score >= maxScore * 0.8 ? "text-green-600" :
      evaluation.score >= maxScore * 0.5 ? "text-amber-600" : "text-red-600"
    : "";

  return (
    <div className="my-6 rounded-xl border border-border overflow-hidden bg-card">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-fuchsia-50 dark:bg-fuchsia-950/20">
        <BrainCircuit className="w-5 h-5 text-fuchsia-600" />
        <span className="font-semibold text-foreground">{title || t({ en: "AI Evaluation", fr: "Évaluation IA" })}</span>
      </div>
      <div className="p-4 space-y-4">
        {/* Prompt */}
        <div className="text-sm leading-relaxed text-foreground"><Streamdown>{prompt}</Streamdown></div>
        {usesTrackedRubric && (
          <div className="rounded-lg border border-fuchsia-200 bg-fuchsia-50/50 p-3 text-sm text-foreground dark:border-fuchsia-800 dark:bg-fuchsia-950/10">
            <p className="font-medium">{t({ en: "What your response must show", fr: "Ce que votre réponse doit montrer" })}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {rubricCriteria.map((criterion: any) => <li key={criterion.id}>{typeof criterion.label === "object" ? (criterion.label[lang] || criterion.label.en) : criterion.label}</li>)}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">{t({ en: `Passing threshold: ${passingScore}/${maxScore}.`, fr: `Seuil de réussite : ${passingScore}/${maxScore}.` })}</p>
          </div>
        )}

        {/* Answer textarea */}
        <div>
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={t({ en: "Write your answer here...", fr: "Écrivez votre réponse ici..." })}
            rows={8}
            className="resize-y"
            disabled={isEvaluating}
          />
          <div className="flex items-center justify-between mt-1">
            <span className={`text-xs ${wordCount >= minWords ? "text-green-600" : "text-muted-foreground"}`}>
              {wordCount}/{minWords} {t({ en: "words min.", fr: "mots min." })}
            </span>
            <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${wordCount >= minWords ? "bg-green-500" : wordCount >= minWords * 0.5 ? "bg-amber-500" : "bg-red-400"}`}
                style={{ width: `${Math.min(100, (wordCount / minWords) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Evaluation result */}
        {evaluation && (
          <div className="rounded-lg border border-fuchsia-200 dark:border-fuchsia-800 bg-fuchsia-50/50 dark:bg-fuchsia-950/10 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className={`text-2xl font-bold ${scoreColor}`}>{evaluation.score}/{maxScore}</div>
              <div className="text-sm text-muted-foreground">{t({ en: "AI Score", fr: "Score IA" })}</div>
              {evaluation.attemptNumber && <div className="text-xs text-muted-foreground">{t({ en: `Attempt ${evaluation.attemptNumber}`, fr: `Tentative ${evaluation.attemptNumber}` })}</div>}
            </div>
            <div className="text-sm text-foreground"><Streamdown>{evaluation.feedback}</Streamdown></div>
            {usesTrackedRubric && <p className={`text-sm font-medium ${evaluation.passed ? "text-green-700" : "text-amber-700"}`}>{evaluation.passed ? t({ en: "Requirement met: you may continue.", fr: "Seuil atteint : vous pouvez continuer." }) : t({ en: "Requirement not yet met: refine your response and try again.", fr: "Seuil non atteint : améliorez votre réponse et réessayez." })}</p>}
            {evaluation.strengths.length > 0 && (
              <div>
                <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">{t({ en: "Strengths:", fr: "Points forts :" })}</p>
                <ul className="text-xs text-green-600 dark:text-green-400 space-y-0.5">
                  {evaluation.strengths.map((s, i) => <li key={i}><Streamdown>{s}</Streamdown></li>)}
                </ul>
              </div>
            )}
            {evaluation.improvements.length > 0 && (
              <div>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">{t({ en: "To improve:", fr: "À améliorer :" })}</p>
                <ul className="text-xs text-amber-600 dark:text-amber-400 space-y-0.5">
                  {evaluation.improvements.map((s, i) => <li key={i}><Streamdown>{s}</Streamdown></li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Sample answer */}
        {showSample && sampleAnswer && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10 p-3">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">{t({ en: "Sample answer:", fr: "Exemple de réponse :" })}</p>
            <div className="text-sm text-foreground"><Streamdown>{sampleAnswer}</Streamdown></div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {!evaluation ? (
            <Button onClick={handleEvaluate} disabled={wordCount < minWords || isEvaluating} className="bg-fuchsia-600 hover:bg-fuchsia-700 gap-1">
              {isEvaluating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {isEvaluating ? t({ en: "Evaluating...", fr: "Évaluation..." }) : t({ en: "Evaluate with AI", fr: "Évaluer avec l'IA" })}
            </Button>
          ) : (
            <Button onClick={handleReset} variant="outline" className="gap-1">
              <RotateCcw className="w-3.5 h-3.5" />
              {t({ en: "Try again", fr: "Réessayer" })}
            </Button>
          )}
          {sampleAnswer && (
            <Button onClick={() => setShowSample(!showSample)} variant="ghost" className="text-amber-600 text-sm">
              {showSample ? t({ en: "Hide sample", fr: "Masquer l'exemple" }) : t({ en: "Show sample answer", fr: "Voir l'exemple" })}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
