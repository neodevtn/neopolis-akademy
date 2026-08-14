import { Link2, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface CheckpointSettingsProps {
  chapter: any;
  onChange: (chapter: any) => void;
}

/** Dedicated configuration for chapter-level checkpoint gates. */
export function CheckpointSettings({ chapter, onChange }: CheckpointSettingsProps) {
  const set = (key: string, value: unknown) => onChange({ ...chapter, [key]: value });
  return (
    <section className="mb-4 rounded-lg border border-orange-200 bg-orange-50/70 p-4">
      <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-orange-700" /><div><h4 className="font-semibold">Configuration du checkpoint</h4><p className="text-xs text-muted-foreground">Ce point de validation peut bloquer le passage à la suite et référencer un exercice ou une banque de questions.</p></div></div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="space-y-1"><Label htmlFor="checkpoint-exercise" className="text-xs">ID de l’exercice ou de la banque associée</Label><div className="flex items-center gap-2"><Link2 className="h-4 w-4 text-muted-foreground" /><Input id="checkpoint-exercise" value={chapter.exerciseId || ""} onChange={(event) => set("exerciseId", event.target.value)} placeholder="ex_course_001" /></div></div>
        <label className="flex items-center gap-2 pt-6 text-sm"><Switch checked={chapter.requiredBeforeAdvance !== false} onCheckedChange={(checked) => set("requiredBeforeAdvance", checked)} /> Validation obligatoire avant de continuer</label>
      </div>
    </section>
  );
}
