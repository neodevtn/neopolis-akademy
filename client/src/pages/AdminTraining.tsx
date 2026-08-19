import { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { AdminNavbar } from "@/components/AdminNavbar";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft, Users, BookOpen, Award, GraduationCap, Search,
  ChevronLeft, ChevronRight, Loader2, Shield, LogIn, Eye,
  UserPlus, Ban, ShieldCheck, Download, BarChart3, Mail,
  MoreVertical, UserX, UserCheck, TrendingUp, Activity,
  Clock, CheckCircle2, AlertTriangle, RefreshCw, Edit2, Send,
  UserCog,
} from "lucide-react";
import { FileText, Video, BookMarked, XCircle, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import trainingIndex from "@/data/trainingIndex.json";
import { AchievementGallery } from "@/components/AchievementGallery";
import { CompetencyProfile } from "@/components/CompetencyProfile";
import { CompetencyLeaderboard } from "@/components/admin/CompetencyLeaderboard";
import { buildNavigationUrl } from "@shared/navigationUrls";
import { parseInvitationEmails, type InvitationEmailParseResult } from "@/lib/invitationEmails";

const LOGO_URL = "/api/assets/logo_neopolis_akademy_9c9a0823.png";

/* ─── Animation ─── */
const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] as const } },
};

