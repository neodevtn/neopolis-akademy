import React, { useRef, useState } from "react";
import { Timer, CheckCircle2, ChevronDown, Download, FileUp, FileJson, X } from "lucide-react";
import PageContent, { renderInlineFormatting } from "@/pages/training/PageContent";
import { Streamdown } from "streamdown";
import { hasRequiredAnswerLength, resolveLocalizedBlockText, resolveMinimumAnswerLength, resolvePostRevealReflectionOptions } from "./blocks/cloudExerciseValidation";
import { Button } from "@/components/ui/button";

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

export function adaptDataCampVmText(text: string, hasUnavailableVmFiles: boolean): string {
  if (!hasUnavailableVmFiles || !text) return text;
  return text
    .replace(/Vous avez été connecté automatiquement à votre propre compte n8n\s*!/gi, "Connectez-vous à votre instance n8n Cloud ou Docker.")
    .replace(/Sous le Desktop de la VM, allez dans Resources et ouvrez\s+([A-Za-z0-9_-]+\.[A-Za-z0-9]+)/gi, (_match, filename) => `Dans votre environnement n8n, reconstituez le workflow \`${String(filename).trim()}\` à partir des étapes, de l’indice et de la correction de ce TP`)
    .replace(/depuis\s+Desktop\/Resources/gi, "dans votre environnement après l’avoir reconstitué")
    .replace(/dans le dossier\s+Desktop\/Resources/gi, "dans votre environnement après sa reconstitution");
}

export function toCompetencyPercentage(score: number, maxScore: number): number {
  if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((score / maxScore) * 100)));
}

/** Keeps source-file notices truthful when the same filename is offered as a resource. */
export function getUnavailableExerciseResourceNames(block: { resources?: unknown; nonDownloadableFiles?: unknown; referencedFiles?: unknown }): string[] {
  const resources = Array.isArray(block.resources) ? block.resources : [];
  const availableNames = new Set(resources.map((resource: any) => String(resource?.filename || resource?.title || "").trim().toLowerCase()).filter(Boolean));
  const candidates = [
    ...(Array.isArray(block.nonDownloadableFiles) ? block.nonDownloadableFiles : []),
    ...(Array.isArray(block.referencedFiles) ? block.referencedFiles.filter((file: any) => !file?.local_path && file?.filename).map((file: any) => file.filename) : []),
  ];
  return Array.from(new Set(candidates.map((filename) => String(filename || "").trim()).filter((filename) => filename && !availableNames.has(filename.toLowerCase()))));
}

/** Server-graded activities already record competency evidence authoritatively. */
export function shouldRecordClientCompetency(block: { serverGradedAssessment?: unknown }, outcome?: { rubricEvaluated?: boolean }): boolean {
  return Boolean(outcome?.rubricEvaluated) && !(typeof block.serverGradedAssessment === "string" && block.serverGradedAssessment.length > 0);
}

interface CloudExerciseBlockProps {
  block: any;
  lang: string;
  t: (obj: { en: string; fr: string }) => string;
  blockIdx: number;
  onComplete?: (id: string, outcome?: { score: number; rubricEvaluated: boolean }) => void;
  evaluationContext?: { certificationId: string; courseId: string; lessonIndex: number; chapterIndex: number };
  onEvaluate?: (input: Record<string, unknown>) => Promise<{ score: number; feedback: string; strengths: string[]; improvements: string[]; passed: boolean; attemptNumber?: number; correction?: string; correctionResources?: Array<{ title?: string; url: string; filename?: string; sha256?: string; size?: number }> }>;
}

