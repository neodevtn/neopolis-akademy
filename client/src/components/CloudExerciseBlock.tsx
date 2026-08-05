import React, { useState } from "react";
import { Timer, CheckCircle2, ChevronDown } from "lucide-react";
import PageContent from "@/pages/training/PageContent";

interface CloudExerciseBlockProps {
  block: any;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  blockIdx: number;
}

export function CloudExerciseBlock({ block, lang, t, blockIdx }: CloudExerciseBlockProps) {
  const [submitted, setSubmitted] = useState(false);
  const [answer, setAnswer] = useState("");

  const tpTitle = typeof block.title === 'object' ? (block.title?.[lang] || block.title?.en || '') : (block.title || '');
  const tpAssignment = block.assignment || '';
  const tpInstructions = block.instructions || '';
  const tpSteps = block.steps || [];
  const tpHint = block.hint || '';
  const tpSolution = block.solution || '';
  const tpSuccess = block.successMessage || '';
  const tpPrompt = block.prompt || '';
  const tpNonDl = block.nonDownloadableFiles || [];

  return (
    <div className="my-6 rounded-xl border-2 border-blue-200 overflow-hidden bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border-b border-blue-200">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600">
          <Timer className="w-4 h-4" />
        </span>
        <span className="font-semibold text-foreground">{tpTitle}</span>
        <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded bg-blue-100 text-blue-700">TP</span>
        {block.xp > 0 && <span className="ml-auto text-xs text-blue-600 font-medium">{block.xp} XP</span>}
      </div>

      <div className="p-4 space-y-4">
        {/* Assignment / Objectif */}
        {tpAssignment && (
          <div className="prose prose-sm max-w-none text-foreground">
            <p className="font-semibold text-sm text-blue-800 mb-1">{t({ en: 'Objective', fr: 'Objectif' })}</p>
            <PageContent content={tpAssignment} lang={lang} />
          </div>
        )}

        {/* Instructions */}
        {tpInstructions && (
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-semibold text-sm text-foreground mb-2">{t({ en: 'Instructions', fr: 'Instructions' })}</p>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <PageContent content={tpInstructions} lang={lang} />
            </div>
          </div>
        )}

        {/* Steps */}
        {tpSteps.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold text-sm text-foreground">{t({ en: 'Steps', fr: 'Étapes' })}</p>
            {tpSteps.map((step: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <div className="text-sm text-foreground">
                  <PageContent content={typeof step === 'string' ? step : (step.text || step.instruction || '')} lang={lang} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Evaluation criteria */}
        {tpPrompt && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="font-semibold text-sm text-amber-800 mb-1">{t({ en: 'Evaluation criteria', fr: "Critères d'évaluation" })}</p>
            <p className="text-sm text-amber-700">{tpPrompt}</p>
          </div>
        )}

        {/* Hint (collapsible) */}
        {tpHint && (
          <details className="border border-border rounded-lg">
            <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
              <ChevronDown className="w-4 h-4" />
              {t({ en: '💡 Hint', fr: '💡 Indice' })}
            </summary>
            <div className="px-4 pb-3 text-sm text-muted-foreground">
              <PageContent content={tpHint} lang={lang} />
            </div>
          </details>
        )}

        {/* Non-downloadable files notice */}
        {tpNonDl.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 mb-1">
              {t({ en: 'DataCamp VM files (not directly downloadable — rebuild from instructions)', fr: 'Fichiers DataCamp VM (non téléchargeables — reconstruire depuis les instructions)' })}
            </p>
            <p className="text-xs text-gray-400 font-mono">{tpNonDl.join(', ')}</p>
          </div>
        )}

        {/* Answer zone + Submit button */}
        <div className="border border-border rounded-lg p-4 bg-muted/20">
          <p className="font-semibold text-sm text-foreground mb-2">
            {t({ en: 'Your answer / Proof of completion', fr: 'Votre réponse / Preuve de réalisation' })}
          </p>
          <textarea
            className="w-full min-h-[100px] p-3 rounded-lg border border-border bg-background text-sm text-foreground resize-y placeholder:text-muted-foreground"
            placeholder={t({ en: 'Describe what you did, paste your workflow JSON, or note the result...', fr: 'Décrivez ce que vous avez fait, collez votre workflow JSON, ou notez le résultat...' })}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={submitted}
          />
          {!submitted && (
            <button
              onClick={() => setSubmitted(true)}
              disabled={answer.trim().length === 0}
              className="mt-3 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t({ en: 'Submit', fr: 'Valider' })}
            </button>
          )}
          {submitted && (
            <div className="mt-3 flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              {t({ en: 'Submitted! You can now view the solution.', fr: 'Validé ! Vous pouvez maintenant voir la correction.' })}
            </div>
          )}
        </div>

        {/* Solution (only visible after submission) */}
        {tpSolution && (
          submitted ? (
            <details className="border border-green-200 rounded-lg bg-green-50/50" open>
              <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-green-700 hover:text-green-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {t({ en: 'Solution', fr: 'Correction' })}
              </summary>
              <div className="px-4 pb-3 text-sm text-green-800 whitespace-pre-wrap font-mono bg-green-50 rounded-b-lg">
                {tpSolution}
              </div>
            </details>
          ) : (
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-center">
              <p className="text-sm text-gray-400 italic">
                {t({ en: '🔒 Submit your answer to unlock the solution', fr: '🔒 Validez votre réponse pour débloquer la correction' })}
              </p>
            </div>
          )
        )}

        {/* Success message */}
        {tpSuccess && submitted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700">{tpSuccess}</p>
          </div>
        )}
      </div>
    </div>
  );
}
