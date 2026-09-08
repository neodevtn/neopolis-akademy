import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { AdminNavbar } from "@/components/AdminNavbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { isAdministrativeRole } from "@shared/roles";
import { AlertTriangle, ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarDays, CheckCircle2, ClipboardCheck, Clock3, Filter, Loader2, Plus, Search, Settings2, Target, UserRoundSearch, UsersRound } from "lucide-react";
import { toast } from "sonner";

const PRIORITY_LABELS = { low: "Faible", normal: "Normale", high: "Haute", urgent: "Urgente" } as const;
const AVAILABILITY_LABELS = { unknown: "Non renseignée", available: "Disponible", busy: "Occupé", unavailable: "Indisponible" } as const;
const EVENT_LABELS = { interview: "Entretien", evaluation: "Évaluation", certification_test: "Test de certification", certification_review: "Revue de certification", onboarding: "Intégration", follow_up: "Suivi", other: "Autre" } as const;
const MODALITY_LABELS = { video: "Visio", in_person: "Présentiel", phone: "Téléphone", platform: "Plateforme", external: "Externe", other: "Autre" } as const;
const ASSIGNMENT_LABELS = { workgroup: "Groupe de travail", mission: "Mission", opportunity: "Opportunité", recruitment: "Recrutement", ambassador: "Ambassadeur", partnership: "Partenariat" } as const;
const RECOMMENDATION_LABELS = { continue: "Poursuivre", develop: "Développer", certify: "Certifier", assign: "Affecter", recruit: "Recruter", ambassador: "Ambassadeur", hold: "Mettre en attente", decline: "Ne pas poursuivre" } as const;

type DialogKind = "event" | "assignment" | "task" | "evaluation" | "stage" | null;

function localized(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return String(record.fr || record.en || record.ar || "");
  }
  return "";
}

function formatDate(value: unknown, includeTime = true) {
  if (!value) return "—";
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return "—";
  return includeTime ? date.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" }) : date.toLocaleDateString("fr-FR", { dateStyle: "medium" });
}

function metric(value: number | undefined, label: string, icon: React.ReactNode, tone = "text-blue-700 bg-blue-50") {
  return <div className="border-b border-slate-200 py-4 last:border-0"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>{icon}</span><span className="text-sm font-medium text-slate-600">{label}</span></div><span className="text-2xl font-semibold text-slate-950">{value || 0}</span></div></div>;
}

