import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const sourceOptions = [
  ["lesson_completed", "Leçon terminée"], ["exercise_passed", "Exercice réussi"], ["quiz_passed", "Quiz réussi"], ["checkpoint_passed", "Checkpoint réussi"], ["course_completed", "Cours terminé"], ["skill_badge", "Badge obtenu"], ["certification", "Certification obtenue"],
] as const;

function localized(value: any, lang: "fr" | "en") { return typeof value === "string" ? (lang === "fr" ? value : "") : value?.[lang] || ""; }

export function CompetencyManager() {
  const frameworkQuery = trpc.competencies.getFramework.useQuery();
  const saveMutation = trpc.competencies.saveFramework.useMutation({ onSuccess: () => { toast.success("Référentiel de compétences sauvegardé."); frameworkQuery.refetch(); }, onError: (error) => toast.error(error.message) });
  const backfillMutation = trpc.competencies.backfill.useMutation({ onSuccess: (result) => toast.success(`${result.created} contribution${result.created > 1 ? "s" : ""} ajoutée${result.created > 1 ? "s" : ""} à partir des réussites existantes.`), onError: (error) => toast.error(error.message) });
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);

  useEffect(() => {
    if (!frameworkQuery.data) return;
    setDefinitions(frameworkQuery.data.definitions.map((item: any) => ({ ...item, maxPoints: String(item.maxPoints) })));
    setRules(frameworkQuery.data.rules.map((item: any) => ({ ...item, points: String(item.points), minScore: item.minScore === null ? "" : String(item.minScore) })));
  }, [frameworkQuery.data]);

  const updateDefinition = (index: number, patch: Record<string, any>) => setDefinitions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  const updateRule = (index: number, patch: Record<string, any>) => setRules((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  const save = () => {
    if (definitions.some((definition) => !definition.id || !localized(definition.title, "fr") || Number(definition.maxPoints) <= 0)) return toast.error("Chaque compétence doit avoir un identifiant, un titre français et un maximum positif.");
    if (rules.some((rule) => !rule.competencyId || !rule.label || Number(rule.points) <= 0)) return toast.error("Chaque règle doit cibler une compétence, avoir un libellé et des points positifs.");
    saveMutation.mutate({ definitions: definitions.map((definition, index) => ({ ...definition, sortOrder: index * 10, active: definition.active ? 1 : 0 })), rules: rules.map((rule, index) => ({ ...rule, minScore: rule.minScore === "" ? null : rule.minScore, sortOrder: index * 10, active: rule.active ? 1 : 0 })) });
  };

  if (frameworkQuery.isLoading) return <div className="rounded-2xl border border-border p-7 text-sm text-muted-foreground">Chargement du référentiel de compétences…</div>;
  return <section className="mt-8 space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><h2 className="text-lg font-semibold text-foreground">Compétences graduées et règles de points</h2><p className="mt-1 max-w-3xl text-sm text-muted-foreground">Chaque règle ajoute le nombre de points indiqué à la compétence choisie après une réussite vérifiée. La somme est plafonnée à 100 par compétence.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => backfillMutation.mutate()} disabled={backfillMutation.isPending}>Recalculer les acquis existants</Button><Button onClick={save} disabled={saveMutation.isPending}><Save className="mr-1.5 h-4 w-4" /> Sauvegarder le référentiel</Button></div></div>

    <div className="space-y-4"><div className="flex items-center justify-between"><h3 className="font-semibold text-foreground">Compétences</h3><Button variant="outline" size="sm" onClick={() => setDefinitions((current) => [...current, { id: `competence_${Date.now()}`, title: { fr: "Nouvelle compétence", en: "New competency" }, description: { fr: "", en: "" }, category: "IA", icon: "sparkles", color: "blue", maxPoints: "100", active: true }])}><Plus className="mr-1 h-4 w-4" /> Ajouter</Button></div>
      <div className="space-y-3">{definitions.map((definition, index) => <div key={`${definition.id}-${index}`} className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-12"><div className="md:col-span-2"><Label>Identifiant</Label><Input value={definition.id} onChange={(event) => updateDefinition(index, { id: event.target.value.replace(/[^a-z0-9_-]/gi, "_").toLowerCase() })} /></div><div className="md:col-span-3"><Label>Titre FR</Label><Input value={localized(definition.title, "fr")} onChange={(event) => updateDefinition(index, { title: { ...(definition.title || {}), fr: event.target.value } })} /></div><div className="md:col-span-3"><Label>Titre EN</Label><Input value={localized(definition.title, "en")} onChange={(event) => updateDefinition(index, { title: { ...(definition.title || {}), en: event.target.value } })} /></div><div className="md:col-span-2"><Label>Catégorie</Label><Input value={definition.category} onChange={(event) => updateDefinition(index, { category: event.target.value })} /></div><div className="md:col-span-1"><Label>Max.</Label><Input type="number" min="1" max="100" value={definition.maxPoints} onChange={(event) => updateDefinition(index, { maxPoints: event.target.value })} /></div><div className="flex items-end gap-2 md:col-span-1"><Switch checked={!!definition.active} onCheckedChange={(active) => updateDefinition(index, { active })} /><Button aria-label="Retirer la compétence" size="icon" variant="ghost" onClick={() => setDefinitions((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4 text-destructive" /></Button></div><div className="md:col-span-12"><Label>Description FR</Label><Textarea className="min-h-16" value={localized(definition.description, "fr")} onChange={(event) => updateDefinition(index, { description: { ...(definition.description || {}), fr: event.target.value } })} /></div></div>)}</div>
    </div>

    <div className="space-y-4 border-t border-border pt-6"><div className="flex items-center justify-between"><h3 className="font-semibold text-foreground">Règles de contribution</h3><Button variant="outline" size="sm" onClick={() => setRules((current) => [...current, { competencyId: definitions[0]?.id || "", sourceType: "lesson_completed", sourceKey: "*", label: "Nouvelle contribution", points: "0.5", minScore: "", active: true }])}><Plus className="mr-1 h-4 w-4" /> Ajouter une règle</Button></div><p className="text-xs text-muted-foreground">Utilisez <code className="rounded bg-secondary px-1">*</code> pour toutes les sources de ce type, ou l’identifiant exact d’un cours/certification pour cibler un élément précis.</p>
      <div className="space-y-3">{rules.map((rule, index) => <div key={`${rule.id || "new"}-${index}`} className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-12"><div className="md:col-span-3"><Label>Compétence</Label><Select value={rule.competencyId} onValueChange={(competencyId) => updateRule(index, { competencyId })}><SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger><SelectContent>{definitions.map((definition) => <SelectItem key={definition.id} value={definition.id}>{localized(definition.title, "fr") || definition.id}</SelectItem>)}</SelectContent></Select></div><div className="md:col-span-2"><Label>Événement</Label><Select value={rule.sourceType} onValueChange={(sourceType) => updateRule(index, { sourceType })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{sourceOptions.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div><div className="md:col-span-2"><Label>Source</Label><Input value={rule.sourceKey} onChange={(event) => updateRule(index, { sourceKey: event.target.value })} placeholder="* ou ID" /></div><div className="md:col-span-3"><Label>Libellé visible</Label><Input value={rule.label} onChange={(event) => updateRule(index, { label: event.target.value })} /></div><div className="md:col-span-1"><Label>Points</Label><Input type="number" step="0.5" min="0.1" value={rule.points} onChange={(event) => updateRule(index, { points: event.target.value })} /></div><div className="md:col-span-1"><Label>Score min.</Label><Input type="number" step="0.5" min="0" max="100" value={rule.minScore} onChange={(event) => updateRule(index, { minScore: event.target.value })} placeholder="—" /></div><div className="flex items-end gap-2 md:col-span-12"><Switch checked={!!rule.active} onCheckedChange={(active) => updateRule(index, { active })} /><span className="text-xs text-muted-foreground">Règle active</span><Button className="ml-auto" aria-label="Supprimer la règle" size="icon" variant="ghost" onClick={() => setRules((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></div>)}</div>
    </div>
  </section>;
}
