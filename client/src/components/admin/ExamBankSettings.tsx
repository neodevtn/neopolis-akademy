import { CircleHelp, Eye, Plus, Settings2, Shuffle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ExamConfiguration } from "@shared/examConfiguration";

interface ExamBankSettingsProps {
  configuration: ExamConfiguration;
  availableQuestions: number;
  isSaving?: boolean;
  onChange: (configuration: ExamConfiguration) => void;
  onSave: () => void;
  onPreview: () => void;
  onDisable?: () => void;
  onDelete?: () => void;
}

function FieldHelp({ label, children }: { label: string; children: string }) {
  return <Tooltip><TooltipTrigger asChild><button type="button" className="inline-flex rounded-sm text-indigo-700 outline-none hover:text-indigo-900 focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label={`Aide : ${label}`}><CircleHelp className="h-3.5 w-3.5" aria-hidden="true" /></button></TooltipTrigger><TooltipContent side="top" sideOffset={6} className="max-w-72 leading-relaxed">{children}</TooltipContent></Tooltip>;
}

/** Dedicated configuration interface for an exam drawn from a reusable question bank. */
export function ExamBankSettings({ configuration, availableQuestions, isSaving, onChange, onSave, onPreview, onDisable, onDelete }: ExamBankSettingsProps) {
  const patch = (value: Partial<ExamConfiguration>) => onChange({ ...configuration, ...value });
  const domainLabel = (name: ExamConfiguration["domains"][number]["name"]) => typeof name === "string" ? name : name?.fr || name?.en || "";
  const updateDomain = (index: number, value: Partial<ExamConfiguration["domains"][number]>) => patch({ domains: configuration.domains.map((domain, current) => current === index ? { ...domain, ...value } : domain) });
  return (
    <section className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-4">
      <div className="flex items-start gap-2"><Settings2 className="mt-0.5 h-5 w-5 text-indigo-700" /><div><h4 className="font-semibold">Règles de la banque d’examen</h4><p className="text-xs text-muted-foreground">La tentative utilise un sous-ensemble contrôlé de la banque ; les questions elles-mêmes restent éditables ci-dessous.</p></div></div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1"><Label className="flex items-center gap-1 text-xs" htmlFor="exam-code">Code d’examen <FieldHelp label="Code d’examen">Repère affiché aux apprenants. Utilisez un code court, stable et unique, par exemple NEO-AI-001.</FieldHelp></Label><Input id="exam-code" value={configuration.examCode} placeholder="Ex. NEO-AI-001" onChange={(event) => patch({ examCode: event.target.value })} /></div>
        <div className="space-y-1"><Label className="flex items-center gap-1 text-xs" htmlFor="exam-question-count">Questions par tentative <FieldHelp label="Questions par tentative">Nombre de questions tirées pour chaque session. Il ne peut pas dépasser les questions publiables de la banque.</FieldHelp></Label><Input id="exam-question-count" type="number" min={1} max={Math.max(1, availableQuestions)} value={configuration.totalQuestions} onChange={(event) => patch({ totalQuestions: Number(event.target.value) })} /><p className="text-[11px] text-muted-foreground">{availableQuestions} disponibles dans la banque</p></div>
        <div className="space-y-1"><Label className="flex items-center gap-1 text-xs" htmlFor="exam-time-limit">Durée (minutes) <FieldHelp label="Durée">Limite appliquée par le serveur dès le démarrage. Une soumission après expiration est non réussie et ne peut pas attribuer de certificat.</FieldHelp></Label><Input id="exam-time-limit" type="number" min={1} max={600} value={configuration.timeLimit} onChange={(event) => patch({ timeLimit: Number(event.target.value) })} /></div>
        <div className="space-y-1"><Label className="flex items-center gap-1 text-xs" htmlFor="exam-passing-score">Score minimal (100–1000) <FieldHelp label="Score minimal">Seuil de réussite vérifié par le serveur. Par exemple, 720 correspond à 72 % sur l’échelle de notation de l’examen.</FieldHelp></Label><Input id="exam-passing-score" type="number" min={100} max={1000} value={configuration.passingScore} onChange={(event) => patch({ passingScore: Number(event.target.value) })} /></div>
        <label className="flex items-center gap-2 pt-6 text-xs"><Switch checked={configuration.shuffleQuestions} onCheckedChange={(checked) => patch({ shuffleQuestions: checked })} /><span><Shuffle className="mr-1 inline h-3.5 w-3.5" /> Mélanger les questions</span><FieldHelp label="Mélanger les questions">Change l’ordre des questions sélectionnées à chaque nouvelle session, sans changer les réponses attendues.</FieldHelp></label>
        <label className="flex items-center gap-2 pt-6 text-xs"><Switch checked={configuration.shuffleChoices} onCheckedChange={(checked) => patch({ shuffleChoices: checked })} /><span>Mélanger les choix</span><FieldHelp label="Mélanger les choix">Change uniquement l’ordre d’affichage des propositions. La notation conserve les bonnes réponses configurées.</FieldHelp></label>
        <label className="flex items-center gap-2 pt-6 text-xs"><Switch checked={configuration.isPublished} onCheckedChange={(checked) => patch({ isPublished: checked })} /><span>Publier l’examen pour les apprenants</span><FieldHelp label="Publication">Rend l’examen disponible seulement aux apprenants qui ont terminé tous les cours requis. Désactivez cette option pour préparer une banque sans la rendre accessible.</FieldHelp></label>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2"><Button size="sm" variant="outline" onClick={onPreview}><Eye className="mr-1 h-3.5 w-3.5" /> Prévisualiser côté apprenant</Button>{onDelete && <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={onDelete} disabled={isSaving}>Supprimer l’examen</Button>}{configuration.isPublished && onDisable && <Button size="sm" variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10" onClick={onDisable} disabled={isSaving}>Dépublier l’examen</Button>}<Button size="sm" className="bg-indigo-700 hover:bg-indigo-800" onClick={onSave} disabled={isSaving}>Sauvegarder les règles</Button></div>
      <div className="mt-5 border-t border-indigo-200 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><h5 className="flex items-center gap-1 text-sm font-semibold">Domaines et pondérations <FieldHelp label="Domaines et pondérations">Les domaines structurent le résumé visible avant le passage. Les pondérations sont indicatives tant que les questions ne sont pas réparties et notées par domaine.</FieldHelp></h5><p className="text-xs text-muted-foreground">Affichés aux apprenants sur l’introduction de l’examen.</p></div><Button type="button" size="sm" variant="outline" onClick={() => patch({ domains: [...configuration.domains, { name: "", weight: 0 }] })}><Plus className="mr-1 h-3.5 w-3.5" /> Ajouter un domaine</Button></div>
        {configuration.domains.length ? <div className="mt-3 space-y-2">{configuration.domains.map((domain, index) => <div className="grid grid-cols-[minmax(0,1fr)_110px_auto] gap-2" key={`${domainLabel(domain.name)}-${index}`}><Input aria-label={`Domaine ${index + 1}`} value={domainLabel(domain.name)} placeholder="Ex. Fondamentaux" onChange={(event) => updateDomain(index, { name: { fr: event.target.value, en: typeof domain.name === "object" ? domain.name.en || event.target.value : event.target.value } })} /><Input aria-label={`Pondération du domaine ${index + 1}`} type="number" min={0} max={100} value={domain.weight} onChange={(event) => updateDomain(index, { weight: Number(event.target.value) })} /><Button type="button" size="icon" variant="ghost" aria-label={`Supprimer le domaine ${index + 1}`} onClick={() => patch({ domains: configuration.domains.filter((_, current) => current !== index) })}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>)}</div> : <p className="mt-3 text-xs text-muted-foreground">Aucun domaine n’est renseigné. Vous pouvez publier un examen sans pondération par domaine.</p>}
      </div>
    </section>
  );
}
