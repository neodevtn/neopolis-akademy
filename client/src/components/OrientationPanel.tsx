import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, Compass, GraduationCap, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { canAddOrientationGoal, MAX_ORIENTATION_GOALS, toggleOrientationGoal, type OrientationGoal } from "@/lib/orientationGoalSelection";

type Goal = OrientationGoal;

const TARGETS = [
  { id: "bronze", label: "Bronze", points: 10, description: "Autonomie de base" },
  { id: "silver", label: "Argent", points: 35, description: "Maîtrise opérationnelle" },
  { id: "gold", label: "Or", points: 70, description: "Maîtrise avancée" },
] as const;

function titleOf(value: any, fallback = "Compétence") {
  if (typeof value === "string") return value;
  return value?.fr || value?.en || fallback;
}

export function OrientationPanel({
  orientation,
  certifications,
  onSaveGoals,
  onCompleteDiagnostic,
  onRespondToProposal,
  savingGoals,
  completing,
  respondingToProposal,
}: {
  orientation: any;
  certifications: any[];
  onSaveGoals: (input: { goals: Goal[]; wantsOfficialCertification: boolean; officialCertificationIds: string[]; certificationTargetDates: Record<string, string> }) => void;
  onCompleteDiagnostic: (answers: Array<{ questionId: string; choiceId: string }>) => void;
  onRespondToProposal: (input: { proposalId: number; accept: boolean }) => void;
  savingGoals?: boolean;
  completing?: boolean;
  respondingToProposal?: boolean;
}) {
  const profile = orientation?.profile;
  const [goals, setGoals] = useState<Goal[]>(profile?.goals || []);
  const [wantsOfficial, setWantsOfficial] = useState(Boolean(profile?.wantsOfficialCertification));
  const [certificationIds, setCertificationIds] = useState<string[]>(profile?.officialCertificationIds || []);
  const [certificationTargetDates, setCertificationTargetDates] = useState<Record<string, string>>(profile?.certificationTargetDates || {});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [editingGoals, setEditingGoals] = useState(false);

  useEffect(() => {
    setGoals(profile?.goals || []);
    setWantsOfficial(Boolean(profile?.wantsOfficialCertification));
    setCertificationIds(profile?.officialCertificationIds || []);
    setCertificationTargetDates(profile?.certificationTargetDates || {});
    setAnswers({});
    setEditingGoals(false);
  }, [profile?.updatedAt]);

  const stage = editingGoals || profile?.status === "not_started" ? "goals" : profile?.status === "completed" ? "recommendations" : "diagnostic";
  const selectedGoalIds = new Set(goals.map((goal) => goal.competencyId));
  const officialCertifications = certifications.filter((certification) => certification.group === "anthropic_certification_preparation");
  const questions = orientation?.questions || [];
  const canSubmitGoals = goals.length > 0;
  const canCompleteDiagnostic = questions.length > 0 && Object.keys(answers).length === questions.length;

  const competencyRows = useMemo(() => (orientation?.competencies || []).filter((competency: any) => selectedGoalIds.has(competency.id)), [orientation?.competencies, goals]);

  const toggleGoal = (competencyId: string) => {
    setGoals((current) => toggleOrientationGoal(current, competencyId));
  };

  const updateTarget = (competencyId: string, targetLevel: Goal["targetLevel"]) => {
    setGoals((current) => current.map((goal) => goal.competencyId === competencyId ? { ...goal, targetLevel } : goal));
  };

  const toggleCertification = (certificationId: string) => {
    setCertificationIds((current) => {
      const selected = current.includes(certificationId);
      if (selected) setCertificationTargetDates((dates) => Object.fromEntries(Object.entries(dates).filter(([id]) => id !== certificationId)));
      return selected ? current.filter((id) => id !== certificationId) : [...current, certificationId];
    });
  };

  const saveGoals = () => onSaveGoals({ goals, wantsOfficialCertification: wantsOfficial, officialCertificationIds: certificationIds, certificationTargetDates });

  if (!orientation) {
    return <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Chargement de votre orientation personnalisée…</div>;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-primary"><Compass className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.16em]">Orientation personnalisée</span></div>
            <h2 className="text-2xl font-bold text-foreground">Construisez un parcours aligné sur vos objectifs</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Choisissez les compétences à développer, indiquez votre niveau cible et répondez à un QCM rapide. Nous ajusterons l’ordre des formations à votre niveau réel, sans vous imposer inutilement les modules débutants.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-primary/20 bg-card px-3 py-2 text-xs font-semibold text-primary">
            <Target className="h-4 w-4" />
            {stage === "goals" ? "1 · Objectifs" : stage === "diagnostic" ? "2 · Diagnostic" : "3 · Parcours prêt"}
          </div>
        </div>
      </div>

      {orientation.pendingProposal && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">Proposition d’ajustement de votre accompagnement</p>
              <p className="mt-1 text-sm text-muted-foreground">{orientation.pendingProposal.justification}</p>
              <p className="mt-2 text-xs font-semibold text-amber-800 dark:text-amber-300">L’acceptation mettra à jour vos objectifs et vous invitera à refaire le diagnostic.</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" disabled={respondingToProposal} onClick={() => onRespondToProposal({ proposalId: orientation.pendingProposal.id, accept: false })}>Décliner</Button>
              <Button disabled={respondingToProposal} onClick={() => onRespondToProposal({ proposalId: orientation.pendingProposal.id, accept: true })}>{respondingToProposal ? "Traitement…" : "Accepter"}</Button>
            </div>
          </div>
        </div>
      )}

      {stage === "goals" && (
        <div className="space-y-6 rounded-2xl border border-border bg-card p-5 md:p-7">
          <div>
            <h3 className="text-lg font-bold text-foreground">1. Vos compétences prioritaires</h3>
            <p className="mt-1 text-sm text-muted-foreground">Sélectionnez jusqu’à cinq compétences. Pour chacune, choisissez le niveau de maîtrise attendu.</p>
            <p className="mt-2 text-sm font-medium text-primary" role="status" aria-live="polite">
              {goals.length} / {MAX_ORIENTATION_GOALS} compétence{goals.length > 1 ? "s" : ""} sélectionnée{goals.length > 1 ? "s" : ""}
              {goals.length >= MAX_ORIENTATION_GOALS ? " — limite atteinte : désélectionnez une compétence pour en choisir une autre." : ` — encore ${MAX_ORIENTATION_GOALS - goals.length} disponible${MAX_ORIENTATION_GOALS - goals.length > 1 ? "s" : ""}.`}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(orientation.competencies || []).map((competency: any) => {
              const selected = selectedGoalIds.has(competency.id);
              const goal = goals.find((item) => item.competencyId === competency.id);
              const selectionDisabled = !canAddOrientationGoal(goals, competency.id);
              return (
                <div key={competency.id} className={`rounded-xl border p-4 ${selected ? "border-primary bg-primary/5" : "border-border"} ${selectionDisabled ? "opacity-60" : ""}`}>
                  <label className={`flex items-start gap-3 ${selectionDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                    <input type="checkbox" checked={selected} disabled={selectionDisabled} onChange={() => toggleGoal(competency.id)} className="mt-1 h-4 w-4 accent-primary disabled:cursor-not-allowed" aria-describedby={selectionDisabled ? "orientation-goal-capacity" : undefined} />
                    <span>
                      <span className="block font-semibold text-foreground">{titleOf(competency.title)}</span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">{titleOf(competency.description, "")}</span>
                      <span className="mt-2 block text-xs font-medium text-primary">Niveau actuel : {Number(competency.level || 0).toLocaleString("fr-FR")} pts</span>
                    </span>
                  </label>
                  {selected && (
                    <label className="mt-4 block text-xs font-semibold text-muted-foreground">
                      Niveau souhaité
                      <select value={goal?.targetLevel || "bronze"} onChange={(event) => updateTarget(competency.id, event.target.value as Goal["targetLevel"])} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground">
                        {TARGETS.map((target) => <option key={target.id} value={target.id}>{target.label} · {target.description}</option>)}
                      </select>
                    </label>
                  )}
                </div>
              );
            })}
          </div>

          <span id="orientation-goal-capacity" className="sr-only">Vous pouvez sélectionner au maximum cinq compétences prioritaires.</span>

          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={wantsOfficial} onChange={(event) => setWantsOfficial(event.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
              <span><span className="font-semibold text-foreground">Je souhaite préparer une certification officielle</span><span className="mt-1 block text-sm text-muted-foreground">Nous intégrerons le parcours officiel choisi dans vos recommandations.</span></span>
            </label>
            {wantsOfficial && <div className="mt-4 grid gap-3 md:grid-cols-2">{officialCertifications.map((certification: any) => {
              const selected = certificationIds.includes(certification.id);
              return <div key={certification.id} className="rounded-lg border border-border bg-card p-3 text-sm"><label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={selected} onChange={() => toggleCertification(certification.id)} className="h-4 w-4 accent-primary" /><GraduationCap className="h-4 w-4 text-primary" />{titleOf(certification.title)}</label>{selected && <label className="mt-3 block text-xs font-semibold text-muted-foreground">Date cible<input type="date" min={new Date().toISOString().slice(0, 10)} value={certificationTargetDates[certification.id] || ""} onChange={(event) => setCertificationTargetDates((current) => ({ ...current, [certification.id]: event.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground" /></label>}</div>;
            })}</div>}
          </div>

          <div className="flex justify-end"><Button disabled={!canSubmitGoals || savingGoals} onClick={saveGoals}>{savingGoals ? "Enregistrement…" : "Passer au diagnostic"}<ChevronRight className="ml-2 h-4 w-4" /></Button></div>
        </div>
      )}

      {stage === "diagnostic" && (
        <div className="space-y-6 rounded-2xl border border-border bg-card p-5 md:p-7">
          <div><h3 className="text-lg font-bold text-foreground">2. Diagnostic rapide</h3><p className="mt-1 text-sm text-muted-foreground">Répondez à une question courte par compétence choisie. Ce diagnostic sert à ajuster l’ordre du parcours ; il ne constitue pas un examen officiel.</p></div>
          <div className="space-y-5">{questions.map((question: any, questionIndex: number) => <div key={question.id} className="rounded-xl border border-border p-5"><p className="text-sm font-semibold text-foreground">{questionIndex + 1}. {titleOf(question.prompt)}</p><div className="mt-4 space-y-2">{question.choices.map((choice: any) => <label key={choice.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${answers[question.id] === choice.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}><input type="radio" name={question.id} checked={answers[question.id] === choice.id} onChange={() => setAnswers((current) => ({ ...current, [question.id]: choice.id }))} className="mt-0.5 accent-primary" />{titleOf(choice.label)}</label>)}</div></div>)}</div>
          <div className="flex justify-end"><Button disabled={!canCompleteDiagnostic || completing} onClick={() => onCompleteDiagnostic(Object.entries(answers).map(([questionId, choiceId]) => ({ questionId, choiceId })))}>{completing ? "Analyse…" : "Obtenir mon parcours"}<ChevronRight className="ml-2 h-4 w-4" /></Button></div>
        </div>
      )}

      {stage === "recommendations" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-900 dark:bg-emerald-950/20"><div className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /><div><h3 className="font-bold text-foreground">Votre parcours est prêt</h3><p className="mt-1 text-sm text-muted-foreground">Vos recommandations sont recalculées à partir de vos objectifs, du diagnostic et de vos compétences graduées actuelles.</p></div></div></div>
          <div className="grid gap-4 lg:grid-cols-3">{competencyRows.map((competency: any) => <div key={competency.id} className="rounded-xl border border-border bg-card p-4"><div className="font-semibold text-foreground">{titleOf(competency.title)}</div><div className="mt-2 flex items-end justify-between"><span className="text-2xl font-bold text-primary">{Number(competency.level || 0).toLocaleString("fr-FR")} pts</span><span className="text-xs text-muted-foreground">Cible : {competency.targetPoints} pts</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (Number(competency.level || 0) / Number(competency.targetPoints || 100)) * 100)}%` }} /></div></div>)}</div>
          {orientation.trajectory?.available ? <div className="rounded-2xl border border-border bg-card p-5"><div className="mb-4"><h3 className="font-bold text-foreground">Votre trajectoire de progression</h3><p className="mt-1 text-sm text-muted-foreground">Comparaison entre l’avancement réel de vos compétences cibles et la trajectoire attendue jusqu’au {new Date(`${orientation.trajectory.targetDate}T12:00:00`).toLocaleDateString("fr-FR")}.</p></div><div className="h-[260px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={orientation.trajectory.points} margin={{ left: -15, right: 10, top: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tickFormatter={(date) => new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} tick={{ fontSize: 11 }} /><YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 11 }} /><Tooltip labelFormatter={(date) => new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR")} formatter={(value, name) => [value == null ? "À venir" : `${value}%`, name === "planned" ? "Prévu" : "Réel"]} /><Line type="monotone" dataKey="planned" name="planned" stroke="#6b7280" strokeDasharray="6 5" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="actual" name="actual" stroke="#155e75" strokeWidth={3} dot={{ r: 3 }} connectNulls={false} /></LineChart></ResponsiveContainer></div></div> : <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">{orientation.trajectory?.reason}</div>}
          <div className="space-y-3">{(orientation.recommendations || []).map((recommendation: any) => { const certification = certifications.find((item) => item.id === recommendation.certificationId); const targetDate = profile?.certificationTargetDates?.[recommendation.certificationId]; return <div key={`${recommendation.order}-${recommendation.certificationId}`} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 md:flex-row md:items-center"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{recommendation.order}</div><div className="min-w-0 flex-1"><p className="font-semibold text-foreground">{titleOf(certification?.title, recommendation.certificationId)}</p><p className="mt-1 text-sm text-muted-foreground">{recommendation.reason}</p>{targetDate && <p className="mt-2 text-xs font-semibold text-primary">Échéance cible : {new Date(`${targetDate}T12:00:00`).toLocaleDateString("fr-FR")}</p>}</div><span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">{recommendation.type === "foundation" ? "Fondations" : recommendation.type === "advanced" ? "Approfondissement" : "Objectif"}</span></div>})}</div>
          <div className="flex justify-end"><Button variant="outline" onClick={() => setEditingGoals(true)}>Modifier mes objectifs</Button></div>
        </div>
      )}
    </section>
  );
}
