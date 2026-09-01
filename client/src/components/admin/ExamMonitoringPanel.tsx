import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Clock3, Eye, Search, Trophy, Users } from "lucide-react";
import trainingIndex from "@/data/trainingIndex.json";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { resolveLocalizedText } from "@shared/localizedText";

type MonitoringStatus = "all" | "passed" | "failed" | "timed_out";
type MonitoringSort = "finishedAt" | "score" | "durationSeconds";

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, seconds || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  return `${minutes} min ${String(rest).padStart(2, "0")} s`;
}

function formatDate(value: Date | string) {
  return new Date(value).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

function ResultBadge({ status }: { status: Exclude<MonitoringStatus, "all"> }) {
  if (status === "passed") return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Réussi</Badge>;
  if (status === "timed_out") return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Temps expiré</Badge>;
  return <Badge variant="secondary">Non réussi</Badge>;
}

function Metric({ label, value, detail, icon }: { label: string; value: string | number; detail: string; icon: React.ReactNode }) {
  return <div className="min-w-0 rounded-xl border border-border bg-card p-4"><div className="mb-2 flex items-center justify-between text-muted-foreground"><span className="text-xs font-medium">{label}</span>{icon}</div><p className="text-2xl font-bold text-foreground">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
}

export function ExamMonitoringPanel({ onOpenLearner }: { onOpenLearner: (userId: number) => void }) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [certificationId, setCertificationId] = useState("all");
  const [status, setStatus] = useState<MonitoringStatus>("all");
  const [sortBy, setSortBy] = useState<MonitoringSort>("finishedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const pageSize = 15;
  const queryInput = useMemo(() => ({ page, pageSize, search: search || undefined, certificationId: certificationId === "all" ? undefined : certificationId, status, sortBy, sortDirection }), [page, search, certificationId, status, sortBy, sortDirection]);
  const monitoringQuery = trpc.admin.getExamMonitoring.useQuery(queryInput);
  const certifications = trainingIndex.certifications.map((certification) => ({ id: certification.id, title: resolveLocalizedText(certification.title, certification.id) }));
  const certificationLabels = new Map(certifications.map((certification) => [certification.id, certification.title]));
  const data = monitoringQuery.data;
  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / pageSize));
  const sort = (next: MonitoringSort) => {
    setPage(1);
    setSortDirection((current) => sortBy === next && current === "desc" ? "asc" : "desc");
    setSortBy(next);
  };
  const sortIcon = (column: MonitoringSort) => sortBy !== column ? null : sortDirection === "desc" ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />;
  const applyFilters = () => { setSearch(searchInput.trim()); setPage(1); };

  if (monitoringQuery.isLoading) return <div className="py-14 text-center text-muted-foreground">Chargement du suivi des examens…</div>;
  if (monitoringQuery.error) return <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Le suivi des examens ne peut pas être chargé pour le moment.</div>;
  const summary = data?.summary;

  return <section className="space-y-6" aria-label="Suivi administratif des examens">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Évaluations certifiantes</p><h2 className="text-xl font-bold text-foreground">Suivi des examens</h2><p className="mt-1 text-sm text-muted-foreground">Consultez les passages, résultats et temps écoulés. Les filtres s’appliquent aux indicateurs et à la liste.</p></div><p className="text-xs text-muted-foreground">Les expirations sont tracées explicitement pour les nouvelles tentatives.</p></div>

    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <Metric label="Tentatives" value={summary?.attemptCount || 0} detail={`${summary?.uniqueLearners || 0} apprenant(s)`} icon={<Users className="h-4 w-4" />} />
      <Metric label="Réussite" value={`${summary?.passRate || 0} %`} detail={`${summary?.passedCount || 0} réussi(es)`} icon={<Trophy className="h-4 w-4" />} />
      <Metric label="Score moyen" value={`${summary?.averagePercent || 0} %`} detail={`${summary?.averageScore || 0}/1000`} icon={<Trophy className="h-4 w-4" />} />
      <Metric label="Temps moyen" value={formatDuration(summary?.averageDurationSeconds || 0)} detail="temps écoulé" icon={<Clock3 className="h-4 w-4" />} />
      <Metric label="Temps expiré" value={summary?.timedOutCount || 0} detail={`${summary?.failedCount || 0} non réussi(es)`} icon={<Clock3 className="h-4 w-4" />} />
    </div>

    <div className="grid gap-3 rounded-xl border border-border bg-card p-4 lg:grid-cols-[minmax(0,1fr)_240px_190px_auto]">
      <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Rechercher une tentative d’examen" className="pl-9" placeholder="Apprenant ou identifiant de formation" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && applyFilters()} /></div>
      <Select value={certificationId} onValueChange={(value) => { setCertificationId(value); setPage(1); }}><SelectTrigger aria-label="Filtrer par formation"><SelectValue placeholder="Toutes les formations" /></SelectTrigger><SelectContent><SelectItem value="all">Toutes les formations</SelectItem>{certifications.map((certification) => <SelectItem key={certification.id} value={certification.id}>{certification.title}</SelectItem>)}</SelectContent></Select>
      <Select value={status} onValueChange={(value) => { setStatus(value as MonitoringStatus); setPage(1); }}><SelectTrigger aria-label="Filtrer par résultat"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tous les résultats</SelectItem><SelectItem value="passed">Réussis</SelectItem><SelectItem value="failed">Non réussis</SelectItem><SelectItem value="timed_out">Temps expiré</SelectItem></SelectContent></Select>
      <Button onClick={applyFilters}>Rechercher</Button>
    </div>

    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table><TableHeader><TableRow><TableHead>Apprenant</TableHead><TableHead>Formation</TableHead><TableHead><button type="button" className="inline-flex items-center gap-1 font-medium hover:text-foreground" onClick={() => sort("finishedAt")}>Terminé {sortIcon("finishedAt")}</button></TableHead><TableHead><button type="button" className="inline-flex items-center gap-1 font-medium hover:text-foreground" onClick={() => sort("durationSeconds")}>Durée {sortIcon("durationSeconds")}</button></TableHead><TableHead><button type="button" className="inline-flex items-center gap-1 font-medium hover:text-foreground" onClick={() => sort("score")}>Score {sortIcon("score")}</button></TableHead><TableHead>Résultat</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>{data?.attempts.length ? data.attempts.map((attempt) => <TableRow className="cursor-pointer" tabIndex={0} key={attempt.id} onClick={() => onOpenLearner(attempt.userId)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onOpenLearner(attempt.userId); }}><TableCell className="max-w-44"><p className="truncate font-medium">{attempt.learnerLabel}</p><p className="text-xs text-muted-foreground">ID #{attempt.userId}</p></TableCell><TableCell className="max-w-56"><p className="truncate">{certificationLabels.get(attempt.certificationId) || attempt.certificationId}</p><p className="text-xs text-muted-foreground">{attempt.correctAnswers}/{attempt.totalQuestions} réponses justes</p></TableCell><TableCell className="whitespace-nowrap text-sm">{formatDate(attempt.finishedAt)}</TableCell><TableCell className="whitespace-nowrap text-sm"><p>{formatDuration(attempt.durationSeconds)}</p>{attempt.timeLimitMinutes ? <p className="text-xs text-muted-foreground">limite {attempt.timeLimitMinutes} min</p> : <p className="text-xs text-muted-foreground">limite non archivée</p>}</TableCell><TableCell className="whitespace-nowrap"><p className="font-semibold">{attempt.scorePercent} %</p><p className="text-xs text-muted-foreground">{attempt.score}/1000</p></TableCell><TableCell><ResultBadge status={attempt.status} /></TableCell><TableCell className="text-right"><Button size="sm" variant="ghost" aria-label={`Voir le profil de ${attempt.learnerLabel}`} onClick={(event) => { event.stopPropagation(); onOpenLearner(attempt.userId); }}><Eye className="h-4 w-4" /></Button></TableCell></TableRow>) : <TableRow><TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">Aucune tentative ne correspond aux filtres appliqués.</TableCell></TableRow>}</TableBody>
      </Table>
    </div>

    <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><p>{data?.total || 0} tentative(s) · page {page} sur {totalPages}</p><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}><ChevronLeft className="h-4 w-4" /> Précédent</Button><Button variant="outline" size="sm" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages}>Suivant <ChevronRight className="h-4 w-4" /></Button></div></div>
  </section>;
}
