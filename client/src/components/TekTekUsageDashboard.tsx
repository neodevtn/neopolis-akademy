import { useMemo, useState } from "react";
import { BarChart3, ChevronLeft, ChevronRight, Coins, Eye, Gauge, Loader2, MessageSquareText, Save, Search, UserRound } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import trainingIndex from "@/data/trainingIndex.json";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Dimension = "training" | "course" | "user";
type Period = "7d" | "30d" | "month" | "all";
type BudgetScope = "global" | Dimension;

const formatCount = new Intl.NumberFormat("fr-FR");
const scopeLabels: Record<BudgetScope, string> = {
  global: "Global",
  training: "Formation",
  course: "Cours",
  user: "Utilisateur",
};
const dimensionLabels: Record<Dimension, string> = {
  training: "Par formation",
  course: "Par cours",
  user: "Par utilisateur",
};
const trainingTitles = new Map(trainingIndex.certifications.map((training) => [training.id, training.title.fr]));

function readableScopeLabel(dimension: Dimension, scopeKey: string, fallback: string) {
  if (dimension === "training") return trainingTitles.get(scopeKey) ?? fallback;
  if (dimension === "course") return scopeKey === "historique-sans-cours" ? "Historique sans cours" : `Cours · ${scopeKey.replace(/__/g, " · ").replace(/_/g, " ")}`;
  return fallback;
}

function usagePercent(used: number, budget?: number) {
  if (!budget || budget <= 0) return null;
  return Math.min(999, Math.round((used / budget) * 100));
}

