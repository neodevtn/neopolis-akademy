import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, LockKeyhole, RotateCcw, Send, Trophy, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

const text = (value: unknown, lang: string) => typeof value === "string"
  ? value
  : value && typeof value === "object"
    ? String((value as Record<string, unknown>)[lang] || (value as Record<string, unknown>).fr || (value as Record<string, unknown>).en || "")
    : "";

/** A generic server-graded final course evaluation. Question keys never enter the course JSON. */
export function CourseFinalQuizBlock({ block, courseId, lang, onComplete }: { block: any; courseId: string; lang: string; onComplete: (id: string) => void }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submission, setSubmission] = useState<any>(null);
  const notifiedCompletion = useRef(false);
  const quizQuery = trpc.training.getClaudeScienceV2FinalQuiz.useQuery({ courseId }, { retry: false, refetchOnWindowFocus: false });
  const submitQuiz = trpc.training.submitClaudeScienceV2FinalQuiz.useMutation();
  const quiz = quizQuery.data as any;
  const questions = quiz?.questions || [];
  const question = questions[questionIndex];
  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;
  const passed = Boolean(submission?.passed);

  useEffect(() => {
    if (passed && !notifiedCompletion.current) {
      notifiedCompletion.current = true;
      onComplete(block.id || "course_final_quiz");
    }
  }, [block.id, onComplete, passed]);

  const canRetry = Boolean(submission && !submission.passed && quiz && quiz.remainingAttempts > 0);
  const title = text(block.title, lang) || text(quiz?.title, lang) || (lang === "fr" ? "Évaluation finale" : "Final assessment");
  const submit = async () => {
    if (!quiz || !allAnswered) return;
    try {
      const result = await submitQuiz.mutateAsync({ courseId, answers: questions.map((item: any) => ({ questionId: item.id, selectedId: answers[item.id] })) });
      setSubmission(result);
      setQuestionIndex(0);
      await quizQuery.refetch();
    } catch {
      // The mutation error remains visible beneath the question set.
    }
  };

  if (quizQuery.isLoading) return <section className="my-5 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">{lang === "fr" ? "Vérification des prérequis de l’évaluation…" : "Checking assessment prerequisites…"}</section>;
  if (quizQuery.error || !quiz) return <section className="my-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950"><div className="flex items-start gap-3"><LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" /><div><h3 className="font-semibold">{lang === "fr" ? "Évaluation verrouillée" : "Assessment locked"}</h3><p className="mt-1 text-sm leading-relaxed">{lang === "fr" ? "Réussissez tous les checkpoints obligatoires avant d’ouvrir l’évaluation finale. Les questions et corrections sont corrigées côté serveur." : "Pass every required checkpoint before opening the final assessment. Questions and answers are graded server-side."}</p><Button className="mt-4" variant="outline" size="sm" onClick={() => quizQuery.refetch()}>{lang === "fr" ? "Vérifier à nouveau" : "Check again"}</Button></div></div></section>;

  return <section className="my-5 overflow-hidden rounded-2xl border border-indigo-200 bg-card shadow-sm">
    <header className="border-b border-indigo-100 bg-indigo-50 px-5 py-4"><div className="flex items-start gap-3"><CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-indigo-700" /><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-700">{lang === "fr" ? "Évaluation finale" : "Final assessment"} · {lang === "fr" ? "points de compétences" : "competency points"}</p><h3 className="mt-1 text-lg font-bold text-foreground">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{questions.length} {lang === "fr" ? "questions · seuil" : "questions · threshold"} {quiz.passingScore}% · {lang === "fr" ? "tentatives restantes" : "remaining attempts"} : {quiz.remainingAttempts}</p></div></div></header>
    {submission ? <div className="p-5"><div className={`rounded-xl border p-4 ${passed ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}><div className="flex items-start gap-3">{passed ? <Trophy className="mt-0.5 h-6 w-6 text-emerald-600" /> : <XCircle className="mt-0.5 h-6 w-6 text-amber-600" />}<div><h4 className="font-bold text-foreground">{passed ? (lang === "fr" ? "Évaluation réussie" : "Assessment passed") : (lang === "fr" ? "Seuil non atteint" : "Threshold not reached")}</h4><p className="mt-1 text-sm text-foreground">{submission.correctCount}/{submission.totalQuestions} · {submission.scorePercent}% {lang === "fr" ? `(seuil : ${submission.passingScore}%)` : `(threshold: ${submission.passingScore}%)`}</p><p className="mt-2 text-sm text-muted-foreground">{passed ? (lang === "fr" ? "Les points de compétences ont été enregistrés. Vous pouvez poursuivre." : "Competency points were recorded. You may continue.") : (lang === "fr" ? "Consultez les corrections puis recommencez si une tentative reste disponible." : "Review corrections, then retry if an attempt remains.")}</p></div></div></div><div className="mt-5 space-y-4">{questions.map((item: any, index: number) => { const result = submission.results.find((entry: any) => entry.questionId === item.id); return <article key={item.id} className={`rounded-xl border p-4 ${result?.correct ? "border-emerald-200" : "border-red-200"}`}><p className="text-xs font-semibold text-muted-foreground">{lang === "fr" ? "Question" : "Question"} {index + 1}</p><p className="mt-1 font-semibold text-foreground">{text(item.prompt, lang)}</p><p className="mt-3 text-sm"><strong>{lang === "fr" ? "Votre réponse : " : "Your answer: "}</strong>{text(item.options.find((option: any) => option.id === result?.selectedId)?.text, lang)}</p><p className="mt-1 text-sm"><strong>{lang === "fr" ? "Bonne réponse : " : "Correct answer: "}</strong>{text(item.options.find((option: any) => option.id === result?.correctChoiceId)?.text, lang)}</p><p className="mt-3 rounded-lg bg-muted/50 p-3 text-sm leading-relaxed text-foreground"><strong>{lang === "fr" ? "Correction : " : "Correction: "}</strong>{text(result?.explanation, lang)}</p></article>; })}</div>{canRetry && <Button className="mt-5 gap-2" variant="outline" onClick={() => { setAnswers({}); setSubmission(null); setQuestionIndex(0); }}><RotateCcw className="h-4 w-4" />{lang === "fr" ? "Réessayer" : "Retry"}</Button>}</div> : <div className="p-5">{question && <><div className="flex items-center justify-between gap-3 text-xs font-semibold text-muted-foreground"><span>{lang === "fr" ? "Question" : "Question"} {questionIndex + 1}/{questions.length}</span><span>{Object.keys(answers).length}/{questions.length} {lang === "fr" ? "répondues" : "answered"}</span></div><h4 className="mt-4 text-lg font-bold leading-relaxed text-foreground">{text(question.prompt, lang)}</h4><div className="mt-5 space-y-2">{question.options.map((option: any) => <button type="button" key={option.id} onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))} className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${answers[question.id] === option.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted/40"}`}><span className="mr-2 font-semibold">{option.id.toUpperCase()}.</span>{text(option.text, lang)}</button>)}</div><div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4"><Button variant="outline" size="sm" disabled={questionIndex === 0} onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))}><ArrowLeft className="mr-1 h-4 w-4" />{lang === "fr" ? "Précédent" : "Previous"}</Button>{questionIndex < questions.length - 1 ? <Button size="sm" onClick={() => setQuestionIndex((index) => Math.min(questions.length - 1, index + 1))}>{lang === "fr" ? "Suivant" : "Next"}<ArrowRight className="ml-1 h-4 w-4" /></Button> : <Button size="sm" disabled={!allAnswered || submitQuiz.isPending} onClick={submit}><Send className="mr-1 h-4 w-4" />{submitQuiz.isPending ? (lang === "fr" ? "Soumission…" : "Submitting…") : (lang === "fr" ? "Soumettre" : "Submit")}</Button>}</div></>}</div>}
    {submitQuiz.error && <p role="alert" className="mx-5 mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{lang === "fr" ? "La soumission n’a pas abouti. Vérifiez votre connexion puis réessayez." : "Submission failed. Check your connection and try again."}</p>}
    {passed && <footer className="border-t border-emerald-100 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-800"><CheckCircle2 className="mr-2 inline h-4 w-4" />{lang === "fr" ? "Évaluation validée ; la suite est déverrouillée." : "Assessment passed; the next step is unlocked."}</footer>}
  </section>;
}
