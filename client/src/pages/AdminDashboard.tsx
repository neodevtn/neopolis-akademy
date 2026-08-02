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
import { Link } from "wouter";
import { ArrowLeft, Download, Users, CheckCircle, XCircle, Clock, TrendingUp, Loader2, ExternalLink, ChevronDown, ChevronUp, FileText, Camera, Linkedin, Github, Globe, Twitter, Video, Mail, Send, Tag, MessageSquare, StickyNote, Eye, Zap, AlertTriangle, BarChart3, Plus, X, Trash2, Activity, Columns3, Bell, BellRing, UserX, FileCheck } from "lucide-react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { AdminNavbar } from "@/components/AdminNavbar";

const LOGO_URL = "/api/assets/logo_neopolis_akademy_9c9a0823.png";

type TabType = "candidatures" | "kanban" | "communications" | "invitations" | "analytics" | "activity";

// Notification type icons
const NOTIF_ICONS: Record<string, { icon: any; color: string }> = {
  new_application: { icon: FileCheck, color: "#22c55e" },
  inactive_learner: { icon: UserX, color: "#f59e0b" },
  quiz_failure: { icon: AlertTriangle, color: "#ef4444" },
  system: { icon: BellRing, color: "#3b82f6" },
};

export default function AdminDashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("candidatures");
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
  const [commSubject, setCommSubject] = useState("");
  const [commBody, setCommBody] = useState("");
  const [commType, setCommType] = useState<string>("announcement");
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Invitation mass sending state
  const [invitDialog, setInvitDialog] = useState(false);
  const [invitEmails, setInvitEmails] = useState("");
  const [invitMessage, setInvitMessage] = useState("");
  const [invitLang, setInvitLang] = useState<"fr" | "en">("fr");

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
  const createCommMutation = trpc.adminTools.communications.create.useMutation({
    onSuccess: () => { communicationsQuery.refetch(); setCommDialog(false); setCommSubject(""); setCommBody(""); toast.success("Communication créée"); },
  });
  const sendCommMutation = trpc.adminTools.communications.send.useMutation({
    onSuccess: (data) => { communicationsQuery.refetch(); toast.success(`Communication envoyée à ${data.sentCount} destinataire(s)`); },
    onError: () => toast.error("Erreur lors de l'envoi"),
  });

  const analyticsQuery = trpc.adminTools.analytics.getLearnerAnalytics.useQuery(undefined, { enabled: activeTab === "analytics" });
  const activityLogQuery = trpc.adminTools.activityLog.list.useQuery(undefined, { enabled: activeTab === "activity" });

  // Invitations
  const invitationsQuery = trpc.admin.getInvitations.useQuery(undefined, { enabled: activeTab === "invitations" });
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

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--wise-canvas-soft)" }}>
        <div className="text-center wise-card p-8">
          <h1 className="wise-display-md mb-4">Accès refusé</h1>
          <p className="wise-body-md mb-6">Cette page est réservée aux administrateurs.</p>
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
        notificationSlot={
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
        }
      />

      {/* Sub-tabs for this page */}
      <div className="border-b" style={{ backgroundColor: "var(--wise-canvas)" }}>
        <div className="container flex items-center gap-1 py-2 overflow-x-auto">
          <button onClick={() => setActiveTab("candidatures")} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${activeTab === "candidatures" ? "font-semibold" : "hover:bg-gray-100"}`} style={{ backgroundColor: activeTab === "candidatures" ? "var(--wise-primary-pale)" : undefined, color: activeTab === "candidatures" ? "var(--wise-positive-deep)" : "var(--wise-mute)" }}>Candidatures</button>
          <button onClick={() => setActiveTab("communications")} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${activeTab === "communications" ? "font-semibold" : "hover:bg-gray-100"}`} style={{ backgroundColor: activeTab === "communications" ? "var(--wise-primary-pale)" : undefined, color: activeTab === "communications" ? "var(--wise-positive-deep)" : "var(--wise-mute)" }}>Communications</button>
          <button onClick={() => setActiveTab("invitations")} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${activeTab === "invitations" ? "font-semibold" : "hover:bg-gray-100"}`} style={{ backgroundColor: activeTab === "invitations" ? "var(--wise-primary-pale)" : undefined, color: activeTab === "invitations" ? "var(--wise-positive-deep)" : "var(--wise-mute)" }}>Invitations</button>
          <button onClick={() => setActiveTab("kanban")} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${activeTab === "kanban" ? "font-semibold" : "hover:bg-gray-100"}`} style={{ backgroundColor: activeTab === "kanban" ? "var(--wise-primary-pale)" : undefined, color: activeTab === "kanban" ? "var(--wise-positive-deep)" : "var(--wise-mute)" }}>Kanban</button>
          <button onClick={() => setActiveTab("analytics")} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${activeTab === "analytics" ? "font-semibold" : "hover:bg-gray-100"}`} style={{ backgroundColor: activeTab === "analytics" ? "var(--wise-primary-pale)" : undefined, color: activeTab === "analytics" ? "var(--wise-positive-deep)" : "var(--wise-mute)" }}>Évaluation</button>
          <button onClick={() => setActiveTab("activity")} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${activeTab === "activity" ? "font-semibold" : "hover:bg-gray-100"}`} style={{ backgroundColor: activeTab === "activity" ? "var(--wise-primary-pale)" : undefined, color: activeTab === "activity" ? "var(--wise-positive-deep)" : "var(--wise-mute)" }}>Activité</button>
        </div>
      </div>

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
                        <tr className="border-t border-border hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => setDetailApp(app)}>
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
                                      <a href={(app as any).videoFileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 hover:bg-red-100 transition-colors">
                                        <Video className="w-3.5 h-3.5" /> Vidéo pitch
                                      </a>
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
              <Button className="gap-2" onClick={() => setCommDialog(true)}>
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
                      <td className="p-4 font-medium text-foreground">{comm.subject}</td>
                      <td className="p-4"><Badge variant="secondary" className="text-xs">{comm.type}</Badge></td>
                      <td className="p-4 text-muted-foreground">{comm.recipientCount}</td>
                      <td className="p-4">
                        {comm.status === "sent" && <span className="wise-badge-positive">Envoyé</span>}
                        {comm.status === "draft" && <span className="wise-badge-warning">Brouillon</span>}
                        {comm.status === "sending" && <span className="wise-badge-warning">En cours...</span>}
                        {comm.status === "failed" && <span className="wise-badge-negative">Échoué</span>}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">{new Date(comm.createdAt).toLocaleDateString("fr-FR")}</td>
                      <td className="p-4">
                        {comm.status === "draft" && (
                          <Button size="sm" className="text-xs gap-1" disabled={sendCommMutation.isPending} onClick={() => sendCommMutation.mutate({ communicationId: comm.id })}>
                            <Send className="w-3 h-3" /> Envoyer
                          </Button>
                        )}
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
              <h1 className="wise-display-md">Invitations</h1>
              <Button className="gap-2" onClick={() => setInvitDialog(true)}>
                <Plus className="w-4 h-4" /> Envoi en masse
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatCard icon={<Mail className="w-4 h-4" />} value={invitationsQuery.data?.invitations?.length || 0} label="Total invitations" />
              <StatCard icon={<CheckCircle className="w-4 h-4" />} value={invitationsQuery.data?.invitations?.filter((i: any) => i.status === "accepted").length || 0} label="Acceptées" />
              <StatCard icon={<Clock className="w-4 h-4" />} value={invitationsQuery.data?.invitations?.filter((i: any) => i.status === "pending").length || 0} label="En attente" />
            </div>

            {/* Invitations list */}
            <div className="wise-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Email</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Nom</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Statut</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Envoyée le</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Expire le</th>
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
            <h1 className="wise-display-md mb-8">Journal d'activité</h1>
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
                    <div key={item.id} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${meta.color}15` }}>
                        <IconComp className="w-4 h-4" style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{meta.label}</p>
                        {details?.candidateName && <p className="text-xs text-muted-foreground">Candidat : {details.candidateName}</p>}
                        {details?.subject && <p className="text-xs text-muted-foreground">Objet : {details.subject}</p>}
                        {details?.count && <p className="text-xs text-muted-foreground">{details.count} élément(s) concerné(s)</p>}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
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
          </>
        )}
      </div>

      {/* ==================== DIALOGS ==================== */}

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
      <Dialog open={commDialog} onOpenChange={setCommDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Nouveau communiqué
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
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
                <Label className="text-xs">Destinataires</Label>
                <p className="text-xs text-muted-foreground mt-2">Tous les utilisateurs avec email</p>
              </div>
            </div>
            <div>
              <Label className="text-xs">Sujet</Label>
              <Input className="mt-1" placeholder="Objet de l'email..." value={commSubject} onChange={(e) => setCommSubject(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Corps du message (HTML supporté, utilisez {"{{name}}"} pour le nom)</Label>
              <Textarea className="mt-1 font-mono text-xs" rows={8} placeholder="<p>Bonjour {{name}},</p><p>...</p>" value={commBody} onChange={(e) => setCommBody(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommDialog(false)}>Annuler</Button>
            <Button disabled={!commSubject.trim() || !commBody.trim() || createCommMutation.isPending} onClick={() => { createCommMutation.mutate({ subject: commSubject, body: commBody, type: commType as any }); }}>
              {createCommMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
              Créer le brouillon
            </Button>
          </DialogFooter>
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
      <Dialog open={!!detailApp} onOpenChange={(open) => { if (!open) setDetailApp(null); }}>
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
                        <a href={detailApp.videoFileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 hover:bg-red-100 transition-colors">
                          <Video className="w-3.5 h-3.5" /> Vidéo pitch
                        </a>
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