/** Monitoring interne des usages TekTek : les jetons affichés proviennent des réponses du modèle, sans conversion en coût fournisseur. */
export function TekTekUsageDashboard() {
  const [dimension, setDimension] = useState<Dimension>("training");
  const [period, setPeriod] = useState<Period>("month");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<BudgetScope>("global");
  const [scopeKey, setScopeKey] = useState("global");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [alertThreshold, setAlertThreshold] = useState("80");
  const [conversationPeriod, setConversationPeriod] = useState<Period>("30d");
  const [conversationPage, setConversationPage] = useState(1);
  const [conversationSearch, setConversationSearch] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [transcriptPage, setTranscriptPage] = useState(1);
  const utils = trpc.useUtils();
  const queryInput = useMemo(() => ({ dimension, period, page, pageSize: 20, search: search.trim() || undefined }), [dimension, page, period, search]);
  const conversationInput = useMemo(() => ({ period: conversationPeriod, page: conversationPage, pageSize: 20, search: conversationSearch.trim() || undefined }), [conversationPage, conversationPeriod, conversationSearch]);
  const overview = trpc.tektek.adminUsage.getOverview.useQuery(queryInput);
  const budgets = trpc.tektek.adminUsage.listBudgets.useQuery();
  const conversations = trpc.tektek.adminUsage.listConversations.useQuery(conversationInput);
  const transcript = trpc.tektek.adminUsage.getConversation.useQuery(
    { conversationId: selectedConversationId ?? 0, page: transcriptPage, pageSize: 60 },
    { enabled: selectedConversationId !== null, retry: false },
  );
  const saveBudget = trpc.tektek.adminUsage.saveBudget.useMutation({
    onSuccess: async () => {
      toast.success("Budget interne TekTek enregistré.");
      setMonthlyBudget("");
      await utils.tektek.adminUsage.listBudgets.invalidate();
    },
    onError: () => toast.error("Le budget interne n’a pas pu être enregistré."),
  });

  const totalPages = Math.max(1, Math.ceil((overview.data?.total ?? 0) / (overview.data?.pageSize ?? 20)));
  const conversationTotalPages = Math.max(1, Math.ceil((conversations.data?.total ?? 0) / (conversations.data?.pageSize ?? 20)));
  const settings = budgets.data ?? [];
  const globalBudget = settings.find((entry) => entry.scope === "global" && entry.scopeKey === "global");
  const effectiveScope = dimension;

  function switchDimension(next: Dimension) {
    setDimension(next);
    setPage(1);
  }

  function openConversation(conversationId: number) {
    setTranscriptPage(1);
    setSelectedConversationId(conversationId);
  }

  function submitBudget(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedBudget = Number(monthlyBudget);
    const parsedThreshold = Number(alertThreshold);
    if (!Number.isInteger(parsedBudget) || parsedBudget < 1) {
      toast.error("Saisissez un budget mensuel entier supérieur à zéro.");
      return;
    }
    if (!Number.isInteger(parsedThreshold) || parsedThreshold < 1 || parsedThreshold > 100) {
      toast.error("Le seuil d’alerte doit être compris entre 1 et 100 %.");
      return;
    }
    saveBudget.mutate({ scope, scopeKey: scope === "global" ? "global" : scopeKey.trim(), monthlyTokenBudget: parsedBudget, alertThresholdPercent: parsedThreshold });
  }

  return <section className="space-y-6">
    <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex items-center gap-2"><span className="rounded-lg bg-indigo-100 p-2 text-indigo-700"><BarChart3 className="h-5 w-5" /></span><h1 className="wise-display-md">Gouvernance IA · TekTek</h1></div>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Suivez les requêtes et les jetons réellement retournés par le modèle. Les budgets sont des seuils internes de pilotage, non une facture ou un prix fournisseur.</p>
      </div>
      <Badge variant="secondary" className="w-fit gap-1.5 px-3 py-1.5"><Gauge className="h-3.5 w-3.5" /> Accès administratif</Badge>
    </header>

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <UsageStat icon={<Coins className="h-4 w-4" />} label="Jetons mesurés" value={formatCount.format(overview.data?.totals.totalTokens ?? 0)} hint="prompt + réponse" />
      <UsageStat icon={<BarChart3 className="h-4 w-4" />} label="Questions" value={formatCount.format(overview.data?.totals.requests ?? 0)} hint="sur la période" />
      <UsageStat icon={<UserRound className="h-4 w-4" />} label="Réponses IA" value={formatCount.format(overview.data?.totals.responses ?? 0)} hint="hors navigation sourcée" />
      <UsageStat icon={<Gauge className="h-4 w-4" />} label="Couverture de mesure" value={`${overview.data?.totals.responses ? Math.round(((overview.data.totals.meteredResponses ?? 0) / overview.data.totals.responses) * 100) : 0} %`} hint="réponses avec jetons fournis" />
    </div>

    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <div className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-[180px_160px_minmax(0,1fr)]">
          <div className="space-y-1.5"><Label>Regrouper</Label><Select value={dimension} onValueChange={(value) => switchDimension(value as Dimension)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="training">Par formation</SelectItem><SelectItem value="course">Par cours</SelectItem><SelectItem value="user">Par utilisateur</SelectItem></SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Période</Label><Select value={period} onValueChange={(value) => { setPeriod(value as Period); setPage(1); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7d">7 derniers jours</SelectItem><SelectItem value="30d">30 derniers jours</SelectItem><SelectItem value="month">Mois en cours</SelectItem><SelectItem value="all">Tout l’historique</SelectItem></SelectContent></Select></div>
          <div className="space-y-1.5"><Label htmlFor="tektek-usage-search">Rechercher</Label><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="tektek-usage-search" className="pl-9" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={dimension === "user" ? "Nom ou e-mail…" : "Identifiant de formation ou de cours…"} /></div></div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-sm"><thead><tr className="border-b border-border bg-muted/30"><th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{dimensionLabels[dimension].replace("Par ", "")}</th><th className="p-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Questions</th><th className="p-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Jetons mesurés</th><th className="p-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Budget interne</th><th className="p-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dernière activité</th></tr></thead><tbody>
            {overview.isLoading && <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">Chargement des usages TekTek…</td></tr>}
            {!overview.isLoading && overview.data?.rows.map((row) => {
              const specificBudget = settings.find((entry) => entry.scope === effectiveScope && entry.scopeKey === row.scopeKey);
              const budget = specificBudget ?? globalBudget;
              const percent = period === "month" ? usagePercent(row.totalTokens, budget?.monthlyTokenBudget) : null;
              const thresholdReached = percent !== null && budget && percent >= budget.alertThresholdPercent;
              return <tr key={`${dimension}-${row.scopeKey}`} className="border-t border-border"><td className="p-4"><p className="font-medium text-foreground">{readableScopeLabel(dimension, row.scopeKey, row.label)}</p>{dimension !== "user" && <p className="mt-0.5 text-xs text-muted-foreground">{row.scopeKey}</p>}{row.email && <p className="mt-0.5 text-xs text-muted-foreground">{row.email}</p>}<p className="mt-1 text-xs text-muted-foreground">{row.meteredResponses}/{row.responses} réponses mesurées</p></td><td className="p-4 text-right font-medium">{formatCount.format(row.requests)}</td><td className="p-4 text-right font-medium">{formatCount.format(row.totalTokens)}</td><td className="p-4 text-right">{budget ? <span className={thresholdReached ? "font-semibold text-amber-700" : "text-muted-foreground"}>{formatCount.format(budget.monthlyTokenBudget)}{percent !== null ? ` · ${percent} %` : " · mensuel"}</span> : <span className="text-muted-foreground">Non défini</span>}</td><td className="p-4 text-right text-xs text-muted-foreground">{row.lastUsedAt ? new Date(row.lastUsedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—"}</td></tr>;
            })}
            {!overview.isLoading && (!overview.data || overview.data.rows.length === 0) && <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">Aucun usage TekTek pour ce filtre.</td></tr>}
          </tbody></table></div>
          <footer className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"><span className="text-muted-foreground">{overview.data?.total ?? 0} résultat{(overview.data?.total ?? 0) > 1 ? "s" : ""} · page {page}/{totalPages}</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1 || overview.isFetching} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="mr-1 h-4 w-4" /> Précédent</Button><Button size="sm" variant="outline" disabled={page >= totalPages || overview.isFetching} onClick={() => setPage((value) => value + 1)}>Suivant <ChevronRight className="ml-1 h-4 w-4" /></Button></div></footer>
        </div>
      </div>

      <aside className="h-fit rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2"><Coins className="h-4 w-4 text-indigo-600" /><h2 className="font-semibold text-foreground">Budget interne</h2></div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Définissez un plafond mensuel en jetons pour suivre l’usage. Aucune conversion financière n’est effectuée.</p>
        <form className="mt-4 space-y-3" onSubmit={submitBudget}>
          <div className="space-y-1.5"><Label>Portée</Label><Select value={scope} onValueChange={(value) => { const next = value as BudgetScope; setScope(next); setScopeKey(next === "global" ? "global" : ""); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="global">Global</SelectItem><SelectItem value="training">Formation</SelectItem><SelectItem value="course">Cours</SelectItem><SelectItem value="user">Utilisateur</SelectItem></SelectContent></Select></div>
          <div className="space-y-1.5"><Label htmlFor="tektek-budget-key">Identifiant</Label><Input id="tektek-budget-key" value={scopeKey} disabled={scope === "global"} onChange={(event) => setScopeKey(event.target.value)} placeholder={scope === "user" ? "Identifiant utilisateur" : scope === "course" ? "Identifiant de cours" : scope === "training" ? "Identifiant de formation" : "global"} required /></div>
          <div className="space-y-1.5"><Label htmlFor="tektek-budget-tokens">Budget mensuel (jetons)</Label><Input id="tektek-budget-tokens" type="number" min={1} step={1} value={monthlyBudget} onChange={(event) => setMonthlyBudget(event.target.value)} placeholder="Ex. 100000" required /></div>
          <div className="space-y-1.5"><Label htmlFor="tektek-budget-threshold">Alerte à (%)</Label><Input id="tektek-budget-threshold" type="number" min={1} max={100} step={1} value={alertThreshold} onChange={(event) => setAlertThreshold(event.target.value)} required /></div>
          <Button type="submit" className="w-full gap-2" disabled={saveBudget.isPending}><Save className="h-4 w-4" /> Enregistrer le budget</Button>
        </form>
        {settings.length > 0 && <div className="mt-5 border-t border-border pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Budgets configurés</p><ul className="mt-2 space-y-2">{settings.slice(0, 8).map((entry) => <li key={entry.id} className="flex items-start justify-between gap-3 text-xs"><span><strong className="text-foreground">{scopeLabels[entry.scope as BudgetScope]}</strong><br /><span className="break-all text-muted-foreground">{entry.scopeKey}</span></span><span className="whitespace-nowrap font-medium text-foreground">{formatCount.format(entry.monthlyTokenBudget)}<br /><span className="font-normal text-muted-foreground">alerte {entry.alertThresholdPercent} %</span></span></li>)}</ul></div>}
      </aside>
    </div>

    <section className="rounded-xl border border-border bg-card">
      <header className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-start sm:justify-between">
        <div><div className="flex items-center gap-2"><MessageSquareText className="h-5 w-5 text-indigo-600" /><h2 className="font-semibold text-foreground">Conversations TekTek</h2></div><p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">Consultez une conversation uniquement si nécessaire pour le suivi pédagogique ou la qualité du coach. L’ouverture d’une transcription est journalisée dans le journal d’activité administrateur.</p></div>
        <Badge variant="secondary" className="w-fit gap-1.5"><Eye className="h-3.5 w-3.5" /> Accès tracé</Badge>
      </header>
      <div className="grid gap-3 border-b border-border p-4 md:grid-cols-[180px_minmax(0,1fr)]">
        <div className="space-y-1.5"><Label>Période</Label><Select value={conversationPeriod} onValueChange={(value) => { setConversationPeriod(value as Period); setConversationPage(1); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7d">7 derniers jours</SelectItem><SelectItem value="30d">30 derniers jours</SelectItem><SelectItem value="month">Mois en cours</SelectItem><SelectItem value="all">Tout l’historique</SelectItem></SelectContent></Select></div>
        <div className="space-y-1.5"><Label htmlFor="tektek-conversation-search">Rechercher</Label><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="tektek-conversation-search" className="pl-9" value={conversationSearch} onChange={(event) => { setConversationSearch(event.target.value); setConversationPage(1); }} placeholder="Apprenant, e-mail, formation ou cours…" /></div></div>
      </div>
      <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-sm"><thead><tr className="border-b border-border bg-muted/30"><th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Apprenant</th><th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contexte</th><th className="p-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Questions</th><th className="p-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Messages</th><th className="p-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Jetons</th><th className="p-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dernière activité</th><th className="p-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground"><span className="sr-only">Ouvrir</span></th></tr></thead><tbody>
        {conversations.isLoading && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Chargement des conversations TekTek…</td></tr>}
        {!conversations.isLoading && conversations.data?.rows.map((conversation) => <tr key={conversation.id} className="border-t border-border"><td className="p-4"><p className="font-medium text-foreground">{conversation.learnerName}</p>{conversation.learnerEmail && <p className="mt-0.5 text-xs text-muted-foreground">{conversation.learnerEmail}</p>}</td><td className="p-4"><p className="max-w-72 truncate font-medium text-foreground" title={conversation.certificationId}>{trainingTitles.get(conversation.certificationId) ?? conversation.certificationId}</p><p className="mt-0.5 max-w-72 truncate text-xs text-muted-foreground" title={conversation.activeCourseId}>{conversation.activeCourseId}</p></td><td className="p-4 text-right font-medium">{formatCount.format(conversation.questionCount)}</td><td className="p-4 text-right font-medium">{formatCount.format(conversation.messageCount)}</td><td className="p-4 text-right font-medium">{formatCount.format(conversation.totalTokens)}</td><td className="p-4 text-right text-xs text-muted-foreground">{new Date(conversation.updatedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</td><td className="p-4 text-right"><Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => openConversation(conversation.id)}><Eye className="h-3.5 w-3.5" /> Consulter</Button></td></tr>)}
        {!conversations.isLoading && (!conversations.data || conversations.data.rows.length === 0) && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Aucune conversation TekTek pour ce filtre.</td></tr>}
      </tbody></table></div>
      <footer className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"><span className="text-muted-foreground">{conversations.data?.total ?? 0} conversation{(conversations.data?.total ?? 0) > 1 ? "s" : ""} · page {conversationPage}/{conversationTotalPages}</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={conversationPage <= 1 || conversations.isFetching} onClick={() => setConversationPage((value) => value - 1)}><ChevronLeft className="mr-1 h-4 w-4" /> Précédent</Button><Button size="sm" variant="outline" disabled={conversationPage >= conversationTotalPages || conversations.isFetching} onClick={() => setConversationPage((value) => value + 1)}>Suivant <ChevronRight className="ml-1 h-4 w-4" /></Button></div></footer>
    </section>
    <Dialog open={selectedConversationId !== null} onOpenChange={(open) => { if (!open) setSelectedConversationId(null); }}>
      <DialogContent className="flex max-h-[85vh] w-[calc(100vw-2rem)] max-w-4xl flex-col overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5"><DialogTitle className="flex items-center gap-2"><MessageSquareText className="h-5 w-5 text-indigo-600" /> Conversation TekTek</DialogTitle>{transcript.data && <p className="mt-1 text-sm font-normal text-muted-foreground">{transcript.data.conversation.learnerName}{transcript.data.conversation.learnerEmail ? ` · ${transcript.data.conversation.learnerEmail}` : ""} · {trainingTitles.get(transcript.data.conversation.certificationId) ?? transcript.data.conversation.certificationId}</p>}</DialogHeader>
        {transcript.isLoading && <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Chargement de la transcription…</div>}
        {transcript.error && <div className="m-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">La conversation ne peut pas être consultée. {transcript.error.message}</div>}
        {transcript.data && <><div className="border-b border-border bg-amber-50/60 px-6 py-2 text-xs leading-relaxed text-amber-900">Accès administratif journalisé. Cette transcription est destinée au suivi pédagogique et à l’amélioration de TekTek ; ne la copiez pas dans un canal non autorisé.</div><div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5">{transcript.data.hasOlderMessages && <div className="text-center"><Button type="button" size="sm" variant="outline" disabled={transcript.isFetching} onClick={() => setTranscriptPage((value) => value + 1)}><ChevronLeft className="mr-1 h-4 w-4 rotate-90" /> Charger les messages antérieurs</Button></div>}{transcript.data.messages.map((message) => <article key={message.id} className={`max-w-[92%] rounded-xl border p-3 ${message.role === "user" ? "mr-auto border-slate-200 bg-slate-50" : message.role === "assistant" ? "ml-auto border-indigo-200 bg-indigo-50/60" : "mx-auto border-amber-200 bg-amber-50"}`}><div className="mb-1 flex items-center justify-between gap-3 text-[11px] text-muted-foreground"><span className="font-semibold uppercase tracking-wide">{message.role === "user" ? "Apprenant" : message.role === "assistant" ? "TekTek" : "Système"}</span><span>{new Date(message.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</span></div><p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">{message.content}</p>{message.role === "assistant" && (message.model || message.promptTokens !== null || message.completionTokens !== null) && <p className="mt-2 border-t border-indigo-200/70 pt-2 text-[11px] text-muted-foreground">{message.model ? `Modèle : ${message.model}` : "Réponse sourcée sans appel modèle"}{message.promptTokens !== null || message.completionTokens !== null ? ` · ${formatCount.format((message.promptTokens ?? 0) + (message.completionTokens ?? 0))} jetons mesurés` : ""}</p>}</article>)}</div><footer className="border-t border-border px-6 py-3 text-xs text-muted-foreground">{transcript.data.total} message{transcript.data.total > 1 ? "s" : ""} · les messages sont affichés chronologiquement.</footer></>}
      </DialogContent>
    </Dialog>
  </section>;
}

function UsageStat({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint: string }) {
  return <div className="rounded-xl border border-border bg-card p-4"><div className="flex items-center gap-2 text-muted-foreground">{icon}<span className="text-xs font-medium uppercase tracking-wide">{label}</span></div><p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p><p className="mt-1 text-xs text-muted-foreground">{hint}</p></div>;
}
