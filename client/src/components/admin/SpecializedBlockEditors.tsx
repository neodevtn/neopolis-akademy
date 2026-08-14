import { useState, type ReactNode } from "react";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckpointSettings } from "./CheckpointSettings";

type EditorProps = { block: any; onSave: (data: any) => void; onClose: () => void };

function localized(value: any, lang: "fr" | "en") {
  if (typeof value === "string") return value;
  return value?.[lang] || value?.fr || value?.en || "";
}

function setLocalized(value: any, lang: "fr" | "en", next: string) {
  return typeof value === "string"
    ? { fr: lang === "fr" ? next : value, en: lang === "en" ? next : "" }
    : { ...(value || {}), [lang]: next };
}

function EditorShell({ title, children, onSave, onClose }: { title: string; children: ReactNode; onSave: () => void; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        {children}
        <DialogFooter><Button variant="outline" onClick={onClose}>Annuler</Button><Button className="bg-emerald-600 hover:bg-emerald-700" onClick={onSave}>Sauvegarder</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LanguageTabs({ lang, setLang }: { lang: "fr" | "en"; setLang: (lang: "fr" | "en") => void }) {
  return <div className="flex w-fit rounded-md border bg-muted/30 p-0.5 text-xs"><Button type="button" variant={lang === "fr" ? "secondary" : "ghost"} size="sm" onClick={() => setLang("fr")}>FR</Button><Button type="button" variant={lang === "en" ? "secondary" : "ghost"} size="sm" onClick={() => setLang("en")}>EN</Button></div>;
}

/** Applies the checkpoint form to legacy checkpoint blocks inside a chapter. */
export function CheckpointBlockEditor({ block, onSave, onClose }: EditorProps) {
  const [data, setData] = useState(() => ({ ...block, type: "checkpoint", questions: block.questions || block.block?.questions || [] }));
  return <EditorShell title="Point de validation" onClose={onClose} onSave={() => onSave(data)}>
    <CheckpointSettings chapter={data} onChange={setData} />
  </EditorShell>;
}

export function ChoiceQuestionEditor({ block, multiple, onSave, onClose }: EditorProps & { multiple: boolean }) {
  const [data, setData] = useState(() => ({ ...block, options: block.options?.length ? block.options : [{ id: "a", text: { fr: "", en: "" } }, { id: "b", text: { fr: "", en: "" } }] }));
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const selected = new Set(String(multiple ? data.correctAnswers || "" : data.correctAnswer || "").split(",").filter(Boolean));
  const toggleCorrect = (id: string) => {
    if (!multiple) { setData((prev: any) => ({ ...prev, correctAnswer: id })); return; }
    const next = new Set(selected); next.has(id) ? next.delete(id) : next.add(id);
    setData((prev: any) => ({ ...prev, correctAnswers: Array.from(next).join(",") }));
  };
  const updateOption = (index: number, patch: any) => setData((prev: any) => ({ ...prev, options: prev.options.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, ...patch } : item) }));
  return <EditorShell title={multiple ? "QCM à choix multiples" : "QCM à choix unique"} onClose={onClose} onSave={() => onSave(data)}>
    <LanguageTabs lang={lang} setLang={setLang} />
    <div className="space-y-1"><Label>Question</Label><Textarea rows={3} value={localized(data.question, lang)} onChange={(event) => setData((prev: any) => ({ ...prev, question: setLocalized(prev.question, lang, event.target.value) }))} placeholder="Saisissez l’énoncé de la question" /></div>
    <div className="space-y-2"><div><Label>Réponses proposées</Label><p className="text-xs text-muted-foreground">Cochez {multiple ? "toutes les réponses correctes" : "la bonne réponse"}. Les identifiants sont gérés automatiquement.</p></div>
      {data.options.map((option: any, index: number) => <div key={option.id || index} className="flex items-center gap-2 rounded-lg border p-2"><button type="button" className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${selected.has(option.id) ? "border-emerald-600 bg-emerald-600 text-white" : "border-muted-foreground/40"}`} onClick={() => toggleCorrect(option.id)} aria-label={`Définir la réponse ${index + 1} comme correcte`}>{selected.has(option.id) && <CheckCircle2 className="h-4 w-4" />}</button><Input value={localized(option.text, lang)} onChange={(event) => updateOption(index, { text: setLocalized(option.text, lang, event.target.value) })} placeholder={`Réponse ${index + 1}`} /><Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" disabled={data.options.length <= 2} onClick={() => setData((prev: any) => ({ ...prev, options: prev.options.filter((_: any, optionIndex: number) => optionIndex !== index) }))}><Trash2 className="h-4 w-4" /></Button></div>)}
      <Button type="button" variant="outline" size="sm" onClick={() => setData((prev: any) => ({ ...prev, options: [...prev.options, { id: String.fromCharCode(97 + prev.options.length), text: { fr: "", en: "" } }] }))}><Plus className="mr-1 h-3.5 w-3.5" /> Ajouter une réponse</Button>
    </div>
    <div className="space-y-1"><Label>Explication après réponse</Label><Textarea rows={3} value={localized(data.explanation, lang)} onChange={(event) => setData((prev: any) => ({ ...prev, explanation: setLocalized(prev.explanation, lang, event.target.value) }))} placeholder="Expliquez pourquoi la réponse est correcte…" /></div>
  </EditorShell>;
}

export function BucketSortBlockEditor({ block, onSave, onClose }: EditorProps) {
  const [data, setData] = useState(() => ({ ...block, buckets: block.buckets || [], cards: block.cards || [] }));
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const updateBucket = (index: number, patch: any) => setData((prev: any) => ({ ...prev, buckets: prev.buckets.map((bucket: any, bucketIndex: number) => bucketIndex === index ? { ...bucket, ...patch } : bucket) }));
  const updateCard = (index: number, patch: any) => setData((prev: any) => ({ ...prev, cards: prev.cards.map((card: any, cardIndex: number) => cardIndex === index ? { ...card, ...patch } : card) }));
  return <EditorShell title="Tri par glisser-déposer" onClose={onClose} onSave={() => onSave(data)}>
    <LanguageTabs lang={lang} setLang={setLang} />
    <div className="space-y-1"><Label>Titre</Label><Input value={localized(data.title, lang)} onChange={(event) => setData((prev: any) => ({ ...prev, title: setLocalized(prev.title, lang, event.target.value) }))} /></div>
    <div className="space-y-1"><Label>Consigne</Label><Textarea rows={2} value={localized(data.instructions, lang)} onChange={(event) => setData((prev: any) => ({ ...prev, instructions: setLocalized(prev.instructions, lang, event.target.value) }))} /></div>
    <div className="space-y-2"><div className="flex items-center justify-between"><Label>Catégories de destination</Label><Button type="button" size="sm" variant="outline" onClick={() => setData((prev: any) => ({ ...prev, buckets: [...prev.buckets, { id: `bucket_${prev.buckets.length + 1}`, label: { fr: "", en: "" } }] }))}><Plus className="mr-1 h-3.5 w-3.5" /> Ajouter</Button></div>{data.buckets.map((bucket: any, index: number) => <div key={bucket.id || index} className="flex gap-2"><Input value={localized(bucket.label, lang)} onChange={(event) => updateBucket(index, { label: setLocalized(bucket.label, lang, event.target.value) })} placeholder={`Catégorie ${index + 1}`} /><Button type="button" size="icon" variant="ghost" disabled={data.buckets.length <= 1} onClick={() => setData((prev: any) => ({ ...prev, buckets: prev.buckets.filter((_: any, bucketIndex: number) => bucketIndex !== index) }))}><Trash2 className="h-4 w-4" /></Button></div>)}</div>
    <div className="space-y-2"><div className="flex items-center justify-between"><Label>Cartes à trier</Label><Button type="button" size="sm" variant="outline" disabled={data.buckets.length === 0} onClick={() => setData((prev: any) => ({ ...prev, cards: [...prev.cards, { id: `card_${prev.cards.length + 1}`, text: { fr: "", en: "" }, correctBucket: prev.buckets[0]?.id || "" }] }))}><Plus className="mr-1 h-3.5 w-3.5" /> Ajouter</Button></div>{data.cards.map((card: any, index: number) => <div key={card.id || index} className="grid gap-2 rounded-lg border p-2 md:grid-cols-[1fr_220px_auto]"><Input value={localized(card.text, lang)} onChange={(event) => updateCard(index, { text: setLocalized(card.text, lang, event.target.value) })} placeholder={`Carte ${index + 1}`} /><Select value={card.correctBucket || undefined} onValueChange={(correctBucket) => updateCard(index, { correctBucket })}><SelectTrigger><SelectValue placeholder="Catégorie correcte" /></SelectTrigger><SelectContent>{data.buckets.map((bucket: any, bucketIndex: number) => <SelectItem key={bucket.id || bucketIndex} value={bucket.id}>{localized(bucket.label, lang) || `Catégorie ${bucketIndex + 1}`}</SelectItem>)}</SelectContent></Select><Button type="button" size="icon" variant="ghost" onClick={() => setData((prev: any) => ({ ...prev, cards: prev.cards.filter((_: any, cardIndex: number) => cardIndex !== index) }))}><Trash2 className="h-4 w-4" /></Button></div>)}</div>
  </EditorShell>;
}

export function FillBlankBlockEditor({ block, onSave, onClose }: EditorProps) {
  const [data, setData] = useState(() => ({ ...block, blanks: block.blanks || [] }));
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const updateBlank = (index: number, patch: any) => setData((prev: any) => ({ ...prev, blanks: prev.blanks.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, ...patch } : item) }));
  return <EditorShell title="Texte à trous" onClose={onClose} onSave={() => onSave(data)}>
    <LanguageTabs lang={lang} setLang={setLang} />
    <div className="space-y-1"><Label>Consigne</Label><Textarea rows={2} value={localized(data.instructions, lang)} onChange={(event) => setData((prev: any) => ({ ...prev, instructions: setLocalized(prev.instructions, lang, event.target.value) }))} /></div>
    <div className="space-y-1"><Label>Texte ou code à compléter</Label><Textarea className="font-mono text-sm" rows={6} value={data.template || ""} onChange={(event) => setData((prev: any) => ({ ...prev, template: event.target.value }))} placeholder="Utilisez {{mot}} à l’emplacement de chaque réponse attendue." /><p className="text-xs text-muted-foreground">Écrivez un trou sous la forme <code>{"{{mot}}"}</code>, puis définissez sa réponse ci-dessous.</p></div>
    <div className="space-y-2"><div className="flex items-center justify-between"><Label>Réponses attendues</Label><Button type="button" size="sm" variant="outline" onClick={() => setData((prev: any) => ({ ...prev, blanks: [...prev.blanks, { id: `blank_${prev.blanks.length + 1}`, answer: "", alternatives: "" }] }))}><Plus className="mr-1 h-3.5 w-3.5" /> Ajouter</Button></div>{data.blanks.map((blank: any, index: number) => <div key={blank.id || index} className="grid gap-2 rounded-lg border p-2 md:grid-cols-[160px_1fr_1fr_auto]"><Input value={blank.id || ""} onChange={(event) => updateBlank(index, { id: event.target.value })} placeholder="Nom du trou" /><Input value={blank.answer || ""} onChange={(event) => updateBlank(index, { answer: event.target.value })} placeholder="Réponse correcte" /><Input value={blank.alternatives || ""} onChange={(event) => updateBlank(index, { alternatives: event.target.value })} placeholder="Variantes acceptées" /><Button type="button" size="icon" variant="ghost" onClick={() => setData((prev: any) => ({ ...prev, blanks: prev.blanks.filter((_: any, itemIndex: number) => itemIndex !== index) }))}><Trash2 className="h-4 w-4" /></Button></div>)}</div>
  </EditorShell>;
}
