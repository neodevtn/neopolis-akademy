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
          <h1 className="text-2xl font-bold mb-4">Accès restreint</h1>
          <p className="text-muted-foreground mb-6">Vous devez être connecté en tant qu'administrateur.</p>
          <a href={getLoginUrl()}>
            <Button className="bg-primary">Se connecter</Button>
          </a>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Accès refusé</h1>
          <p className="text-muted-foreground mb-6">Cette page est réservée aux administrateurs.</p>
          <Link href="/">
            <Button variant="outline">Retour à l'accueil</Button>
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
      case "selectionne": return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Sélectionné</Badge>;
      case "refuse": return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Refusé</Badge>;
      default: return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">En attente</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <nav className="border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Neopolis" className="h-8" />
            <span className="font-bold text-lg font-[Montserrat]">Admin</span>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Retour au site</Button>
          </Link>
        </div>
      </nav>

      <div className="container py-8">
        <h1 className="text-3xl font-bold font-[Montserrat] mb-8">Tableau de bord — Candidatures</h1>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard icon={<Users className="w-5 h-5" />} value={stats.total} label="Total" />
            <StatCard icon={<Clock className="w-5 h-5" />} value={stats.enAttente} label="En attente" />
            <StatCard icon={<CheckCircle className="w-5 h-5" />} value={stats.selectionne} label="Sélectionnés" />
            <StatCard icon={<XCircle className="w-5 h-5" />} value={stats.refuse} label="Refusés" />
            <StatCard icon={<TrendingUp className="w-5 h-5" />} value={`${stats.avgScore.toFixed(1)}%`} label="Score moyen" />
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
          <Button variant="outline" onClick={handleExport} disabled={!applications.length}>
            <Download className="w-4 h-4 mr-2" /> Exporter CSV
          </Button>
        </div>

        {/* Table */}
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Candidat</th>
                  <th className="text-left p-4 font-medium">Pays</th>
                  <th className="text-left p-4 font-medium">Secteur</th>
                  <th className="text-left p-4 font-medium">Score</th>
                  <th className="text-left p-4 font-medium">Statut</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-t border-border hover:bg-muted/20">
                    <td className="p-4">
                      <div className="font-medium">{app.firstName} {app.lastName}</div>
                      <div className="text-xs text-muted-foreground">{app.email}</div>
                    </td>
                    <td className="p-4">{app.country}</td>
                    <td className="p-4 text-xs">{app.sector}</td>
                    <td className="p-4">
                      <span className="font-bold text-primary">{Number(app.scoreTotal).toFixed(1)}%</span>
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
                            className="text-green-400 hover:text-green-300 text-xs"
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
                            className="text-red-400 hover:text-red-300 text-xs"
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
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
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
    <div className="p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 mb-2 text-muted-foreground">{icon}<span className="text-xs">{label}</span></div>
      <div className="text-2xl font-bold font-[Montserrat]">{value}</div>
    </div>
  );
}
