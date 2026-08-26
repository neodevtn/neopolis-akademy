import React from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { ArrowLeft, Download, Users, CheckCircle, XCircle, Clock, TrendingUp, Loader2, ExternalLink, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, FileText, Camera, Linkedin, Github, Globe, Twitter, Video, Mail, Send, Tag, MessageSquare, StickyNote, Eye, Zap, AlertTriangle, BarChart3, Plus, X, Trash2, Activity, Columns3, Bell, BellRing, UserX, FileCheck, CalendarClock, Save, Filter, Gift, Search } from "lucide-react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { AdminNavbar } from "@/components/AdminNavbar";
import { buildNavigationUrl } from "@shared/navigationUrls";
import { WysiwygMarkdownEditor } from "@/components/admin/WysiwygMarkdownEditor";
import { normalizeEditableMarkdown } from "@/components/admin/wysiwygMarkdown";
import { Checkbox } from "@/components/ui/checkbox";
import { COMMUNICATION_AUDIENCE_LABELS, COMMUNICATION_CRITERIA_LOGIC_LABELS, COURSE_PROGRESS_STATUS_LABELS, type CommunicationAudience, type CommunicationCriteriaLogic, type CourseProgressStatus } from "@shared/communicationRecipients";
import { toPreviewMediaUrl } from "@/lib/mediaUrl";

const LOGO_URL = "/api/assets/neopolis-akademy-official-logo_40a16b6c.svg";

type TabType = "candidatures" | "kanban" | "communications" | "invitations" | "analytics" | "activity" | "referrals";

// Notification type icons
const NOTIF_ICONS: Record<string, { icon: any; color: string }> = {
  new_application: { icon: FileCheck, color: "#22c55e" },
  inactive_learner: { icon: UserX, color: "#f59e0b" },
  quiz_failure: { icon: AlertTriangle, color: "#ef4444" },
  system: { icon: BellRing, color: "#3b82f6" },
};

