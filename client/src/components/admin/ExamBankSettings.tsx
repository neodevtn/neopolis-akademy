import { Settings2, Shuffle } from "lucide-react";
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
}

/** Dedicated configuration interface for an exam drawn from a reusable question bank. */
export function ExamBankSettings({ configuration, availableQuestions, isSaving, onChange, onSave }: ExamBankSettingsProps) {
  const patch = (value: Partial<ExamConfiguration>) => onChange({ ...configuration, ...value });
  return (
    <section className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-4">
      <div className="flex items-start gap-2"><Settings2 className="mt-0.5 h-5 w-5 text-indigo-700" /><div><h4 className="font-semibold">Règles de la banque d’examen</h4><p className="text-xs text-muted-foreground">La tentative utilise un sous-ensemble contrôlé de la banque ; les questions elles-mêmes restent éditables ci-dessous.</p></div></div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="space-y-1"><Label className="text-xs" htmlFor="exam-question-count">Questions par tentative</Label><Input id="exam-question-count" type="number" min={1} max={Math.max(1, availableQuestions)} value={configuration.questionCount} onChange={(event) => patch({ questionCount: Number(event.target.value) })} /></div>
        <div className="space-y-1"><Label className="text-xs" htmlFor="exam-passing-score">Score minimal (%)</Label><Input id="exam-passing-score" type="number" min={1} max={100} value={configuration.passingScore} onChange={(event) => patch({ passingScore: Number(event.target.value) })} /></div>
        <label className="flex items-center gap-2 pt-6 text-xs"><Switch checked={configuration.shuffleQuestions} onCheckedChange={(checked) => patch({ shuffleQuestions: checked })} /><span><Shuffle className="mr-1 inline h-3.5 w-3.5" /> Mélanger les questions</span></label>
        <label className="flex items-center gap-2 pt-6 text-xs"><Switch checked={configuration.shuffleChoices} onCheckedChange={(checked) => patch({ shuffleChoices: checked })} /> Mélanger les choix</label>
      </div>
      <div className="mt-3 flex justify-end"><Button size="sm" className="bg-indigo-700 hover:bg-indigo-800" onClick={onSave} disabled={isSaving}>Sauvegarder les règles</Button></div>
    </section>
  );
}
