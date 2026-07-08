import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Download, Users, CheckCircle, XCircle, Clock, TrendingUp, Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";

const LOGO_URL = "/manus-storage/logo_neopolis_dev_04585f1b.png";

export default function AdminDashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="display-lg mb-4">Accès restreint</h1>
          <p className="body-md text-muted-foreground mb-6">Vous devez être connecté en tant qu'administrateur.</p>
          <a href={getLoginUrl()}>
            <Button className="btn-pill bg-primary text-primary-foreground">Se connecter</Button>
          </a>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="display-lg mb-4">Accès refusé</h1>
          <p className="body-md text-muted-foreground mb-6">Cette page est réservée aux administrateurs.</p>
          <Link href="/">
            <Button variant="outline" className="btn-pill">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = statsQuery.data;
  const applications = applicationsQuery.data || [];

  const handleExport = () => {
    if (!applications.length) return;
    const headers = ["ID", "Prénom", "Nom", "Email", "Téléphone", "Pays", "Ville", "Secteur", "Poste", "Expérience", "Score Total", "Score Technique", "Score Métier", "Score Communication", "Statut", "Date"];
    const rows = applications.map(a => [
      a.id, a.firstName, a.lastName, a.email, a.phone, a.country, a.city, a.sector, a.currentRole, a.yearsExperience,
      a.scoreTotal, a.scoreTechnique, a.scoreMetier, a.scoreCommunication, a.status, new Date(a.createdAt).toLocaleDateString("fr-FR")
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candidatures_neopolis_akademy_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "selectionne": return <Badge className="bg-green-50 text-green-700 border border-green-200 font-normal">Sélectionné</Badge>;
      case "refuse": return <Badge className="bg-red-50 text-red-700 border border-red-200 font-normal">Refusé</Badge>;
      default: return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-normal">En attente</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-secondary text-foreground">
      {/* Header */}
      <nav className="border-b border-border bg-background">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="Neopolis" className="h-7" />
            <span className="text-lg font-light tracking-tight">Admin</span>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour au site
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container py-10">
        <h1 className="display-lg text-foreground mb-10">Tableau de bord — Candidatures</h1>

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
          </div>
          <Button variant="outline" onClick={handleExport} disabled={!applications.length} className="btn-pill">
            <Download className="w-4 h-4 mr-2" /> Exporter CSV
          </Button>
        </div>

        {/* Table */}
        <div className="bg-background border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Candidat</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Pays</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Secteur</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Score</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-foreground">{app.firstName} {app.lastName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{app.email}</div>
                    </td>
                    <td className="p-4 text-foreground">{app.country}</td>
                    <td className="p-4 text-xs text-foreground">{app.sector}</td>
                    <td className="p-4">
                      <span className="font-medium text-primary">{Number(app.scoreTotal).toFixed(1)}%</span>
                    </td>
                    <td className="p-4">{getStatusBadge(app.status)}</td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {new Date(app.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {app.status !== "selectionne" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-700 hover:text-green-600 hover:bg-green-50 text-xs"
                            onClick={() => updateStatusMutation.mutate({ id: app.id, status: "selectionne" })}
                            disabled={updateStatusMutation.isPending}
                          >
                            Sélectionner
                          </Button>
                        )}
                        {app.status !== "refuse" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-700 hover:text-red-600 hover:bg-red-50 text-xs"
                            onClick={() => updateStatusMutation.mutate({ id: app.id, status: "refuse" })}
                            disabled={updateStatusMutation.isPending}
                          >
                            Refuser
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
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
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <div className="p-5 rounded-xl border border-border bg-background">
      <div className="flex items-center gap-2 mb-2 text-muted-foreground">{icon}<span className="text-xs uppercase tracking-wider">{label}</span></div>
      <div className="display-md text-foreground">{value}</div>
    </div>
  );
}
