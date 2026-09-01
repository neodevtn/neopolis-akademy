import { AlertTriangle, CheckCircle2, Clock3, FileQuestion, Lock, ShieldCheck } from "lucide-react";
import type { ExamConfiguration } from "@shared/examConfiguration";
import { buildExamLearnerPreviewModel } from "./examLearnerPreviewModel";

interface ExamLearnerPreviewProps {
  certificationTitle: string;
  certificationIcon?: string;
  configuration: ExamConfiguration;
  availableQuestions: number;
}

/** Aperçu non interactif de l’introduction apprenant ; aucune session n’est créée. */
export function ExamLearnerPreview({ certificationTitle, certificationIcon, configuration, availableQuestions }: ExamLearnerPreviewProps) {
  const preview = buildExamLearnerPreviewModel(configuration, availableQuestions);
  const statusStyle = preview.state === "ready"
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : preview.state === "draft"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-red-200 bg-red-50 text-red-800";
  const StatusIcon = preview.state === "ready" ? CheckCircle2 : preview.state === "draft" ? Lock : AlertTriangle;
  const domainLabel = (domain: ExamConfiguration["domains"][number]["name"]) => typeof domain === "string" ? domain : domain.fr || domain.en || "Domaine";

  return (
    <section aria-label="Prévisualisation du parcours apprenant" className="max-w-full min-w-0 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
      <div className="mx-auto w-full min-w-0 max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-xl" aria-hidden="true">{certificationIcon || "🎓"}</div>
          <div className="min-w-0"><p className="text-xs font-medium uppercase tracking-wide text-amber-700">Examen blanc</p><h3 className="truncate text-lg font-bold text-slate-900">{certificationTitle}</h3></div>
        </div>

        <div className={`mb-5 flex items-start gap-2 rounded-xl border p-3 text-sm ${statusStyle}`}>
          <StatusIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div><p className="font-semibold">{preview.title}</p><p className="mt-0.5">{preview.description}</p></div>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <h4 className="mb-3 font-semibold text-slate-800">Détails de l’examen</h4>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-slate-500">Code examen</dt><dd className="font-medium text-slate-800">{configuration.examCode || "À définir"}</dd></div>
            <div><dt className="text-slate-500">Questions</dt><dd className="font-medium text-slate-800">{preview.displayedQuestionCount}</dd></div>
            <div><dt className="flex items-center gap-1 text-slate-500"><Clock3 className="h-3.5 w-3.5" /> Durée</dt><dd className="font-medium text-slate-800">{configuration.timeLimit} min</dd></div>
            <div><dt className="text-slate-500">Score de passage</dt><dd className="font-medium text-slate-800">{configuration.passingScore}/1000</dd></div>
          </dl>
        </div>

        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <div className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><div><p className="font-semibold">Conditions d’examen</p><ul className="mt-2 list-inside list-disc space-y-1"><li>Les questions sont présentées une par une.</li><li>Le chronomètre démarre au lancement.</li><li>À l’expiration, la tentative est soumise et ne peut pas obtenir de certificat.</li><li>Le résultat est affiché après la dernière question ou la fin du temps.</li></ul></div></div>
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
          <p className="mb-2 flex items-center gap-1.5 font-medium text-slate-700"><FileQuestion className="h-4 w-4" /> Domaines couverts</p>
          {configuration.domains.length ? <ul className="space-y-1.5">{configuration.domains.map((domain, index) => <li className="flex items-center justify-between gap-3 text-slate-600" key={`${domainLabel(domain.name)}-${index}`}><span className="min-w-0 truncate">{domainLabel(domain.name)}</span><span className="shrink-0 font-medium text-slate-400">{domain.weight}%</span></li>)}</ul> : <p className="text-slate-500">Aucun domaine n’est affiché pour le moment.</p>}
        </div>

        <button type="button" disabled className="mt-5 w-full rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white opacity-60" aria-disabled="true">Prévisualisation uniquement — aucune session créée</button>
      </div>
    </section>
  );
}
