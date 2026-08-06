import React, { useState } from "react";
import { Timer, CheckCircle2, ChevronDown } from "lucide-react";
import PageContent from "@/pages/training/PageContent";

/**
 * Extract learner-friendly objectives from the raw grading prompt.
 * Strips XML tags like <exercise_objective>, <required_elements>, <grading_rules>, PASS/FAIL etc.
 * Returns 3-5 clean bullets for the learner.
 */
function extractLearnerObjectives(prompt: string): string[] {
  const bullets: string[] = [];
  
  // Extract required_elements content
  const reqMatch = prompt.match(/<required_elements>([\s\S]*?)<\/required_elements>/);
  if (reqMatch) {
    const lines = reqMatch[1].trim().split('\n').filter(l => l.trim());
    for (const line of lines) {
      const cleaned = line.replace(/^\d+[).]\s*/, '').trim();
      if (cleaned && cleaned.length > 5 && !cleaned.includes('PASS') && !cleaned.includes('FAIL')) {
        bullets.push(cleaned);
      }
    }
  }
  
  // If no required_elements, try exercise_objective
  if (bullets.length === 0) {
    const objMatch = prompt.match(/<exercise_objective>([\s\S]*?)<\/exercise_objective>/);
    if (objMatch) {
      const text = objMatch[1].trim();
      // Split into sentences
      const sentences = text.split(/\.\s+/).filter(s => s.trim().length > 10);
      for (const s of sentences.slice(0, 4)) {
        bullets.push(s.trim().replace(/\.$/, '') + '.');
      }
    }
  }
  
  // Fallback: if still empty but prompt has content without XML tags
  if (bullets.length === 0 && !prompt.includes('<exercise_objective>') && !prompt.includes('<grading_rules>')) {
    // It's a plain text prompt - show it as-is (max 3 lines)
    const lines = prompt.trim().split('\n').filter(l => l.trim()).slice(0, 3);
    bullets.push(...lines);
  }
  
  return bullets.slice(0, 5);
}

interface CloudExerciseBlockProps {
  block: any;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  blockIdx: number;
  onComplete?: (id: string) => void;
}

export function CloudExerciseBlock({ block, lang, t, blockIdx, onComplete }: CloudExerciseBlockProps) {
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
          <details className="border border-border rounded-lg bg-muted/30">
            <summary className="px-4 py-2.5 cursor-pointer text-sm font-semibold text-foreground hover:bg-muted/50 rounded-lg flex items-center gap-2">
              <ChevronDown className="w-4 h-4 transition-transform" />
              {t({ en: 'Setup & Instructions', fr: 'Préparation & Instructions' })}
            </summary>
            <div className="px-4 pb-3 text-sm text-muted-foreground prose prose-sm max-w-none">
              <PageContent content={tpInstructions} lang={lang} />
            </div>
          </details>
        )}

        {/* Steps */}
        {tpSteps.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold text-sm text-foreground">{t({ en: 'Steps', fr: 'Étapes' })}</p>
            {tpSteps.map((step: any, i: number) => {
              const stepContent = typeof step === 'string' ? step : (step.instructions_text || step.instruction_text || step.text || step.instruction || '');
              if (!stepContent) return null;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <div className="text-sm text-foreground whitespace-pre-wrap">
                    <PageContent content={stepContent} lang={lang} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Evaluation criteria - transformed into learner-friendly rubric */}
        {tpPrompt && (() => {
          // Parse the raw grading prompt into learner-friendly bullets
          const bullets = extractLearnerObjectives(tpPrompt);
          if (bullets.length === 0) return null;
          return (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="font-semibold text-sm text-amber-800 mb-2">{t({ en: 'What your work should demonstrate', fr: 'Ce que votre travail doit montrer' })}</p>
              <ul className="space-y-1">
                {bullets.map((bullet: string, i: number) => (
                  <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}

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
              onClick={() => {
                setSubmitted(true);
                const id = block.id || `cloud_exercise_${blockIdx}`;
                onComplete?.(id);
              }}
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
