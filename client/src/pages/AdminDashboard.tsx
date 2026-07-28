import React from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Download, Users, CheckCircle, XCircle, Clock, TrendingUp, Loader2, ExternalLink, ChevronDown, ChevronUp, FileText, Camera, Linkedin, Github, Globe, Twitter, Video, Mail, Send } from "lucide-react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

const LOGO_URL = "/manus-storage/logo_neopolis_akademy_9c9a0823.png";

export default function AdminDashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [decisionDialog, setDecisionDialog] = useState<{ open: boolean; appId: number | null; status: "selectionne" | "refuse" | null; app: any }>({ open: false, appId: null, status: null, app: null });
  const [decisionNotes, setDecisionNotes] = useState("");
  const [decisionLang, setDecisionLang] = useState<"fr" | "en">("fr");
  const [sendEmail, setSendEmail] = useState(true);

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
      // Convert base64 to blob and download
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
      "Contacts Industrie", "Connaissance Marché", "Réseau Distribution", "Partenariats",
      "Tolérance Risque", "Autonomie", "Résilience", "Leadership", "Expérience Entrepreneuriale",
      "Scénario IA", "Secteur IA", "Impact IA",
      "LinkedIn", "Twitter", "GitHub", "Site Web",
      "CV", "Photo",
      "Statut", "Date"
    ];
    const rows = applications.map((a: any) => [
      a.id, a.firstName, a.lastName, a.email, a.phone, a.country, a.city, a.sector, a.currentRole, a.yearsExperience,
      a.scoreTotal, a.scoreTechnique, a.scoreMetier, a.scoreCommunication,
      a.industryContacts || "", a.targetMarketKnowledge || "", a.distributionNetwork || "", a.existingPartnerships || "",
      a.riskTolerance || "", a.autonomyLevel || "", a.resilienceLevel || "", a.leadershipStyle || "", a.entrepreneurialExperience || "",
      a.aiAgentScenario || "", a.aiAgentSector || "", a.aiAgentImpact || "",
      a.linkedinUrl || "", a.twitterUrl || "", a.githubUrl || "", a.websiteUrl || "",
      a.cvFileUrl || "", a.photoFileUrl || "", (a as any).videoFileUrl || "",
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--wise-canvas-soft)" }}>
      {/* Header */}
      <nav className="sticky top-0 z-50" style={{ backgroundColor: "var(--wise-canvas)", borderBottom: "1px solid var(--wise-canvas-soft)" }}>
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="Neopolis Akademy" className="h-8 object-contain" />
            <span className="text-xs font-semibold ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--wise-primary-pale)", color: "var(--wise-positive-deep)" }}>Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors" style={{ backgroundColor: "var(--wise-primary-pale)", color: "var(--wise-positive-deep)" }}>Candidatures</Link>
            <Link href="/admin/training" className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-gray-100" style={{ color: "var(--wise-mute)" }}>Suivi Apprenants</Link>
            <Link href="/">
              <button className="wise-btn-tertiary text-sm flex items-center gap-2 ml-3">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container py-10">
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
                    <tr className="border-t border-border hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}>
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
                        <div className={`font-semibold ${getScoreColor(Number(app.scoreTotal))}`}>{Number(app.scoreTotal).toFixed(1)}%</div>
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
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-700 hover:text-green-600 hover:bg-green-50 text-xs"
                              onClick={(e) => { e.stopPropagation(); setDecisionDialog({ open: true, appId: app.id, status: "selectionne", app }); setDecisionNotes(""); }}
                            >
                              Sélectionner
                            </Button>
                          )}
                          {app.status !== "refuse" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-700 hover:text-red-600 hover:bg-red-50 text-xs"
                              onClick={(e) => { e.stopPropagation(); setDecisionDialog({ open: true, appId: app.id, status: "refuse", app }); setDecisionNotes(""); }}
                            >
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
                        <td colSpan={7} className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Informations de base */}
                            <DetailSection title="Informations de base">
                              <DetailItem label="Téléphone" value={app.phone} />
                              <DetailItem label="Ville" value={app.city} />
                              <DetailItem label="Poste actuel" value={app.currentRole} />
                              <DetailItem label="Années d'expérience" value={`${app.yearsExperience} ans`} />
                            </DetailSection>

                            {/* Compétences techniques */}
                            <DetailSection title="Compétences techniques">
                              <DetailItem label="Programmation" value={getLabel(app.programmingLevel)} />
                              <DetailItem label="Connaissances IA" value={getLabel(app.aiKnowledge)} />
                              <DetailItem label="Cloud" value={getLabel(app.cloudExperience)} />
                              <DetailItem label="Outils" value={app.technicalTools || "—"} />
                              <DetailItem label="Certifications" value={app.certifications || "—"} />
                            </DetailSection>

                            {/* Communication */}
                            <DetailSection title="Communication">
                              <DetailItem label="Prise de parole" value={getLabel(app.publicSpeaking)} />
                              <DetailItem label="Exp. commerciale" value={getLabel(app.salesExperience)} />
                              <DetailItem label="Langues" value={app.languages || "—"} />
                            </DetailSection>

                            {/* Réseau de distribution */}
                            <DetailSection title="Réseau de distribution">
                              <DetailItem label="Contacts industrie" value={getLabel(app.industryContacts)} />
                              <DetailItem label="Connaissance marché" value={getLabel(app.targetMarketKnowledge)} />
                              {app.distributionNetwork && (
                                <div className="mt-2">
                                  <span className="text-xs text-muted-foreground">Réseau :</span>
                                  <p className="text-xs text-foreground mt-1 bg-background p-2 rounded border border-border">{app.distributionNetwork}</p>
                                </div>
                              )}
                              {app.existingPartnerships && (
                                <div className="mt-2">
                                  <span className="text-xs text-muted-foreground">Partenariats :</span>
                                  <p className="text-xs text-foreground mt-1 bg-background p-2 rounded border border-border">{app.existingPartnerships}</p>
                                </div>
                              )}
                            </DetailSection>

                            {/* Profil entrepreneurial */}
                            <DetailSection title="Profil entrepreneurial">
                              <DetailItem label="Tolérance au risque" value={getLabel(app.riskTolerance)} />
                              <DetailItem label="Autonomie" value={getLabel(app.autonomyLevel)} />
                              <DetailItem label="Résilience" value={getLabel(app.resilienceLevel)} />
                              <DetailItem label="Leadership" value={getLabel(app.leadershipStyle)} />
                              {app.entrepreneurialExperience && (
                                <div className="mt-2">
                                  <span className="text-xs text-muted-foreground">Expérience :</span>
                                  <p className="text-xs text-foreground mt-1 bg-background p-2 rounded border border-border">{app.entrepreneurialExperience}</p>
                                </div>
                              )}
                            </DetailSection>

                            {/* Scénario IA */}
                            <DetailSection title="Scénario Agent IA">
                              <DetailItem label="Secteur cible" value={app.aiAgentSector || "—"} />
                              {app.aiAgentScenario && (
                                <div className="mt-2">
                                  <span className="text-xs text-muted-foreground">Scénario :</span>
                                  <p className="text-xs text-foreground mt-1 bg-background p-2 rounded border border-border max-h-32 overflow-y-auto">{app.aiAgentScenario}</p>
                                </div>
                              )}
                              {app.aiAgentImpact && (
                                <div className="mt-2">
                                  <span className="text-xs text-muted-foreground">Impact estimé :</span>
                                  <p className="text-xs text-foreground mt-1 bg-background p-2 rounded border border-border">{app.aiAgentImpact}</p>
                                </div>
                              )}
                            </DetailSection>

                            {/* Motivation */}
                            <div className="md:col-span-2">
                              <DetailSection title="Motivation">
                                <p className="text-xs text-foreground bg-background p-3 rounded border border-border max-h-32 overflow-y-auto">{app.motivation}</p>
                              </DetailSection>
                            </div>

                            {/* Liens & Documents */}
                            <DetailSection title="Liens & Documents">
                              <div className="flex flex-wrap gap-2 mt-1">
                                {app.linkedinUrl && (
                                  <a href={app.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                    <Linkedin className="w-3 h-3" /> LinkedIn
                                  </a>
                                )}
                                {app.twitterUrl && (
                                  <a href={app.twitterUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                    <Twitter className="w-3 h-3" /> Twitter/X
                                  </a>
                                )}
                                {app.githubUrl && (
                                  <a href={app.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                    <Github className="w-3 h-3" /> GitHub
                                  </a>
                                )}
                                {app.websiteUrl && (
                                  <a href={app.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                    <Globe className="w-3 h-3" /> Site web
                                  </a>
                                )}
                                {app.otherSocialUrl && (
                                  <a href={app.otherSocialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                    <ExternalLink className="w-3 h-3" /> Autre
                                  </a>
                                )}
                              </div>
                              <div className="flex gap-3 mt-3">
                                {app.cvFileUrl && (
                                  <a href={app.cvFileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-lg text-xs text-primary hover:bg-primary/10 transition-colors">
                                    <FileText className="w-3.5 h-3.5" /> Voir le CV
                                  </a>
                                )}
                {app.photoFileUrl && (
                                   <a href={app.photoFileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-lg text-xs text-primary hover:bg-primary/10 transition-colors">
                                     <Camera className="w-3.5 h-3.5" /> Voir la photo
                                   </a>
                                 )}
                                 {(app as any).videoFileUrl && (
                                   <a href={(app as any).videoFileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 hover:bg-red-100 transition-colors">
                                     <Video className="w-3.5 h-3.5" /> Voir la vidéo pitch
                                   </a>
                                 )}
                              </div>
                            </DetailSection>
                          </div>
                          {/* Action buttons row */}
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs gap-1.5"
                              disabled={exportPDFMutation.isPending}
                              onClick={() => exportPDFMutation.mutate({ applicationId: app.id })}
                            >
                              {exportPDFMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                              Exporter PDF
                            </Button>
                            {app.status === "en_attente" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50"
                                disabled={sendReminderMutation.isPending}
                                onClick={() => sendReminderMutation.mutate({ applicationId: app.id, language: "fr" })}
                              >
                                {sendReminderMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                                Relancer par email
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
                    <td colSpan={7} className="p-12 text-center text-muted-foreground body-md">
                      Aucune candidature pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
              <Textarea
                className="mt-1 text-sm"
                placeholder={decisionDialog.status === "selectionne" ? "Bienvenue dans le programme ! Voici quelques recommandations..." : "Merci pour votre candidature. Nous vous encourageons à..."}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDecisionDialog({ open: false, appId: null, status: null, app: null })}>
              Annuler
            </Button>
            <Button
              className={decisionDialog.status === "selectionne" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
              onClick={() => {
                if (decisionDialog.appId && decisionDialog.status) {
                  updateStatusMutation.mutate({
                    id: decisionDialog.appId,
                    status: decisionDialog.status,
                    adminNotes: decisionNotes || undefined,
                    sendEmail,
                    language: decisionLang,
                  });
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
