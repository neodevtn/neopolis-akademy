import { useState } from "react";
import { ClipboardCheck, FileText, Lightbulb, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { WysiwygMarkdownEditor } from "./WysiwygMarkdownEditor";
import { legacyExerciseInteractionTypes } from "@/lib/exerciseEditor";

type LegacyExerciseEditorProps = {
  exercise: any;
  onSave: (exercise: any) => void;
  onClose: () => void;
};

function localized(value: any, lang: "fr" | "en") {
  if (typeof value === "string") return value;
  return value?.[lang] || value?.en || value?.fr || "";
}

function setLocalized(value: any, lang: "fr" | "en", next: string) {
  if (typeof value === "string") return { en: lang === "en" ? next : value, fr: lang === "fr" ? next : "" };
  return { ...(value || {}), [lang]: next };
}

/**
 * Visual editor for legacy `course.exercises` objects. It keeps their data shape
 * intact while exposing the same pedagogical fields as the standard block library.
 */
export function LegacyExerciseEditor({ exercise, onSave, onClose }: LegacyExerciseEditorProps) {
  const [data, setData] = useState(() => ({ ...exercise, interactionType: exercise.interactionType || "free_text", options: exercise.options || [], inputSchema: exercise.inputSchema || {} }));
  const [lang, setLang] = useState<"fr" | "en">("fr");

  const updateLocalized = (key: string, value: string) => setData((previous: any) => ({ ...previous, [key]: setLocalized(previous[key], lang, value) }));
  const isChoice = ["single_choice", "multi_choice", "checklist"].includes(data.interactionType);
  const updateOption = (index: number, patch: any) => setData((previous: any) => ({ ...previous, options: previous.options.map((option: any, optionIndex: number) => optionIndex === index ? { ...option, ...patch } : option) }));
  const toggleCorrect = (index: number) => setData((previous: any) => ({ ...previous, options: previous.options.map((option: any, optionIndex: number) => ({ ...option, correct: previous.interactionType === "single_choice" ? optionIndex === index : optionIndex === index ? !option.correct : option.correct })) }));

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[88vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-emerald-700" /> Éditer l’exercice</DialogTitle>
          <p className="text-sm text-muted-foreground">Les éléments pédagogiques restent séparés : contexte, consigne, critères et correction.</p>
        </DialogHeader>

        <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-3">
          <div className="flex items-center gap-2 text-xs text-slate-600"><FileText className="h-4 w-4 text-slate-500" /><span>Chapitre : <strong>{data.chapterId || "non renseigné"}</strong></span></div>
          <div className="flex items-center gap-2 text-xs text-slate-600"><MessageSquareText className="h-4 w-4 text-blue-600" /><span>Type : <strong>{legacyExerciseInteractionTypes.find((type) => type.value === data.interactionType)?.label || data.interactionType}</strong></span></div>
          <div className="flex items-center gap-2 text-xs text-slate-600"><Lightbulb className="h-4 w-4 text-amber-600" /><span>Position : <strong>{data.position || "après contenu"}</strong></span></div>
        </div>

        <div className="grid gap-4 rounded-xl border p-4 md:grid-cols-2">
          <div className="space-y-1"><Label>Type de réponse</Label><Select value={data.interactionType} onValueChange={(interactionType) => setData((previous: any) => ({ ...previous, interactionType }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{legacyExerciseInteractionTypes.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1"><Label>Niveau</Label><Select value={data.difficulty || "foundation"} onValueChange={(difficulty) => setData((previous: any) => ({ ...previous, difficulty }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="foundation">Foundation</SelectItem><SelectItem value="intermediate">Intermédiaire</SelectItem><SelectItem value="advanced">Avancé</SelectItem></SelectContent></Select></div>
        </div>

        <Tabs value={lang} onValueChange={(value) => setLang(value as "fr" | "en")}>
          <TabsList><TabsTrigger value="fr">Français</TabsTrigger><TabsTrigger value="en">English</TabsTrigger></TabsList>
          <TabsContent value={lang} className="mt-4 space-y-5">
            <div className="space-y-1"><Label>Titre de l’exercice</Label><Input value={localized(data.title, lang)} onChange={(event) => updateLocalized("title", event.target.value)} placeholder="Intitulé visible par l’apprenant" /></div>
            {(data.interactionType === "free_text" || data.interactionType === "scenario") && <div className="grid gap-4 rounded-xl border p-4 md:grid-cols-2"><div className="space-y-1"><Label>Nombre minimal de mots</Label><Input type="number" min={1} value={data.inputSchema?.minWords || 5} onChange={(event) => setData((previous: any) => ({ ...previous, inputSchema: { ...previous.inputSchema, minWords: Number(event.target.value) || 1 } }))} /></div><div className="space-y-1"><Label>Nombre maximal de mots (facultatif)</Label><Input type="number" min={1} value={data.inputSchema?.maxWords || ""} onChange={(event) => setData((previous: any) => ({ ...previous, inputSchema: { ...previous.inputSchema, maxWords: event.target.value ? Number(event.target.value) : undefined } }))} /></div></div>}
            {data.interactionType === "code" && <div className="space-y-1 rounded-xl border p-4"><Label>Langage attendu</Label><Select value={data.inputSchema?.language || "python"} onValueChange={(language) => setData((previous: any) => ({ ...previous, inputSchema: { ...previous.inputSchema, language } }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="python">Python</SelectItem><SelectItem value="javascript">JavaScript</SelectItem><SelectItem value="typescript">TypeScript</SelectItem><SelectItem value="sql">SQL</SelectItem></SelectContent></Select></div>}
            {isChoice && <section className="space-y-3 rounded-xl border border-violet-200 bg-violet-50/30 p-4"><div className="flex items-start justify-between gap-4"><div><Label>Réponses proposées</Label><p className="mt-1 text-xs text-muted-foreground">Sélectionnez {data.interactionType === "single_choice" ? "une seule réponse correcte" : "toutes les réponses correctes"}. Cette configuration utilise le même modèle que les QCM standardisés.</p></div><Button type="button" size="sm" variant="outline" onClick={() => setData((previous: any) => ({ ...previous, options: [...previous.options, { id: String.fromCharCode(97 + previous.options.length), text: { fr: "", en: "" }, correct: false }] }))}>Ajouter</Button></div>{data.options.map((option: any, index: number) => <div key={option.id || index} className="grid gap-2 rounded-lg border bg-background p-2 md:grid-cols-[auto_1fr_auto]"><button type="button" className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${option.correct ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 text-slate-400"}`} onClick={() => toggleCorrect(index)} aria-label={`Définir l’option ${index + 1} comme correcte`}>{option.correct ? "✓" : String.fromCharCode(65 + index)}</button><Input value={localized(option.text, lang)} onChange={(event) => updateOption(index, { text: setLocalized(option.text, lang, event.target.value) })} placeholder={`Option ${index + 1}`} /><Button type="button" size="sm" variant="ghost" className="text-destructive" disabled={data.options.length <= 2} onClick={() => setData((previous: any) => ({ ...previous, options: previous.options.filter((_: any, optionIndex: number) => optionIndex !== index) }))}>Retirer</Button></div>)}</section>}
            <section className="space-y-2 rounded-xl border border-slate-200 p-4"><div><Label>Contexte pédagogique</Label><p className="mt-1 text-xs text-muted-foreground">Informations, scénario, données ou situation à analyser avant de répondre.</p></div><WysiwygMarkdownEditor value={localized(data.prompt, lang)} onChange={(value) => updateLocalized("prompt", value)} minHeight="160px" placeholder="Décrivez le contexte de l’exercice…" /></section>
            <section className="space-y-2 rounded-xl border border-blue-200 bg-blue-50/30 p-4"><div><Label>Consigne pour l’apprenant</Label><p className="mt-1 text-xs text-muted-foreground">Action attendue, format de réponse et critères de remise.</p></div><WysiwygMarkdownEditor value={localized(data.instructions, lang)} onChange={(value) => updateLocalized("instructions", value)} minHeight="140px" placeholder="Expliquez précisément ce que l’apprenant doit faire…" /></section>
            <section className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/30 p-4"><div><Label>Critères d’évaluation internes</Label><p className="mt-1 text-xs text-muted-foreground">Ces critères guident la correction ; ils ne remplacent pas la consigne affichée à l’apprenant.</p></div><Textarea rows={3} value={localized(data.rubric, lang)} onChange={(event) => updateLocalized("rubric", event.target.value)} placeholder="Éléments attendus, tolérances, barème…" /></section>
            <section className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/30 p-4"><div><Label>Correction et feedback après tentative</Label><p className="mt-1 text-xs text-muted-foreground">Cette partie reste masquée pour l’apprenant jusqu’à sa réponse.</p></div><WysiwygMarkdownEditor value={localized(data.correction, lang)} onChange={(value) => updateLocalized("correction", value)} minHeight="160px" placeholder="Rédigez la correction, les points clés et le feedback…" /></section>
          </TabsContent>
        </Tabs>
        <DialogFooter><Button variant="outline" onClick={onClose}>Annuler</Button><Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => onSave(data)}>Sauvegarder l’exercice</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