export default function AdminDashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const urlSearch = useSearch();
  const getTabFromUrl = (): TabType => {
    const tab = new URLSearchParams(urlSearch).get("tab");
    return ["candidatures", "kanban", "communications", "invitations", "analytics", "activity", "referrals"].includes(tab || "") ? tab as TabType : "candidatures";
  };
  const [activeTab, setActiveTab] = useState<TabType>(getTabFromUrl);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [decisionDialog, setDecisionDialog] = useState<{ open: boolean; appId: number | null; status: "selectionne" | "refuse" | null; app: any }>({ open: false, appId: null, status: null, app: null });
  const [decisionNotes, setDecisionNotes] = useState("");
  const [decisionLang, setDecisionLang] = useState<"fr" | "en">("fr");
  const [sendEmail, setSendEmail] = useState(true);
  const [bulkDialog, setBulkDialog] = useState<{ open: boolean; status: "selectionne" | "refuse" | null }>({ open: false, status: null });
  const [noteDialog, setNoteDialog] = useState<{ open: boolean; targetType: "user" | "application"; targetId: number; targetName: string }>({ open: false, targetType: "application", targetId: 0, targetName: "" });
  const [newNote, setNewNote] = useState("");
  const [noteCategory, setNoteCategory] = useState<string>("general");
  const [cvViewerUrl, setCvViewerUrl] = useState<string | null>(null);
  const [detailApp, setDetailApp] = useState<any | null>(null);
  const [commDialog, setCommDialog] = useState(false);
  const [editingCommunicationId, setEditingCommunicationId] = useState<number | null>(null);
  const [commSubject, setCommSubject] = useState("");
  const [commBody, setCommBody] = useState("");
  const [commType, setCommType] = useState<string>("announcement");
  const [commIsImportant, setCommIsImportant] = useState(false);
  const [commAudience, setCommAudience] = useState<CommunicationAudience>("all");
  const [commCompetencyId, setCommCompetencyId] = useState("");
  const [commMinCompetencyLevel, setCommMinCompetencyLevel] = useState("10");
  const [commUseCompetencyFilter, setCommUseCompetencyFilter] = useState(false);
  const [commCourseId, setCommCourseId] = useState("any");
  const [commCourseProgressStatus, setCommCourseProgressStatus] = useState<CourseProgressStatus>("started");
  const [commActivityWithinDays, setCommActivityWithinDays] = useState("");
  const [commManualEmails, setCommManualEmails] = useState<string[]>([]);
  const [commRecipientSearch, setCommRecipientSearch] = useState("");
  const [commCriteriaLogic, setCommCriteriaLogic] = useState<CommunicationCriteriaLogic>("all");
  const [commSegmentName, setCommSegmentName] = useState("");
  const [commScheduleDialog, setCommScheduleDialog] = useState<{ open: boolean; communication: any | null }>({ open: false, communication: null });
  const [commScheduledAt, setCommScheduledAt] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [activityPage, setActivityPage] = useState(1);
  const [activityAdminId, setActivityAdminId] = useState("all");
  const [activityAction, setActivityAction] = useState("all");
  const [activityFrom, setActivityFrom] = useState("");
  const [activityTo, setActivityTo] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [referralNotes, setReferralNotes] = useState<Record<number, string>>({});

  // Invitation mass sending state
  const [invitDialog, setInvitDialog] = useState(false);
  const [invitEmails, setInvitEmails] = useState("");
  const [invitMessage, setInvitMessage] = useState("");
  const [invitLang, setInvitLang] = useState<"fr" | "en">("fr");
  const [invitationPage, setInvitationPage] = useState(1);
  const [invitationSearch, setInvitationSearch] = useState("");
  const [invitationSortBy, setInvitationSortBy] = useState<"createdAt" | "email" | "name" | "status" | "expiresAt">("createdAt");
  const [invitationSortDirection, setInvitationSortDirection] = useState<"asc" | "desc">("desc");

  const navigateAdmin = (tab: TabType, applicationId?: number | null) => {
    const params = new URLSearchParams({ tab });
    if (applicationId) params.set("application", String(applicationId));
    navigate(buildNavigationUrl("/admin", { tab, application: applicationId }));
  };

  useEffect(() => {
    setActiveTab(getTabFromUrl());
  }, [urlSearch]);

  const canAccessLogs = user?.role === "admin" || user?.role === "manager";
  useEffect(() => {
    if (user?.role === "manager" && activeTab !== "activity") {
      setActiveTab("activity");
      navigate(buildNavigationUrl("/admin", { tab: "activity" }));
    }
  }, [activeTab, navigate, user?.role]);

  // Close notification panel on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  const statsQuery = trpc.applications.stats.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const applicationsQuery = trpc.applications.list.useQuery(
    statusFilter === "all" ? {} : { status: statusFilter },
    { enabled: isAuthenticated && user?.role === "admin" }
  );
  const requestedApplicationId = useMemo(() => {
    const value = Number(new URLSearchParams(urlSearch).get("application"));
    return Number.isInteger(value) && value > 0 ? value : null;
  }, [urlSearch]);
  const directApplicationQuery = trpc.applications.getById.useQuery(
    { id: requestedApplicationId || 0 },
    { enabled: isAuthenticated && user?.role === "admin" && requestedApplicationId !== null, retry: false },
  );
  useEffect(() => {
    if (requestedApplicationId === null) {
      setDetailApp(null);
      return;
    }
    const application = directApplicationQuery.data || applicationsQuery.data?.find((item: any) => Number(item.id) === requestedApplicationId);
    if (application) setDetailApp(application);
  }, [applicationsQuery.data, directApplicationQuery.data, requestedApplicationId]);
  const updateStatusMutation = trpc.applications.updateStatus.useMutation({
    onSuccess: () => {
      applicationsQuery.refetch();
      statsQuery.refetch();
    },
  });

  const exportPDFMutation = trpc.applications.exportPDF.useMutation({
    onSuccess: (data) => {
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PDF exporté avec succès");
    },
    onError: () => toast.error("Erreur lors de l'export PDF"),
  });

  const sendReminderMutation = trpc.applications.sendReminder.useMutation({
    onSuccess: (data) => {
      toast.success(`Email de relance envoyé (candidature en attente depuis ${data.daysPending} jours)`);
    },
    onError: (err) => toast.error(err.message || "Erreur lors de l'envoi de la relance"),
  });

  // Admin Tools queries
  const notesQuery = trpc.adminTools.notes.list.useQuery(
    { targetType: noteDialog.targetType, targetId: noteDialog.targetId },
    { enabled: noteDialog.open && noteDialog.targetId > 0 }
  );
  const createNoteMutation = trpc.adminTools.notes.create.useMutation({
    onSuccess: () => { notesQuery.refetch(); setNewNote(""); toast.success("Note ajoutée"); },
    onError: () => toast.error("Erreur lors de l'ajout de la note"),
  });
  const deleteNoteMutation = trpc.adminTools.notes.delete.useMutation({
    onSuccess: () => { notesQuery.refetch(); toast.success("Note supprimée"); },
  });

  const tagsQuery = trpc.adminTools.tags.list.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });

  const bulkUpdateMutation = trpc.adminTools.bulk.updateStatus.useMutation({
    onSuccess: (data) => {
      applicationsQuery.refetch();
      statsQuery.refetch();
      setSelectedIds([]);
      setBulkDialog({ open: false, status: null });
      toast.success(`${data.updated} candidature(s) mises à jour avec activation automatique des comptes`);
    },
    onError: () => toast.error("Erreur lors de la mise à jour en masse"),
  });

  const communicationsQuery = trpc.adminTools.communications.list.useQuery(undefined, { enabled: activeTab === "communications" });
  const communicationSegmentsQuery = trpc.adminTools.communications.segments.list.useQuery(undefined, { enabled: activeTab === "communications" || commDialog });
  const competencyFrameworkQuery = trpc.competencies.getFramework.useQuery(undefined, { enabled: commDialog && isAuthenticated && user?.role === "admin" });
  const communicationSegmentOptionsQuery = trpc.adminTools.communications.getSegmentOptions.useQuery(undefined, { enabled: commDialog && isAuthenticated && user?.role === "admin", staleTime: 60_000 });
  const communicationRecipientFilter = useMemo(() => ({
    audience: commAudience,
    criteriaLogic: commCriteriaLogic,
    ...(commUseCompetencyFilter && commCompetencyId ? { competencyId: commCompetencyId, minCompetencyLevel: Math.min(100, Math.max(0, Number(commMinCompetencyLevel) || 0)) } : {}),
    ...(commCourseId !== "any" ? { courseId: commCourseId, courseProgressStatus: commCourseProgressStatus, ...(Number(commActivityWithinDays) > 0 ? { activityWithinDays: Math.min(365, Math.max(1, Number(commActivityWithinDays))) } : {}) } : {}),
    ...(commManualEmails.length ? { manualEmails: commManualEmails } : {}),
  }), [commAudience, commCriteriaLogic, commUseCompetencyFilter, commCompetencyId, commMinCompetencyLevel, commCourseId, commCourseProgressStatus, commActivityWithinDays, commManualEmails]);
  const recipientPreviewQuery = trpc.adminTools.communications.getRecipientCount.useQuery(
    { recipientFilter: communicationRecipientFilter },
    { enabled: commDialog && (!commUseCompetencyFilter || Boolean(commCompetencyId)), staleTime: 5_000 },
  );
  const createCommMutation = trpc.adminTools.communications.create.useMutation({
    onSuccess: () => { communicationsQuery.refetch(); resetCommunicationEditor(); toast.success("Brouillon créé"); },
  });
  const resetCommunicationEditor = () => { setCommDialog(false); setEditingCommunicationId(null); setCommSubject(""); setCommBody(""); setCommType("announcement"); setCommIsImportant(false); setCommAudience("all"); setCommCriteriaLogic("all"); setCommCompetencyId(""); setCommMinCompetencyLevel("10"); setCommUseCompetencyFilter(false); setCommCourseId("any"); setCommCourseProgressStatus("started"); setCommActivityWithinDays(""); setCommManualEmails([]); setCommRecipientSearch(""); };
  const openCommunicationEditor = (communication?: any) => {
    const filter = communication?.recipientFilter || {};
    const normalizedAudience = filter.audience === "manual" || Object.prototype.hasOwnProperty.call(COMMUNICATION_AUDIENCE_LABELS, filter.audience)
      ? filter.audience
      : filter.manualEmails?.length ? "manual" : "all";
    setEditingCommunicationId(communication?.id || null);
    setCommSubject(communication?.subject || "");
    setCommBody(normalizeEditableMarkdown(communication?.body || ""));
    setCommType(communication?.type || "announcement");
    setCommIsImportant(communication?.isImportant === 1);
    setCommAudience(normalizedAudience as CommunicationAudience);
    setCommCriteriaLogic(filter.criteriaLogic === "any" ? "any" : "all");
    setCommUseCompetencyFilter(Boolean(filter.competencyId));
    setCommCompetencyId(filter.competencyId || "");
    setCommMinCompetencyLevel(String(filter.minCompetencyLevel ?? 10));
    setCommCourseId(filter.courseId || "any");
    setCommCourseProgressStatus(filter.courseProgressStatus || "started");
    setCommActivityWithinDays(filter.activityWithinDays ? String(filter.activityWithinDays) : "");
    setCommManualEmails(filter.manualEmails || []);
    setCommRecipientSearch("");
    setCommDialog(true);
  };
  const updateCommMutation = trpc.adminTools.communications.updateDraft.useMutation({
    onSuccess: () => { communicationsQuery.refetch(); resetCommunicationEditor(); toast.success("Brouillon mis à jour"); },
    onError: (error) => toast.error(error.message || "Impossible de modifier ce brouillon"),
  });
  const sendCommMutation = trpc.adminTools.communications.send.useMutation({
    onSuccess: (data) => { communicationsQuery.refetch(); toast.success(`Communication envoyée à ${data.sentCount} destinataire(s)`); },
    onError: () => toast.error("Erreur lors de l'envoi"),
  });
  const createCommunicationSegmentMutation = trpc.adminTools.communications.segments.create.useMutation({
    onSuccess: () => { communicationSegmentsQuery.refetch(); setCommSegmentName(""); toast.success("Segment enregistré"); },
    onError: (error) => toast.error(error.message || "Impossible d’enregistrer le segment"),
  });
  const deleteCommunicationSegmentMutation = trpc.adminTools.communications.segments.delete.useMutation({
    onSuccess: () => { communicationSegmentsQuery.refetch(); toast.success("Segment supprimé"); },
  });
  const scheduleCommMutation = trpc.adminTools.communications.schedule.useMutation({
    onSuccess: (data) => { communicationsQuery.refetch(); setCommScheduleDialog({ open: false, communication: null }); setCommScheduledAt(""); toast.success(`Communication programmée pour ${new Date(data.scheduledAt).toLocaleString("fr-FR")}`); },
    onError: (error) => toast.error(error.message || "Impossible de programmer la communication"),
  });
  const cancelScheduledCommMutation = trpc.adminTools.communications.cancelSchedule.useMutation({
    onSuccess: () => { communicationsQuery.refetch(); toast.success("Communication programmée annulée"); },
    onError: (error) => toast.error(error.message || "Impossible d’annuler la programmation"),
  });
  const selectableCommunicationRecipients = useMemo(() => {
    const query = commRecipientSearch.trim().toLocaleLowerCase("fr");
    return (communicationSegmentOptionsQuery.data?.recipients || []).filter((recipient: any) => !query || recipient.email.toLocaleLowerCase("fr").includes(query) || recipient.name?.toLocaleLowerCase("fr").includes(query));
  }, [communicationSegmentOptionsQuery.data?.recipients, commRecipientSearch]);
  const activeCommunicationCriteria = useMemo(() => {
    const labels = [COMMUNICATION_AUDIENCE_LABELS[commAudience]];
    if (commCourseId !== "any") {
      const course = communicationSegmentOptionsQuery.data?.courses.find((item: any) => item.id === commCourseId);
      labels.push(`${COURSE_PROGRESS_STATUS_LABELS[commCourseProgressStatus]} : ${course?.title || commCourseId}${Number(commActivityWithinDays) > 0 ? ` · ${commActivityWithinDays} derniers jours` : ""}`);
    }
    if (commUseCompetencyFilter && commCompetencyId) {
      const competency = (competencyFrameworkQuery.data?.definitions || []).find((item: any) => item.id === commCompetencyId);
      const titleValue = competency?.title as { fr?: string; en?: string } | string | null | undefined;
      const title = typeof titleValue === "object" && titleValue ? titleValue.fr || titleValue.en : titleValue || commCompetencyId;
      labels.push(`${title} ≥ ${Math.min(100, Math.max(0, Number(commMinCompetencyLevel) || 0))}`);
    }
    if (commManualEmails.length) labels.push(`Sélection manuelle : ${commManualEmails.length}`);
    return labels;
  }, [commAudience, commCourseId, commCourseProgressStatus, commActivityWithinDays, commUseCompetencyFilter, commCompetencyId, commMinCompetencyLevel, commManualEmails.length, communicationSegmentOptionsQuery.data?.courses, competencyFrameworkQuery.data?.definitions]);

  const analyticsQuery = trpc.adminTools.analytics.getLearnerAnalytics.useQuery(undefined, { enabled: activeTab === "analytics" });
  const referralOverviewQuery = trpc.referral.getAdminOverview.useQuery(undefined, { enabled: activeTab === "referrals" && isAuthenticated && user?.role === "admin" });
  const updateReferralCampaignMutation = trpc.referral.updateCampaign.useMutation({
    onSuccess: () => { referralOverviewQuery.refetch(); toast.success("Programme de parrainage mis à jour"); },
    onError: (error) => toast.error(error.message || "Impossible de mettre à jour le programme"),
  });
  const updateReferralConversionMutation = trpc.referral.updateConversionStatus.useMutation({
    onSuccess: () => { referralOverviewQuery.refetch(); toast.success("Statut de conversion mis à jour"); },
    onError: (error) => toast.error(error.message || "Impossible de mettre à jour la conversion"),
  });
  const activityLogInput = useMemo(() => ({
    page: activityPage,
    pageSize: 25,
    ...(activityAdminId !== "all" ? { adminId: Number(activityAdminId) } : {}),
    ...(activityAction !== "all" ? { action: activityAction } : {}),
    ...(activityFrom ? { from: new Date(`${activityFrom}T00:00:00`) } : {}),
    ...(activityTo ? { to: new Date(`${activityTo}T23:59:59`) } : {}),
  }), [activityAction, activityAdminId, activityFrom, activityPage, activityTo]);
  const activityLogQuery = trpc.adminTools.activityLog.list.useQuery(activityLogInput, { enabled: activeTab === "activity" && canAccessLogs });
  const activityActorsQuery = trpc.adminTools.activityLog.actors.useQuery(undefined, { enabled: activeTab === "activity" && canAccessLogs });
  const availableActivityActions = useMemo(() => Array.from(new Set((activityLogQuery.data?.items || []).map((item: any) => item.action))).sort(), [activityLogQuery.data?.items]);

  // Invitations
  const invitationInput = useMemo(() => ({
    page: invitationPage,
    pageSize: 25,
    search: invitationSearch.trim() || undefined,
    sortBy: invitationSortBy,
    sortDirection: invitationSortDirection,
  }), [invitationPage, invitationSearch, invitationSortBy, invitationSortDirection]);
  const invitationsQuery = trpc.admin.getDirectInvitations.useQuery(invitationInput, { enabled: activeTab === "invitations" });
  const bulkInviteMutation = trpc.admin.bulkCreateInvitations.useMutation({
    onSuccess: (data) => {
      invitationsQuery.refetch();
      setInvitDialog(false);
      setInvitEmails("");
      setInvitMessage("");
      toast.success(`${data.sent} invitation(s) envoyée(s) sur ${data.total}`);
      if (data.failed > 0) toast.error(`${data.failed} invitation(s) échouée(s)`);
    },
    onError: () => toast.error("Erreur lors de l'envoi des invitations"),
  });
  const resendInviteMutation = trpc.admin.resendInvitation.useMutation({
    onSuccess: () => { invitationsQuery.refetch(); toast.success("Invitation renvoyée"); },
    onError: () => toast.error("Erreur lors du renvoi"),
  });

  // Notifications
  const notifCountQuery = trpc.adminTools.notifications.unreadCount.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin", refetchInterval: 30000 });
  const notifListQuery = trpc.adminTools.notifications.list.useQuery(undefined, { enabled: notifOpen });
  const markReadMutation = trpc.adminTools.notifications.markRead.useMutation({
    onSuccess: () => { notifCountQuery.refetch(); notifListQuery.refetch(); },
  });
  const markAllReadMutation = trpc.adminTools.notifications.markAllRead.useMutation({
    onSuccess: () => { notifCountQuery.refetch(); notifListQuery.refetch(); toast.success("Toutes les notifications marquées comme lues"); },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--wise-canvas-soft)" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--wise-positive)" }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--wise-canvas-soft)" }}>
        <div className="text-center wise-card p-8">
          <h1 className="wise-display-md mb-4">Accès restreint</h1>
          <p className="wise-body-md mb-6">Vous devez être connecté en tant qu'administrateur.</p>
          <a href={getLoginUrl()}>
            <button className="wise-btn-primary">Se connecter</button>
          </a>
        </div>
      </div>
    );
  }

  if (!canAccessLogs) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--wise-canvas-soft)" }}>
        <div className="text-center wise-card p-8">
          <h1 className="wise-display-md mb-4">Accès refusé</h1>
          <p className="wise-body-md mb-6">Cette page est réservée aux Super Admins et Managers.</p>
          <Link href="/">
            <button className="wise-btn-tertiary">Retour à l'accueil</button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = statsQuery.data;
  const applications = applicationsQuery.data || [];

  const handleExport = () => {
    if (!applications.length) return;
    const headers = [
      "ID", "Prénom", "Nom", "Email", "Téléphone", "Pays", "Ville", "Secteur", "Poste", "Expérience",
      "Score Total", "Score Technique", "Score Métier", "Score Communication",
      "Statut", "Date"
    ];
    const rows = applications.map((a: any) => [
      a.id, a.firstName, a.lastName, a.email, a.phone, a.country, a.city, a.sector, a.currentRole, a.yearsExperience,
      a.scoreTotal, a.scoreTechnique, a.scoreMetier, a.scoreCommunication,
      a.status, new Date(a.createdAt).toLocaleDateString("fr-FR")
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candidatures_neopolis_akademy_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "selectionne": return <span className="wise-badge-positive">Sélectionné</span>;
      case "refuse": return <span className="wise-badge-negative">Refusé</span>;
      default: return <span className="wise-badge-warning">En attente</span>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "var(--wise-positive)";
    if (score >= 50) return "#b8860b";
    return "var(--wise-negative)";
  };

  const labelMap: Record<string, string> = {
    none: "Aucun", few: "Quelques", moderate: "Modéré", extensive: "Étendu", very_extensive: "Très étendu",
    basic: "Basique", good: "Bon", excellent: "Excellent", expert: "Expert",
    very_low: "Très faible", low: "Faible", high: "Élevé", very_high: "Très élevé",
    needs_guidance: "Besoin d'encadrement", somewhat_autonomous: "Assez autonome", autonomous: "Autonome", very_autonomous: "Très autonome", fully_independent: "Totalement indépendant",
    follower: "Suiveur", collaborative: "Collaboratif", situational: "Situationnel", visionary: "Visionnaire", transformational: "Transformationnel",
  };

  const getLabel = (value: string | null | undefined) => {
    if (!value) return "—";
    return labelMap[value] || value;
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === applications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(applications.map((a: any) => a.id));
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--wise-canvas-soft)" }}>
      {/* Shared Admin Navigation */}
      <AdminNavbar
        activePage="candidatures"
        accessRole={user?.role}
        notificationSlot={user?.role === "admin" ? (
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" style={{ color: "var(--wise-mute)" }} />
              {(notifCountQuery.data?.count || 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {notifCountQuery.data!.count > 9 ? "9+" : notifCountQuery.data!.count}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-96 max-h-[480px] bg-card border border-border rounded-xl shadow-xl overflow-hidden z-[100]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {(notifCountQuery.data?.count || 0) > 0 && (
                      <button
                        onClick={() => markAllReadMutation.mutate()}
                        className="text-xs text-primary hover:underline"
                      >
                        Tout marquer comme lu
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-y-auto max-h-[400px]">
                  {notifListQuery.isLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                  ) : !notifListQuery.data?.items?.length ? (
                    <div className="text-center py-10">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">Aucune notification</p>
                    </div>
                  ) : (
                    notifListQuery.data.items.map((notif: any) => {
                      const meta = NOTIF_ICONS[notif.type] || NOTIF_ICONS.system;
                      const IconComp = meta.icon;
                      return (
                        <div
                          key={notif.id}
                          className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-accent/30 transition-colors cursor-pointer ${notif.isRead === 0 ? "bg-primary/5" : ""}`}
                          onClick={() => { if (notif.isRead === 0) markReadMutation.mutate({ id: notif.id }); }}
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${meta.color}15` }}>
                            <IconComp className="w-4 h-4" style={{ color: meta.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${notif.isRead === 0 ? "font-semibold" : "font-normal text-muted-foreground"}`}>{notif.title}</p>
                            {notif.message && <p className="text-xs text-muted-foreground mt-0.5 truncate">{notif.message}</p>}
                            <p className="text-[10px] text-muted-foreground/70 mt-1">
                              {new Date(notif.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          {notif.isRead === 0 && (
                            <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      />

      <div className="container py-10">
        {/* ==================== CANDIDATURES TAB ==================== */}
        {activeTab === "candidatures" && (
          <>
            <h1 className="wise-display-md mb-10">Tableau de bord — Candidatures</h1>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                <StatCard icon={<Users className="w-4 h-4" />} value={stats.total} label="Total" />
                <StatCard icon={<Clock className="w-4 h-4" />} value={stats.enAttente} label="En attente" />
                <StatCard icon={<CheckCircle className="w-4 h-4" />} value={stats.selectionne} label="Sélectionnés" />
                <StatCard icon={<XCircle className="w-4 h-4" />} value={stats.refuse} label="Refusés" />
                <StatCard icon={<TrendingUp className="w-4 h-4" />} value={`${stats.avgScore.toFixed(1)}%`} label="Score moyen" />
              </div>
            )}

            {/* Bulk action bar */}
            {selectedIds.length > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between">
                <span className="text-sm font-medium text-primary">{selectedIds.length} candidature(s) sélectionnée(s)</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs gap-1" onClick={() => setBulkDialog({ open: true, status: "selectionne" })}>
                    <Zap className="w-3 h-3" /> Accepter + Activer comptes
                  </Button>
                  <Button size="sm" variant="destructive" className="text-xs gap-1" onClick={() => setBulkDialog({ open: true, status: "refuse" })}>
                    <XCircle className="w-3 h-3" /> Refuser en masse
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs" onClick={() => setSelectedIds([])}>
                    <X className="w-3 h-3" /> Désélectionner
                  </Button>
                </div>
              </div>
            )}

            {/* Filters & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Filtrer par statut" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="selectionne">Sélectionnés</SelectItem>
                    <SelectItem value="refuse">Refusés</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm" style={{ color: "var(--wise-mute)" }}>{applications.length} candidature(s)</span>
              </div>
              <button onClick={handleExport} disabled={!applications.length} className="wise-btn-secondary flex items-center gap-2 text-sm">
                <Download className="w-4 h-4" /> Exporter CSV
              </button>
            </div>

            {/* Table */}
            <div className="wise-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-4 w-10">
                        <input type="checkbox" checked={selectedIds.length === applications.length && applications.length > 0} onChange={toggleSelectAll} className="rounded border-border" />
                      </th>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Candidat</th>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Pays</th>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Secteur</th>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Scores</th>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</th>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app: any) => (
                      <React.Fragment key={app.id}>
                        <tr className="border-t border-border hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => { setDetailApp(app); navigateAdmin("candidatures", app.id); }}>
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" checked={selectedIds.includes(app.id)} onChange={() => toggleSelect(app.id)} className="rounded border-border" />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {app.photoFileUrl ? (
                                <img src={app.photoFileUrl} alt="" className="w-9 h-9 rounded-full object-cover border border-border" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                                  {app.firstName?.[0]}{app.lastName?.[0]}
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-foreground">{app.firstName} {app.lastName}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{app.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-foreground">{app.country}</td>
                          <td className="p-4 text-xs text-foreground">{app.sector}</td>
                          <td className="p-4">
                            <div className="font-semibold" style={{ color: getScoreColor(Number(app.scoreTotal)) }}>{Number(app.scoreTotal).toFixed(1)}%</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              T:{Number(app.scoreTechnique).toFixed(0)} | M:{Number(app.scoreMetier).toFixed(0)} | C:{Number(app.scoreCommunication).toFixed(0)}
                            </div>
                          </td>
                          <td className="p-4">{getStatusBadge(app.status)}</td>
                          <td className="p-4 text-xs text-muted-foreground">
                            {new Date(app.createdAt).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              {app.status !== "selectionne" && (
                                <Button size="sm" variant="ghost" className="text-green-700 hover:text-green-600 hover:bg-green-50 text-xs"
                                  onClick={(e) => { e.stopPropagation(); setDecisionDialog({ open: true, appId: app.id, status: "selectionne", app }); setDecisionNotes(""); }}>
                                  Sélectionner
                                </Button>
                              )}
                              {app.status !== "refuse" && (
                                <Button size="sm" variant="ghost" className="text-red-700 hover:text-red-600 hover:bg-red-50 text-xs"
                                  onClick={(e) => { e.stopPropagation(); setDecisionDialog({ open: true, appId: app.id, status: "refuse", app }); setDecisionNotes(""); }}>
                                  Refuser
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === app.id ? null : app.id); }}>
                                {expandedId === app.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {expandedId === app.id && (
                          <tr key={`${app.id}-detail`} className="bg-secondary/30">
                            <td colSpan={8} className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <DetailSection title="Informations de base">
                                  <DetailItem label="Téléphone" value={app.phone} />
                                  <DetailItem label="Ville" value={app.city} />
                                  <DetailItem label="Poste actuel" value={app.currentRole} />
                                  <DetailItem label="Années d'expérience" value={`${app.yearsExperience} ans`} />
                                </DetailSection>

                                <DetailSection title="Compétences techniques">
                                  <DetailItem label="Programmation" value={getLabel(app.programmingLevel)} />
                                  <DetailItem label="Connaissances IA" value={getLabel(app.aiKnowledge)} />
                                  <DetailItem label="Cloud" value={getLabel(app.cloudExperience)} />
                                  <DetailItem label="Outils" value={app.technicalTools || "—"} />
                                  <DetailItem label="Certifications" value={app.certifications || "—"} />
                                </DetailSection>

                                <DetailSection title="Communication">
                                  <DetailItem label="Prise de parole" value={getLabel(app.publicSpeaking)} />
                                  <DetailItem label="Exp. commerciale" value={getLabel(app.salesExperience)} />
                                  <DetailItem label="Langues" value={app.languages || "—"} />
                                </DetailSection>

                                <DetailSection title="Réseau de distribution">
                                  <DetailItem label="Contacts industrie" value={getLabel(app.industryContacts)} />
                                  <DetailItem label="Connaissance marché" value={getLabel(app.targetMarketKnowledge)} />
                                  {app.distributionNetwork && (
                                    <div className="mt-2">
                                      <span className="text-xs text-muted-foreground">Réseau :</span>
                                      <p className="text-xs text-foreground mt-1 bg-background p-2 rounded border border-border">{app.distributionNetwork}</p>
                                    </div>
                                  )}
                                </DetailSection>

                                <DetailSection title="Profil entrepreneurial">
                                  <DetailItem label="Tolérance au risque" value={getLabel(app.riskTolerance)} />
                                  <DetailItem label="Autonomie" value={getLabel(app.autonomyLevel)} />
                                  <DetailItem label="Résilience" value={getLabel(app.resilienceLevel)} />
                                  <DetailItem label="Leadership" value={getLabel(app.leadershipStyle)} />
                                </DetailSection>

                                <DetailSection title="Scénario Agent IA">
                                  <DetailItem label="Secteur cible" value={app.aiAgentSector || "—"} />
                                  {app.aiAgentScenario && (
                                    <div className="mt-2">
                                      <p className="text-xs text-foreground bg-background p-2 rounded border border-border max-h-24 overflow-y-auto">{app.aiAgentScenario}</p>
                                    </div>
                                  )}
                                </DetailSection>

                                <div className="md:col-span-2">
                                  <DetailSection title="Motivation">
                                    <p className="text-xs text-foreground bg-background p-3 rounded border border-border max-h-24 overflow-y-auto">{app.motivation}</p>
                                  </DetailSection>
                                </div>

                                {/* Liens & Documents */}
                                <DetailSection title="Liens & Documents">
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {app.linkedinUrl && <a href={app.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"><Linkedin className="w-3 h-3" /> LinkedIn</a>}
                                    {app.twitterUrl && <a href={app.twitterUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"><Twitter className="w-3 h-3" /> Twitter/X</a>}
                                    {app.githubUrl && <a href={app.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"><Github className="w-3 h-3" /> GitHub</a>}
                                    {app.websiteUrl && <a href={app.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"><Globe className="w-3 h-3" /> Site web</a>}
                                  </div>
                                  <div className="flex gap-2 mt-3 flex-wrap">
                                    {app.cvFileUrl && (
                                      <button onClick={() => setCvViewerUrl(app.cvFileUrl)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-lg text-xs text-primary hover:bg-primary/10 transition-colors">
                                        <Eye className="w-3.5 h-3.5" /> Consulter CV
                                      </button>
                                    )}
                                    {app.photoFileUrl && (
                                      <a href={app.photoFileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-lg text-xs text-primary hover:bg-primary/10 transition-colors">
                                        <Camera className="w-3.5 h-3.5" /> Photo
                                      </a>
                                    )}
                                    {(app as any).videoFileUrl && (
                                      <details className="w-full rounded-lg border border-red-200 bg-red-50/40 p-2 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300">
                                        <summary className="flex cursor-pointer items-center gap-1.5 font-medium"><Video className="h-3.5 w-3.5" /> Voir la vidéo de présentation</summary>
                                        <video className="mt-2 max-h-72 w-full rounded-md bg-black" controls preload="metadata" src={toPreviewMediaUrl((app as any).videoFileUrl, "video")}><track kind="captions" /> Votre navigateur ne prend pas en charge la lecture vidéo.</video>
                                        <a href={toPreviewMediaUrl((app as any).videoFileUrl, "video")} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs underline">Ouvrir dans un nouvel onglet</a>
                                      </details>
                                    )}
                                  </div>
                                </DetailSection>
                              </div>
                              {/* Action buttons row */}
                              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border flex-wrap">
                                <Button size="sm" variant="outline" className="text-xs gap-1.5" disabled={exportPDFMutation.isPending} onClick={() => exportPDFMutation.mutate({ applicationId: app.id })}>
                                  {exportPDFMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                                  Exporter PDF
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => setNoteDialog({ open: true, targetType: "application", targetId: app.id, targetName: `${app.firstName} ${app.lastName}` })}>
                                  <StickyNote className="w-3 h-3" /> Notes ({0})
                                </Button>
                                {app.status === "en_attente" && (
                                  <Button size="sm" variant="outline" className="text-xs gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50" disabled={sendReminderMutation.isPending} onClick={() => sendReminderMutation.mutate({ applicationId: app.id, language: "fr" })}>
                                    {sendReminderMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                                    Relancer
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {applications.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-muted-foreground body-md">
                          Aucune candidature pour le moment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ==================== COMMUNICATIONS TAB ==================== */}
        {activeTab === "communications" && (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="wise-display-md">Communications en masse</h1>
              <Button className="gap-2" onClick={() => openCommunicationEditor()}>
                <Plus className="w-4 h-4" /> Nouveau communiqué
              </Button>
            </div>

            <div className="wise-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Sujet</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Type</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Destinataires</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Statut</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Date</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {communicationsQuery.data?.items?.map((comm: any) => (
                    <tr key={comm.id} className="border-t border-border">
                      <td className="p-4 font-medium text-foreground"><div className="flex items-center gap-2">{comm.subject}{comm.isImportant === 1 && <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300">Important</Badge>}</div></td>
                      <td className="p-4"><Badge variant="secondary" className="text-xs">{comm.type}</Badge></td>
                      <td className="p-4 text-muted-foreground">{comm.recipientCount}</td>
                      <td className="p-4">
                        {comm.status === "sent" && <span className="wise-badge-positive">Envoyé</span>}
                        {comm.status === "draft" && <span className="wise-badge-warning">Brouillon</span>}
                        {comm.status === "scheduled" && <span className="wise-badge-positive">Programmé</span>}
                        {comm.status === "sending" && <span className="wise-badge-warning">En cours...</span>}
                        {comm.status === "failed" && <span className="wise-badge-negative">Échoué</span>}
                        {comm.status === "cancelled" && <span className="wise-badge-negative">Annulé</span>}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">{comm.status === "scheduled" && comm.scheduledAt ? `Prévu : ${new Date(comm.scheduledAt).toLocaleString("fr-FR")}` : new Date(comm.createdAt).toLocaleDateString("fr-FR")}</td>
                      <td className="p-4 whitespace-nowrap">
                        {comm.status === "draft" && (
                          <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => openCommunicationEditor(comm)}><FileText className="w-3 h-3" /> Modifier</Button><Button size="sm" variant="outline" className="text-xs gap-1" disabled={sendCommMutation.isPending} onClick={() => { if (window.confirm(`Envoyer maintenant « ${comm.subject} » ?`)) sendCommMutation.mutate({ communicationId: comm.id }); }}><Send className="w-3 h-3" /> Envoyer maintenant</Button><Button size="sm" className="text-xs gap-1" onClick={() => setCommScheduleDialog({ open: true, communication: comm })}><CalendarClock className="w-3 h-3" /> Programmer</Button></div>
                        )}
                        {comm.status === "scheduled" && <Button size="sm" variant="outline" className="text-xs gap-1 text-destructive" disabled={cancelScheduledCommMutation.isPending} onClick={() => { if (window.confirm(`Annuler l’envoi programmé de « ${comm.subject} » ?`)) cancelScheduledCommMutation.mutate({ communicationId: comm.id }); }}><X className="w-3 h-3" /> Annuler</Button>}
                      </td>
                    </tr>
                  ))}
                  {(!communicationsQuery.data?.items || communicationsQuery.data.items.length === 0) && (
                    <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">Aucune communication envoyée.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ==================== INVITATIONS TAB ==================== */}
        {activeTab === "invitations" && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div><h1 className="wise-display-md">Invitations directes</h1><p className="mt-1 text-sm text-muted-foreground">Les invitations liées aux candidatures sont suivies dans les candidatures sélectionnées.</p></div>
              <Button className="gap-2" onClick={() => setInvitDialog(true)}>
                <Plus className="w-4 h-4" /> Envoi en masse
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatCard icon={<Mail className="w-4 h-4" />} value={invitationsQuery.data?.total || 0} label="Total invitations" />
              <StatCard icon={<CheckCircle className="w-4 h-4" />} value={invitationsQuery.data?.statusCounts?.accepted || 0} label="Acceptées" />
              <StatCard icon={<Clock className="w-4 h-4" />} value={invitationsQuery.data?.statusCounts?.pending || 0} label="En attente" />
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={invitationSearch} onChange={(event) => { setInvitationSearch(event.target.value); setInvitationPage(1); }} placeholder="Rechercher un e-mail ou un nom…" className="pl-9" /></div>
              <p className="text-xs text-muted-foreground">Recherche, tri et pagination sont appliqués côté serveur.</p>
            </div>

            {/* Invitations list */}
            <div className="wise-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {([ ["email", "Email"], ["name", "Nom"], ["status", "Statut"], ["createdAt", "Envoyée le"], ["expiresAt", "Expire le"] ] as const).map(([column, label]) => <th key={column} className="text-left p-4 text-xs font-medium text-muted-foreground uppercase"><button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => { const sameColumn = invitationSortBy === column; setInvitationSortBy(column); setInvitationSortDirection(sameColumn && invitationSortDirection === "asc" ? "desc" : "asc"); setInvitationPage(1); }}>{label}{invitationSortBy === column ? (invitationSortDirection === "asc" ? " ↑" : " ↓") : " ↕"}</button></th>)}
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitationsQuery.data?.invitations?.map((inv: any) => (
                    <tr key={inv.id} className="border-t border-border">
                      <td className="p-4 font-medium text-foreground">{inv.email}</td>
                      <td className="p-4 text-muted-foreground">{inv.name || "—"}</td>
                      <td className="p-4">
                        {inv.status === "pending" && <span className="wise-badge-warning">En attente</span>}
                        {inv.status === "accepted" && <span className="wise-badge-positive">Acceptée</span>}
                        {inv.status === "expired" && <span className="wise-badge-negative">Expirée</span>}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString("fr-FR")}</td>
                      <td className="p-4 text-xs text-muted-foreground">{inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString("fr-FR") : "—"}</td>
                      <td className="p-4">
                        {inv.status === "pending" && (
                          <Button size="sm" variant="outline" className="text-xs gap-1" disabled={resendInviteMutation.isPending} onClick={() => resendInviteMutation.mutate({ email: inv.email })}>
                            <Send className="w-3 h-3" /> Renvoyer
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(!invitationsQuery.data?.invitations || invitationsQuery.data.invitations.length === 0) && (
                    <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">Aucune invitation envoyée.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {invitationsQuery.data && invitationsQuery.data.total > 0 && (() => {
              const totalPages = Math.max(1, Math.ceil(invitationsQuery.data.total / invitationsQuery.data.pageSize));
              return <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"><span className="text-muted-foreground">{invitationsQuery.data.total} invitation{invitationsQuery.data.total > 1 ? "s" : ""} · page {invitationPage}/{totalPages}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={invitationPage <= 1 || invitationsQuery.isFetching} onClick={() => setInvitationPage((page) => page - 1)}><ChevronLeft className="mr-1 h-4 w-4" /> Précédent</Button><Button variant="outline" size="sm" disabled={invitationPage >= totalPages || invitationsQuery.isFetching} onClick={() => setInvitationPage((page) => page + 1)}>Suivant <ChevronRight className="ml-1 h-4 w-4" /></Button></div></div>;
            })()}
          </>
        )}

        {/* ==================== ANALYTICS TAB ==================== */}
        {activeTab === "analytics" && (
          <>
            <h1 className="wise-display-md mb-8">Évaluation & Suivi des apprenants</h1>

            {analyticsQuery.isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : analyticsQuery.data ? (
              <div className="space-y-8">
                {/* Summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={<Users className="w-4 h-4" />} value={analyticsQuery.data.totalLearners} label="Apprenants" />
                  <StatCard icon={<CheckCircle className="w-4 h-4" />} value={analyticsQuery.data.activeLast7Days} label="Actifs (7j)" />
                  <StatCard icon={<AlertTriangle className="w-4 h-4" />} value={analyticsQuery.data.inactiveUsers.length} label="Inactifs" />
                  <StatCard icon={<XCircle className="w-4 h-4" />} value={analyticsQuery.data.strugglingUsers.length} label="En difficulté" />
                </div>

                {/* Leaderboard */}
                <div className="wise-card p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--wise-positive)" }}>
                    <BarChart3 className="w-4 h-4 inline mr-2" />Classement — Top apprenants
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 text-xs text-muted-foreground">#</th>
                          <th className="text-left p-3 text-xs text-muted-foreground">Apprenant</th>
                          <th className="text-left p-3 text-xs text-muted-foreground">Leçons</th>
                          <th className="text-left p-3 text-xs text-muted-foreground">Examens</th>
                          <th className="text-left p-3 text-xs text-muted-foreground">Meilleur score</th>
                          <th className="text-left p-3 text-xs text-muted-foreground">Dernière activité</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsQuery.data.leaderboard.map((l: any, i: number) => (
                          <tr key={l.id} className="border-t border-border">
                            <td className="p-3 font-bold text-primary">{i + 1}</td>
                            <td className="p-3">
                              <div className="font-medium text-foreground">{l.name || "—"}</div>
                              <div className="text-xs text-muted-foreground">{l.email}</div>
                            </td>
                            <td className="p-3 font-semibold">{l.lessonsCompleted}</td>
                            <td className="p-3">{l.examStats.passed}/{l.examStats.attempts}</td>
                            <td className="p-3 font-semibold" style={{ color: l.examStats.bestScore >= 720 ? "var(--wise-positive)" : "var(--wise-negative)" }}>{l.examStats.bestScore || "—"}</td>
                            <td className="p-3 text-xs text-muted-foreground">{l.lastSignedIn ? new Date(l.lastSignedIn).toLocaleDateString("fr-FR") : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Inactive users alert */}
                {analyticsQuery.data.inactiveUsers.length > 0 && (
                  <div className="wise-card p-6 border-l-4 border-l-amber-400">
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-amber-700">
                      <AlertTriangle className="w-4 h-4 inline mr-2" />Apprenants inactifs ({analyticsQuery.data.inactiveUsers.length})
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">Ces apprenants ne se sont pas connectés depuis plus de 7 jours.</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {analyticsQuery.data.inactiveUsers.map((u: any) => (
                        <div key={u.id} className="flex items-center justify-between p-2 bg-background rounded border border-border">
                          <div>
                            <span className="text-sm font-medium">{u.name || "—"}</span>
                            <span className="text-xs text-muted-foreground ml-2">{u.email}</span>
                          </div>
                          <span className="text-xs text-amber-600">Dernière connexion: {u.lastSignedIn ? new Date(u.lastSignedIn).toLocaleDateString("fr-FR") : "Jamais"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Struggling users */}
                {analyticsQuery.data.strugglingUsers.length > 0 && (
                  <div className="wise-card p-6 border-l-4 border-l-red-400">
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-red-700">
                      <XCircle className="w-4 h-4 inline mr-2" />Apprenants en difficulté ({analyticsQuery.data.strugglingUsers.length})
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">Ces apprenants ont échoué aux examens sans succès ultérieur.</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {analyticsQuery.data.strugglingUsers.map((u: any) => (
                        <div key={u.id} className="flex items-center justify-between p-2 bg-background rounded border border-border">
                          <div>
                            <span className="text-sm font-medium">{u.name || "—"}</span>
                            <span className="text-xs text-muted-foreground ml-2">{u.email}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-red-600">{u.attempts} tentative(s)</span>
                            <span className="text-xs text-muted-foreground ml-2">Meilleur: {u.bestScore}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-20">Aucune donnée disponible.</p>
            )}
          </>
        )}

        {/* ==================== REFERRAL TAB ==================== */}
        {activeTab === "referrals" && (
          <section>
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Acquisition traçable</p><h1 className="wise-display-md">Parrainage et récompenses</h1><p className="mt-2 max-w-3xl text-sm text-muted-foreground">Les récompenses sont des promesses administrables. Elles ne sont attribuées qu’après validation manuelle de chaque conversion.</p></div>
            </div>
            {referralOverviewQuery.isLoading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : referralOverviewQuery.data ? <>
              <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard icon={<Gift className="w-4 h-4" />} value={referralOverviewQuery.data.conversions.length} label="Candidatures attribuées" />
                <StatCard icon={<Clock className="w-4 h-4" />} value={referralOverviewQuery.data.counts.pending || 0} label="À examiner" />
                <StatCard icon={<CheckCircle className="w-4 h-4" />} value={referralOverviewQuery.data.counts.eligible || 0} label="Éligibles" />
                <StatCard icon={<Gift className="w-4 h-4" />} value={referralOverviewQuery.data.counts.rewarded || 0} label="Récompensées" />
              </div>
              <form className="mb-8 rounded-xl border border-border bg-card p-5" onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                updateReferralCampaignMutation.mutate({ id: referralOverviewQuery.data!.campaign.id, active: form.get("active") ? 1 : 0, tokenRewardLabel: String(form.get("tokenRewardLabel") || ""), giftRewardLabel: String(form.get("giftRewardLabel") || ""), eligibilityText: String(form.get("eligibilityText") || ""), shareMessage: String(form.get("shareMessage") || "") });
              }}>
                <div className="mb-4 flex items-center justify-between gap-4"><div><h2 className="font-semibold">Règles et message de partage</h2><p className="text-xs text-muted-foreground">Éditez les promesses affichées aux apprenants et les conditions de validation.</p></div><label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="active" defaultChecked={referralOverviewQuery.data.campaign.active === 1} /> Programme actif</label></div>
                <div className="grid gap-4 md:grid-cols-2"><div><Label htmlFor="tokenRewardLabel">Promesse de tokens</Label><Input id="tokenRewardLabel" name="tokenRewardLabel" defaultValue={referralOverviewQuery.data.campaign.tokenRewardLabel} /></div><div><Label htmlFor="giftRewardLabel">Promesse de cadeau</Label><Input id="giftRewardLabel" name="giftRewardLabel" defaultValue={referralOverviewQuery.data.campaign.giftRewardLabel} /></div></div>
                <div className="mt-4"><Label htmlFor="eligibilityText">Conditions d’éligibilité</Label><Textarea id="eligibilityText" name="eligibilityText" defaultValue={referralOverviewQuery.data.campaign.eligibilityText || ""} rows={3} /></div>
                <div className="mt-4"><Label htmlFor="shareMessage">Message proposé au partage</Label><Textarea id="shareMessage" name="shareMessage" defaultValue={referralOverviewQuery.data.campaign.shareMessage || ""} rows={3} /></div>
                <div className="mt-4 flex justify-end"><Button type="submit" disabled={updateReferralCampaignMutation.isPending} className="gap-2"><Save className="h-4 w-4" />Enregistrer les règles</Button></div>
              </form>
              <div className="overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full min-w-[900px] text-sm"><thead className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Parrain</th><th className="px-4 py-3">Candidat</th><th className="px-4 py-3">Origine</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Note</th><th className="px-4 py-3">Validation</th></tr></thead><tbody>{referralOverviewQuery.data.conversions.length ? referralOverviewQuery.data.conversions.map((conversion: any) => <tr key={conversion.id} className="border-b border-border/60 last:border-0"><td className="px-4 py-3"><p className="font-medium">{conversion.referrerName || "Apprenant"}</p><p className="text-xs text-muted-foreground">{conversion.referrerEmail || "—"}</p></td><td className="px-4 py-3"><a className="text-primary hover:underline" href={buildNavigationUrl("/admin", { tab: "candidatures", application: conversion.applicationId })}>{conversion.referredEmail}</a></td><td className="px-4 py-3">{conversion.shareTarget || conversion.sourceChannel || "Lien direct"}</td><td className="px-4 py-3 text-muted-foreground">{new Date(conversion.createdAt).toLocaleDateString("fr-FR")}</td><td className="px-4 py-3"><Input aria-label={`Note récompense ${conversion.referredEmail}`} value={referralNotes[conversion.id] ?? conversion.rewardNote ?? ""} onChange={(event) => setReferralNotes((notes) => ({ ...notes, [conversion.id]: event.target.value }))} placeholder="Motif / référence" /></td><td className="px-4 py-3"><Select value={conversion.status} onValueChange={(status) => updateReferralConversionMutation.mutate({ id: conversion.id, status: status as "pending" | "eligible" | "rewarded" | "rejected", rewardNote: referralNotes[conversion.id] ?? conversion.rewardNote ?? "" })}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">À examiner</SelectItem><SelectItem value="eligible">Éligible</SelectItem><SelectItem value="rewarded">Récompensé</SelectItem><SelectItem value="rejected">Non retenu</SelectItem></SelectContent></Select></td></tr>) : <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Aucune candidature attribuée pour le moment. Les liens partagés par les apprenants apparaîtront ici dès la soumission d’une candidature.</td></tr>}</tbody></table></div>
            </> : <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Le programme de parrainage n’a pas pu être chargé.</p>}
          </section>
        )}

        {/* ==================== KANBAN TAB ==================== */}
        {activeTab === "kanban" && (
          <>
            <h1 className="wise-display-md mb-8">Vue Kanban — Candidatures</h1>
            {applicationsQuery.isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(["en_attente", "selectionne", "refuse"] as const).map((status) => {
                  const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
                    en_attente: { label: "En attente", color: "var(--wise-warning)", bg: "rgba(234,179,8,0.08)" },
                    selectionne: { label: "Sélectionnés", color: "var(--wise-positive)", bg: "rgba(34,197,94,0.08)" },
                    refuse: { label: "Refusés", color: "var(--wise-negative)", bg: "rgba(239,68,68,0.08)" },
                  };
                  const { label, color, bg } = statusLabels[status];
                  const items = (applicationsQuery.data || []).filter((a: any) => a.status === status);
                  return (
                    <div key={status} className="rounded-xl border border-border p-4" style={{ backgroundColor: bg }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-sm" style={{ color }}>{label}</h3>
                        <Badge variant="outline" className="text-xs">{items.length}</Badge>
                      </div>
                      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {items.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-8">Aucune candidature</p>
                        ) : items.map((app: any) => (
                          <div key={app.id} className="bg-card rounded-lg border border-border p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setExpandedId(app.id === expandedId ? null : app.id)}>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: color }}>
                                {(app.firstName?.[0] || "").toUpperCase()}{(app.lastName?.[0] || "").toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{app.firstName} {app.lastName}</p>
                                <p className="text-xs text-muted-foreground truncate">{app.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">{app.country}</span>
                              {app.totalScore != null && (
                                <Badge variant="outline" className="text-xs">{(app.totalScore * 100).toFixed(0)}%</Badge>
                              )}
                            </div>
                            {status === "en_attente" && (
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" variant="outline" className="text-xs h-7 flex-1" style={{ color: "var(--wise-positive)" }} onClick={(e) => { e.stopPropagation(); setDecisionDialog({ open: true, appId: app.id, status: "selectionne", app }); }}>
                                  <CheckCircle className="w-3 h-3 mr-1" /> Accepter
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs h-7 flex-1" style={{ color: "var(--wise-negative)" }} onClick={(e) => { e.stopPropagation(); setDecisionDialog({ open: true, appId: app.id, status: "refuse", app }); }}>
                                  <XCircle className="w-3 h-3 mr-1" /> Refuser
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ==================== ACTIVITY TAB ==================== */}
        {activeTab === "activity" && (
          <>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div><h1 className="wise-display-md">Logs administratifs</h1><p className="mt-1 text-sm text-muted-foreground">Historique filtrable des actions administratives, réservé aux Super Admins et Managers.</p></div>
              <Badge variant="outline" className="gap-1"><Activity className="h-3.5 w-3.5" /> {activityLogQuery.data?.total || 0} événement(s)</Badge>
            </div>
            <div className="mb-5 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-1.5"><Label htmlFor="log-admin-filter">Utilisateur</Label><Select value={activityAdminId} onValueChange={(value) => { setActivityAdminId(value); setActivityPage(1); }}><SelectTrigger id="log-admin-filter"><SelectValue placeholder="Tous" /></SelectTrigger><SelectContent><SelectItem value="all">Tous les utilisateurs</SelectItem>{(activityActorsQuery.data || []).map((actor: any) => <SelectItem key={actor.id} value={String(actor.id)}>{actor.name || actor.email || `#${actor.id}`}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1.5"><Label htmlFor="log-action-filter">Action</Label><Select value={activityAction} onValueChange={(value) => { setActivityAction(value); setActivityPage(1); }}><SelectTrigger id="log-action-filter"><SelectValue placeholder="Toutes" /></SelectTrigger><SelectContent><SelectItem value="all">Toutes les actions</SelectItem>{availableActivityActions.map((action) => <SelectItem key={action} value={action}>{action}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1.5"><Label htmlFor="log-from-filter">Du</Label><Input id="log-from-filter" type="date" value={activityFrom} onChange={(event) => { setActivityFrom(event.target.value); setActivityPage(1); }} /></div>
              <div className="space-y-1.5"><Label htmlFor="log-to-filter">Au</Label><Input id="log-to-filter" type="date" value={activityTo} onChange={(event) => { setActivityTo(event.target.value); setActivityPage(1); }} /></div>
              <Button type="button" variant="outline" className="gap-2" onClick={() => { setActivityAdminId("all"); setActivityAction("all"); setActivityFrom(""); setActivityTo(""); setActivityPage(1); }}><Filter className="h-4 w-4" /> Réinitialiser</Button>
            </div>
            {activityLogQuery.isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : activityLogQuery.data?.items?.length ? (
              <div className="space-y-3">
                {activityLogQuery.data.items.map((item: any) => {
                  const actionLabels: Record<string, { label: string; icon: any; color: string }> = {
                    accept_application: { label: "Candidature acceptée", icon: CheckCircle, color: "var(--wise-positive)" },
                    reject_application: { label: "Candidature refusée", icon: XCircle, color: "var(--wise-negative)" },
                    bulk_accept: { label: "Acceptation en masse", icon: Users, color: "var(--wise-positive)" },
                    bulk_reject: { label: "Refus en masse", icon: Users, color: "var(--wise-negative)" },
                    send_communication: { label: "Communication envoyée", icon: Mail, color: "var(--wise-info, #3b82f6)" },
                    activate_account: { label: "Compte activé", icon: Zap, color: "var(--wise-positive)" },
                    add_note: { label: "Note ajoutée", icon: StickyNote, color: "var(--wise-warning)" },
                  };
                  const meta = actionLabels[item.action] || { label: item.action, icon: Activity, color: "var(--wise-mute)" };
                  const IconComp = meta.icon;
                  const details = item.details as any;
                  return (
                    <button type="button" key={item.id} className="flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent/30" onClick={() => setSelectedActivity(item)}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${meta.color}15` }}>
                        <IconComp className="w-4 h-4" style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{meta.label}</p>
                        <p className="text-xs text-muted-foreground">Par {item.actorName || item.actorEmail || `Utilisateur #${item.adminId}`}</p>
                        {details?.candidateName && <p className="text-xs text-muted-foreground">Candidat : {details.candidateName}</p>}
                        {details?.subject && <p className="text-xs text-muted-foreground">Objet : {details.subject}</p>}
                        {details?.count && <p className="text-xs text-muted-foreground">{details.count} élément(s) concerné(s)</p>}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">Aucune activité enregistrée pour le moment.</p>
                <p className="text-xs text-muted-foreground mt-1">Les actions admin (acceptations, refus, communications) apparaîtront ici.</p>
              </div>
            )}
            {(activityLogQuery.data?.total || 0) > 25 && <div className="mt-5 flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Page {activityLogQuery.data?.page} sur {Math.max(1, Math.ceil((activityLogQuery.data?.total || 0) / 25))}</p><div className="flex gap-2"><Button type="button" variant="outline" size="sm" disabled={activityPage <= 1} onClick={() => setActivityPage((page) => page - 1)}>Précédent</Button><Button type="button" variant="outline" size="sm" disabled={activityPage >= Math.ceil((activityLogQuery.data?.total || 0) / 25)} onClick={() => setActivityPage((page) => page + 1)}>Suivant</Button></div></div>}
          </>
        )}
      </div>

      {/* ==================== DIALOGS ==================== */}
      <Dialog open={Boolean(selectedActivity)} onOpenChange={(open) => { if (!open) setSelectedActivity(null); }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Détail de l’événement</DialogTitle></DialogHeader>
          {selectedActivity && <div className="space-y-4 text-sm"><div className="grid gap-3 sm:grid-cols-2"><div><p className="text-xs text-muted-foreground">Action</p><p className="font-medium">{selectedActivity.action}</p></div><div><p className="text-xs text-muted-foreground">Horodatage</p><p className="font-medium">{new Date(selectedActivity.createdAt).toLocaleString("fr-FR")}</p></div><div><p className="text-xs text-muted-foreground">Utilisateur</p><p className="font-medium">{selectedActivity.actorName || selectedActivity.actorEmail || `Utilisateur #${selectedActivity.adminId}`}</p></div><div><p className="text-xs text-muted-foreground">Cible</p><p className="font-medium">{selectedActivity.targetType || "—"}{selectedActivity.targetId ? ` #${selectedActivity.targetId}` : ""}</p></div></div>{(() => { const details = (selectedActivity.details || {}) as Record<string, unknown>; const hasComparison = Object.prototype.hasOwnProperty.call(details, "before") || Object.prototype.hasOwnProperty.call(details, "after"); return hasComparison ? <div className="grid gap-3 sm:grid-cols-2"><div><p className="mb-2 text-xs font-medium text-muted-foreground">Avant la modification</p><pre className="max-h-64 overflow-auto rounded-lg bg-muted p-3 text-xs whitespace-pre-wrap">{JSON.stringify(details.before ?? {}, null, 2)}</pre></div><div><p className="mb-2 text-xs font-medium text-muted-foreground">Après la modification</p><pre className="max-h-64 overflow-auto rounded-lg bg-primary/10 p-3 text-xs whitespace-pre-wrap">{JSON.stringify(details.after ?? {}, null, 2)}</pre></div></div> : <div><p className="mb-2 text-xs text-muted-foreground">Données historiques disponibles</p><p className="mb-2 text-xs text-muted-foreground">Cet événement est antérieur à l’enrichissement avant/après ; les données enregistrées à l’époque restent consultables ci-dessous.</p><pre className="max-h-72 overflow-auto rounded-lg bg-muted p-3 text-xs whitespace-pre-wrap">{JSON.stringify(details, null, 2)}</pre></div>; })()}</div>}
        </DialogContent>
      </Dialog>

      {/* Decision Dialog */}
      <Dialog open={decisionDialog.open} onOpenChange={(open) => { if (!open) setDecisionDialog({ open: false, appId: null, status: null, app: null }); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {decisionDialog.status === "selectionne" ? (
                <><CheckCircle className="w-5 h-5 text-green-600" /> Accepter la candidature</>
              ) : (
                <><XCircle className="w-5 h-5 text-red-600" /> Refuser la candidature</>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {decisionDialog.app && (
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                  {decisionDialog.app.firstName?.[0]}{decisionDialog.app.lastName?.[0]}
                </div>
                <div>
                  <div className="font-medium text-sm">{decisionDialog.app.firstName} {decisionDialog.app.lastName}</div>
                  <div className="text-xs text-muted-foreground">{decisionDialog.app.email}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-sm font-semibold">{Number(decisionDialog.app.scoreTotal).toFixed(1)}%</div>
                  <div className="text-[10px] text-muted-foreground">Score total</div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Langue de l'email</Label>
                <Select value={decisionLang} onValueChange={(v) => setDecisionLang(v as "fr" | "en")}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="rounded border-border" />
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> Envoyer l'email</span>
                </label>
              </div>
            </div>
            <div>
              <Label className="text-xs">Notes / Commentaires (optionnel)</Label>
              <Textarea className="mt-1 text-sm" placeholder="Commentaires..." value={decisionNotes} onChange={(e) => setDecisionNotes(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDecisionDialog({ open: false, appId: null, status: null, app: null })}>Annuler</Button>
            <Button
              className={decisionDialog.status === "selectionne" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
              onClick={() => {
                if (decisionDialog.appId && decisionDialog.status) {
                  updateStatusMutation.mutate({ id: decisionDialog.appId, status: decisionDialog.status, adminNotes: decisionNotes || undefined, sendEmail, language: decisionLang });
                  setDecisionDialog({ open: false, appId: null, status: null, app: null });
                  toast.success(decisionDialog.status === "selectionne" ? "Candidature acceptée" : "Candidature refusée");
                }
              }}
              disabled={updateStatusMutation.isPending}
            >
              <Send className="w-4 h-4 mr-1" />
              {decisionDialog.status === "selectionne" ? "Confirmer l'acceptation" : "Confirmer le refus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={bulkDialog.open} onOpenChange={(open) => { if (!open) setBulkDialog({ open: false, status: null }); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              {bulkDialog.status === "selectionne" ? "Accepter en masse + Activer comptes" : "Refuser en masse"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              {bulkDialog.status === "selectionne"
                ? `Vous allez accepter ${selectedIds.length} candidature(s). Un compte sera automatiquement créé pour chaque candidat accepté et un email avec les identifiants sera envoyé.`
                : `Vous allez refuser ${selectedIds.length} candidature(s). Un email de notification sera envoyé à chaque candidat.`}
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
              Cette action est irréversible. Veuillez confirmer.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialog({ open: false, status: null })}>Annuler</Button>
            <Button
              className={bulkDialog.status === "selectionne" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
              disabled={bulkUpdateMutation.isPending}
              onClick={() => {
                if (bulkDialog.status) {
                  bulkUpdateMutation.mutate({ applicationIds: selectedIds, status: bulkDialog.status });
                }
              }}
            >
              {bulkUpdateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
              Confirmer ({selectedIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={noteDialog.open} onOpenChange={(open) => { if (!open) setNoteDialog({ open: false, targetType: "application", targetId: 0, targetName: "" }); }}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="w-5 h-5" /> Notes — {noteDialog.targetName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Add note form */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Select value={noteCategory} onValueChange={setNoteCategory}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Général</SelectItem>
                    <SelectItem value="evaluation">Évaluation</SelectItem>
                    <SelectItem value="follow_up">Suivi</SelectItem>
                    <SelectItem value="alert">Alerte</SelectItem>
                    <SelectItem value="decision">Décision</SelectItem>
                  </SelectContent>
                </Select>
                <Input className="flex-1" placeholder="Ajouter une note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && newNote.trim()) { createNoteMutation.mutate({ targetType: noteDialog.targetType, targetId: noteDialog.targetId, content: newNote, category: noteCategory as any }); } }} />
                <Button size="sm" disabled={!newNote.trim() || createNoteMutation.isPending} onClick={() => { if (newNote.trim()) createNoteMutation.mutate({ targetType: noteDialog.targetType, targetId: noteDialog.targetId, content: newNote, category: noteCategory as any }); }}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {/* Notes list */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {notesQuery.data?.map((note: any) => (
                <div key={note.id} className="p-3 bg-secondary/50 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="secondary" className="text-[10px]">{note.category}</Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{new Date(note.createdAt).toLocaleString("fr-FR")}</span>
                      <button onClick={() => deleteNoteMutation.mutate({ noteId: note.id })} className="text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-foreground">{note.content}</p>
                </div>
              ))}
              {notesQuery.data?.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-6">Aucune note pour le moment.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Communication Dialog */}
      <Dialog open={commDialog} onOpenChange={(open) => { if (!open) resetCommunicationEditor(); else setCommDialog(true); }}>
        <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> {editingCommunicationId ? "Modifier le brouillon" : "Nouveau communiqué"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto py-2 pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={commType} onValueChange={setCommType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Annonce</SelectItem>
                    <SelectItem value="invitation">Invitation</SelectItem>
                    <SelectItem value="reminder">Rappel</SelectItem>
                    <SelectItem value="welcome">Bienvenue</SelectItem>
                    <SelectItem value="custom">Personnalisé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Population de départ</Label>
                <Select value={commAudience} onValueChange={(value) => setCommAudience(value as CommunicationAudience)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(COMMUNICATION_AUDIENCE_LABELS) as [CommunicationAudience, string][]).filter(([value]) => value !== "competency_level").map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-amber-300/70 bg-amber-50/60 p-3 text-sm dark:border-amber-800/60 dark:bg-amber-950/25">
              <Checkbox checked={commIsImportant} onCheckedChange={(checked) => setCommIsImportant(checked === true)} />
              <span><strong className="text-amber-900 dark:text-amber-200">Important — accusé de réception obligatoire</strong><br /><span className="text-xs text-amber-800/90 dark:text-amber-300/85">Après l’e-mail, le communiqué s’affichera en fenêtre d’information aux apprenants ciblés jusqu’à confirmation de leur réception. Pour « Tout le monde », il restera visible aux futurs apprenants.</span></span>
            </label>
            <section className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold">Critères supplémentaires</p><p className="text-xs text-muted-foreground">Ils s’ajoutent à la population de départ.</p></div><div className="min-w-52"><Label className="text-xs">Combiner les critères</Label><Select value={commCriteriaLogic} onValueChange={(value) => setCommCriteriaLogic(value as CommunicationCriteriaLogic)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(COMMUNICATION_CRITERIA_LOGIC_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div></div>
              <div className="rounded-md border border-border bg-background p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-medium">Segments enregistrés</p><p className="text-xs text-muted-foreground">Chargez une combinaison déjà utilisée.</p></div><div className="flex items-center gap-2"><Input className="h-8 w-48" value={commSegmentName} onChange={(event) => setCommSegmentName(event.target.value)} placeholder="Nom du segment" /><Button type="button" size="sm" variant="outline" className="gap-1" disabled={!commSegmentName.trim() || createCommunicationSegmentMutation.isPending} onClick={() => createCommunicationSegmentMutation.mutate({ name: commSegmentName.trim(), recipientFilter: communicationRecipientFilter })}><Save className="h-3.5 w-3.5" /> Enregistrer</Button></div></div><div className="mt-3 flex max-h-28 flex-wrap gap-2 overflow-y-auto">{(communicationSegmentsQuery.data || []).map((segment: any) => <div key={segment.id} className="inline-flex items-center gap-1 rounded-full border bg-muted/30 py-1 pl-3 pr-1 text-xs"><button type="button" className="max-w-52 truncate text-left hover:underline" onClick={() => { const filter = segment.recipientFilter as any; setCommAudience(filter.audience || "all"); setCommCriteriaLogic(filter.criteriaLogic || "all"); setCommUseCompetencyFilter(Boolean(filter.competencyId)); setCommCompetencyId(filter.competencyId || ""); setCommMinCompetencyLevel(String(filter.minCompetencyLevel ?? 10)); setCommCourseId(filter.courseId || "any"); setCommCourseProgressStatus(filter.courseProgressStatus || "started"); setCommActivityWithinDays(filter.activityWithinDays ? String(filter.activityWithinDays) : ""); setCommManualEmails(filter.manualEmails || []); toast.success(`Segment « ${segment.name} » appliqué`); }}>{segment.name}</button><Button type="button" variant="ghost" size="icon" className="h-5 w-5" aria-label={`Supprimer ${segment.name}`} onClick={() => { if (window.confirm(`Supprimer le segment « ${segment.name} » ?`)) deleteCommunicationSegmentMutation.mutate({ segmentId: segment.id }); }}><X className="h-3 w-3" /></Button></div>)}{communicationSegmentsQuery.data?.length === 0 && <p className="text-xs text-muted-foreground">Aucun segment enregistré.</p>}</div></div>
              <div className="grid gap-3 sm:grid-cols-[1fr_160px_130px]">
                <div><Label className="text-xs">Cours précis</Label><Select value={commCourseId} onValueChange={setCommCourseId}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="any">Tous les cours</SelectItem>{(communicationSegmentOptionsQuery.data?.courses || []).map((course: any) => <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="text-xs">Progression</Label><Select value={commCourseProgressStatus} onValueChange={(value) => setCommCourseProgressStatus(value as CourseProgressStatus)} disabled={commCourseId === "any"}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(COURSE_PROGRESS_STATUS_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="text-xs">Dans les X jours</Label><Input className="mt-1" type="number" min="1" max="365" disabled={commCourseId === "any"} placeholder="Sans limite" value={commActivityWithinDays} onChange={(event) => setCommActivityWithinDays(event.target.value)} /></div>
              </div>
              <div className="rounded-md border border-border bg-background p-3">
                <div className="flex items-center gap-2"><Checkbox id="communication-competency" checked={commUseCompetencyFilter} onCheckedChange={(checked) => setCommUseCompetencyFilter(Boolean(checked))} /><Label htmlFor="communication-competency" className="cursor-pointer text-sm font-medium">Exiger une performance dans une compétence</Label></div>
                {commUseCompetencyFilter && <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_150px]"><div><Label className="text-xs">Compétence</Label><Select value={commCompetencyId} onValueChange={setCommCompetencyId}><SelectTrigger className="mt-1"><SelectValue placeholder="Choisir une compétence" /></SelectTrigger><SelectContent>{(competencyFrameworkQuery.data?.definitions || []).filter((definition: any) => definition.active).map((definition: any) => { const title = definition.title as { fr?: string; en?: string } | string | null; return <SelectItem key={definition.id} value={definition.id}>{typeof title === "object" && title ? title.fr || title.en : title}</SelectItem>; })}</SelectContent></Select></div><div><Label className="text-xs">Niveau minimum</Label><Input className="mt-1" type="number" min="0" max="100" value={commMinCompetencyLevel} onChange={(event) => setCommMinCompetencyLevel(event.target.value)} /></div></div>}
              </div>
              <details className="rounded-md border border-border bg-background p-3"><summary className="cursor-pointer text-sm font-medium">Sélection manuelle des destinataires {commManualEmails.length ? `(${commManualEmails.length})` : ""}</summary><p className="mt-2 text-xs text-muted-foreground">Recherchez puis cochez une liste précise. Elle est combinée avec les autres critères selon l’opérateur choisi.</p><div className="mt-3 flex items-center gap-2"><Input value={commRecipientSearch} onChange={(event) => setCommRecipientSearch(event.target.value)} placeholder="Rechercher par nom ou e-mail" /><Button type="button" variant="ghost" size="sm" onClick={() => setCommManualEmails([])} disabled={!commManualEmails.length}>Effacer</Button></div><div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded border p-2">{selectableCommunicationRecipients.slice(0, 200).map((recipient: any) => { const selected = commManualEmails.includes(recipient.email); return <label key={recipient.email} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-muted"><Checkbox checked={selected} onCheckedChange={(checked) => setCommManualEmails((current) => checked ? Array.from(new Set([...current, recipient.email])) : current.filter((email) => email !== recipient.email))} /><span className="min-w-0 truncate">{recipient.name || recipient.email} <span className="text-xs text-muted-foreground">{recipient.name ? `· ${recipient.email}` : ""}</span></span></label>; })}{!selectableCommunicationRecipients.length && <p className="p-2 text-xs text-muted-foreground">Aucun destinataire ne correspond à cette recherche.</p>}</div></details>
            </section>
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm"><div className="flex items-center justify-between gap-3"><span className="font-medium">Aperçu des destinataires</span>{recipientPreviewQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="font-semibold text-primary">{recipientPreviewQuery.data?.count ?? 0} adresse{(recipientPreviewQuery.data?.count ?? 0) > 1 ? "s" : ""}</span>}</div><p className="mt-1 text-xs text-muted-foreground">Mode : {COMMUNICATION_CRITERIA_LOGIC_LABELS[commCriteriaLogic]} · Critères actifs : {activeCommunicationCriteria.join(" · ")}</p>{recipientPreviewQuery.data?.sample?.length ? <p className="mt-1 truncate text-xs text-muted-foreground">Exemples : {recipientPreviewQuery.data.sample.map((recipient: any) => recipient.email).join(" · ")}</p> : <p className="mt-1 text-xs text-muted-foreground">Aucun destinataire ne correspond actuellement à cette combinaison.</p>}</div>
            <div>
              <Label className="text-xs">Sujet</Label>
              <Input className="mt-1" placeholder="Objet de l'email..." value={commSubject} onChange={(e) => setCommSubject(e.target.value)} />
            </div>
            <div><Label className="text-xs">Corps du message (vous pouvez coller du texte riche ; utilisez {"{{name}}"} pour le nom)</Label><div className="mt-1"><WysiwygMarkdownEditor value={commBody} onChange={setCommBody} minHeight="180px" placeholder="Bonjour {{name}},\n\nRédigez votre communiqué ou collez un texte déjà mis en forme…" /></div><p className="mt-1 text-xs text-muted-foreground">Titres, listes, gras, italique et liens sont préservés dans l’e-mail. Les balises HTML actives sont supprimées.</p></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetCommunicationEditor}>Annuler</Button>
            <Button disabled={!commSubject.trim() || !commBody.trim() || !recipientPreviewQuery.data?.count || createCommMutation.isPending || updateCommMutation.isPending || (commUseCompetencyFilter && !commCompetencyId)} onClick={() => { const payload = { subject: commSubject, body: commBody, bodyFormat: "markdown" as const, type: commType as any, isImportant: commIsImportant, recipientFilter: communicationRecipientFilter }; if (editingCommunicationId) updateCommMutation.mutate({ communicationId: editingCommunicationId, ...payload }); else createCommMutation.mutate(payload); }}>
              {createCommMutation.isPending || updateCommMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : editingCommunicationId ? <Save className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
              {editingCommunicationId ? "Enregistrer le brouillon" : "Créer le brouillon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={commScheduleDialog.open} onOpenChange={(open) => { if (!open) { setCommScheduleDialog({ open: false, communication: null }); setCommScheduledAt(""); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5" /> Programmer le communiqué</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-md border border-border bg-muted/30 p-3"><p className="font-medium">{commScheduleDialog.communication?.subject}</p><p className="mt-1 text-xs text-muted-foreground">Le segment sera recalculé au moment de l’envoi ; seuls les destinataires correspondant encore aux critères seront contactés.</p></div>
            <div><Label htmlFor="communication-scheduled-at">Date et heure d’envoi</Label><Input id="communication-scheduled-at" className="mt-1" type="datetime-local" min={new Date(Date.now() + 120_000).toISOString().slice(0, 16)} value={commScheduledAt} onChange={(event) => setCommScheduledAt(event.target.value)} /><p className="mt-1 text-xs text-muted-foreground">L’heure saisie est celle de votre navigateur. Un délai minimum de deux minutes est requis.</p></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setCommScheduleDialog({ open: false, communication: null }); setCommScheduledAt(""); }}>Retour</Button><Button disabled={!commScheduledAt || scheduleCommMutation.isPending} onClick={() => { const scheduledAt = new Date(commScheduledAt); if (Number.isNaN(scheduledAt.getTime())) return toast.error("Veuillez choisir une date valide"); scheduleCommMutation.mutate({ communicationId: commScheduleDialog.communication.id, scheduledAt }); }}>{scheduleCommMutation.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CalendarClock className="mr-1 h-4 w-4" />}Confirmer la programmation</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Invitation Dialog */}
      <Dialog open={invitDialog} onOpenChange={setInvitDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" /> Envoi d'invitations en masse
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">Emails (un par ligne, format: email ou email,nom)</Label>
              <Textarea
                className="mt-1 font-mono text-xs"
                rows={8}
                placeholder={"ahmed@example.com, Ahmed Ben Ali\nfatima@example.com, Fatima Mansouri\nkarim@example.com"}
                value={invitEmails}
                onChange={(e) => setInvitEmails(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Maximum 100 invitations par envoi</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Langue de l'email</Label>
                <Select value={invitLang} onValueChange={(v) => setInvitLang(v as "fr" | "en")}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Nombre détecté</Label>
                <p className="text-lg font-bold mt-2" style={{ color: "var(--wise-positive)" }}>
                  {invitEmails.trim() ? invitEmails.trim().split("\n").filter(l => l.trim()).length : 0} email(s)
                </p>
              </div>
            </div>
            <div>
              <Label className="text-xs">Message personnalisé (optionnel)</Label>
              <Textarea
                className="mt-1 text-xs"
                rows={3}
                placeholder="Message additionnel à inclure dans l'email d'invitation..."
                value={invitMessage}
                onChange={(e) => setInvitMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvitDialog(false)}>Annuler</Button>
            <Button
              disabled={!invitEmails.trim() || bulkInviteMutation.isPending}
              onClick={() => {
                const lines = invitEmails.trim().split("\n").filter(l => l.trim());
                const invitations = lines.map(line => {
                  const parts = line.split(",").map(p => p.trim());
                  return { email: parts[0], name: parts[1] || undefined };
                });
                bulkInviteMutation.mutate({ invitations, language: invitLang, message: invitMessage || undefined });
              }}
            >
              {bulkInviteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
              Envoyer les invitations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Candidature Detail Dialog */}
      <Dialog open={!!detailApp} onOpenChange={(open) => { if (!open) { setDetailApp(null); navigateAdmin("candidatures"); } }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {detailApp && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {detailApp.photoFileUrl ? (
                    <img src={detailApp.photoFileUrl} alt="" className="w-12 h-12 rounded-full object-cover border border-border" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                      {detailApp.firstName?.[0]}{detailApp.lastName?.[0]}
                    </div>
                  )}
                  <div>
                    <div className="text-lg font-semibold">{detailApp.firstName} {detailApp.lastName}</div>
                    <div className="text-sm text-muted-foreground font-normal">{detailApp.email} · {detailApp.phone}</div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              {/* Score & Status bar */}
              <div className="flex items-center gap-4 py-3 px-4 rounded-lg bg-secondary/40 border border-border mt-2">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Score global</div>
                  <div className="text-2xl font-bold" style={{ color: getScoreColor(Number(detailApp.scoreTotal)) }}>{Number(detailApp.scoreTotal).toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Technique: {Number(detailApp.scoreTechnique).toFixed(0)}% · Métier: {Number(detailApp.scoreMetier).toFixed(0)}% · Communication: {Number(detailApp.scoreCommunication).toFixed(0)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="mb-1">{getStatusBadge(detailApp.status)}</div>
                  <div className="text-xs text-muted-foreground">Candidature du {new Date(detailApp.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
                </div>
              </div>

              {/* Detail sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                <DetailSection title="Informations personnelles">
                  <DetailItem label="Pays" value={detailApp.country} />
                  <DetailItem label="Ville" value={detailApp.city} />
                  <DetailItem label="Poste actuel" value={detailApp.currentRole} />
                  <DetailItem label="Secteur" value={detailApp.sector} />
                  <DetailItem label="Années d'expérience" value={`${detailApp.yearsExperience} ans`} />
                </DetailSection>

                <DetailSection title="Compétences techniques">
                  <DetailItem label="Programmation" value={getLabel(detailApp.programmingLevel)} />
                  <DetailItem label="Connaissances IA" value={getLabel(detailApp.aiKnowledge)} />
                  <DetailItem label="Cloud" value={getLabel(detailApp.cloudExperience)} />
                  <DetailItem label="Outils" value={detailApp.technicalTools || "—"} />
                  <DetailItem label="Certifications" value={detailApp.certifications || "—"} />
                </DetailSection>

                <DetailSection title="Communication & Vente">
                  <DetailItem label="Prise de parole" value={getLabel(detailApp.publicSpeaking)} />
                  <DetailItem label="Exp. commerciale" value={getLabel(detailApp.salesExperience)} />
                  <DetailItem label="Langues" value={detailApp.languages || "—"} />
                </DetailSection>

                <DetailSection title="Réseau de distribution">
                  <DetailItem label="Contacts industrie" value={getLabel(detailApp.industryContacts)} />
                  <DetailItem label="Connaissance marché" value={getLabel(detailApp.targetMarketKnowledge)} />
                  {detailApp.distributionNetwork && (
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">Réseau :</span>
                      <p className="text-xs text-foreground mt-1 bg-background p-2 rounded border border-border">{detailApp.distributionNetwork}</p>
                    </div>
                  )}
                </DetailSection>

                <DetailSection title="Profil entrepreneurial">
                  <DetailItem label="Tolérance au risque" value={getLabel(detailApp.riskTolerance)} />
                  <DetailItem label="Autonomie" value={getLabel(detailApp.autonomyLevel)} />
                  <DetailItem label="Résilience" value={getLabel(detailApp.resilienceLevel)} />
                  <DetailItem label="Leadership" value={getLabel(detailApp.leadershipStyle)} />
                </DetailSection>

                <DetailSection title="Scénario Agent IA">
                  <DetailItem label="Secteur cible" value={detailApp.aiAgentSector || "—"} />
                  {detailApp.aiAgentScenario && (
                    <div className="mt-2">
                      <p className="text-xs text-foreground bg-background p-2 rounded border border-border max-h-24 overflow-y-auto">{detailApp.aiAgentScenario}</p>
                    </div>
                  )}
                </DetailSection>

                <div className="md:col-span-2">
                  <DetailSection title="Motivation">
                    <p className="text-sm text-foreground bg-background p-3 rounded border border-border max-h-32 overflow-y-auto">{detailApp.motivation}</p>
                  </DetailSection>
                </div>

                {/* Liens & Documents */}
                <div className="md:col-span-2">
                  <DetailSection title="Liens & Documents">
                    <div className="flex flex-wrap gap-3 mt-1">
                      {detailApp.linkedinUrl && <a href={detailApp.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"><Linkedin className="w-4 h-4" /> LinkedIn</a>}
                      {detailApp.twitterUrl && <a href={detailApp.twitterUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"><Twitter className="w-4 h-4" /> Twitter/X</a>}
                      {detailApp.githubUrl && <a href={detailApp.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"><Github className="w-4 h-4" /> GitHub</a>}
                      {detailApp.websiteUrl && <a href={detailApp.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"><Globe className="w-4 h-4" /> Site web</a>}
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {detailApp.cvFileUrl && (
                        <button onClick={() => { setDetailApp(null); setTimeout(() => setCvViewerUrl(detailApp.cvFileUrl), 200); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-lg text-xs text-primary hover:bg-primary/10 transition-colors">
                          <Eye className="w-3.5 h-3.5" /> Consulter CV
                        </button>
                      )}
                      {detailApp.photoFileUrl && (
                        <a href={detailApp.photoFileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-lg text-xs text-primary hover:bg-primary/10 transition-colors">
                          <Camera className="w-3.5 h-3.5" /> Photo
                        </a>
                      )}
                      {detailApp.videoFileUrl && (
                        <details className="w-full rounded-lg border border-red-200 bg-red-50/40 p-2 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300">
                          <summary className="flex cursor-pointer items-center gap-1.5 font-medium"><Video className="h-3.5 w-3.5" /> Voir la vidéo de présentation</summary>
                          <video className="mt-2 max-h-80 w-full rounded-md bg-black" controls preload="metadata" src={toPreviewMediaUrl(detailApp.videoFileUrl, "video")}><track kind="captions" /> Votre navigateur ne prend pas en charge la lecture vidéo.</video>
                          <a href={toPreviewMediaUrl(detailApp.videoFileUrl, "video")} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs underline">Ouvrir dans un nouvel onglet</a>
                        </details>
                      )}
                    </div>
                  </DetailSection>
                </div>
              </div>

              {/* Action buttons */}
              <DialogFooter className="flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                <Button size="sm" variant="outline" className="text-xs gap-1.5" disabled={exportPDFMutation.isPending} onClick={() => { exportPDFMutation.mutate({ applicationId: detailApp.id }); }}>
                  {exportPDFMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                  Exporter PDF
                </Button>
                <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => { setDetailApp(null); setTimeout(() => setNoteDialog({ open: true, targetType: "application", targetId: detailApp.id, targetName: `${detailApp.firstName} ${detailApp.lastName}` }), 200); }}>
                  <StickyNote className="w-3 h-3" /> Notes
                </Button>
                {detailApp.status !== "selectionne" && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs gap-1.5" onClick={() => { setDetailApp(null); setTimeout(() => { setDecisionDialog({ open: true, appId: detailApp.id, status: "selectionne", app: detailApp }); setDecisionNotes(""); }, 200); }}>
                    <CheckCircle className="w-3 h-3" /> Sélectionner
                  </Button>
                )}
                {detailApp.status !== "refuse" && (
                  <Button size="sm" variant="destructive" className="text-xs gap-1.5" onClick={() => { setDetailApp(null); setTimeout(() => { setDecisionDialog({ open: true, appId: detailApp.id, status: "refuse", app: detailApp }); setDecisionNotes(""); }, 200); }}>
                    <XCircle className="w-3 h-3" /> Refuser
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* CV Viewer Dialog */}
      <Dialog open={!!cvViewerUrl} onOpenChange={(open) => { if (!open) setCvViewerUrl(null); }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" /> Consultation du CV
            </DialogTitle>
          </DialogHeader>
          <div className="w-full h-[70vh] bg-secondary/30 rounded-lg overflow-hidden">
            {cvViewerUrl && (
              <iframe src={cvViewerUrl} className="w-full h-full border-0" title="CV Preview" />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCvViewerUrl(null)}>Fermer</Button>
            {cvViewerUrl && (
              <a href={cvViewerUrl} target="_blank" rel="noopener noreferrer">
                <Button className="gap-1"><ExternalLink className="w-4 h-4" /> Ouvrir dans un nouvel onglet</Button>
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <div className="wise-card p-5">
      <div className="flex items-center gap-2 mb-2" style={{ color: "var(--wise-mute)" }}>{icon}<span className="text-xs uppercase tracking-wider">{label}</span></div>
      <div className="text-2xl font-bold" style={{ color: "var(--wise-ink)" }}>{value}</div>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--wise-positive)" }}>{title}</h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span style={{ color: "var(--wise-mute)" }}>{label}</span>
      <span className="font-medium" style={{ color: "var(--wise-ink)" }}>{value}</span>
    </div>
  );
}
