import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { NovasavoLearningBlock } from "@/components/blocks/NovasavoLearningBlocks";

const text = (value: unknown, lang: string) => typeof value === "string" ? value : value && typeof value === "object" ? String((value as Record<string, unknown>)[lang] || (value as Record<string, unknown>).fr || (value as Record<string, unknown>).en || "") : "";

export function LearningSectionBlock({ block, lang }: { block: any; lang: string }) {
  const variant = block.sectionKind || "content";
  const isHero = variant === "hero";
  return <section className={`w-full min-w-0 max-w-full rounded-2xl p-5 sm:p-7 ${isHero ? "bg-gradient-to-br from-[var(--course-primary)] to-[var(--course-secondary)] text-white" : "border border-border bg-card"}`}>
    {block.eyebrow && <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-80">{text(block.eyebrow, lang)}</p>}
    <h2 className="mt-2 break-words text-2xl font-bold">{text(block.title, lang)}</h2>
    {block.body && <p className="mt-3 break-words leading-relaxed opacity-90">{text(block.body, lang)}</p>}
    {!!block.items?.length && <ul className="mt-5 space-y-3">{block.items.map((item: unknown, index: number) => <li key={index} className="flex gap-3"><span className="font-bold text-[var(--course-accent)]">{String(index + 1).padStart(2, "0")}</span><span>{text(item, lang)}</span></li>)}</ul>}
  </section>;
}

export function KnowledgeCheckBlock({ block, lang, onComplete }: { block: any; lang: string; onComplete: (id: string, isCorrect: boolean) => void }) {
  const [answer, setAnswer] = useState<string | null>(null);
  const mode = block.mode || "multiple_choice";
  const options = useMemo(() => mode === "myth_reality"
    ? [{ id: "mythe", label: "Mythe" }, { id: "realite", label: "Réalité" }]
    : (block.options || []).map((option: any, index: number) => ({ id: String(option.id ?? option.value ?? index), label: text(option.text || option.label || option, lang) })), [block.options, lang, mode]);
  const prompt = text(block.prompt || block.scenario, lang);
  const select = (id: string) => { setAnswer(id); onComplete(block.id || "knowledge_check", id === block.correctAnswer); };
  const correct = answer !== null && answer === block.correctAnswer;
  return <section className={`w-full min-w-0 max-w-full rounded-2xl p-5 text-white sm:p-7 ${mode === "scenario" ? "bg-slate-950" : "bg-gradient-to-br from-[var(--course-primary)] to-[var(--course-secondary)]"}`}>
    <p className="text-xs font-bold uppercase tracking-wider text-white/75">{mode === "scenario" ? "Scénario" : mode === "myth_reality" ? "Mythe ou réalité" : "Vérification des acquis"} · {block.competencyPoints || 1} point{(block.competencyPoints || 1) > 1 ? "s" : ""} de compétences</p>
    <h2 className="mt-3 break-words text-xl font-bold leading-relaxed">{prompt}</h2>
    <div className={mode === "myth_reality" ? "mt-5 grid grid-cols-2 gap-3" : "mt-5 space-y-3"}>{options.map((option: any) => <button type="button" key={option.id} onClick={() => select(option.id)} className={`w-full max-w-full break-words rounded-xl border p-3 text-left text-sm font-medium leading-relaxed sm:p-4 ${answer === option.id ? "border-white bg-white/20" : "border-white/20 bg-white/5 hover:bg-white/10"}`}><span className="mr-3 text-white/70">{mode !== "myth_reality" && `${String(option.id).toUpperCase()}.`}</span>{option.label}</button>)}</div>
    {answer && <div className={`mt-5 break-words rounded-xl p-4 text-sm ${correct ? "bg-emerald-500/20 text-emerald-50" : "bg-amber-300/15 text-amber-50"}`}><strong>{correct ? "Bonne réponse." : "Réponse enregistrée."}</strong> {text(block.explanation, lang)}<Button variant="link" size="sm" className="ml-1 h-auto max-w-full whitespace-normal px-1 text-left text-current" onClick={() => setAnswer(null)}>Réessayer</Button></div>}
  </section>;
}

export function SequenceVisualBlock({ block, lang }: { block: any; lang: string }) {
  const items = block.items || block.steps || block.nodes || [];
  const layout = block.styleLayout || block.layout || "timeline";
  return <section className="w-full min-w-0 max-w-full rounded-2xl border border-border bg-card p-5 sm:p-7"><h2 className="text-xl font-bold">{text(block.title, lang)}</h2><div className={`mt-5 flex min-w-0 ${layout === "flow" ? "flex-wrap items-center gap-2" : "flex-col gap-3"}`}>{items.map((item: any, index: number) => <div key={index} className="min-w-0 rounded-xl bg-[var(--course-surface-muted)] p-4"><p className="break-words font-semibold">{layout !== "flow" && <span className="mr-2 text-[var(--course-primary)]">{index + 1}.</span>}{text(item.title || item, lang)}</p>{item.description && <p className="mt-2 break-words text-sm text-muted-foreground">{text(item.description, lang)}</p>}</div>)}</div></section>;
}

export function ComparisonPanelBlock({ block, lang }: { block: any; lang: string }) {
  const columns = block.columns || (block.left && block.right ? [block.left, block.right] : []);
  return <section className="w-full min-w-0 max-w-full rounded-2xl border border-border bg-card p-5 sm:p-7"><h2 className="text-xl font-bold">{text(block.title, lang)}</h2><div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2">{columns.map((column: any, index: number) => <div key={index} className="min-w-0 rounded-xl border border-border bg-[var(--course-surface-muted)] p-4"><h3 className="break-words font-semibold">{text(column.title || column.label, lang)}</h3><ul className="mt-3 space-y-2 text-sm">{(column.items || column.points || []).map((item: unknown, itemIndex: number) => <li key={itemIndex} className="break-words">• {text(item, lang)}</li>)}</ul></div>)}</div></section>;
}

export function LearningProgressBlock({ block, lang }: { block: any; lang: string }) {
  return <section className="flex min-w-0 flex-col justify-between gap-3 rounded-2xl border border-[color:var(--course-primary)]/20 bg-[var(--course-surface-muted)] p-5 sm:flex-row sm:items-center"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-[var(--course-primary)]">{text(block.label, lang) || "Progression des compétences"}</p><p className="mt-1 break-words font-medium">{text(block.copy || block.body, lang) || "Validez les activités obligatoires pour poursuivre."}</p></div><span className="w-fit rounded-full bg-white px-4 py-2 text-sm font-bold text-[var(--course-primary)]">{block.competencyPoints || block.points || 1} point{(block.competencyPoints || block.points || 1) > 1 ? "s" : ""}</span></section>;
}

export function LearningToolsBlock({ block, lang, courseId, lessonTitle, screenTitle }: { block: any; lang: string; courseId?: string; lessonTitle?: string; screenTitle?: string }) {
  if (block.toolMode === "assistant") return <NovasavoLearningBlock block={{ ...block, type: "ai_assistant_prompt_panel", prompt: block.prompt || block.context }} lang={lang} courseId={courseId} lessonTitle={lessonTitle} screenTitle={screenTitle} onComplete={() => undefined} />;
  if (block.toolMode === "notes") return <NovasavoLearningBlock block={{ ...block, type: "notes_highlights_bookmarks_panel" }} lang={lang} courseId={courseId} lessonTitle={lessonTitle} screenTitle={screenTitle} onComplete={() => undefined} />;
  return <section className="w-full min-w-0 max-w-full rounded-2xl border border-border bg-card p-5 sm:p-7"><h2 className="break-words text-xl font-bold">{text(block.title, lang) || "Outils d’apprentissage"}</h2><p className="mt-2 break-words text-sm text-muted-foreground">{text(block.body, lang)}</p><div className="mt-4 flex flex-wrap gap-2">{(block.tools || []).map((tool: any, index: number) => <Button key={index} variant="outline" className="max-w-full whitespace-normal">{text(tool.label || tool, lang)}</Button>)}</div></section>;
}
