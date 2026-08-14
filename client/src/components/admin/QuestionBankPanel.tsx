import { useEffect, useState } from "react";
import { Dice5, Plus, Save, Shuffle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { normalizeQuestionBank, serializeQuestionBank, type QuestionBank, type QuestionSelectionSettings } from "@shared/questionBank";

interface QuestionBankPanelProps {
  rawBank: unknown;
  onSave: (bank: QuestionBank) => void;
  onAddQuestion: () => void;
}

/** Dedicated authoring panel for randomised checkpoint / lesson quiz banks. */
export function QuestionBankPanel({ rawBank, onSave, onAddQuestion }: QuestionBankPanelProps) {
  const bank = normalizeQuestionBank(rawBank);
  const [settings, setSettings] = useState<QuestionSelectionSettings>(bank.selection);

  useEffect(() => setSettings(bank.selection), [rawBank]);

  const update = (partial: Partial<QuestionSelectionSettings>) => setSettings((current) => ({ ...current, ...partial }));
  const selectedCount = Math.min(Math.max(1, Number(settings.questionCount) || 1), Math.max(1, bank.questions.length));
  const threshold = Math.min(Math.max(1, Number(settings.passThreshold) || 1), selectedCount);

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2"><Dice5 className="h-4 w-4 text-amber-700" /><h4 className="text-sm font-semibold">Banque de questions</h4><Badge variant="secondary">{bank.questions.length} disponibles</Badge></div>
          <p className="mt-1 text-xs text-muted-foreground">Définissez le tirage utilisé dans un checkpoint ou un quiz sans modifier les questions individuelles.</p>
        </div>
        <Button size="sm" variant="outline" onClick={onAddQuestion}><Plus className="mr-1 h-3.5 w-3.5" /> Ajouter une question</Button>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-4">
        <div className="space-y-1"><Label htmlFor="selection-count" className="text-xs">Questions par tentative</Label><Input id="selection-count" type="number" min={1} max={Math.max(1, bank.questions.length)} value={settings.mode === "all" ? bank.questions.length : settings.questionCount} disabled={settings.mode === "all"} onChange={(event) => update({ questionCount: Number(event.target.value) })} /></div>
        <div className="space-y-1"><Label htmlFor="pass-threshold" className="text-xs">Bonnes réponses requises</Label><Input id="pass-threshold" type="number" min={1} max={selectedCount} value={settings.passThreshold} onChange={(event) => update({ passThreshold: Number(event.target.value) })} /></div>
        <label className="flex items-center gap-2 pt-6 text-xs"><Switch checked={settings.mode === "random"} onCheckedChange={(checked) => update({ mode: checked ? "random" : "all" })} /> <span><Shuffle className="mr-1 inline h-3.5 w-3.5" /> Tirage aléatoire</span></label>
        <label className="flex items-center gap-2 pt-6 text-xs"><Switch checked={settings.shuffleChoices} onCheckedChange={(checked) => update({ shuffleChoices: checked })} /> Mélanger les choix</label>
      </div>
      <div className="mt-3 flex justify-end"><Button size="sm" className="bg-amber-700 hover:bg-amber-800" onClick={() => onSave({ questions: bank.questions, selection: { ...settings, questionCount: selectedCount, passThreshold: threshold } })}><Save className="mr-1 h-3.5 w-3.5" /> Sauvegarder les règles</Button></div>
    </div>
  );
}