export default function AdminTalentCRM() {
  const { user, loading, isAuthenticated } = useAuth();
  const isAdmin = isAdministrativeRole(user?.role);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [dialogKind, setDialogKind] = useState<DialogKind>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const utils = trpc.useUtils();

  const overviewQuery = trpc.talentAdmin.overview.useQuery(undefined, { enabled: isAuthenticated && isAdmin });
  const stagesQuery = trpc.talentAdmin.stages.useQuery(undefined, { enabled: isAuthenticated && isAdmin });
  const portfolioInput = useMemo(() => ({
    page,
    pageSize: 20,
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(stageFilter !== "all" ? { stageId: Number(stageFilter) } : {}),
    ...(priorityFilter !== "all" ? { priority: priorityFilter as "low" | "normal" | "high" | "urgent" } : {}),
  }), [page, priorityFilter, search, stageFilter]);
  const portfolioQuery = trpc.talentAdmin.portfolio.useQuery(portfolioInput, { enabled: isAuthenticated && isAdmin });
  const detailQuery = trpc.talentAdmin.detail.useQuery({ userId: selectedUserId || 0 }, { enabled: Boolean(selectedUserId) && isAuthenticated && isAdmin });

  useEffect(() => setPage(1), [search, stageFilter, priorityFilter]);

  const refresh = async () => {
    await Promise.all([utils.talentAdmin.overview.invalidate(), utils.talentAdmin.portfolio.invalidate(), selectedUserId ? utils.talentAdmin.detail.invalidate({ userId: selectedUserId }) : Promise.resolve()]);
  };
  const onSuccess = (message: string) => async () => { toast.success(message); setDialogKind(null); setForm({}); await refresh(); };
  const onError = (error: { message?: string }) => toast.error(error.message || "Action impossible");
  const changeStageMutation = trpc.talentAdmin.changeStage.useMutation({ onSuccess: onSuccess("Étape mise à jour"), onError });
  const updateProfileMutation = trpc.talentAdmin.updateProfile.useMutation({ onSuccess: onSuccess("Dossier mis à jour"), onError });
  const createEventMutation = trpc.talentAdmin.createEvent.useMutation({ onSuccess: onSuccess("Convocation créée"), onError });
  const createAssignmentMutation = trpc.talentAdmin.createAssignment.useMutation({ onSuccess: onSuccess("Affectation créée"), onError });
  const createTaskMutation = trpc.talentAdmin.createTask.useMutation({ onSuccess: onSuccess("Tâche créée"), onError });
  const createEvaluationMutation = trpc.talentAdmin.createEvaluation.useMutation({ onSuccess: onSuccess("Évaluation enregistrée"), onError });
  const updateEventMutation = trpc.talentAdmin.updateEventStatus.useMutation({ onSuccess: onSuccess("Rendez-vous mis à jour"), onError });
  const updateAssignmentMutation = trpc.talentAdmin.updateAssignmentStatus.useMutation({ onSuccess: onSuccess("Affectation mise à jour"), onError });
  const updateTaskMutation = trpc.talentAdmin.updateTaskStatus.useMutation({ onSuccess: onSuccess("Tâche mise à jour"), onError });
  const saveStageMutation = trpc.talentAdmin.saveStage.useMutation({ onSuccess: async () => { toast.success("Étape enregistrée"); setDialogKind(null); setForm({}); await Promise.all([utils.talentAdmin.stages.invalidate(), utils.talentAdmin.portfolio.invalidate()]); }, onError });

  const selected = detailQuery.data;
  const isMutating = createEventMutation.isPending || createAssignmentMutation.isPending || createTaskMutation.isPending || createEvaluationMutation.isPending || saveStageMutation.isPending;
  const totalPages = Math.max(1, Math.ceil((portfolioQuery.data?.total || 0) / 20));

  function openDialog(kind: Exclude<DialogKind, null>, defaults: Record<string, string | boolean> = {}) {
    setForm(defaults);
    setDialogKind(kind);
  }

  function submitDialog() {
    if (dialogKind === "stage") {
      saveStageMutation.mutate({ ...(form.id ? { id: Number(form.id) } : {}), key: String(form.key || ""), label: { fr: String(form.label || "") }, color: String(form.color || "#2563eb"), icon: String(form.icon || "user-round-search"), sortOrder: Number(form.sortOrder || 100), active: form.active !== false });
      return;
    }
    if (!selectedUserId) return;
    if (dialogKind === "event") {
      createEventMutation.mutate({ userId: selectedUserId, type: String(form.type || "interview") as keyof typeof EVENT_LABELS, title: String(form.title || ""), description: String(form.description || "") || undefined, modality: String(form.modality || "video") as keyof typeof MODALITY_LABELS, startsAt: form.startsAt ? new Date(String(form.startsAt)) : null, endsAt: form.endsAt ? new Date(String(form.endsAt)) : null, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", location: String(form.location || "") || undefined, meetingUrl: String(form.meetingUrl || "") || undefined, certificationId: String(form.certificationId || "") || undefined, learnerInstructions: String(form.learnerInstructions || "") || undefined, privateNotes: String(form.privateNotes || "") || undefined, visibleToLearner: form.visibleToLearner !== false, notifyLearner: form.notifyLearner !== false });
    } else if (dialogKind === "assignment") {
      createAssignmentMutation.mutate({ userId: selectedUserId, kind: String(form.kind || "workgroup") as keyof typeof ASSIGNMENT_LABELS, title: String(form.title || ""), description: String(form.description || "") || undefined, status: "proposed", startsAt: form.startsAt ? new Date(String(form.startsAt)) : null, endsAt: form.endsAt ? new Date(String(form.endsAt)) : null, visibleToLearner: form.visibleToLearner !== false });
    } else if (dialogKind === "task") {
      createTaskMutation.mutate({ userId: selectedUserId, title: String(form.title || ""), description: String(form.description || "") || undefined, priority: String(form.priority || "normal") as keyof typeof PRIORITY_LABELS, dueAt: form.dueAt ? new Date(String(form.dueAt)) : null });
    } else if (dialogKind === "evaluation") {
      createEvaluationMutation.mutate({ userId: selectedUserId, evaluationType: String(form.evaluationType || "Entretien"), score: form.score === "" || form.score === undefined ? null : Number(form.score), maxScore: form.maxScore === "" || form.maxScore === undefined ? null : Number(form.maxScore), recommendation: String(form.recommendation || "continue") as keyof typeof RECOMMENDATION_LABELS, strengths: String(form.strengths || "") || undefined, improvements: String(form.improvements || "") || undefined, learnerFeedback: String(form.learnerFeedback || "") || undefined, privateNotes: String(form.privateNotes || "") || undefined, visibleToLearner: form.visibleToLearner === true });
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-blue-700" /></div>;
  if (!isAuthenticated || !isAdmin) return <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50"><AlertTriangle className="h-12 w-12 text-slate-400" /><p className="text-lg font-semibold text-slate-900">Accès réservé aux administrateurs</p><a href={getLoginUrl()} className="rounded-md bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white">Se connecter</a></div>;

  return <div className="min-h-screen bg-slate-50 lg:pl-64">
    <AdminNavbar activePage="talent" accessRole={user?.role} />
    <main className="px-4 py-8 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-700">Gestion longitudinale</p><h1 className="mt-1 text-3xl font-semibold text-slate-950">Talents & réseau</h1><p className="mt-2 max-w-3xl text-sm text-slate-600">Suivez chaque membre depuis sa candidature jusqu’aux évaluations, certifications, missions, recrutements ou responsabilités d’ambassadeur.</p></div>
        <Button variant="outline" onClick={() => openDialog("stage", { color: "#2563eb", sortOrder: "100", active: true })}><Settings2 className="mr-2 h-4 w-4" />Configurer les étapes</Button>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <section className="border-y border-slate-200 bg-white px-5 py-4">
          <div className="grid grid-cols-2 gap-x-8 lg:grid-cols-4">
            {metric(overviewQuery.data?.members, "Membres suivis", <UsersRound className="h-4 w-4" />)}
            {metric(overviewQuery.data?.upcomingEvents, "Rendez-vous à 7 jours", <CalendarDays className="h-4 w-4" />, "bg-violet-50 text-violet-700")}
            {metric(overviewQuery.data?.activeAssignments, "Affectations actives", <BriefcaseBusiness className="h-4 w-4" />, "bg-emerald-50 text-emerald-700")}
            {metric(overviewQuery.data?.overdueTasks, "Tâches en retard", <Clock3 className="h-4 w-4" />, "bg-amber-50 text-amber-700")}
          </div>
        </section>
        <section className="border-y border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3"><span className="text-sm font-semibold text-slate-800">À traiter</span><Target className="h-4 w-4 text-slate-400" /></div>
          <div className="grid grid-cols-3 divide-x divide-slate-100 pt-4 text-center"><div><p className="text-2xl font-semibold">{overviewQuery.data?.awaitingResponse || 0}</p><p className="text-xs text-slate-500">Réponses</p></div><div><p className="text-2xl font-semibold">{overviewQuery.data?.highPriority || 0}</p><p className="text-xs text-slate-500">Prioritaires</p></div><div><p className="text-2xl font-semibold">{overviewQuery.data?.ambassadors || 0}</p><p className="text-xs text-slate-500">Ambassadeurs</p></div></div>
        </section>
      </div>

      <Tabs defaultValue="portfolio">
        <TabsList><TabsTrigger value="portfolio">Portefeuille</TabsTrigger><TabsTrigger value="stages">Étapes du parcours</TabsTrigger></TabsList>
        <TabsContent value="portfolio" className="mt-6">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un nom, une adresse ou un intitulé" /></div>
            <Select value={stageFilter} onValueChange={setStageFilter}><SelectTrigger className="w-full lg:w-52"><Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="Toutes les étapes" /></SelectTrigger><SelectContent><SelectItem value="all">Toutes les étapes</SelectItem>{stagesQuery.data?.filter((stage) => stage.active === 1).map((stage) => <SelectItem key={stage.id} value={String(stage.id)}>{localized(stage.label)}</SelectItem>)}</SelectContent></Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}><SelectTrigger className="w-full lg:w-44"><SelectValue placeholder="Toute priorité" /></SelectTrigger><SelectContent><SelectItem value="all">Toute priorité</SelectItem>{Object.entries(PRIORITY_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="overflow-x-auto border-y border-slate-200 bg-white">
            <table className="w-full min-w-[1050px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Membre</th><th className="px-4 py-3">Étape</th><th className="px-4 py-3">Priorité</th><th className="px-4 py-3">Disponibilité</th><th className="px-4 py-3">À répondre</th><th className="px-4 py-3">Affectations</th><th className="px-4 py-3">Tâches</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
              <tbody>{portfolioQuery.isLoading ? <tr><td colSpan={8} className="p-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-700" /></td></tr> : portfolioQuery.data?.members.length ? portfolioQuery.data.members.map((member) => <tr key={member.profile.id} className="cursor-pointer border-t border-slate-100 hover:bg-blue-50/40" onClick={() => setSelectedUserId(member.user.id)}><td className="px-4 py-4"><p className="font-semibold text-slate-900">{member.user.name || "Membre sans nom"}</p><p className="text-xs text-slate-500">{member.user.email || "—"}</p>{member.profile.headline && <p className="mt-1 max-w-[260px] truncate text-xs text-slate-600">{member.profile.headline}</p>}</td><td className="px-4 py-4"><span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: `${member.stage?.color || "#64748b"}18`, color: member.stage?.color || "#475569" }}><span className="h-2 w-2 rounded-full" style={{ backgroundColor: member.stage?.color || "#64748b" }} />{localized(member.stage?.label) || "Non classé"}</span></td><td className="px-4 py-4"><Badge variant={member.profile.priority === "urgent" ? "destructive" : "secondary"}>{PRIORITY_LABELS[member.profile.priority]}</Badge></td><td className="px-4 py-4 text-slate-600">{AVAILABILITY_LABELS[member.profile.availability]}</td><td className="px-4 py-4">{member.indicators.awaitingResponse}</td><td className="px-4 py-4">{member.indicators.activeAssignments}</td><td className="px-4 py-4"><span className={member.indicators.overdueTasks ? "font-semibold text-amber-700" : "text-slate-600"}>{member.indicators.openTasks}{member.indicators.overdueTasks ? ` (${member.indicators.overdueTasks} en retard)` : ""}</span></td><td className="px-4 py-4 text-right"><Button size="sm" variant="outline" onClick={(event) => { event.stopPropagation(); setSelectedUserId(member.user.id); }}>Ouvrir</Button></td></tr>) : <tr><td colSpan={8} className="p-12 text-center text-slate-500">Aucun membre ne correspond aux filtres.</td></tr>}</tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between"><p className="text-sm text-slate-500">{portfolioQuery.data?.total || 0} membre(s)</p><div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ArrowLeft className="mr-1 h-4 w-4" />Précédent</Button><span className="px-2 text-sm text-slate-600">Page {page} / {totalPages}</span><Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Suivant<ArrowRight className="ml-1 h-4 w-4" /></Button></div></div>
        </TabsContent>
        <TabsContent value="stages" className="mt-6"><div className="border-y border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="font-semibold text-slate-900">Cycle de vie du membre</h2><p className="text-sm text-slate-500">Les étapes système peuvent être renommées et réordonnées ; leur clé reste stable.</p></div><Button onClick={() => openDialog("stage", { color: "#2563eb", sortOrder: "100", active: true })}><Plus className="mr-2 h-4 w-4" />Nouvelle étape</Button></div>{stagesQuery.data?.map((stage) => <button type="button" key={stage.id} className="flex w-full items-center gap-4 border-b border-slate-100 px-5 py-4 text-left last:border-0 hover:bg-slate-50" onClick={() => openDialog("stage", { id: String(stage.id), key: stage.key, label: localized(stage.label), color: stage.color, icon: stage.icon, sortOrder: String(stage.sortOrder), active: stage.active === 1 })}><span className="h-10 w-1 rounded-full" style={{ backgroundColor: stage.color }} /><span className="flex-1"><span className="font-semibold text-slate-900">{localized(stage.label)}</span><span className="ml-2 text-xs text-slate-400">{stage.key}</span><span className="mt-1 block text-sm text-slate-500">{localized(stage.description)}</span></span><Badge variant={stage.active ? "secondary" : "outline"}>{stage.active ? "Active" : "Inactive"}</Badge><span className="text-sm text-slate-400">Ordre {stage.sortOrder}</span></button>)}</div></TabsContent>
      </Tabs>
    </main>

    <Sheet open={Boolean(selectedUserId)} onOpenChange={(open) => !open && setSelectedUserId(null)}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader><SheetTitle>{selected?.user.name || "Dossier membre"}</SheetTitle><SheetDescription>{selected?.user.email || "Chargement du dossier longitudinal…"}</SheetDescription></SheetHeader>
        {detailQuery.isLoading ? <div className="py-16 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-700" /></div> : selected ? <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3"><div><Label>Étape</Label><Select value={String(selected.profile.stageId || "")} onValueChange={(value) => changeStageMutation.mutate({ userId: selected.user.id, stageId: Number(value), reason: "Mise à jour depuis le dossier Talent CRM" })}><SelectTrigger className="mt-1"><SelectValue placeholder="Choisir" /></SelectTrigger><SelectContent>{selected.stages.filter((stage) => stage.active === 1).map((stage) => <SelectItem key={stage.id} value={String(stage.id)}>{localized(stage.label)}</SelectItem>)}</SelectContent></Select></div><div><Label>Priorité</Label><Select value={selected.profile.priority} onValueChange={(priority) => updateProfileMutation.mutate({ userId: selected.user.id, priority: priority as keyof typeof PRIORITY_LABELS, availability: selected.profile.availability, headline: selected.profile.headline || undefined, summary: selected.profile.summary || undefined, ownerId: selected.profile.ownerId })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(PRIORITY_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div><div><Label>Disponibilité</Label><Select value={selected.profile.availability} onValueChange={(availability) => updateProfileMutation.mutate({ userId: selected.user.id, priority: selected.profile.priority, availability: availability as keyof typeof AVAILABILITY_LABELS, headline: selected.profile.headline || undefined, summary: selected.profile.summary || undefined, ownerId: selected.profile.ownerId })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(AVAILABILITY_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div></div>
          <div className="flex flex-wrap gap-2"><Button onClick={() => openDialog("event", { type: "interview", modality: "video", visibleToLearner: true, notifyLearner: true })}><CalendarDays className="mr-2 h-4 w-4" />Convoquer</Button><Button variant="outline" onClick={() => openDialog("evaluation", { recommendation: "continue", visibleToLearner: false })}><ClipboardCheck className="mr-2 h-4 w-4" />Évaluer</Button><Button variant="outline" onClick={() => openDialog("assignment", { kind: "workgroup", visibleToLearner: true })}><BriefcaseBusiness className="mr-2 h-4 w-4" />Affecter</Button><Button variant="outline" onClick={() => openDialog("task", { priority: "normal" })}><CheckCircle2 className="mr-2 h-4 w-4" />Créer une tâche</Button></div>
          <Tabs defaultValue="timeline"><TabsList className="h-auto w-full justify-start overflow-x-auto"><TabsTrigger value="timeline">Synthèse</TabsTrigger><TabsTrigger value="learning">Formation</TabsTrigger><TabsTrigger value="events">Rendez-vous</TabsTrigger><TabsTrigger value="assignments">Affectations</TabsTrigger><TabsTrigger value="evaluations">Évaluations</TabsTrigger><TabsTrigger value="tasks">Tâches</TabsTrigger></TabsList>
            <TabsContent value="timeline" className="space-y-4 pt-4"><div className="border-y border-slate-200 py-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Profil candidat</p><div className="mt-3 grid grid-cols-2 gap-4 text-sm"><div><span className="text-slate-500">Métier</span><p className="font-medium">{selected.application?.currentRole || "—"}</p></div><div><span className="text-slate-500">Secteur</span><p className="font-medium">{selected.application?.sector || "—"}</p></div><div><span className="text-slate-500">Localisation</span><p className="font-medium">{[selected.application?.city, selected.application?.country].filter(Boolean).join(", ") || "—"}</p></div><div><span className="text-slate-500">Score candidature</span><p className="font-medium">{selected.application?.scoreTotal || "—"}</p></div></div></div><div><p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Historique des étapes</p>{selected.history.length ? selected.history.map((item) => <div key={item.history.id} className="flex gap-3 border-l-2 border-slate-200 py-2 pl-4"><div><p className="text-sm font-medium text-slate-800">Changement d’étape</p><p className="text-xs text-slate-500">{item.history.reason || "Sans commentaire"} · {formatDate(item.history.createdAt)}</p></div></div>) : <p className="text-sm text-slate-500">Aucun changement enregistré.</p>}</div></TabsContent>
            <TabsContent value="learning" className="space-y-5 pt-4"><div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><Kpi label="Leçons terminées" value={selected.learning.metrics.completedLessons} /><Kpi label="Chapitres validés" value={selected.learning.metrics.completedChapters} /><Kpi label="Vidéos vues" value={selected.learning.metrics.watchedVideos} /><Kpi label="Examens passés" value={selected.learning.metrics.examAttempts} /><Kpi label="Temps actif" value={`${Math.round(selected.learning.metrics.activeSeconds / 60)} min`} /><Kpi label="Réussite 1re tentative" value={selected.learning.metrics.firstExamPassRate == null ? "—" : `${selected.learning.metrics.firstExamPassRate}%`} /></div><div><p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Progression engagée</p>{selected.learning.certificationProgress.some((item) => item.completedLessons > 0 || item.completedCourses > 0 || item.completionPercent > 0) ? <div className="space-y-3">{selected.learning.certificationProgress.filter((item) => item.completedLessons > 0 || item.completedCourses > 0 || item.completionPercent > 0).map((item) => <div key={item.certificationId} className="rounded-lg border border-slate-200 p-3"><div className="flex items-center justify-between gap-3 text-sm"><span className="font-medium text-slate-800">{item.title}</span><span className="text-slate-500">{item.completionPercent}%</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-600" style={{ width: `${Math.max(0, Math.min(100, item.completionPercent))}%` }} /></div></div>)}</div> : <p className="text-sm text-slate-500">Aucune progression de formation enregistrée.</p>}</div><div><p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Groupes</p><div className="flex flex-wrap gap-2">{selected.learning.groups.length ? selected.learning.groups.map((group) => <Badge key={group.id} variant="secondary">{group.name}</Badge>) : <span className="text-sm text-slate-500">Aucun groupe attribué.</span>}</div></div></TabsContent>
            <TabsContent value="events" className="space-y-3 pt-4">{selected.events.length ? selected.events.map((event) => <div key={event.id} className="border-b border-slate-200 pb-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{event.title}</p><p className="text-sm text-slate-500">{EVENT_LABELS[event.type]} · {MODALITY_LABELS[event.modality]} · {formatDate(event.startsAt)}</p></div><div className="flex flex-wrap justify-end gap-2"><Badge variant="secondary">{event.status}</Badge>{event.notificationStatus === "sent" && <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">E-mail envoyé</Badge>}{event.notificationStatus === "failed" && <Badge variant="destructive">E-mail en échec</Badge>}</div></div><p className="mt-2 text-sm text-slate-600">Réponse : {event.responseStatus}</p>{event.learnerResponseNote && <p className="mt-2 rounded-md bg-slate-50 p-3 text-sm text-slate-700">{event.learnerResponseNote}</p>}<div className="mt-3 flex gap-2"><Button size="sm" variant="outline" onClick={() => updateEventMutation.mutate({ eventId: event.id, status: "completed" })}>Terminer</Button><Button size="sm" variant="ghost" onClick={() => updateEventMutation.mutate({ eventId: event.id, status: "cancelled" })}>Annuler</Button></div></div>) : <p className="py-8 text-center text-sm text-slate-500">Aucun rendez-vous.</p>}</TabsContent>
            <TabsContent value="assignments" className="space-y-3 pt-4">{selected.assignments.length ? selected.assignments.map((assignment) => <div key={assignment.id} className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4"><div><p className="font-semibold">{assignment.title}</p><p className="text-sm text-slate-500">{ASSIGNMENT_LABELS[assignment.kind]} · {assignment.status}</p><p className="mt-1 text-sm text-slate-600">{assignment.description}</p></div>{assignment.status === "proposed" && <Button size="sm" variant="outline" onClick={() => updateAssignmentMutation.mutate({ assignmentId: assignment.id, status: "active" })}>Activer</Button>}</div>) : <p className="py-8 text-center text-sm text-slate-500">Aucune affectation.</p>}</TabsContent>
            <TabsContent value="evaluations" className="space-y-3 pt-4">{selected.evaluations.length ? selected.evaluations.map((evaluation) => <div key={evaluation.id} className="border-b border-slate-200 pb-4"><div className="flex items-start justify-between"><div><p className="font-semibold">{evaluation.evaluationType}</p><p className="text-sm text-slate-500">{formatDate(evaluation.createdAt)} · {RECOMMENDATION_LABELS[evaluation.recommendation]}</p></div>{evaluation.score && <Badge variant="secondary">{evaluation.score}/{evaluation.maxScore || "—"}</Badge>}</div>{evaluation.strengths && <p className="mt-2 text-sm"><strong>Points forts :</strong> {evaluation.strengths}</p>}{evaluation.improvements && <p className="mt-1 text-sm"><strong>À développer :</strong> {evaluation.improvements}</p>}</div>) : <p className="py-8 text-center text-sm text-slate-500">Aucune évaluation.</p>}</TabsContent>
            <TabsContent value="tasks" className="space-y-3 pt-4">{selected.tasks.length ? selected.tasks.map((task) => <div key={task.id} className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4"><div><p className="font-semibold">{task.title}</p><p className="text-sm text-slate-500">{PRIORITY_LABELS[task.priority]} · échéance {formatDate(task.dueAt, false)}</p></div>{task.status !== "completed" && <Button size="sm" variant="outline" onClick={() => updateTaskMutation.mutate({ taskId: task.id, status: "completed" })}>Terminer</Button>}</div>) : <p className="py-8 text-center text-sm text-slate-500">Aucune tâche.</p>}</TabsContent>
          </Tabs>
        </div> : null}
      </SheetContent>
    </Sheet>

    <Dialog open={Boolean(dialogKind)} onOpenChange={(open) => !open && setDialogKind(null)}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>{dialogKind === "event" ? "Créer une convocation" : dialogKind === "assignment" ? "Créer une affectation" : dialogKind === "task" ? "Créer une tâche" : dialogKind === "evaluation" ? "Enregistrer une évaluation" : "Configurer une étape"}</DialogTitle><DialogDescription>Les informations du membre sont reprises automatiquement depuis son dossier.</DialogDescription></DialogHeader><div className="space-y-4 pt-2">
      {dialogKind === "stage" && <><Field label="Clé stable"><Input value={String(form.key || "")} disabled={Boolean(form.id)} onChange={(event) => setForm({ ...form, key: event.target.value })} placeholder="nouvelle_etape" /></Field><Field label="Libellé français"><Input value={String(form.label || "")} onChange={(event) => setForm({ ...form, label: event.target.value })} /></Field><div className="grid grid-cols-2 gap-4"><Field label="Couleur"><Input type="color" value={String(form.color || "#2563eb")} onChange={(event) => setForm({ ...form, color: event.target.value })} /></Field><Field label="Ordre"><Input type="number" value={String(form.sortOrder || "100")} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} /></Field></div></>}
      {dialogKind === "event" && <><div className="grid gap-4 sm:grid-cols-2"><Field label="Motif"><Select value={String(form.type || "interview")} onValueChange={(value) => setForm({ ...form, type: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(EVENT_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></Field><Field label="Modalité"><Select value={String(form.modality || "video")} onValueChange={(value) => setForm({ ...form, modality: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(MODALITY_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></Field></div><Field label="Titre"><Input value={String(form.title || "")} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Entretien d’évaluation" /></Field><Field label="Description"><Textarea value={String(form.description || "")} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Début"><Input type="datetime-local" value={String(form.startsAt || "")} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} /></Field><Field label="Fin"><Input type="datetime-local" value={String(form.endsAt || "")} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} /></Field></div><Field label="Lien visio ou externe"><Input type="url" value={String(form.meetingUrl || "")} onChange={(event) => setForm({ ...form, meetingUrl: event.target.value })} placeholder="https://…" /></Field><Field label="Lieu"><Input value={String(form.location || "")} onChange={(event) => setForm({ ...form, location: event.target.value })} /></Field><Field label="Certification concernée"><Input value={String(form.certificationId || "")} onChange={(event) => setForm({ ...form, certificationId: event.target.value })} /></Field><Field label="Instructions apprenant"><Textarea value={String(form.learnerInstructions || "")} onChange={(event) => setForm({ ...form, learnerInstructions: event.target.value })} /></Field><Field label="Notes privées administrateur"><Textarea value={String(form.privateNotes || "")} onChange={(event) => setForm({ ...form, privateNotes: event.target.value })} /></Field></>}
      {dialogKind === "assignment" && <><Field label="Type"><Select value={String(form.kind || "workgroup")} onValueChange={(value) => setForm({ ...form, kind: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(ASSIGNMENT_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></Field><Field label="Intitulé"><Input value={String(form.title || "")} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field><Field label="Description"><Textarea value={String(form.description || "")} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Début"><Input type="date" value={String(form.startsAt || "")} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} /></Field><Field label="Fin"><Input type="date" value={String(form.endsAt || "")} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} /></Field></div></>}
      {dialogKind === "task" && <><Field label="Tâche"><Input value={String(form.title || "")} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field><Field label="Description"><Textarea value={String(form.description || "")} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Priorité"><Select value={String(form.priority || "normal")} onValueChange={(value) => setForm({ ...form, priority: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(PRIORITY_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></Field><Field label="Échéance"><Input type="date" value={String(form.dueAt || "")} onChange={(event) => setForm({ ...form, dueAt: event.target.value })} /></Field></div></>}
      {dialogKind === "evaluation" && <><div className="grid gap-4 sm:grid-cols-2"><Field label="Type d’évaluation"><Input value={String(form.evaluationType || "")} onChange={(event) => setForm({ ...form, evaluationType: event.target.value })} /></Field><Field label="Recommandation"><Select value={String(form.recommendation || "continue")} onValueChange={(value) => setForm({ ...form, recommendation: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(RECOMMENDATION_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></Field></div><div className="grid grid-cols-2 gap-4"><Field label="Score"><Input type="number" min="0" value={String(form.score || "")} onChange={(event) => setForm({ ...form, score: event.target.value })} /></Field><Field label="Maximum"><Input type="number" min="1" value={String(form.maxScore || "")} onChange={(event) => setForm({ ...form, maxScore: event.target.value })} /></Field></div><Field label="Points forts"><Textarea value={String(form.strengths || "")} onChange={(event) => setForm({ ...form, strengths: event.target.value })} /></Field><Field label="Axes de développement"><Textarea value={String(form.improvements || "")} onChange={(event) => setForm({ ...form, improvements: event.target.value })} /></Field><Field label="Retour visible par l’apprenant"><Textarea value={String(form.learnerFeedback || "")} onChange={(event) => setForm({ ...form, learnerFeedback: event.target.value })} /></Field><Field label="Notes privées"><Textarea value={String(form.privateNotes || "")} onChange={(event) => setForm({ ...form, privateNotes: event.target.value })} /></Field></>}
      <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={() => setDialogKind(null)}>Annuler</Button><Button onClick={submitDialog} disabled={isMutating || !String(form.title || form.label || form.evaluationType || "").trim()}>{isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer</Button></div>
    </div></DialogContent></Dialog>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}

function Kpi({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-lg font-semibold text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>;
}
