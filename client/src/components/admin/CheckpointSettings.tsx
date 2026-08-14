import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, ClipboardCheck, Link2, Plus, Trash2 } from "lucide-react";

interface CheckpointSettingsProps {
  chapter: any;
  onChange: (chapter: any) => void;
}

/** Dedicated configuration for chapter-level checkpoint gates. */
export function CheckpointSettings({ chapter, onChange }: CheckpointSettingsProps) {
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const questions = useMemo(() => chapter.questions || chapter.block?.questions || [], [chapter.questions, chapter.block?.questions]);
  const readLocalized = (value: unknown) => typeof value === "string" ? value : (value as any)?.[lang] || (value as any)?.fr || (value as any)?.en || "";
  const writeLocalized = (value: unknown, next: string) => typeof value === "string"
    ? { fr: lang === "fr" ? next : value, en: lang === "en" ? next : "" }
    : { ...(value as any || {}), [lang]: next };
  const set = (key: string, value: unknown) => onChange({ ...chapter, [key]: value });
  const setQuestions = (nextQuestions: any[]) => onChange({
    ...chapter,
    questions: nextQuestions,
    ...(chapter.block?.type === "checkpoint" ? { block: { ...chapter.block, questions: nextQuestions } } : {}),
  });
  const updateQuestion = (index: number, patch: Record<string, unknown>) => setQuestions(questions.map((question: any, questionIndex: number) => questionIndex === index ? { ...question, ...patch } : question));
  const addQuestion = () => setQuestions([
    ...questions,
    {
      id: `question_${Date.now()}`,
      question: { fr: "", en: "" },
      choices: [
        { id: "a", text: { fr: "", en: "" } },
        { id: "b", text: { fr: "", en: "" } },
      ],
      correctId: "a",
      explanation: { fr: "", en: "" },
    },
  ]);
  const removeQuestion = (index: number) => setQuestions(questions.filter((_: any, questionIndex: number) => questionIndex !== index));

  return (
    <section className="mb-5 rounded-xl border border-orange-200 bg-orange-50/70 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <div className="rounded-lg bg-orange-100 p-2"><ClipboardCheck className="h-5 w-5 text-orange-700" /></div>
          <div>
            <h4 className="font-semibold text-orange-950">Point de validation</h4>
            <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">Créez les questions que l’apprenant doit valider avant de poursuivre. Les identifiants techniques restent masqués dans les options avancées.</p>
          </div>
        </div>
        <div className="flex rounded-md border bg-background p-0.5 text-xs">
          <Button type="button" size="sm" variant={lang === "fr" ? "secondary" : "ghost"} className="h-7" onClick={() => setLang("fr")}>FR</Button>
          <Button type="button" size="sm" variant={lang === "en" ? "secondary" : "ghost"} className="h-7" onClick={() => setLang("en")}>EN</Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div className="space-y-1">
          <Label htmlFor="checkpoint-title" className="text-xs">Titre du checkpoint</Label>
          <Input id="checkpoint-title" value={readLocalized(chapter.title)} onChange={(event) => set("title", writeLocalized(chapter.title, event.target.value))} placeholder="Vérifiez vos acquis" />
        </div>
        <label className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm"><Switch checked={chapter.requiredBeforeAdvance !== false} onCheckedChange={(checked) => set("requiredBeforeAdvance", checked)} /> Validation obligatoire</label>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div><p className="text-sm font-semibold">Questions de validation</p><p className="text-xs text-muted-foreground">{questions.length} question{questions.length > 1 ? "s" : ""} configurée{questions.length > 1 ? "s" : ""}</p></div>
          <Button type="button" size="sm" onClick={addQuestion}><Plus className="mr-1 h-3.5 w-3.5" /> Ajouter une question</Button>
        </div>
        {questions.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-background/60 p-5 text-center text-sm text-muted-foreground">Ajoutez une première question de validation. Vous pourrez définir les réponses et la correction sans manipuler d’ID.</div>
        ) : questions.map((question: any, questionIndex: number) => {
          const choices = question.choices || question.options || [];
          const updateChoices = (nextChoices: any[]) => updateQuestion(questionIndex, { choices: nextChoices, options: undefined });
          return (
            <div key={question.id || questionIndex} className="rounded-lg border bg-background p-3">
              <div className="mb-3 flex items-center justify-between gap-2"><Badge variant="outline">Question {questionIndex + 1}</Badge><Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeQuestion(questionIndex)} aria-label="Supprimer la question"><Trash2 className="h-3.5 w-3.5" /></Button></div>
              <Label className="text-xs">Énoncé</Label>
              <Textarea className="mt-1" rows={2} value={readLocalized(question.question)} onChange={(event) => updateQuestion(questionIndex, { question: writeLocalized(question.question, event.target.value) })} placeholder="Saisissez la question…" />
              <div className="mt-3 space-y-2">
                <Label className="text-xs">Réponses proposées</Label>
                {choices.map((choice: any, choiceIndex: number) => (
                  <div key={choice.id || choiceIndex} className="flex items-center gap-2">
                    <Badge className="w-7 justify-center bg-slate-100 text-slate-700 hover:bg-slate-100">{choice.id || String.fromCharCode(97 + choiceIndex)}</Badge>
                    <Input className="flex-1" value={readLocalized(choice.text)} onChange={(event) => updateChoices(choices.map((currentChoice: any, currentIndex: number) => currentIndex === choiceIndex ? { ...currentChoice, text: writeLocalized(currentChoice.text, event.target.value) } : currentChoice))} placeholder={`Réponse ${choiceIndex + 1}`} />
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateChoices(choices.filter((_: any, currentIndex: number) => currentIndex !== choiceIndex))} disabled={choices.length <= 2} aria-label="Supprimer la réponse"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => updateChoices([...choices, { id: String.fromCharCode(97 + choices.length), text: { fr: "", en: "" } }])}><Plus className="mr-1 h-3.5 w-3.5" /> Ajouter une réponse</Button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div><Label className="text-xs">Bonne réponse</Label><Select value={question.correctId || question.answer || choices[0]?.id || "a"} onValueChange={(correctId) => updateQuestion(questionIndex, { correctId })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{choices.map((choice: any, choiceIndex: number) => <SelectItem key={choice.id || choiceIndex} value={choice.id || String.fromCharCode(97 + choiceIndex)}>{choice.id || String.fromCharCode(97 + choiceIndex)} — {readLocalized(choice.text) || `Réponse ${choiceIndex + 1}`}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="text-xs">Explication après réponse</Label><Textarea className="mt-1" rows={2} value={readLocalized(question.explanation)} onChange={(event) => updateQuestion(questionIndex, { explanation: writeLocalized(question.explanation, event.target.value) })} placeholder="Expliquez pourquoi la réponse est correcte…" /></div>
              </div>
            </div>
          );
        })}
      </div>

      <Accordion type="single" collapsible className="mt-4 rounded-lg border bg-background/70 px-3">
        <AccordionItem value="advanced" className="border-0"><AccordionTrigger className="py-3 text-xs text-muted-foreground hover:no-underline"><span className="flex items-center gap-2"><Link2 className="h-3.5 w-3.5" /> Options avancées : référence externe ou banque</span></AccordionTrigger><AccordionContent className="pb-3"><Label htmlFor="checkpoint-exercise" className="text-xs">Référence externe optionnelle</Label><Input id="checkpoint-exercise" className="mt-1" value={chapter.exerciseId || ""} onChange={(event) => set("exerciseId", event.target.value)} placeholder="À renseigner uniquement si vous liez un exercice existant" /><p className="mt-1 text-[11px] text-muted-foreground">Les questions créées ci-dessus restent la méthode recommandée pour une édition visuelle.</p></AccordionContent></AccordionItem>
      </Accordion>
    </section>
  );
}
