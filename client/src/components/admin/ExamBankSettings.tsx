import { Plus, Settings2, Shuffle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ExamConfiguration } from "@shared/examConfiguration";

interface ExamBankSettingsProps {
  configuration: ExamConfiguration;
  availableQuestions: number;
  isSaving?: boolean;
  onChange: (configuration: ExamConfiguration) => void;
  onSave: () => void;
  onDisable?: () => void;
  onDelete?: () => void;
}

/** Dedicated configuration interface for an exam drawn from a reusable question bank. */
export function ExamBankSettings({ configuration, availableQuestions, isSaving, onChange, onSave, onDisable, onDelete }: ExamBankSettingsProps) {
  const patch = (value: Partial<ExamConfiguration>) => onChange({ ...configuration, ...value });
  const domainLabel = (name: ExamConfiguration["domains"][number]["name"]) => typeof name === "string" ? name : name?.fr || name?.en || "";
  const updateDomain = (index: number, value: Partial<ExamConfiguration["domains"][number]>) => patch({ domains: configuration.domains.map((domain, current) => current === index ? { ...domain, ...value } : domain) });
  return (
    <section className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-4">
      <div className="flex items-start gap-2"><Settings2 className="mt-0.5 h-5 w-5 text-indigo-700" /><div><h4 className="font-semibold">Règles de la banque d’examen</h4><p className="text-xs text-muted-foreground">La tentative utilise un sous-ensemble contrôlé de la banque ; les questions elles-mêmes restent éditables ci-dessous.</p></div></div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1"><Label className="text-xs" htmlFor="exam-code">Code d’examen</Label><Input id="exam-code" value={configuration.examCode} placeholder="Ex. NEO-AI-001" onChange={(event) => patch({ examCode: event.target.value })} /></div>
        <div className="space-y-1"><Label className="text-xs" htmlFor="exam-question-count">Questions par tentative</Label><Input id="exam-question-count" type="number" min={1} max={Math.max(1, availableQuestions)} value={configuration.totalQuestions} onChange={(event) => patch({ totalQuestions: Number(event.target.value) })} /><p className="text-[11px] text-muted-foreground">{availableQuestions} disponibles dans la banque</p></div>
        <div className="space-y-1"><Label className="text-xs" htmlFor="exam-time-limit">Durée (minutes)</Label><Input id="exam-time-limit" type="number" min={1} max={600} value={configuration.timeLimit} onChange={(event) => patch({ timeLimit: Number(event.target.value) })} /></div>
        <div className="space-y-1"><Label className="text-xs" htmlFor="exam-passing-score">Score minimal (100–1000)</Label><Input id="exam-passing-score" type="number" min={100} max={1000} value={configuration.passingScore} onChange={(event) => patch({ passingScore: Number(event.target.value) })} /></div>
        <label className="flex items-center gap-2 pt-6 text-xs"><Switch checked={configuration.shuffleQuestions} onCheckedChange={(checked) => patch({ shuffleQuestions: checked })} /><span><Shuffle className="mr-1 inline h-3.5 w-3.5" /> Mélanger les questions</span></label>
        <label className="flex items-center gap-2 pt-6 text-xs"><Switch checked={configuration.shuffleChoices} onCheckedChange={(checked) => patch({ shuffleChoices: checked })} /> Mélanger les choix</label>
        <label className="flex items-center gap-2 pt-6 text-xs"><Switch checked={configuration.isPublished} onCheckedChange={(checked) => patch({ isPublished: checked })} /><span>Publier l’examen pour les apprenants</span></label>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">{onDelete && <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={onDelete} disabled={isSaving}>Supprimer l’examen</Button>}{configuration.isPublished && onDisable && <Button size="sm" variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10" onClick={onDisable} disabled={isSaving}>Dépublier l’examen</Button>}<Button size="sm" className="bg-indigo-700 hover:bg-indigo-800" onClick={onSave} disabled={isSaving}>Sauvegarder les règles</Button></div>
      <div className="mt-5 border-t border-indigo-200 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><h5 className="text-sm font-semibold">Domaines et pondérations</h5><p className="text-xs text-muted-foreground">Affichés aux apprenants sur l’introduction de l’examen.</p></div><Button type="button" size="sm" variant="outline" onClick={() => patch({ domains: [...configuration.domains, { name: "", weight: 0 }] })}><Plus className="mr-1 h-3.5 w-3.5" /> Ajouter un domaine</Button></div>
        {configuration.domains.length ? <div className="mt-3 space-y-2">{configuration.domains.map((domain, index) => <div className="grid grid-cols-[minmax(0,1fr)_110px_auto] gap-2" key={`${domainLabel(domain.name)}-${index}`}><Input aria-label={`Domaine ${index + 1}`} value={domainLabel(domain.name)} placeholder="Ex. Fondamentaux" onChange={(event) => updateDomain(index, { name: { fr: event.target.value, en: typeof domain.name === "object" ? domain.name.en || event.target.value : event.target.value } })} /><Input aria-label={`Pondération du domaine ${index + 1}`} type="number" min={0} max={100} value={domain.weight} onChange={(event) => updateDomain(index, { weight: Number(event.target.value) })} /><Button type="button" size="icon" variant="ghost" aria-label={`Supprimer le domaine ${index + 1}`} onClick={() => patch({ domains: configuration.domains.filter((_, current) => current !== index) })}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>)}</div> : <p className="mt-3 text-xs text-muted-foreground">Aucun domaine n’est renseigné. Vous pouvez publier un examen sans pondération par domaine.</p>}
      </div>
    </section>
  );
}