export function CloudExerciseBlock({ block, lang, t, blockIdx, onComplete, evaluationContext, onEvaluate }: CloudExerciseBlockProps) {
  const [submitted, setSubmitted] = useState(false);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<{ score: number; feedback: string; strengths: string[]; improvements: string[]; passed: boolean; attemptNumber?: number; correction?: string; correctionResources?: Array<{ title?: string; url: string; filename?: string; sha256?: string; size?: number }> } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [reflectionChoiceId, setReflectionChoiceId] = useState<string | null>(null);
  const [workflowJson, setWorkflowJson] = useState("");
  const [workflowFilename, setWorkflowFilename] = useState("");
  const [workflowUploadError, setWorkflowUploadError] = useState("");
  const workflowFileInputRef = useRef<HTMLInputElement>(null);

  const tpTitle = typeof block.title === 'object' ? (block.title?.[lang] || block.title?.en || '') : (block.title || '');
  const tpAssignment = resolveLocalizedBlockText(block.assignment, lang);
  const tpInstructions = resolveLocalizedBlockText(block.instructions, lang);
  const tpEnvironmentGuide = resolveLocalizedBlockText(block.environmentGuide, lang);
  const tpResources = Array.isArray(block.resources) ? block.resources : [];
  const tpSteps = block.steps || [];
  const tpHint = resolveLocalizedBlockText(block.hint, lang);
  const tpSolution = resolveLocalizedBlockText(block.solution, lang);
  const tpSuccess = resolveLocalizedBlockText(block.successMessage, lang);
  const tpPrompt = resolveLocalizedBlockText(block.prompt, lang);
  const rubricCriteria = Array.isArray(block.rubricCriteria) ? block.rubricCriteria : [];
  const learnerCriteria = Array.isArray(block.learnerCriteria) ? block.learnerCriteria : [];
  const localizedLearnerCriteria = learnerCriteria.map((criterion: unknown) => resolveLocalizedBlockText(criterion, lang)).filter(Boolean);
  const usesServerGradedAssessment = typeof block.serverGradedAssessment === "string" && block.serverGradedAssessment.length > 0;
  const requiresWorkflowUpload = Boolean(block.workflowUploadRequired);
  const minimumAnswerLength = resolveMinimumAnswerLength(block.minimumAnswerLength);
  const submittedAnswer = requiresWorkflowUpload ? workflowJson : answer;
  const hasMinimumAnswer = hasRequiredAnswerLength(submittedAnswer, minimumAnswerLength);
  const reflectionOptions = resolvePostRevealReflectionOptions(block.postRevealReflectionOptions, lang);
  const reflectionIsRequired = Boolean(block.requirePostRevealReflection) && reflectionOptions.length > 0;
  const reflectionTitle = resolveLocalizedBlockText(block.postRevealReflectionTitle, lang);
  const selectedReflection = reflectionOptions.find((option) => option.id === reflectionChoiceId) ?? null;
  const usesTrackedRubric = (rubricCriteria.length > 0 || usesServerGradedAssessment) && Boolean(evaluationContext);
  const maxScore = Number(block.maxScore) || rubricCriteria.length || 1;
  const passingScore = Number(block.passingScore) || maxScore;
  const tpNonDl = getUnavailableExerciseResourceNames(block);
  const hasUnavailableVmFiles = tpNonDl.length > 0;
  const learnerAssignment = adaptDataCampVmText(tpAssignment, hasUnavailableVmFiles);
  const learnerHint = adaptDataCampVmText(tpHint, hasUnavailableVmFiles);
  const learnerSolution = adaptDataCampVmText(tpSolution, hasUnavailableVmFiles);
  const revealedSolution = evaluation?.correction || learnerSolution;
  const evaluationPrompt = resolveLocalizedBlockText(block.evaluationPrompt, lang) || learnerAssignment;
  const completeEvaluation = (data: { score: number; feedback: string; strengths: string[]; improvements: string[]; passed: boolean; attemptNumber?: number; correction?: string; correctionResources?: Array<{ title?: string; url: string; filename?: string; sha256?: string; size?: number }> }) => {
      setEvaluation(data);
      setIsEvaluating(false);
      if (data.passed) {
        setSubmitted(true);
        setSolutionRevealed(true);
        if (!reflectionIsRequired) {
          onComplete?.(block.id || `cloud_exercise_${blockIdx}`, { score: toCompetencyPercentage(data.score, maxScore), rubricEvaluated: true });
        }
      }
    };
  const failEvaluation = () => {
      setEvaluation({ score: 0, feedback: t({ en: "The evaluation could not be completed. Please try again.", fr: "L’évaluation n’a pas pu être effectuée. Veuillez réessayer." }), strengths: [], improvements: [], passed: false });
      setIsEvaluating(false);
    };

  const submit = () => {
    if (!hasMinimumAnswer) return;
    if (!usesTrackedRubric || !evaluationContext || !onEvaluate) {
      setSubmitted(true);
      setSolutionRevealed(true);
      if (!reflectionIsRequired) {
        onComplete?.(block.id || `cloud_exercise_${blockIdx}`);
      }
      return;
    }
    setIsEvaluating(true);
    void onEvaluate({
      ...evaluationContext,
      blockId: block.id || `cloud_exercise_${blockIdx}`,
      answer: submittedAnswer,
      workflowJson: requiresWorkflowUpload ? workflowJson : undefined,
      prompt: evaluationPrompt,
      rubric: rubricCriteria,
      maxScore,
      passingScore,
      lang: lang === "en" ? "en" : "fr",
    }).then(completeEvaluation).catch(failEvaluation);
  };

  const selectWorkflowFile = async (file?: File | null) => {
    if (!file) return;
    setWorkflowUploadError("");
    if (!/\.json$/i.test(file.name) && file.type !== "application/json") {
      setWorkflowJson("");
      setWorkflowFilename("");
      setWorkflowUploadError(t({ en: "Choose an exported n8n JSON file.", fr: "Choisissez un fichier JSON exporté par n8n." }));
      return;
    }
    if (file.size > 300_000) {
      setWorkflowJson("");
      setWorkflowFilename("");
      setWorkflowUploadError(t({ en: "This workflow file is too large (300 KB maximum).", fr: "Ce fichier de workflow est trop volumineux (300 Ko maximum)." }));
      return;
    }
    try {
      const content = await file.text();
      JSON.parse(content);
      setWorkflowJson(content);
      setWorkflowFilename(file.name);
    } catch {
      setWorkflowJson("");
      setWorkflowFilename("");
      setWorkflowUploadError(t({ en: "This file is not valid JSON.", fr: "Ce fichier n’est pas un JSON valide." }));
    }
  };

  const selectReflection = (choiceId: string) => {
    const selected = reflectionOptions.find((option) => option.id === choiceId);
    if (!selected || selectedReflection?.passes) return;
    setReflectionChoiceId(choiceId);
    if (selected.passes) {
      onComplete?.(block.id || `cloud_exercise_${blockIdx}`);
      return;
    }
    setSubmitted(false);
  };

  return (
    <div className="my-6 rounded-xl border-2 border-blue-200 overflow-hidden bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border-b border-blue-200">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600">
          <Timer className="w-4 h-4" />
        </span>
        <span className="font-semibold text-foreground">{tpTitle}</span>
        <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded bg-blue-100 text-blue-700">TP</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Assignment / Objectif */}
        {learnerAssignment && (
          <div className="prose prose-sm max-w-none text-foreground">
            <p className="font-semibold text-sm text-blue-800 mb-1">{t({ en: 'Objective', fr: 'Objectif' })}</p>
            <PageContent content={learnerAssignment} lang={lang} />
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

        {tpEnvironmentGuide && (
          <details className="border border-sky-200 rounded-lg bg-sky-50/60">
            <summary className="px-4 py-2.5 cursor-pointer text-sm font-semibold text-sky-900 hover:bg-sky-100/60 rounded-lg flex items-center gap-2">
              <ChevronDown className="w-4 h-4 transition-transform" />
              {t({ en: 'Environment prerequisites', fr: 'Prérequis et préparation de l’environnement' })}
            </summary>
            <div className="px-4 pb-3 text-sm text-sky-950 prose prose-sm max-w-none">
              <PageContent content={tpEnvironmentGuide} lang={lang} />
            </div>
          </details>
        )}

        {tpResources.length > 0 && (
          <div className="border border-emerald-200 rounded-lg bg-emerald-50/60 p-4">
            <p className="font-semibold text-sm text-emerald-900 mb-2">{t({ en: 'Resources for this exercise', fr: 'Ressources pour ce TP' })}</p>
            <div className="space-y-2">
              {tpResources.map((resource: any, index: number) => {
                const title = typeof resource.title === 'object' ? (resource.title?.[lang] || resource.title?.fr || resource.title?.en) : resource.title;
                const description = typeof resource.description === 'object' ? (resource.description?.[lang] || resource.description?.fr || resource.description?.en) : resource.description;
                return (
                  <a key={`${resource.url}-${index}`} href={resource.url} target="_blank" rel="noreferrer" className="flex items-start gap-3 rounded-md bg-background/80 border border-emerald-100 px-3 py-2 text-sm text-emerald-800 hover:bg-background">
                    <Download className="w-4 h-4 mt-0.5 shrink-0" />
                    <span><strong>{title || t({ en: 'Download resource', fr: 'Télécharger la ressource' })}</strong>{description && <span className="block text-xs text-emerald-700 mt-0.5">{description}</span>}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Steps */}
        {tpSteps.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold text-sm text-foreground">{t({ en: 'Steps', fr: 'Étapes' })}</p>
            {tpSteps.map((step: any, i: number) => {
              const rawStepContent = typeof step === 'string' ? step : (step.instructions_text || step.instruction_text || step.text || step.instruction || '');
              const stepContent = resolveLocalizedBlockText(rawStepContent, lang);
              const learnerStepContent = adaptDataCampVmText(stepContent, hasUnavailableVmFiles);
              if (!learnerStepContent) return null;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <div className="text-sm text-foreground whitespace-pre-wrap">
                    <PageContent content={learnerStepContent} lang={lang} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Evaluation criteria - transformed into learner-friendly rubric */}
        {(tpPrompt || rubricCriteria.length > 0 || localizedLearnerCriteria.length > 0) && (() => {
          // Parse the raw grading prompt into learner-friendly bullets
          const bullets = localizedLearnerCriteria.length > 0
            ? localizedLearnerCriteria
            : rubricCriteria.length > 0
            ? rubricCriteria.map((criterion: any) => criterion.label || criterion.description).filter(Boolean)
            : extractLearnerObjectives(tpPrompt);
          if (bullets.length === 0) return null;
          return (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="font-semibold text-sm text-amber-800 mb-2">{t({ en: 'What your work should demonstrate', fr: 'Ce que votre travail doit montrer' })}</p>
              <ul className="space-y-1">
                {bullets.map((bullet: string, i: number) => (
                  <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{renderInlineFormatting(bullet)}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}

        {/* Hint (collapsible) */}
        {learnerHint && (
          <details className="border border-border rounded-lg">
            <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
              <ChevronDown className="w-4 h-4" />
              {t({ en: '💡 Hint', fr: '💡 Indice' })}
            </summary>
            <div className="px-4 pb-3 text-sm text-muted-foreground">
              <PageContent content={learnerHint} lang={lang} />
            </div>
          </details>
        )}

        {/* Only surface genuinely unavailable references. A resource already present
            above must never be misrepresented as an inaccessible source artifact. */}
        {tpNonDl.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 mb-1">
              {t({ en: 'Source environment files (not directly downloadable — rebuild from the instructions)', fr: 'Fichiers de l’environnement source (non téléchargeables — reconstruire depuis les instructions)' })}
            </p>
            <p className="text-xs text-gray-400 font-mono">{tpNonDl.join(', ')}</p>
          </div>
        )}

        {/* Answer zone + Submit button */}
        <div className="border border-border rounded-lg p-4 bg-muted/20">
          <p className="font-semibold text-sm text-foreground mb-2">
            {requiresWorkflowUpload
              ? t({ en: "Submit your completed workflow", fr: "Remettez votre workflow terminé" })
              : t({ en: 'Your answer / Proof of completion', fr: 'Votre réponse / Preuve de réalisation' })}
          </p>
          {requiresWorkflowUpload ? (
            <>
              <input ref={workflowFileInputRef} type="file" accept="application/json,.json" className="sr-only" disabled={submitted || isEvaluating} onChange={(event) => void selectWorkflowFile(event.target.files?.[0])} />
              {workflowFilename ? (
                <div className="flex items-center gap-3 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-950">
                  <FileJson className="h-5 w-5 shrink-0 text-emerald-700" />
                  <span className="min-w-0 flex-1 truncate font-medium">{workflowFilename}</span>
                  {!submitted && <Button type="button" size="icon" variant="ghost" aria-label={t({ en: "Remove selected workflow", fr: "Retirer le workflow sélectionné" })} onClick={() => { setWorkflowJson(""); setWorkflowFilename(""); if (workflowFileInputRef.current) workflowFileInputRef.current.value = ""; }}><X className="h-4 w-4" /></Button>}
                </div>
              ) : (
                <button type="button" disabled={submitted || isEvaluating} onClick={() => workflowFileInputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void selectWorkflowFile(event.dataTransfer.files?.[0]); }} className="flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/50 px-4 py-5 text-center text-sm text-blue-900 transition-colors hover:border-blue-500 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60">
                  <FileUp className="h-6 w-6 text-blue-700" />
                  <span className="font-semibold">{t({ en: "Drop your exported n8n JSON here or choose a file", fr: "Déposez ici votre JSON n8n exporté ou choisissez un fichier" })}</span>
                  <span className="text-xs text-blue-800">{t({ en: "JSON only · 300 KB maximum · no credential or secret", fr: "JSON uniquement · 300 Ko maximum · sans identifiant ni secret" })}</span>
                </button>
              )}
              {workflowUploadError && <p className="mt-2 text-xs font-medium text-destructive">{workflowUploadError}</p>}
            </>
          ) : (
            <textarea
              className="w-full min-h-[100px] p-3 rounded-lg border border-border bg-background text-sm text-foreground resize-y placeholder:text-muted-foreground"
              placeholder={t({ en: 'Describe what you did, paste your workflow JSON, or note the result...', fr: 'Décrivez ce que vous avez fait, collez votre workflow JSON, ou notez le résultat...' })}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={submitted || isEvaluating}
            />
          )}
          {!submitted && minimumAnswerLength > 1 && !hasMinimumAnswer && (
            <p className="mt-2 text-xs text-muted-foreground">
              {t({
                en: `Write at least ${minimumAnswerLength} characters to submit.`,
                fr: `Rédigez au moins ${minimumAnswerLength} caractères pour valider.`,
              })}
            </p>
          )}
        {!submitted && (
            <button
              onClick={submit}
              disabled={!hasMinimumAnswer || isEvaluating}
              className="mt-3 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isEvaluating ? t({ en: 'Evaluating…', fr: 'Évaluation…' }) : usesTrackedRubric ? t({ en: 'Evaluate my answer', fr: 'Évaluer ma réponse' }) : t({ en: 'Submit', fr: 'Valider' })}
            </button>
          )}
          {evaluation && (
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-3 text-sm text-foreground">
              <p className="font-semibold">{t({ en: `Result: ${evaluation.score}/${maxScore}`, fr: `Résultat : ${evaluation.score}/${maxScore}` })}</p>
              <Streamdown>{evaluation.feedback}</Streamdown>
              {evaluation.strengths.length > 0 && <ul className="list-disc pl-5 text-green-700">{evaluation.strengths.map((item, index) => <li key={index}><Streamdown>{item}</Streamdown></li>)}</ul>}
              {evaluation.improvements.length > 0 && <ul className="list-disc pl-5 text-amber-700">{evaluation.improvements.map((item, index) => <li key={index}><Streamdown>{item}</Streamdown></li>)}</ul>}
              {(evaluation.correctionResources?.length ?? 0) > 0 && (
                <div className="rounded-md border border-green-300 bg-white p-3">
                  <p className="font-semibold text-green-900">{t({ en: "Correction explained", fr: "Correction expliquée" })}</p>
                  <div className="mt-2 space-y-2">
                    {evaluation.correctionResources!.map((resource, index) => (
                      <a key={`${resource.url}-${index}`} href={resource.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-green-800 underline underline-offset-2 hover:text-green-950">
                        <Download className="h-4 w-4 shrink-0" />
                        {resource.title || resource.filename || t({ en: "Download correction", fr: "Télécharger la correction" })}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {usesTrackedRubric && <p className={evaluation.passed ? "font-medium text-green-700" : "font-medium text-amber-700"}>{evaluation.passed ? t({ en: "Requirement met: you may continue. The associated competency points are being recorded.", fr: "Seuil atteint : vous pouvez continuer. Les points de compétences associés sont enregistrés." }) : t({ en: "Requirement not yet met: refine your response and try again.", fr: "Seuil non atteint : améliorez votre réponse et réessayez." })}</p>}
            </div>
          )}
          {submitted && (
            <div className="mt-3 flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              {t({ en: 'Submitted! You can now view the solution.', fr: 'Validé ! Vous pouvez maintenant voir la correction.' })}
            </div>
          )}
        </div>

        {/* Solution (only visible after submission) */}
        {revealedSolution && (
          (solutionRevealed || evaluation) ? (
            <details className="border border-green-200 rounded-lg bg-green-50/50" open>
              <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-green-700 hover:text-green-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {t({ en: 'Solution', fr: 'Correction' })}
              </summary>
              <div className="px-4 pb-3 text-sm text-green-800 bg-green-50 rounded-b-lg prose prose-sm max-w-none">
                <Streamdown>{revealedSolution}</Streamdown>
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

        {reflectionOptions.length > 0 && (solutionRevealed || evaluation) && (
          <div className="border border-indigo-200 rounded-lg bg-indigo-50/50 p-4 space-y-3">
            <p className="font-semibold text-sm text-indigo-900">
              {reflectionTitle || t({ en: "How did your answer compare?", fr: "Comment votre réponse se compare-t-elle à la correction ?" })}
            </p>
            <div className="flex flex-wrap gap-2">
              {reflectionOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={Boolean(selectedReflection?.passes)}
                  onClick={() => selectReflection(option.id)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium text-left ${reflectionChoiceId === option.id ? "border-indigo-600 bg-indigo-100 text-indigo-900" : "border-indigo-200 bg-background text-indigo-800 hover:bg-indigo-100"} disabled:cursor-default disabled:opacity-100`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {selectedReflection?.feedback && (
              <div className="rounded-lg border border-indigo-200 bg-background/80 p-3 text-sm text-indigo-900">
                <Streamdown>{selectedReflection.feedback}</Streamdown>
              </div>
            )}
            {reflectionIsRequired && !selectedReflection?.passes && (
              <p className="text-xs text-indigo-800">
                {t({ en: "Choose a reflection result to complete this activity.", fr: "Choisissez un résultat d’auto-évaluation pour terminer cette activité." })}
              </p>
            )}
          </div>
        )}

        {/* Success message */}
        {tpSuccess && submitted && (!reflectionIsRequired || selectedReflection?.passes) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700">{tpSuccess}</p>
          </div>
        )}
      </div>
    </div>
  );
}