export default function AdminTraining() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const urlSearch = useSearch();
  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(typeof window === "undefined" ? "" : window.location.search).get("tab") || "learners");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [learnerSortBy, setLearnerSortBy] = useState<"lastSignedIn" | "name" | "email" | "createdAt" | "globalScore" | "role" | "blocked">("globalScore");
  const [learnerSortDirection, setLearnerSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteLang, setInviteLang] = useState<"fr" | "en">("fr");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteResults, setInviteResults] = useState<{ email: string; success: boolean; error?: string }[] | null>(null);
  const [editEmailId, setEditEmailId] = useState<number | null>(null);
  const [editEmailValue, setEditEmailValue] = useState("");
  const [reportingDays, setReportingDays] = useState<7 | 30 | 90>(30);
  const [reportingCertificationId, setReportingCertificationId] = useState("all");
  const pageSize = 15;
  const activeSection = ({
    learners: { title: "Suivi des apprenants", description: "Progression, engagement et accompagnement des comptes actifs" },
    invitations: { title: "Invitations directes", description: "Inviter, suivre ou annuler les invitations hors candidature" },
    selected: { title: "Candidats sélectionnés", description: "Vérifier l’activation des comptes et relancer les candidats retenus" },
    analytics: { title: "Reporting d’apprentissage", description: "Analyser la performance, l’implication et l’évolution des apprenants" },
  } as Record<string, { title: string; description: string }>)[activeTab] || { title: "Gestion des apprenants", description: "Suivi, invitations et analyses de la formation" };

  const navigateTraining = (tab: string, learnerId?: number | null) => {
    const params = new URLSearchParams({ tab });
    if (learnerId) params.set("learner", String(learnerId));
    navigate(buildNavigationUrl("/admin/training", { tab, learner: learnerId }));
  };

  const directInvitationTable = useMemo(() => {
    const params = new URLSearchParams(urlSearch);
    const page = Math.max(1, Number(params.get("invPage")) || 1);
    const search = params.get("invSearch") || "";
    const sortBy = ["createdAt", "email", "name", "status", "expiresAt"].includes(params.get("invSort") || "") ? params.get("invSort")! as "createdAt" | "email" | "name" | "status" | "expiresAt" : "createdAt";
    const sortDirection = params.get("invDirection") === "asc" ? "asc" as const : "desc" as const;
    return { page, search, sortBy, sortDirection };
  }, [urlSearch]);

  const selectedCandidateTable = useMemo(() => {
    const params = new URLSearchParams(urlSearch);
    const page = Math.max(1, Number(params.get("selectedPage")) || 1);
    const search = params.get("selectedSearch") || "";
    const sortBy = ["updatedAt", "email", "firstName", "scoreTotal"].includes(params.get("selectedSort") || "") ? params.get("selectedSort")! as "updatedAt" | "email" | "firstName" | "scoreTotal" : "updatedAt";
    const sortDirection = params.get("selectedDirection") === "asc" ? "asc" as const : "desc" as const;
    return { page, search, sortBy, sortDirection };
  }, [urlSearch]);

  const updateDirectInvitationTable = (next: Partial<typeof directInvitationTable>) => {
    const state = { ...directInvitationTable, ...next };
    const params = new URLSearchParams(urlSearch);
    params.set("tab", "invitations");
    state.page > 1 ? params.set("invPage", String(state.page)) : params.delete("invPage");
    state.search ? params.set("invSearch", state.search) : params.delete("invSearch");
    state.sortBy !== "createdAt" ? params.set("invSort", state.sortBy) : params.delete("invSort");
    state.sortDirection !== "desc" ? params.set("invDirection", state.sortDirection) : params.delete("invDirection");
    navigate(`/admin/training?${params.toString()}`);
  };

  const updateSelectedCandidateTable = (next: Partial<typeof selectedCandidateTable>) => {
    const state = { ...selectedCandidateTable, ...next };
    const params = new URLSearchParams(urlSearch);
    params.set("tab", "selected");
    state.page > 1 ? params.set("selectedPage", String(state.page)) : params.delete("selectedPage");
    state.search ? params.set("selectedSearch", state.search) : params.delete("selectedSearch");
    state.sortBy !== "updatedAt" ? params.set("selectedSort", state.sortBy) : params.delete("selectedSort");
    state.sortDirection !== "desc" ? params.set("selectedDirection", state.sortDirection) : params.delete("selectedDirection");
    navigate(`/admin/training?${params.toString()}`);
  };

  const toggleDirectInvitationSort = (column: typeof directInvitationTable.sortBy) => {
    updateDirectInvitationTable({
      page: 1,
      sortBy: column,
      sortDirection: directInvitationTable.sortBy === column && directInvitationTable.sortDirection === "desc" ? "asc" : "desc",
    });
  };

  const toggleLearnerSort = (column: typeof learnerSortBy) => {
    setPage(1);
    setLearnerSortDirection((direction) => learnerSortBy === column && direction === "desc" ? "asc" : "desc");
    setLearnerSortBy(column);
  };

  useEffect(() => {
    const params = new URLSearchParams(urlSearch);
    const tab = params.get("tab");
    if (["learners", "invitations", "selected", "analytics"].includes(tab || "")) setActiveTab(tab!);
    else setActiveTab("learners");
    const learnerId = Number(params.get("learner"));
    if (Number.isInteger(learnerId) && learnerId > 0) setSelectedUserId(learnerId);
    else setSelectedUserId(null);
  }, [urlSearch]);

  const reportingInput = useMemo(() => ({
    days: reportingDays,
    certificationId: reportingCertificationId === "all" ? undefined : reportingCertificationId,
  }), [reportingDays, reportingCertificationId]);

  // Queries
  const statsQuery = trpc.admin.getStats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const learnersQuery = trpc.admin.getLearners.useQuery(
    { page, pageSize, search: search || undefined, sortBy: learnerSortBy, sortDirection: learnerSortDirection },
    { enabled: isAuthenticated && user?.role === "admin" && activeTab === "learners" }
  );

  const detailQuery = trpc.admin.getLearnerDetail.useQuery(
    { userId: selectedUserId! },
    { enabled: !!selectedUserId && isAuthenticated && user?.role === "admin" }
  );

  const integrityQueueQuery = trpc.adminTools.integrity.queue.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin" && activeTab === "learners",
  });
  const learnerIntegrityQuery = trpc.adminTools.integrity.getForLearner.useQuery(
    { userId: selectedUserId! },
    { enabled: !!selectedUserId && isAuthenticated && user?.role === "admin" },
  );
  const learnerOrientationQuery = trpc.orientation.getAdminOverview.useQuery(
    { userId: selectedUserId!, limit: 1 },
    { enabled: !!selectedUserId && isAuthenticated && user?.role === "admin" },
  );
  const integrityByUserId = useMemo(
    () => new Map((integrityQueueQuery.data || []).map((item) => [item.id, item])),
    [integrityQueueQuery.data],
  );

  const invitationsQuery = trpc.admin.getInvitations.useQuery(
    { page: 1, pageSize: 50 },
    { enabled: isAuthenticated && user?.role === "admin" && activeTab === "invitations" }
  );

  const directInvitationsQuery = trpc.admin.getDirectInvitations.useQuery(
    { page: directInvitationTable.page, pageSize: 10, search: directInvitationTable.search || undefined, sortBy: directInvitationTable.sortBy, sortDirection: directInvitationTable.sortDirection },
    { enabled: isAuthenticated && user?.role === "admin" && activeTab === "invitations" }
  );

  const analyticsQuery = trpc.admin.getAnalytics.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin" && activeTab === "analytics",
  });

  const learningReportsQuery = trpc.admin.getLearningReports.useQuery(reportingInput, {
    enabled: isAuthenticated && user?.role === "admin" && activeTab === "analytics",
  });

  const exportQuery = trpc.admin.exportLearners.useQuery(undefined, {
    enabled: false, // manual trigger
  });
  const orientationReminderMutation = trpc.orientation.prepareLegacyReminder.useMutation({
    onSuccess: (result) => toast.success(result.draft ? `Brouillon créé pour ${result.recipientCount} apprenants : vérifiez-le avant envoi.` : "Tous les apprenants ont déjà terminé leur orientation."),
    onError: (error) => toast.error(error.message || "Impossible de préparer le rappel d’orientation"),
  });

  const selectedCandidatesQuery = trpc.admin.getSelectedCandidates.useQuery({ page: selectedCandidateTable.page, pageSize: 10, search: selectedCandidateTable.search || undefined, sortBy: selectedCandidateTable.sortBy, sortDirection: selectedCandidateTable.sortDirection }, {
    enabled: isAuthenticated && user?.role === "admin" && activeTab === "selected",
  });

  const emailStatsQuery = trpc.admin.getEmailDeliveryStats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin" && activeTab === "selected",
  });

  // Mutations
  const blockMutation = trpc.admin.blockUser.useMutation({
    onSuccess: (data) => {
      toast.success(data.blocked ? "Utilisateur bloqué" : "Utilisateur débloqué");
      learnersQuery.refetch();
    },
    onError: () => toast.error("Erreur lors de la modification"),
  });

  const roleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: (data) => {
      toast.success(`Rôle mis à jour : ${data.role}`);
      learnersQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const integrityReviewMutation = trpc.adminTools.integrity.review.useMutation({
    onSuccess: (data) => {
      learnerIntegrityQuery.refetch();
      integrityQueueQuery.refetch();
      toast.success(data.review.status === "dismissed" ? "Signal écarté après revue" : "Revue d’intégrité enregistrée");
    },
    onError: (error) => toast.error(error.message || "Impossible d’enregistrer la revue"),
  });

  const bulkInviteMutation = trpc.admin.bulkCreateInvitations.useMutation({
    onSuccess: (data) => {
      setInviteResults(data.results);
      if (data.sent) toast.success(`${data.sent} invitation${data.sent > 1 ? "s" : ""} créée${data.sent > 1 ? "s" : ""}`);
      if (data.failed) toast.error(`${data.failed} adresse${data.failed > 1 ? "s" : ""} n’a${data.failed > 1 ? "ont" : ""} pas pu être invitée${data.failed > 1 ? "s" : ""}`);
      invitationsQuery.refetch();
      directInvitationsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const parsedInviteEmails: InvitationEmailParseResult = useMemo(
    () => parseInvitationEmails(inviteEmails),
    [inviteEmails],
  );
  const resetInviteDialog = () => {
    setInviteOpen(false);
    setInviteEmails("");
    setInviteName("");
    setInviteMessage("");
    setInviteResults(null);
  };

  const updateEmailMutation = trpc.admin.updateCandidateEmail.useMutation({
    onSuccess: () => {
      toast.success("Email mis à jour avec succès");
      setEditEmailId(null);
      setEditEmailValue("");
      selectedCandidatesQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const resendCandidateInvitationMutation = trpc.admin.resendCandidateInvitation.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Invitation renvoyée avec succès");
      } else {
        toast.error(data.error || "Échec de l'envoi");
      }
      selectedCandidatesQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const cancelInvitationMutation = trpc.admin.cancelInvitation.useMutation({
    onSuccess: () => {
      toast.success("Invitation annulée");
      directInvitationsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  // Auth gates
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center bg-card rounded-2xl border border-border p-10 shadow-sm max-w-md">
          <LogIn className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-3">Accès restreint</h1>
          <p className="text-muted-foreground mb-6">Vous devez être connecté en tant qu'administrateur.</p>
          <a href={getLoginUrl()}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Se connecter</Button>
          </a>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center bg-card rounded-2xl border border-border p-10 shadow-sm max-w-md">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-3">Accès refusé</h1>
          <p className="text-muted-foreground mb-6">Cette page est réservée aux administrateurs.</p>
          <Link href="/">
            <Button variant="outline">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = statsQuery.data;
  const learners = learnersQuery.data;
  const totalPages = learners ? Math.ceil(learners.total / pageSize) : 0;

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleExportCSV = async () => {
    try {
      const result = await exportQuery.refetch();
      if (result.data) {
        const headers = ["ID", "Nom", "Email", "Rôle", "Bloqué", "Leçons terminées", "Examens passés", "Inscrit le", "Dernière connexion"];
        const rows = result.data.map((r: any) => [
          r.id, r.name, r.email, r.role, r.blocked, r.lessonsCompleted, r.examAttempts, r.createdAt, r.lastSignedIn
        ]);
        const csv = [headers.join(";"), ...rows.map((r: any[]) => r.join(";"))].join("\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `apprenants_export_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Export CSV téléchargé");
      }
    } catch {
      toast.error("Erreur lors de l'export");
    }
  };

  // Detail view for a specific learner — enriched
  if (selectedUserId && detailQuery.data) {
    const detail = detailQuery.data;
    const selectedLearner = learners?.users.find((u: any) => u.id === selectedUserId);
    const viaCandidature = (detail as any).viaCandidature ?? selectedLearner?.viaCandidature ?? false;
    const chapterProg = (detail as any).chapterProgress ?? [];
    const videoProg = (detail as any).videoProgress ?? [];
    const learningEvents = (detail as any).learningEvents ?? [];
    const exerciseResults = (detail as any).exerciseResults ?? [];
    const achievements = (detail as any).achievements ?? [];
    const competencies = (detail as any).competencies ?? [];
    const totalChaptersDone = chapterProg.length;
    const totalVideosDone = videoProg.filter((v: any) => v.watched).length;
    const totalSeconds = learningEvents.filter((e: any) => e.eventType === "learning_time").reduce((sum: number, e: any) => sum + (e.durationSeconds || 0), 0);
    const firstAttempts = learningEvents.filter((e: any) => e.eventType === "exercise_submitted" && e.attemptNumber === 1);
    const firstAttemptRate = firstAttempts.length ? Math.round((firstAttempts.filter((e: any) => e.success === 1).length / firstAttempts.length) * 100) : null;
    const integrity = learnerIntegrityQuery.data;
    const orientation = learnerOrientationQuery.data?.[0]?.orientation;
    const integrityTone = integrity?.assessment.level === "priority_review" ? "border-red-300 bg-red-50 dark:border-red-900/70 dark:bg-red-950/30" : integrity?.assessment.level === "review" ? "border-amber-300 bg-amber-50 dark:border-amber-900/70 dark:bg-amber-950/30" : "border-border bg-card";

    // Group progress by certification
    const progressByCert: Record<string, { courseId: string; lessonIndex: number }[]> = {};
    for (const p of detail.progress) {
      if (!progressByCert[p.certificationId]) progressByCert[p.certificationId] = [];
      progressByCert[p.certificationId].push({ courseId: p.courseId, lessonIndex: p.lessonIndex });
    }

    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar activePage="training" />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Button variant="outline" size="sm" onClick={() => navigateTraining(activeTab)} className="mb-6 gap-1.5">
            <ChevronLeft className="w-4 h-4" /> Retour à la liste
          </Button>

          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <div className="bg-card rounded-2xl border border-border p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    {selectedLearner?.name || (detail as any).userInfo?.name || "Apprenant"}
                  </h2>
                  <p className="text-sm text-muted-foreground">{selectedLearner?.email || (detail as any).userInfo?.email || "—"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {viaCandidature ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Via candidature
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Via invitation directe
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedLearner?.blocked ? (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium">Bloqué</span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium">Actif</span>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => blockMutation.mutate({ userId: selectedUserId, blocked: !selectedLearner?.blocked })}
                        className="gap-2"
                      >
                        {selectedLearner?.blocked ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        {selectedLearner?.blocked ? "Débloquer" : "Bloquer"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => roleMutation.mutate({ userId: selectedUserId, role: selectedLearner?.role === "admin" ? "user" : "admin" })}
                        className="gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        {selectedLearner?.role === "admin" ? "Rétrograder en utilisateur" : "Promouvoir admin"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-card rounded-xl border border-border p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-primary">{detail.progress.length}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><BookOpen className="w-3 h-3" /> Leçons terminées</div>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-primary">{totalChaptersDone}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><BookMarked className="w-3 h-3" /> Chapitres validés</div>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-primary">{totalVideosDone}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><Video className="w-3 h-3" /> Vidéos vues</div>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-primary">{detail.attempts.length}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><Award className="w-3 h-3" /> Examens passés</div>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-primary">{totalSeconds >= 3600 ? `${(totalSeconds / 3600).toFixed(1)} h` : `${Math.round(totalSeconds / 60)} min`}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><Clock className="w-3 h-3" /> Temps actif</div>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-primary">{firstAttemptRate === null ? "—" : `${firstAttemptRate}%`}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3" /> Réussite 1re tentative</div>
              </div>
            </div>

            <section className={`mb-6 rounded-xl border p-5 ${integrityTone}`} aria-label="Revue d’intégrité pédagogique">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <h3 className="font-semibold text-foreground">Intégrité pédagogique · revue humaine</h3>
                    {integrity && <span className="rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-foreground">Score de revue : {integrity.assessment.riskScore}/100</span>}
                  </div>
                  <p className="mt-1 max-w-3xl text-xs text-muted-foreground">Les signaux sont des éléments de contexte pédagogiques. Ils ne prouvent pas une utilisation d’IA et ne bloquent jamais un compte automatiquement.</p>
                </div>
                {integrity?.review && <span className="rounded-full bg-background px-2.5 py-1 text-xs font-medium text-foreground">Statut : {integrity.review.status === "dismissed" ? "Écarté" : integrity.review.status === "confirmed" ? "Suivi renforcé" : "À vérifier"}</span>}
              </div>
              {learnerIntegrityQuery.isLoading ? <div className="mt-4 h-16 animate-pulse rounded-lg bg-muted" /> : integrity && (
                <>
                  {integrity.assessment.signals.length ? (
                    <ul className="mt-4 space-y-2">
                      {integrity.assessment.signals.map((signal) => (
                        <li key={signal.id} className="rounded-lg border border-border/70 bg-background/70 p-3 text-sm">
                          <div className="flex items-center justify-between gap-3"><span className="font-medium text-foreground">{signal.label}</span><span className="text-xs font-semibold text-amber-700 dark:text-amber-300">+{signal.weight} points</span></div>
                          <p className="mt-1 text-xs text-muted-foreground">{signal.details}</p>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="mt-4 rounded-lg bg-background/70 p-3 text-sm text-muted-foreground">Aucun comportement atypique détecté par les signaux actuellement disponibles.</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" disabled={integrityReviewMutation.isPending} onClick={() => integrityReviewMutation.mutate({ userId: selectedUserId, status: "review_required" })}><AlertTriangle className="mr-1.5 h-3.5 w-3.5" />Ajouter à la revue</Button>
                    <Button size="sm" variant="outline" disabled={integrityReviewMutation.isPending} onClick={() => integrityReviewMutation.mutate({ userId: selectedUserId, status: "confirmed" })}><Shield className="mr-1.5 h-3.5 w-3.5" />Conserver le tag de suivi</Button>
                    <Button size="sm" variant="ghost" disabled={integrityReviewMutation.isPending} onClick={() => integrityReviewMutation.mutate({ userId: selectedUserId, status: "dismissed" })}>Écarter après revue</Button>
                  </div>
                </>
              )}
            </section>

            <div className="mb-6">
              <AchievementGallery achievements={achievements} adminView emptyText="Cet apprenant n’a pas encore obtenu de badge ou de diplôme." />
            </div>
            <section className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground"><BookMarked className="h-5 w-5 text-primary" /> Orientation et objectifs</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Objectifs déclarés, diagnostic initial et ordre de formation recommandé.</p>
                </div>
                <span className={`self-start rounded-full px-2.5 py-1 text-xs font-semibold ${orientation?.profile?.status === "completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>{orientation?.profile?.status === "completed" ? "Diagnostic terminé" : orientation?.profile?.status === "goals_set" ? "Diagnostic à terminer" : "Non commencé"}</span>
              </div>
              {learnerOrientationQuery.isLoading ? <div className="mt-4 h-20 animate-pulse rounded-xl bg-muted" /> : orientation?.profile?.goals?.length ? (
                <div className="mt-4 space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">{orientation.profile.goals.map((goal: any) => {
                    const competency = orientation.competencies?.find((item: any) => item.id === goal.competencyId);
                    const competencyTitle = competency?.title as any;
                    const currentPoints = Number(competency?.level || 0);
                    const targetPoints = Number(competency?.targetPoints || 0);
                    const remainingPoints = Math.max(0, targetPoints - currentPoints);
                    const progress = targetPoints ? Math.min(100, Math.round((currentPoints / targetPoints) * 100)) : 0;
                    return <div key={goal.competencyId} className="rounded-xl border border-border bg-muted/30 p-3"><div className="flex items-start justify-between gap-3"><span className="text-sm font-semibold text-foreground">{competencyTitle?.fr || competencyTitle?.en || goal.competencyId}</span><span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{progress}%</span></div><div className="mt-2 flex items-baseline justify-between text-xs"><span className="text-muted-foreground">Actuel <strong className="text-foreground">{currentPoints.toLocaleString("fr-FR")} pts</strong></span><span className="text-muted-foreground">Cible <strong className="text-foreground">{targetPoints.toLocaleString("fr-FR")} pts</strong></span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-xs text-muted-foreground">{remainingPoints > 0 ? `Écart restant : ${remainingPoints.toLocaleString("fr-FR")} pts` : "Objectif atteint"}</p></div>;
                  })}</div>
                  {orientation.recommendations?.length ? <ol className="space-y-2">{orientation.recommendations.map((recommendation: any) => {
                    const cert = (trainingIndex.certifications as any[]).find((item) => item.id === recommendation.certificationId);
                    const certificationTargetDates = orientation.profile.certificationTargetDates as Record<string, string> | undefined;
                    const targetDate = certificationTargetDates?.[recommendation.certificationId];
                    return <li key={`${recommendation.order}-${recommendation.certificationId}`} className="flex gap-3 rounded-lg border border-border/70 bg-muted/30 p-3 text-sm"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{recommendation.order}</span><span><strong className="text-foreground">{cert?.title?.fr || cert?.title?.en || recommendation.certificationId}</strong><span className="mt-0.5 block text-xs text-muted-foreground">{recommendation.reason}</span>{targetDate && <span className="mt-1 block text-xs font-semibold text-primary">Échéance cible : {new Date(`${targetDate}T12:00:00`).toLocaleDateString("fr-FR")}</span>}</span></li>;
                  })}</ol> : <p className="text-sm text-muted-foreground">Le diagnostic doit être complété pour générer les recommandations.</p>}
                </div>
              ) : <p className="mt-4 text-sm text-muted-foreground">L’apprenant n’a pas encore renseigné ses objectifs. Il peut démarrer l’orientation depuis son espace formation.</p>}
            </section>
            <div className="mb-6">
              <CompetencyProfile competencies={competencies} adminView />
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Engagement et premières tentatives</h3>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Premières tentatives d’exercices</p>
                  {firstAttempts.length === 0 ? <p className="text-sm text-muted-foreground">Aucune tentative enregistrée pour le moment.</p> : <div className="space-y-2">{firstAttempts.slice(0, 6).map((event: any) => <div key={event.id} className="flex justify-between text-sm border-b border-border pb-2"><span className="truncate pr-3">{event.exerciseId || "Exercice"}</span><span className={event.success === 1 ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>{event.success === 1 ? "Réussi" : "À revoir"}{event.score != null ? ` · ${event.score}` : ""}</span></div>)}</div>}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Activité récente</p>
                  {learningEvents.length === 0 ? <p className="text-sm text-muted-foreground">Le temps et les événements seront enregistrés à partir des nouvelles sessions.</p> : <div className="space-y-2">{learningEvents.slice(0, 6).map((event: any) => <div key={event.id} className="flex justify-between text-sm border-b border-border pb-2"><span>{String(event.eventType).replaceAll("_", " ")}</span><span className="text-muted-foreground">{new Date(event.createdAt).toLocaleDateString()}</span></div>)}</div>}
                </div>
              </div>
            </div>

            {/* Progress by certification */}
            <div className="bg-card rounded-2xl border border-border p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Progression par certification
              </h3>
              {Object.keys(progressByCert).length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Aucune progression enregistrée.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(progressByCert).map(([certId, items]) => {
                    const cert = trainingIndex.certifications.find((c) => c.id === certId);
                    const certCourses = trainingIndex.courses.filter((c) => c.certId === certId);
                    const totalLessons = certCourses.reduce((acc, c) => acc + (c.lessonCount || 1), 0);
                    const uniqueCourses = new Set(items.map((i) => i.courseId));
                    const progressPct = totalLessons > 0 ? Math.round((items.length / totalLessons) * 100) : 0;
                    return (
                      <div key={certId} className="border border-border rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-foreground">
                            {cert?.title?.fr || cert?.title?.en || certId}
                          </span>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                            {items.length} leçons / {totalLessons}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{uniqueCourses.size}/{certCourses.length} cours entamés</span>
                          <span>{progressPct}% complété</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Exam attempts */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" /> Tentatives d'examen
              </h3>
              {detail.attempts.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Aucune tentative d'examen.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certification</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Résultat</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.attempts.map((attempt: any, idx: number) => {
                      const cert = trainingIndex.certifications.find((c) => c.id === attempt.certificationId);
                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-sm">
                            {cert?.title?.fr || cert?.title?.en || attempt.certificationId}
                          </TableCell>
                          <TableCell>
                            <span className={`font-bold ${attempt.passed ? "text-emerald-600" : "text-red-500"}`}>
                              {attempt.score}/1000
                            </span>
                          </TableCell>
                          <TableCell>
                            {attempt.passed ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium">Réussi</span>
                            ) : (
                              <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium">Échoué</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {attempt.finishedAt ? new Date(attempt.finishedAt).toLocaleDateString("fr-FR") : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar activePage="training" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          {/* Title + Actions */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{activeSection.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{activeSection.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {activeTab === "learners" && <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportCSV}>
                <Download className="w-4 h-4" /> Export CSV
              </Button>}
              {activeTab === "learners" && <Button variant="outline" size="sm" className="gap-1.5" onClick={() => orientationReminderMutation.mutate()} disabled={orientationReminderMutation.isPending}>
                <Send className="w-4 h-4" /> {orientationReminderMutation.isPending ? "Préparation…" : "Préparer rappel orientation"}
              </Button>}
              {activeTab === "invitations" && <Dialog open={inviteOpen} onOpenChange={(open) => open ? setInviteOpen(true) : resetInviteDialog()}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <UserPlus className="w-4 h-4" /> Inviter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Inviter un ou plusieurs apprenants</DialogTitle>
                    <DialogDescription>
                      Saisissez les adresses séparées par un point-virgule ou un retour à la ligne.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Adresses e-mail *</label>
                      <textarea
                        className="w-full min-h-[112px] resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder={"apprenant1@entreprise.com; apprenant2@entreprise.com\nou\napprenant3@entreprise.com"}
                        value={inviteEmails}
                        onChange={(e) => { setInviteEmails(e.target.value); setInviteResults(null); }}
                      />
                      <p className="mt-1.5 text-xs text-muted-foreground">{parsedInviteEmails.emails.length} adresse{parsedInviteEmails.emails.length > 1 ? "s" : ""} valide{parsedInviteEmails.emails.length > 1 ? "s" : ""} · maximum 100 par envoi.</p>
                      {parsedInviteEmails.duplicates.length > 0 && <p className="mt-1 text-xs text-amber-700">{parsedInviteEmails.duplicates.length} doublon{parsedInviteEmails.duplicates.length > 1 ? "s" : ""} sera{parsedInviteEmails.duplicates.length > 1 ? "ont" : ""} ignoré{parsedInviteEmails.duplicates.length > 1 ? "s" : ""}.</p>}
                      {parsedInviteEmails.invalid.length > 0 && <p className="mt-1 text-xs text-destructive">Adresse{parsedInviteEmails.invalid.length > 1 ? "s" : ""} invalide{parsedInviteEmails.invalid.length > 1 ? "s" : ""} : {parsedInviteEmails.invalid.join(" · ")}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Nom (optionnel, uniquement pour une adresse)</label>
                      <Input
                        placeholder="Jean Dupont"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        disabled={parsedInviteEmails.emails.length > 1}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Langue de l'email</label>
                        <select
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={inviteLang}
                          onChange={(e) => setInviteLang(e.target.value as "fr" | "en")}
                        >
                          <option value="fr">Français</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Message personnalisé (optionnel)</label>
                      <textarea
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-y"
                        placeholder="Un message personnel pour accompagner l'invitation..."
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                      />
                    </div>
                    {inviteResults && <div className="rounded-md border bg-muted/30 p-3 text-sm"><p className="font-medium">Résultat de l’envoi</p><ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs">{inviteResults.map((result) => <li key={result.email} className={result.success ? "text-emerald-700" : "text-destructive"}>{result.success ? "✓" : "✕"} {result.email}{result.error ? ` — ${result.error}` : ""}</li>)}</ul></div>}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={resetInviteDialog}>{inviteResults ? "Fermer" : "Annuler"}</Button>
                    <Button
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={parsedInviteEmails.emails.length === 0 || parsedInviteEmails.invalid.length > 0 || parsedInviteEmails.emails.length > 100 || bulkInviteMutation.isPending}
                      onClick={() => bulkInviteMutation.mutate({ invitations: parsedInviteEmails.emails.map((email) => ({ email, name: parsedInviteEmails.emails.length === 1 ? inviteName || undefined : undefined })), language: inviteLang, message: inviteMessage || undefined })}
                    >
                      {bulkInviteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      <span className="ml-1.5">Envoyer {parsedInviteEmails.emails.length || "les"} invitation{parsedInviteEmails.emails.length > 1 ? "s" : ""}</span>
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>}

            </div>
          </div>

          {/* Stats */}
          {stats && activeTab === "learners" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard icon={<Users className="w-5 h-5" />} value={stats.totalUsers} label="Apprenants" />
              <StatCard icon={<BookOpen className="w-5 h-5" />} value={stats.totalLessonsCompleted} label="Leçons terminées" />
              <StatCard icon={<GraduationCap className="w-5 h-5" />} value={stats.totalExamAttempts} label="Examens passés" />
              <StatCard icon={<Award className="w-5 h-5" />} value={stats.totalExamsPassed} label="Examens réussis" />
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(tab) => navigateTraining(tab)} className="w-full">
            <TabsList className="hidden">
              <TabsTrigger value="learners" className="gap-1.5">
                <Users className="w-4 h-4" /> Apprenants
              </TabsTrigger>
              <TabsTrigger value="invitations" className="gap-1.5">
                <Mail className="w-4 h-4" /> Invitations
              </TabsTrigger>
              <TabsTrigger value="selected" className="gap-1.5">
                <UserCog className="w-4 h-4" /> Candidats sélectionnés
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-1.5">
                <BarChart3 className="w-4 h-4" /> Reporting
              </TabsTrigger>
            </TabsList>

            {/* TAB: Learners */}
            <TabsContent value="learners">
              {/* Search */}
              <div className="flex items-center gap-3 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom ou email..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Rechercher
                </Button>
                {search && (
                  <Button variant="outline" size="sm" onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}>
                    Effacer
                  </Button>
                )}
              </div>

              {/* Table */}
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {learnersQuery.isLoading ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-3" />
                    <p className="text-sm text-muted-foreground">Chargement...</p>
                  </div>
                ) : !learners || learners.users.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Aucun apprenant trouvé.</p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {([ ["name", "Apprenant"], ["email", "Email"], ["globalScore", "Score global"], ["blocked", "Statut"], ["role", "Rôle"] ] as const).map(([column, label]) => <TableHead key={column}><button type="button" className="inline-flex items-center gap-1 font-medium hover:text-foreground" onClick={() => toggleLearnerSort(column)}>{label}{learnerSortBy === column ? <span>{learnerSortDirection === "asc" ? "↑" : "↓"}</span> : <span className="text-muted-foreground/60">↕</span>}</button></TableHead>)}
                          <TableHead>Revue</TableHead>
                          <TableHead><button type="button" className="inline-flex items-center gap-1 font-medium hover:text-foreground" onClick={() => toggleLearnerSort("lastSignedIn")}>Dernière connexion{learnerSortBy === "lastSignedIn" ? <span>{learnerSortDirection === "asc" ? "↑" : "↓"}</span> : <span className="text-muted-foreground/60">↕</span>}</button></TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {learners.users.map((learner: any) => (
                          <TableRow
                            key={learner.id}
                            className="cursor-pointer hover:bg-secondary/50 transition-colors"
                            onClick={() => navigateTraining("learners", learner.id)}
                          >
                            <TableCell className="font-medium">{learner.name || "Sans nom"}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{learner.email || "—"}</TableCell>
                            <TableCell className="font-semibold tabular-nums text-primary">{learner.globalScore.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} pts</TableCell>
                            <TableCell>
                              {learner.blocked ? (
                                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium flex items-center gap-1 w-fit">
                                  <Ban className="w-3 h-3" /> Bloqué
                                </span>
                              ) : (
                                <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium flex items-center gap-1 w-fit">
                                  <CheckCircle2 className="w-3 h-3" /> Actif
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {(() => {
                                const integrity = integrityByUserId.get(learner.id);
                                if (!integrity) return <span className="text-xs text-muted-foreground">Aucun signal</span>;
                                const label = integrity.review?.status === "dismissed" ? "Écarté" : integrity.review ? "À vérifier" : "Signal détecté";
                                const tone = integrity.assessment.riskScore >= 60 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
                                return <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 w-fit ${tone}`}><AlertTriangle className="w-3 h-3" />{label} · {integrity.assessment.riskScore}</span>;
                              })()}
                            </TableCell>
                            <TableCell>
                              {learner.role === "admin" ? (
                                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">Admin</span>
                              ) : (
                                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground font-medium">User</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {learner.lastSignedIn ? new Date(learner.lastSignedIn).toLocaleDateString("fr-FR") : "—"}
                            </TableCell>
                            <TableCell>
                              {learner.viaCandidature ? (
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium flex items-center gap-1 w-fit">
                                  <FileText className="w-3 h-3" /> Candidature
                                </span>
                              ) : (
                                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground font-medium flex items-center gap-1 w-fit">
                                  <Mail className="w-3 h-3" /> Invitation
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => navigateTraining("learners", learner.id)}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <MoreVertical className="w-3.5 h-3.5" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => blockMutation.mutate({ userId: learner.id, blocked: !learner.blocked })}
                                      className="gap-2"
                                    >
                                      {learner.blocked ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                                      {learner.blocked ? "Débloquer" : "Bloquer"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => roleMutation.mutate({ userId: learner.id, role: learner.role === "admin" ? "user" : "admin" })}
                                      className="gap-2"
                                    >
                                      <ShieldCheck className="w-4 h-4" />
                                      {learner.role === "admin" ? "Rétrograder" : "Promouvoir admin"}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                        <span className="text-sm text-muted-foreground">
                          Page {page} sur {totalPages} ({learners.total} résultats)
                        </span>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="gap-1">
                            <ChevronLeft className="w-4 h-4" /> Précédent
                          </Button>
                          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="gap-1">
                            Suivant <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>

            {/* TAB: Invitations directes */}
            <TabsContent value="invitations">
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-300">
                Cet onglet affiche uniquement les <strong>invitations directes</strong> (envoyées sans passer par une candidature). Les invitations liées à une candidature sont visibles dans l'onglet <strong>Candidats sélectionnés</strong>.
              </div>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={directInvitationTable.search} onChange={(event) => updateDirectInvitationTable({ search: event.target.value, page: 1 })} placeholder="Rechercher un e-mail ou un nom…" className="pl-9" />
                </div>
                <p className="text-xs text-muted-foreground">Recherche, tri et pagination sont appliqués côté serveur.</p>
              </div>
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {directInvitationsQuery.isLoading ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-3" />
                    <p className="text-sm text-muted-foreground">Chargement des invitations...</p>
                  </div>
                ) : !directInvitationsQuery.data || directInvitationsQuery.data.invitations.length === 0 ? (
                  <div className="p-12 text-center">
                    <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">Aucune invitation directe envoyée.</p>
                    <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setInviteOpen(true)}>
                      <UserPlus className="w-4 h-4" /> Envoyer une invitation
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {([ ["email", "Email"], ["name", "Nom"], ["status", "Statut"], ["expiresAt", "Expire le"], ["createdAt", "Envoyée le"] ] as const).map(([column, label]) => <TableHead key={column}><button type="button" className="inline-flex items-center gap-1 font-medium hover:text-foreground" onClick={() => toggleDirectInvitationSort(column)}>{label}{directInvitationTable.sortBy === column ? <span aria-label={directInvitationTable.sortDirection === "asc" ? "Tri croissant" : "Tri décroissant"}>{directInvitationTable.sortDirection === "asc" ? "↑" : "↓"}</span> : <span className="text-muted-foreground/60">↕</span>}</button></TableHead>)}
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {directInvitationsQuery.data.invitations.map((inv: any) => {
                        const isExpired = new Date(inv.expiresAt) < new Date();
                        const isCancellable = inv.status === "pending" && !isExpired;
                        const statusLabel = inv.status === "accepted" ? "Acceptée" : inv.status === "expired" ? "Annulée" : isExpired ? "Expirée" : "En attente";
                        const statusClass = inv.status === "accepted"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : inv.status === "expired" || isExpired
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
                        return (
                          <TableRow key={inv.id}>
                            <TableCell className="font-medium text-sm">{inv.email}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{inv.name || "—"}</TableCell>
                            <TableCell>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusClass}`}>
                                {statusLabel}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(inv.expiresAt).toLocaleDateString("fr-FR")}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(inv.createdAt).toLocaleDateString("fr-FR")}
                            </TableCell>
                            <TableCell className="text-right">
                              {isCancellable && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                                  disabled={cancelInvitationMutation.isPending}
                                  onClick={() => {
                                    if (confirm(`Annuler l'invitation envoyée à ${inv.email} ?`)) {
                                      cancelInvitationMutation.mutate({ invitationId: inv.id });
                                    }
                                  }}
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Annuler
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
                {directInvitationsQuery.data && directInvitationsQuery.data.total > 0 && (() => {
                  const totalPages = Math.max(1, Math.ceil(directInvitationsQuery.data.total / directInvitationsQuery.data.pageSize));
                  return <div className="flex flex-col gap-3 border-t border-border px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between"><span className="text-muted-foreground">{directInvitationsQuery.data.total} invitation{directInvitationsQuery.data.total > 1 ? "s" : ""} · page {directInvitationTable.page}/{totalPages}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={directInvitationTable.page <= 1 || directInvitationsQuery.isFetching} onClick={() => updateDirectInvitationTable({ page: directInvitationTable.page - 1 })}><ChevronLeft className="mr-1 h-4 w-4" /> Précédent</Button><Button variant="outline" size="sm" disabled={directInvitationTable.page >= totalPages || directInvitationsQuery.isFetching} onClick={() => updateDirectInvitationTable({ page: directInvitationTable.page + 1 })}>Suivant <ChevronRight className="ml-1 h-4 w-4" /></Button></div></div>;
                })()}
              </div>
            </TabsContent>

                        {/* TAB: Selected Candidates */}
            <TabsContent value="selected">
              <SelectedCandidatesPanel
                data={selectedCandidatesQuery.data}
                emailStats={emailStatsQuery.data}
                isLoading={selectedCandidatesQuery.isLoading}
                table={selectedCandidateTable}
                onTableChange={updateSelectedCandidateTable}
                editEmailId={editEmailId}
                editEmailValue={editEmailValue}
                setEditEmailId={setEditEmailId}
                setEditEmailValue={setEditEmailValue}
                onUpdateEmail={(applicationId: number, newEmail: string) => {
                  updateEmailMutation.mutate({ applicationId, newEmail });
                }}
                onResendInvitation={(applicationId: number, email: string, name?: string) => {
                  resendCandidateInvitationMutation.mutate({ applicationId, email, name });
                }}
                isUpdatingEmail={updateEmailMutation.isPending}
                isResending={resendCandidateInvitationMutation.isPending}
              />
            </TabsContent>

            {/* TAB: Analytics */}
            <TabsContent value="analytics">
              <LearningReportPanel
                data={learningReportsQuery.data}
                isLoading={learningReportsQuery.isLoading}
                periodDays={reportingDays}
                certificationId={reportingCertificationId}
                onPeriodChange={setReportingDays}
                onCertificationChange={setReportingCertificationId}
              />
              <div className="mt-8 border-t border-border pt-8">
                <h2 className="text-base font-semibold text-foreground mb-4">Indicateurs administratifs complémentaires</h2>
                <AnalyticsPanel data={analyticsQuery.data} isLoading={analyticsQuery.isLoading} />
              </div>
              <CompetencyLeaderboard />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Learning Reporting Panel ─── */
function LearningReportPanel({
  data,
  isLoading,
  periodDays,
  certificationId,
  onPeriodChange,
  onCertificationChange,
}: {
  data: any;
  isLoading: boolean;
  periodDays: 7 | 30 | 90;
  certificationId: string;
  onPeriodChange: (days: 7 | 30 | 90) => void;
  onCertificationChange: (certificationId: string) => void;
}) {
  const courseTitle = (courseId: string) => {
    for (const certification of trainingIndex.certifications) {
      const course: any = (certification.courses as any[])?.find((item: any) => item.id === courseId);
      if (course) return course.title?.fr || course.title?.en || courseId;
    }
    return courseId;
  };
  const maxDailyMinutes = Math.max(...(data?.daily || []).map((day: any) => day.activeMinutes), 1);
  const maxDailyLearners = Math.max(...(data?.daily || []).map((day: any) => day.activeLearners), 1);
  const maxBucket = Math.max(...(data?.engagementBuckets || []).map((bucket: any) => bucket.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">Reporting d’apprentissage</span>
          </div>
          <h2 className="mt-2 text-xl font-bold text-foreground">Performance, implication et évolution</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Les indicateurs sont calculés à partir du temps actif, des validations de leçon et des premières tentatives enregistrés sur la plateforme.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-end">
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            Période
            <select className="h-9 min-w-[130px] rounded-md border border-input bg-background px-3 text-sm text-foreground" value={periodDays} onChange={(event) => onPeriodChange(Number(event.target.value) as 7 | 30 | 90)}>
              <option value={7}>7 derniers jours</option>
              <option value={30}>30 derniers jours</option>
              <option value={90}>90 derniers jours</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            Certification
            <select className="h-9 min-w-[185px] rounded-md border border-input bg-background px-3 text-sm text-foreground" value={certificationId} onChange={(event) => onCertificationChange(event.target.value)}>
              <option value="all">Toutes les certifications</option>
              {trainingIndex.certifications.map((certification: any) => <option key={certification.id} value={certification.id}>{certification.title?.fr || certification.title?.en || certification.id}</option>)}
            </select>
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Calcul des indicateurs réels…</p>
        </div>
      ) : !data ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-amber-500" />
          <p className="text-sm text-muted-foreground">Le reporting est momentanément indisponible.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
            <ReportKpi icon={<Users className="h-5 w-5" />} label="Apprenants inscrits" value={data.overview.enrolledLearners} hint="Comptes apprenants actifs" />
            <ReportKpi icon={<Activity className="h-5 w-5" />} label="Apprenants impliqués" value={data.overview.engagedLearners} hint={`Avec activité sur ${data.periodDays} jours`} accent="text-emerald-600" />
            <ReportKpi icon={<Clock className="h-5 w-5" />} label="Temps moyen" value={`${data.overview.avgActiveMinutes} min`} hint={`${data.overview.activeMinutes} min cumulées`} accent="text-sky-600" />
            <ReportKpi icon={<TrendingUp className="h-5 w-5" />} label="Réussite initiale" value={data.overview.firstAttemptRate === null ? "—" : `${data.overview.firstAttemptRate}%`} hint="Premier essai uniquement" accent="text-violet-600" />
            <ReportKpi icon={<BookOpen className="h-5 w-5" />} label="Leçons validées" value={data.overview.completedLessons} hint={`Sur ${data.periodDays} derniers jours`} accent="text-amber-600" />
          </div>

          {!data.hasLearningData ? (
            <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-10 text-center">
              <Activity className="mx-auto mb-3 h-9 w-9 text-primary" />
              <h3 className="font-semibold text-foreground">Les données s’accumuleront au fil des sessions</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">Dès que les apprenants consulteront des leçons, valideront des exercices ou termineront des cours, les graphiques de performance, de sérieux et d’évolution s’alimenteront automatiquement.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground"><TrendingUp className="h-5 w-5 text-primary" /> Évolution de l’activité</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Minutes actives et apprenants impliqués, par jour.</p>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-primary" /> Minutes</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Apprenants</span></div>
                  </div>
                  <div className="flex h-52 items-end gap-1.5 border-b border-border pb-1">
                    {data.daily.map((day: any) => (
                      <div key={day.date} className="group relative flex h-full min-w-0 flex-1 items-end justify-center gap-px">
                        <div className="w-1/2 rounded-t-sm bg-primary/75 transition-colors group-hover:bg-primary" style={{ height: `${Math.max((day.activeMinutes / maxDailyMinutes) * 100, day.activeMinutes ? 2 : 0)}%` }} />
                        <div className="w-1/2 rounded-t-sm bg-emerald-500/75 transition-colors group-hover:bg-emerald-500" style={{ height: `${Math.max((day.activeLearners / maxDailyLearners) * 100, day.activeLearners ? 2 : 0)}%` }} />
                        <div className="pointer-events-none absolute bottom-full z-10 mb-2 hidden min-w-max rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background shadow-lg group-hover:block">{new Date(`${day.date}T12:00:00`).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} · {day.activeMinutes} min · {day.activeLearners} actif{day.activeLearners > 1 ? "s" : ""}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{data.daily[0]?.date ? new Date(`${data.daily[0].date}T12:00:00`).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : ""}</span><span>{data.daily.at(-1)?.date ? new Date(`${data.daily.at(-1).date}T12:00:00`).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : ""}</span></div>
                </section>

                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground"><Activity className="h-5 w-5 text-primary" /> Répartition de l’implication</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Temps actif cumulé durant la période choisie.</p>
                  <div className="mt-6 space-y-5">
                    {data.engagementBuckets.map((bucket: any, index: number) => (
                      <div key={bucket.label}>
                        <div className="mb-2 flex items-center justify-between text-sm"><span className="font-medium text-foreground">{bucket.label}</span><span className="text-muted-foreground">{bucket.count} apprenant{bucket.count > 1 ? "s" : ""}</span></div>
                        <div className="h-3 overflow-hidden rounded-full bg-secondary"><div className={["h-full rounded-full", ["bg-slate-400", "bg-sky-500", "bg-emerald-500", "bg-amber-400"][index]].join(" ")} style={{ width: `${(bucket.count / maxBucket) * 100}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <div className="border-b border-border p-6"><h3 className="flex items-center gap-2 text-lg font-semibold text-foreground"><BookMarked className="h-5 w-5 text-primary" /> Performance par cours</h3><p className="mt-1 text-sm text-muted-foreground">Activité, complétion et réussite au premier essai.</p></div>
                  {data.coursePerformance.length === 0 ? <p className="p-6 text-sm italic text-muted-foreground">Aucune activité attribuable à un cours sur cette période.</p> : <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Cours</TableHead><TableHead className="text-right">Temps</TableHead><TableHead className="text-right">Apprenants</TableHead><TableHead className="text-right">Leçons</TableHead><TableHead className="text-right">1er essai</TableHead></TableRow></TableHeader><TableBody>{data.coursePerformance.map((course: any) => <TableRow key={course.courseId}><TableCell className="max-w-[260px] font-medium"><span className="line-clamp-2">{courseTitle(course.courseId)}</span></TableCell><TableCell className="text-right text-sm">{course.activeMinutes} min</TableCell><TableCell className="text-right text-sm">{course.learners}</TableCell><TableCell className="text-right text-sm">{course.completedLessons}</TableCell><TableCell className="text-right text-sm font-semibold">{course.firstAttemptRate === null ? "—" : `${course.firstAttemptRate}%`}</TableCell></TableRow>)}</TableBody></Table></div>}
                </section>
                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground"><Award className="h-5 w-5 text-primary" /> Apprenants les plus impliqués</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Classement selon le temps actif, puis les leçons validées.</p>
                  <div className="mt-5 divide-y divide-border">{data.topLearners.length === 0 ? <p className="py-5 text-sm italic text-muted-foreground">Aucun signal d’apprentissage enregistré.</p> : data.topLearners.map((learner: any, index: number) => <div key={learner.userId} className="flex items-center gap-3 py-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{learner.name}</p><p className="text-xs text-muted-foreground">{learner.activeDays} jour{learner.activeDays > 1 ? "s" : ""} actif{learner.activeDays > 1 ? "s" : ""} · {learner.completedLessons} leçon{learner.completedLessons > 1 ? "s" : ""}</p></div><div className="text-right"><p className="text-sm font-bold text-foreground">{learner.activeMinutes} min</p><p className="text-xs text-muted-foreground">{learner.firstAttemptRate === null ? "Pas de quiz" : `${learner.firstAttemptRate}% au 1er essai`}</p></div></div>)}</div>
                </section>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ReportKpi({ icon, label, value, hint, accent = "text-primary" }: { icon: React.ReactNode; label: string; value: string | number; hint: string; accent?: string }) {
  return <div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><div className={`mb-3 flex items-center gap-2 ${accent}`}><span>{icon}</span><span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span></div><div className="text-2xl font-bold text-foreground">{value}</div><p className="mt-1 text-xs text-muted-foreground">{hint}</p></div>;
}

/* ─── Analytics Panel ─── */
function AnalyticsPanel({ data, isLoading }: { data: any; isLoading: boolean }) {
  const analytics = useMemo(() => {
    if (!data) return null;

    // Group registrations by day (last 30 days)
    const dailyRegistrations: Record<string, number> = {};
    const dailyActivity: Record<string, number> = {};
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dailyRegistrations[key] = 0;
      dailyActivity[key] = 0;
    }

    for (const u of data.recentUsers) {
      const day = new Date(u.createdAt).toISOString().slice(0, 10);
      if (dailyRegistrations[day] !== undefined) dailyRegistrations[day]++;
    }

    for (const p of data.recentProgress) {
      const day = new Date(p.completedAt).toISOString().slice(0, 10);
      if (dailyActivity[day] !== undefined) dailyActivity[day]++;
    }

    // Certification breakdown
    const certBreakdown: Record<string, number> = {};
    for (const p of data.recentProgress) {
      const certId = p.certificationId;
      certBreakdown[certId] = (certBreakdown[certId] || 0) + 1;
    }

    // Exam stats
    const examsPassed = data.recentExams.filter((e: any) => e.passed).length;
    const examsFailed = data.recentExams.filter((e: any) => !e.passed).length;
    const avgScore = data.recentExams.length > 0
      ? Math.round(data.recentExams.reduce((acc: number, e: any) => acc + e.score, 0) / data.recentExams.length)
      : 0;

    return {
      dailyRegistrations,
      dailyActivity,
      certBreakdown,
      examsPassed,
      examsFailed,
      avgScore,
      activeUsersLast7Days: data.activeUsersLast7Days,
      blockedUsers: data.blockedUsers,
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Chargement des analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-12 text-center">
        <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Données non disponibles.</p>
      </div>
    );
  }

  const regDays = Object.entries(analytics.dailyRegistrations);
  const actDays = Object.entries(analytics.dailyActivity);
  const maxReg = Math.max(...regDays.map(([, v]) => v), 1);
  const maxAct = Math.max(...actDays.map(([, v]) => v), 1);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <Activity className="w-5 h-5" />
            <span className="text-xs uppercase tracking-wider font-medium">Actifs (7j)</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{analytics.activeUsersLast7Days}</div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <Ban className="w-5 h-5" />
            <span className="text-xs uppercase tracking-wider font-medium">Bloqués</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{analytics.blockedUsers}</div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs uppercase tracking-wider font-medium">Score moyen</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{analytics.avgScore}/1000</div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <Award className="w-5 h-5" />
            <span className="text-xs uppercase tracking-wider font-medium">Taux réussite</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {analytics.examsPassed + analytics.examsFailed > 0
              ? Math.round((analytics.examsPassed / (analytics.examsPassed + analytics.examsFailed)) * 100)
              : 0}%
          </div>
        </div>
      </div>

      {/* Registrations chart */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" /> Inscriptions (30 derniers jours)
        </h3>
        <div className="flex items-end gap-1 h-32">
          {regDays.map(([day, count]) => (
            <div key={day} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              <div
                className="w-full bg-primary/80 rounded-t transition-all duration-200 hover:bg-primary min-h-[2px]"
                style={{ height: `${Math.max((count / maxReg) * 100, 2)}%` }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {day.slice(5)}: {count}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{regDays[0]?.[0]?.slice(5)}</span>
          <span>{regDays[regDays.length - 1]?.[0]?.slice(5)}</span>
        </div>
      </div>

      {/* Activity chart */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Activité d'apprentissage (30 derniers jours)
        </h3>
        <div className="flex items-end gap-1 h-32">
          {actDays.map(([day, count]) => (
            <div key={day} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              <div
                className="w-full bg-emerald-500/80 rounded-t transition-all duration-200 hover:bg-emerald-500 min-h-[2px]"
                style={{ height: `${Math.max((count / maxAct) * 100, 2)}%` }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {day.slice(5)}: {count} leçons
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{actDays[0]?.[0]?.slice(5)}</span>
          <span>{actDays[actDays.length - 1]?.[0]?.slice(5)}</span>
        </div>
      </div>

      {/* Certification breakdown */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" /> Répartition par certification (30j)
        </h3>
        {Object.keys(analytics.certBreakdown).length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Aucune activité récente.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(analytics.certBreakdown)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([certId, count]) => {
                const cert = trainingIndex.certifications.find((c) => c.id === certId);
                const maxCount = Math.max(...Object.values(analytics.certBreakdown) as number[]);
                return (
                  <div key={certId} className="flex items-center gap-3">
                    <span className="text-sm text-foreground font-medium w-64 truncate">
                      {cert?.title?.fr || cert?.title?.en || certId}
                    </span>
                    <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${((count as number) / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-foreground w-12 text-right">{count as number}</span>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Exam results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" /> Résultats d'examens (30j)
          </h3>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">{analytics.examsPassed}</div>
              <div className="text-xs text-muted-foreground mt-1">Réussis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">{analytics.examsFailed}</div>
              <div className="text-xs text-muted-foreground mt-1">Échoués</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{analytics.examsPassed + analytics.examsFailed}</div>
              <div className="text-xs text-muted-foreground mt-1">Total</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Dernières activités
          </h3>
          <p className="text-sm text-muted-foreground">
            {data?.recentUsers?.length || 0} nouvelles inscriptions et{" "}
            {data?.recentProgress?.length || 0} leçons complétées au cours des 30 derniers jours.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

// Header replaced by AdminNavbar

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2 text-muted-foreground">
        {icon}
        <span className="text-xs uppercase tracking-wider font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}

/* ─── Selected Candidates Panel ─── */
interface SelectedCandidatesPanelProps {
  data: { candidates: any[]; total: number; page: number; pageSize: number } | undefined;
  emailStats: any | undefined;
  isLoading: boolean;
  table: { page: number; search: string; sortBy: "updatedAt" | "email" | "firstName" | "scoreTotal"; sortDirection: "asc" | "desc" };
  onTableChange: (next: Partial<{ page: number; search: string; sortBy: "updatedAt" | "email" | "firstName" | "scoreTotal"; sortDirection: "asc" | "desc" }>) => void;
  editEmailId: number | null;
  editEmailValue: string;
  setEditEmailId: (id: number | null) => void;
  setEditEmailValue: (val: string) => void;
  onUpdateEmail: (applicationId: number, newEmail: string) => void;
  onResendInvitation: (applicationId: number, email: string, name?: string) => void;
  isUpdatingEmail: boolean;
  isResending: boolean;
}

function SelectedCandidatesPanel({
  data,
  emailStats,
  isLoading,
  table,
  onTableChange,
  editEmailId,
  editEmailValue,
  setEditEmailId,
  setEditEmailValue,
  onUpdateEmail,
  onResendInvitation,
  isUpdatingEmail,
  isResending,
}: SelectedCandidatesPanelProps) {
  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Chargement des candidats sélectionnés...</p>
      </div>
    );
  }

  const candidates = Array.isArray(data?.candidates) ? data.candidates : [];

  if (!data || candidates.length === 0) {
    return (
      <div className="p-12 text-center">
        <UserCog className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Aucun candidat sélectionné pour le moment.</p>
      </div>
    );
  }

  // Compute stats
  const totalSelected = data.total;
  const accountsCreated = candidates.filter((c: any) => c.accountStatus === "active").length;
  const invitationsSent = candidates.filter((c: any) => c.latestInvitation).length;
  const bounced = candidates.filter((c: any) => c.latestInvitation?.emailDeliveryStatus === "bounced").length;
  const pending = candidates.filter((c: any) => c.accountStatus === "no_account" && !c.latestInvitation).length;
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const toggleSort = (sortBy: typeof table.sortBy) => onTableChange({ page: 1, sortBy, sortDirection: table.sortBy === sortBy && table.sortDirection === "desc" ? "asc" : "desc" });

  return (
    <div className="space-y-6">
      {/* Email delivery stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-medium">Sélectionnés</span>
          </div>
          <div className="text-xl font-bold text-foreground">{totalSelected}</div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-medium">Comptes actifs</span>
          </div>
          <div className="text-xl font-bold text-emerald-600">{accountsCreated}</div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1 text-amber-600">
            <Mail className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-medium">Invitations envoyées</span>
          </div>
          <div className="text-xl font-bold text-amber-600">{invitationsSent}</div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-medium">Email invalide</span>
          </div>
          <div className="text-xl font-bold text-red-600">{bounced}</div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-medium">En attente</span>
          </div>
          <div className="text-xl font-bold text-foreground">{pending}</div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={table.search} onChange={(event) => onTableChange({ search: event.target.value, page: 1 })} placeholder="Rechercher un candidat ou un e-mail…" className="pl-9" /></div>
        <p className="text-xs text-muted-foreground">Indicateurs hors total calculés sur la page affichée.</p>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {([ ["firstName", "Candidat"], ["email", "Email"], ["scoreTotal", "Score"] ] as const).map(([column, label]) => <TableHead key={column}><button type="button" className="inline-flex items-center gap-1 font-medium hover:text-foreground" onClick={() => toggleSort(column)}>{label}{table.sortBy === column ? <span>{table.sortDirection === "asc" ? "↑" : "↓"}</span> : <span className="text-muted-foreground/60">↕</span>}</button></TableHead>)}
              <TableHead>Statut compte</TableHead>
              <TableHead>Statut email</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate: any) => {
              const accountStatusBadge = candidate.accountStatus === "active"
                ? { label: "Compte créé", class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" }
                : candidate.latestInvitation?.status === "accepted"
                  ? { label: "Acceptée", class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" }
                  : candidate.latestInvitation
                    ? { label: "Invitation envoyée", class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" }
                    : { label: "En attente", class: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400" };

              const emailStatusBadge = !candidate.latestInvitation
                ? { label: "—", class: "" }
                : candidate.latestInvitation.emailDeliveryStatus === "delivered"
                  ? { label: "Délivré", class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" }
                  : candidate.latestInvitation.emailDeliveryStatus === "bounced"
                    ? { label: "Rebondi", class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" }
                    : candidate.latestInvitation.emailDeliveryStatus === "complained"
                      ? { label: "Spam", class: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" }
                      : candidate.latestInvitation.emailDeliveryStatus === "suppressed"
                        ? { label: "Supprimé", class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" }
                        : { label: "Envoyé", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };

              const isEditing = editEmailId === candidate.id;

              return (
                <TableRow key={candidate.id}>
                  <TableCell className="font-medium text-sm">
                    {candidate.firstName} {candidate.lastName}
                  </TableCell>
                  <TableCell className="text-sm">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="email"
                          value={editEmailValue}
                          onChange={(e) => setEditEmailValue(e.target.value)}
                          className="h-8 text-sm w-56"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          disabled={isUpdatingEmail || !editEmailValue}
                          onClick={() => onUpdateEmail(candidate.id, editEmailValue)}
                        >
                          {isUpdatingEmail ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2"
                          onClick={() => { setEditEmailId(null); setEditEmailValue(""); }}
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={candidate.latestInvitation?.emailDeliveryStatus === "bounced" ? "text-red-600 line-through" : "text-foreground"}>
                          {candidate.email}
                        </span>
                        <button
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => { setEditEmailId(candidate.id); setEditEmailValue(candidate.email); }}
                          title="Modifier l'email"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {Number(candidate.scoreTotal).toFixed(0)}%
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${accountStatusBadge.class}`}>
                      {accountStatusBadge.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    {emailStatusBadge.label === "—" ? (
                      <span className="text-sm text-muted-foreground">—</span>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${emailStatusBadge.class}`}>
                        {emailStatusBadge.label}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {candidate.accountStatus !== "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs gap-1"
                          disabled={isResending}
                          onClick={() => onResendInvitation(candidate.id, candidate.email, `${candidate.firstName} ${candidate.lastName}`)}
                          title="Envoyer/Renvoyer l'invitation"
                        >
                          {isResending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                          Inviter
                        </Button>
                      )}
                      {candidate.accountStatus === "active" && (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Actif
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="flex flex-col gap-3 border-t border-border px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between"><span className="text-muted-foreground">{data.total} candidat{data.total > 1 ? "s" : ""} · page {table.page}/{totalPages}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={table.page <= 1} onClick={() => onTableChange({ page: table.page - 1 })}><ChevronLeft className="mr-1 h-4 w-4" /> Précédent</Button><Button variant="outline" size="sm" disabled={table.page >= totalPages} onClick={() => onTableChange({ page: table.page + 1 })}>Suivant <ChevronRight className="ml-1 h-4 w-4" /></Button></div></div>
      </div>
    </div>
  );
}
