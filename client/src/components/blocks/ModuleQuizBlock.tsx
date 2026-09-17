import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, LockKeyhole, RotateCcw, Send, Trophy, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

const text = (value: unknown, lang: string) => typeof value === "string"
  ? value
  : value && typeof value === "object"
    ? String((value as Record<string, unknown>)[lang] || (value as Record<string, unknown>).fr || (value as Record<string, unknown>).en || "")
    : "";

type ModuleQuizBlockProps = {
  block: { id?: string; moduleId: string; title?: unknown; passingScore?: number; questionCount?: number; competencyPoints?: number };
  courseId: string;
  lang: string;
  onComplete: (id: string) => void;
};

/**
 * Generic module assessment. Questions and answer keys are retrieved and
 * graded server-side; client course JSON carries only this configuration.
 */
export function ModuleQuizBlock({ block, courseId, lang, onComplete }: ModuleQuizBlockProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submission, setSubmission] = useState<any>(null);
  const notifiedCompletion = useRef(false);
  const quizQuery = trpc.training.getModuleQuiz.useQuery({ courseId, moduleId: block.moduleId }, { retry: false, refetchOnWindowFocus: false });
  const submitQuiz = trpc.training.submitModuleQuiz.useMutation();
  const quiz = quizQuery.data as any;
  const questions = quiz?.questions || [];
  const question = questions[questionIndex];
  const completedAnswers = Object.keys(answers).length;
  const allAnswered = questions.length > 0 && completedAnswers === questions.length;
  const isPassed = Boolean(submission?.passed);

  useEffect(() => {
    if (isPassed && !notifiedCompletion.current) {
      notifiedCompletion.current = true;
      onComplete(block.id || `module_quiz_${block.moduleId}`);
    }
  }, [block.id, block.moduleId, isPassed, onComplete]);

  const currentResult = useMemo(() => submission?.results?.find((result: any) => result.questionId === question?.id), [question?.id, submission]);
  const canRetry = Boolean(submission && !submission.passed && quiz && quiz.remainingAttempts > 0);
  const localizedTitle = text(block.title, lang) || text(quiz?.title, lang) || (lang === "fr" ? "Quiz de module" : "Module quiz");

  const submit = async () => {
    if (!allAnswered || !quiz) return;
    try {
      const result = await submitQuiz.mutateAsync({
        courseId,
        moduleId: block.moduleId,
        answers: questions.map((item: any) => ({ questionId: item.id, selectedId: answers[item.id] })),
      });
      setSubmission(result);
      setQuestionIndex(0);
      await quizQuery.refetch();
    } catch {
      // The mutation state supplies an accessible error message below.
    }
  };

  const retry = () => {
    setAnswers({});
    setSubmission(null);
    setQuestionIndex(0);
  };

  if (quizQuery.isLoading) {
    return <section className="my-5 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">{lang === "fr" ? "Vérification des conditions d’ouverture du quiz…" : "Checking quiz opening requirements…"}</section>;
  }
  if (quizQuery.error || !quiz) {
    return (
      <section className="my-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
        <div className="flex items-start gap-3"><LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" /><div><h3 className="font-semibold">{lang === "fr" ? "Quiz verrouillé" : "Quiz locked"}</h3><p className="mt-1 text-sm leading-relaxed">{lang === "fr" ? "Terminez et réussissez les quatre checkpoints, puis validez le TP de ce module. Les questions et corrections restent protégées côté serveur." : "Complete and pass the four checkpoints, then submit this module’s lab. Questions and corrections stay protected on the server."}</p><Button className="mt-4" variant="outline" size="sm" onClick={() => quizQuery.refetch()}>{lang === "fr" ? "Vérifier à nouveau" : "Check again"}</Button></div></div>
      </section>
    );
  }

  return (
    <section className="my-5 overflow-hidden rounded-2xl border border-indigo-200 bg-card shadow-sm">
      <header className="border-b border-indigo-100 bg-indigo-50 px-5 py-4">
        <div className="flex items-start gap-3"><CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-indigo-700" /><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-indigo-700">{lang === "fr" ? "Évaluation de module" : "Module assessment"} · {block.competencyPoints || 10} {lang === "fr" ? "points de compétences" : "competency points"}</p><h3 className="mt-1 text-lg font-bold text-foreground">{localizedTitle}</h3><p className="mt-1 text-sm text-muted-foreground">{questions.length} {lang === "fr" ? "questions · seuil de réussite" : "questions · passing score"} {quiz.passingScore}% · {lang === "fr" ? "tentatives restantes" : "attempts remaining"}: {quiz.remainingAttempts}</p></div></div>
      </header>

      {submission ? (
        <div className="p-5">
          <div className={`rounded-xl border p-4 ${submission.passed ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
            <div className="flex items-start gap-3">{submission.passed ? <Trophy className="mt-0.5 h-6 w-6 text-emerald-600" /> : <XCircle className="mt-0.5 h-6 w-6 text-amber-600" />}<div><h4 className="font-bold text-foreground">{submission.passed ? (lang === "fr" ? "Quiz réussi" : "Quiz passed") : (lang === "fr" ? "Seuil non atteint" : "Passing threshold not reached")}</h4><p className="mt-1 text-sm text-foreground">{submission.correctCount}/{submission.totalQuestions} · {submission.scorePercent}% {lang === "fr" ? `(seuil : ${submission.passingScore}%)` : `(threshold: ${submission.passingScore}%)`}</p><p className="mt-2 text-sm text-muted-foreground">{submission.passed ? (lang === "fr" ? "Les points de compétences ont été enregistrés. Vous pouvez poursuivre." : "Competency points were recorded. You may continue.") : (lang === "fr" ? "Consultez les corrections, puis recommencez si une tentative reste disponible." : "Review the corrections, then retry if an attempt remains.")}</p></div></div>
          </div>
          <div className="mt-5 space-y-4">{questions.map((item: any, index: number) => {
            const result = submission.results.find((entry: any) => entry.questionId === item.id);
            return <article key={item.id} className={`rounded-xl border p-4 ${result?.correct ? "border-emerald-200" : "border-red-200"}`}><p className="text-xs font-semibold text-muted-foreground">{lang === "fr" ? "Question" : "Question"} {index + 1}</p><p className="mt-1 font-semibold text-foreground">{text(item.prompt, lang)}</p><p className="mt-3 text-sm"><span className="font-medium">{lang === "fr" ? "Votre réponse :" : "Your answer:"}</span> {text(item.options.find((option: any) => option.id === result?.selectedId)?.text, lang)}</p><p className="mt-1 text-sm"><span className="font-medium">{lang === "fr" ? "Bonne réponse :" : "Correct answer:"}</span> {text(item.options.find((option: any) => option.id === result?.correctChoiceId)?.text, lang)}</p><p className="mt-3 rounded-lg bg-muted/50 p-3 text-sm leading-relaxed text-foreground"><span className="font-semibold">{lang === "fr" ? "Correction :" : "Correction:"}</span> {text(result?.explanation, lang)}</p></article>;
          })}</div>
          {canRetry && <Button className="mt-5 gap-2" variant="outline" onClick={retry}><RotateCcw className="h-4 w-4" />{lang === "fr" ? "Réessayer le quiz" : "Retry quiz"}</Button>}
        </div>
      ) : (
        <div className="p-5">
          {question ? <><div className="flex items-center justify-between gap-3 text-xs font-semibold text-muted-foreground"><span>{lang === "fr" ? "Question" : "Question"} {questionIndex + 1}/{questions.length}</span><span>{completedAnswers}/{questions.length} {lang === "fr" ? "répondues" : "answered"}</span></div><h4 className="mt-4 text-lg font-bold leading-relaxed text-foreground">{text(question.prompt, lang)}</h4><div className="mt-5 space-y-2">{question.options.map((option: any) => <button type="button" key={option.id} onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))} className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${answers[question.id] === option.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted/40"}`}><span className="mr-2 font-semibold">{option.id.toUpperCase()}.</span>{text(option.text, lang)}</button>)}</div><div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4"><Button variant="outline" size="sm" disabled={questionIndex === 0} onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))}><ArrowLeft className="mr-1 h-4 w-4" />{lang === "fr" ? "Précédent" : "Previous"}</Button>{questionIndex < questions.length - 1 ? <Button size="sm" onClick={() => setQuestionIndex((index) => Math.min(questions.length - 1, index + 1))}>{lang === "fr" ? "Suivant" : "Next"}<ArrowRight className="ml-1 h-4 w-4" /></Button> : <Button size="sm" disabled={!allAnswered || submitQuiz.isPending} onClick={submit}><Send className="mr-1 h-4 w-4" />{submitQuiz.isPending ? (lang === "fr" ? "Soumission…" : "Submitting…") : (lang === "fr" ? "Soumettre le quiz" : "Submit quiz")}</Button>}</div></> : null}
          {submitQuiz.error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{lang === "fr" ? "La soumission n’a pas abouti. Vérifiez votre connexion puis réessayez." : "Submission did not complete. Check your connection and retry."}</p>}
        </div>
      )}
      {isPassed && <footer className="border-t border-emerald-100 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-800"><span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{lang === "fr" ? "Module validé ; la suite est déverrouillée." : "Module passed; the next step is unlocked."}</span></footer>}
    </section>
  );
}
