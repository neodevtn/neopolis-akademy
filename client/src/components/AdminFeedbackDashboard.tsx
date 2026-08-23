import { useMemo, useState } from "react";
import { CheckCircle2, Lightbulb, MessageSquareText, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import trainingIndex from "@/data/trainingIndex.json";

const statusLabels: Record<string, string> = { new: "Nouveau", in_review: "En revue", responded: "Répondu", resolved: "Résolu", dismissed: "Écarté" };

export function AdminFeedbackDashboard() {
  const utils = trpc.useUtils();
  const dashboard = trpc.training.getFeedbackDashboard.useQuery();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [responseById, setResponseById] = useState<Record<number, string>>({});
  const moderate = trpc.training.moderateCourseFeedback.useMutation({ onSuccess: () => utils.training.getFeedbackDashboard.invalidate() });
  const items = useMemo(() => (dashboard.data?.items || []).filter((item) => {
    const course = (trainingIndex.courses as any[]).find((entry) => entry.id === item.courseId);
    const haystack = `${item.userName || ""} ${item.userEmail || ""} ${course?.title?.fr || ""} ${item.comment || ""} ${item.suggestion || ""}`.toLowerCase();
    return (filter === "all" || item.status === filter) && (!search || haystack.includes(search.toLowerCase()));
  }), [dashboard.data, filter, search]);

  if (dashboard.isLoading) return <p className="py-10 text-sm text-muted-foreground">Chargement des retours pédagogiques…</p>;
  const summary = dashboard.data?.summary;
  return <section className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-4">
      {[{ label: "Avis", value: summary?.count || 0, icon: MessageSquareText }, { label: "Note moyenne", value: `${summary?.averageRating || 0}/5`, icon: Star }, { label: "À traiter", value: summary?.pendingCount || 0, icon: Lightbulb }, { label: "Suggestions", value: summary?.suggestionsCount || 0, icon: CheckCircle2 }].map(({ label, value, icon: Icon }) => <div key={label} className="rounded-xl border border-border bg-card p-4"><Icon className="h-4 w-4 text-primary" /><p className="mt-2 text-2xl font-bold text-foreground">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>)}
    </div>
    <div className="flex flex-col gap-3 sm:flex-row"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un apprenant, un cours ou un mot-clé…" /><select value={filter} onChange={(event) => setFilter(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"><option value="all">Tous les statuts</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
    <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full min-w-[920px] text-left text-sm"><thead className="bg-muted/50 text-xs text-muted-foreground"><tr><th className="px-4 py-3">Formation & apprenant</th><th className="px-4 py-3">Évaluation</th><th className="px-4 py-3">Retour / suggestion</th><th className="px-4 py-3">Statut & action</th></tr></thead><tbody className="divide-y divide-border">{items.map((item) => { const course = (trainingIndex.courses as any[]).find((entry) => entry.id === item.courseId); return <tr key={item.id} className="align-top"><td className="px-4 py-4"><p className="font-medium text-foreground">{course?.title?.fr || course?.title?.en || item.courseId}</p><p className="mt-1 text-xs text-muted-foreground">{item.userName || "Apprenant"} · {item.userEmail || "email non disponible"}</p></td><td className="px-4 py-4"><p className="font-semibold text-amber-600">{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)} <span className="text-xs text-muted-foreground">{item.rating}/5</span></p><p className="mt-1 text-xs text-muted-foreground">Contenu {item.contentRating || "—"}/5 · Expérience {item.experienceRating || "—"}/5</p></td><td className="max-w-md px-4 py-4"><p className="whitespace-pre-wrap text-foreground">{item.comment || "Sans commentaire"}</p>{item.suggestion ? <p className="mt-2 whitespace-pre-wrap rounded-md bg-amber-50 p-2 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">Suggestion : {item.suggestion}</p> : null}</td><td className="px-4 py-4"><select value={item.status} onChange={(event) => moderate.mutate({ feedbackId: item.id, status: event.target.value as any, adminResponse: responseById[item.id] || item.adminResponse || undefined })} className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><textarea value={responseById[item.id] ?? item.adminResponse ?? ""} onChange={(event) => setResponseById((previous) => ({ ...previous, [item.id]: event.target.value }))} placeholder="Réponse privée à l’apprenant…" className="mt-2 min-h-16 w-full rounded-md border border-input bg-background p-2 text-xs text-foreground" /><Button size="sm" className="mt-2" disabled={moderate.isPending} onClick={() => moderate.mutate({ feedbackId: item.id, status: "responded", adminResponse: responseById[item.id] || item.adminResponse || undefined })}>Répondre</Button></td></tr>; })}</tbody></table>{items.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">Aucun feedback ne correspond aux filtres.</p> : null}</div>
  </section>;
}
