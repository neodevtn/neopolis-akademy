import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AdminNavbar } from "@/components/AdminNavbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getLoginUrl } from "@/const";
import { AlertTriangle, ChevronLeft, ChevronRight, RefreshCw, Search, Filter, Clock, Globe, Code, Layers, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { isAdministrativeRole } from "@shared/roles";

type SourceFilter = "all" | "window" | "promise" | "boundary" | "manual";
type OperationalLog = { id: string; timestamp: number; type: string; category: "learning" | "incident"; courseId: string; details: { message?: string } };

export default function AdminErrors() {
  const { user, loading, isAuthenticated } = useAuth();
  const isAdmin = isAdministrativeRole(user?.role);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [operationalPage, setOperationalPage] = useState(1);
  const [operationalSearch, setOperationalSearch] = useState("");

  const utils = trpc.useUtils();

  const errorsQuery = trpc.system.getClientErrors.useQuery(
    { limit: 100, source: sourceFilter === "all" ? undefined : sourceFilter, search: searchQuery.trim() || undefined },
    { enabled: isAuthenticated && isAdmin, refetchInterval: 15_000 }
  );

  const statsQuery = trpc.system.getClientErrorStats.useQuery(
    undefined,
    { enabled: isAuthenticated && isAdmin, refetchInterval: 15_000 }
  );
  const operationalLogsQuery = trpc.system.getOperationalLogs.useQuery(
    { page: operationalPage, pageSize: 25, search: operationalSearch.trim() || undefined },
    { enabled: isAuthenticated && isAdmin, refetchInterval: 15_000 }
  );

  useEffect(() => {
    setOperationalPage(1);
  }, [operationalSearch]);

  const deleteMutation = trpc.system.deleteClientErrors.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.deleted} erreur(s) supprimée(s)`);
      setSelectedIds(new Set());
      utils.system.getClientErrors.invalidate();
      utils.system.getClientErrorStats.invalidate();
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  const clearAllMutation = trpc.system.clearAllClientErrors.useMutation({
    onSuccess: () => {
      toast.success("Toutes les erreurs ont été supprimées");
      setSelectedIds(new Set());
      utils.system.getClientErrors.invalidate();
      utils.system.getClientErrorStats.invalidate();
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  const errors = errorsQuery.data || [];
  const operationalLogs: OperationalLog[] = operationalLogsQuery.data?.items || [];
  const operationalTotal = operationalLogsQuery.data?.total || 0;
  const operationalTotalPages = operationalLogsQuery.data?.totalPages || 1;
  const operationalCurrentPage = operationalLogsQuery.data?.page || operationalPage;
  const operationalStart = operationalTotal === 0 ? 0 : (operationalCurrentPage - 1) * 25 + 1;
  const operationalEnd = Math.min(operationalCurrentPage * 25, operationalTotal);

  // Use server-computed stats and chart data
  const chartData = statsQuery.data?.hourlyData || [];
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);
  const stats = {
    total: statsQuery.data?.total || 0,
    boundary: statsQuery.data?.boundary || 0,
    window: statsQuery.data?.window || 0,
    promise: statsQuery.data?.promise || 0,
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === errors.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(errors.map((e) => e.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    deleteMutation.mutate({ ids: Array.from(selectedIds) });
  };

  const handleDeleteOne = (id: number) => {
    deleteMutation.mutate({ ids: [id] });
  };

  const handleClearAll = () => {
    if (confirm("Supprimer toutes les erreurs ? Cette action est irréversible.")) {
      clearAllMutation.mutate();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--wise-canvas)" }}>
        <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full" style={{ borderColor: "var(--wise-positive)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--wise-canvas)" }}>
        <AlertTriangle size={48} style={{ color: "var(--wise-mute)" }} />
        <p className="wise-body-lg" style={{ color: "var(--wise-ink)" }}>Accès réservé aux administrateurs</p>
        <a href={getLoginUrl()} className="wise-btn-primary px-6 py-2">Se connecter</a>
      </div>
    );
  }

  const sourceColors: Record<string, { bg: string; text: string; label: string }> = {
    window: { bg: "#fef3c7", text: "#92400e", label: "Window" },
    promise: { bg: "#dbeafe", text: "#1e40af", label: "Promise" },
    boundary: { bg: "#fee2e2", text: "#991b1b", label: "Crash" },
    manual: { bg: "#e0e7ff", text: "#3730a3", label: "Manuel" },
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--wise-canvas)" }}>
      <AdminNavbar activePage="errors" />

      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="wise-display-sm" style={{ color: "var(--wise-ink)" }}>Monitoring Erreurs Client</h1>
            <p className="wise-body-md mt-1" style={{ color: "var(--wise-mute)" }}>
              {errors.length} erreur(s) • Les erreurs de build/déploiement sont automatiquement filtrées
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleClearAll}
              variant="outline"
              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
              disabled={errors.length === 0}
            >
              <Trash2 size={14} />
              Tout supprimer
            </Button>
            <Button
              onClick={() => errorsQuery.refetch()}
              variant="outline"
              className="flex items-center gap-2"
              disabled={errorsQuery.isFetching}
            >
              <RefreshCw size={16} className={errorsQuery.isFetching ? "animate-spin" : ""} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="wise-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Layers size={16} style={{ color: "var(--wise-mute)" }} />
              <span className="wise-label" style={{ color: "var(--wise-mute)" }}>Total</span>
            </div>
            <p className="wise-display-xs" style={{ color: "var(--wise-ink)" }}>{stats.total}</p>
          </div>
          <div className="wise-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} style={{ color: "#ef4444" }} />
              <span className="wise-label" style={{ color: "var(--wise-mute)" }}>Crashes (Boundary)</span>
            </div>
            <p className="wise-display-xs" style={{ color: "#ef4444" }}>{stats.boundary}</p>
          </div>
          <div className="wise-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe size={16} style={{ color: "#f59e0b" }} />
              <span className="wise-label" style={{ color: "var(--wise-mute)" }}>Window Errors</span>
            </div>
            <p className="wise-display-xs" style={{ color: "#f59e0b" }}>{stats.window}</p>
          </div>
          <div className="wise-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Code size={16} style={{ color: "#3b82f6" }} />
              <span className="wise-label" style={{ color: "var(--wise-mute)" }}>Promise Rejections</span>
            </div>
            <p className="wise-display-xs" style={{ color: "#3b82f6" }}>{stats.promise}</p>
          </div>
        </div>

        <div className="wise-card p-6 mb-8">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="wise-body-lg font-semibold" style={{ color: "var(--wise-ink)" }}>Journal opérationnel</h2>
              <p className="text-xs mt-1" style={{ color: "var(--wise-mute)" }}>Progression, temps d’apprentissage, tentatives et incidents récents.</p>
            </div>
            <Badge variant="secondary">{operationalTotal} événement(s)</Badge>
          </div>
          <div className="relative mb-4 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--wise-mute)" }} />
            <Input aria-label="Rechercher dans le journal opérationnel" value={operationalSearch} onChange={(event) => setOperationalSearch(event.target.value)} placeholder="Rechercher un cours, un événement ou un incident..." className="pl-9" />
          </div>
          {operationalTotal === 0 ? (
            <p className="text-sm py-4" style={{ color: "var(--wise-mute)" }}>En attente d’activité réelle : les nouveaux événements s’afficheront automatiquement.</p>
          ) : (
            <>
              <div className="divide-y divide-border">
              {operationalLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-sm">
                  <div className="min-w-0"><p className="font-medium text-foreground">{log.category === "incident" ? "Incident client" : log.type.replaceAll("_", " ")}</p><p className="text-xs text-muted-foreground truncate">{log.courseId || (log.details as any).message || "Plateforme"}</p></div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              ))}
              </div>
              <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs" style={{ color: "var(--wise-mute)" }}>Événements {operationalStart}–{operationalEnd} sur {operationalTotal} · Page {operationalCurrentPage} sur {operationalTotalPages}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" aria-label="Page précédente du journal opérationnel" onClick={() => setOperationalPage((page) => Math.max(1, page - 1))} disabled={operationalCurrentPage <= 1 || operationalLogsQuery.isFetching}><ChevronLeft size={15} />Précédent</Button>
                  <Button size="sm" variant="outline" aria-label="Page suivante du journal opérationnel" onClick={() => setOperationalPage((page) => Math.min(operationalTotalPages, page + 1))} disabled={operationalCurrentPage >= operationalTotalPages || operationalLogsQuery.isFetching}>Suivant<ChevronRight size={15} /></Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Temporal chart */}
        <div className="wise-card p-6 mb-8">
          <h2 className="wise-body-lg font-semibold mb-4" style={{ color: "var(--wise-ink)" }}>
            <Clock size={16} className="inline mr-2" />
            Erreurs par heure (dernières 24h)
          </h2>
          <div className="flex items-end gap-1 h-32">
            {chartData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="w-full flex flex-col justify-end" style={{ height: "100px" }}>
                  {d.boundary > 0 && (
                    <div
                      className="w-full rounded-t-sm"
                      style={{
                        height: `${Math.max((d.boundary / maxCount) * 100, 4)}%`,
                        backgroundColor: "#ef4444",
                      }}
                    />
                  )}
                  <div
                    className="w-full rounded-t-sm"
                    style={{
                      height: `${Math.max(((d.count - d.boundary) / maxCount) * 100, d.count > 0 ? 4 : 0)}%`,
                      backgroundColor: d.count > 0 ? "var(--wise-positive)" : "var(--wise-canvas-soft)",
                      minHeight: d.count > 0 ? "4px" : "2px",
                    }}
                  />
                </div>
                <span className="text-[9px] hidden md:block" style={{ color: "var(--wise-mute)" }}>
                  {i % 3 === 0 ? d.hour : ""}
                </span>
                {/* Tooltip */}
                <div className="absolute bottom-full mb-1 hidden group-hover:block z-10">
                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {d.hour}: {d.count} erreur{d.count !== 1 ? "s" : ""}
                    {d.boundary > 0 && ` (${d.boundary} crash${d.boundary !== 1 ? "es" : ""})`}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "var(--wise-positive)" }} />
              <span className="text-xs" style={{ color: "var(--wise-mute)" }}>Erreurs</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#ef4444" }} />
              <span className="text-xs" style={{ color: "var(--wise-mute)" }}>Crashes</span>
            </div>
          </div>
        </div>

        {/* Filters + bulk actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--wise-mute)" }} />
            <Input
              placeholder="Rechercher dans les erreurs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as SourceFilter)}>
            <SelectTrigger className="w-[180px]">
              <Filter size={14} className="mr-2" />
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sources</SelectItem>
              <SelectItem value="window">Window Error</SelectItem>
              <SelectItem value="promise">Promise Rejection</SelectItem>
              <SelectItem value="boundary">ErrorBoundary</SelectItem>
              <SelectItem value="manual">Manuel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg" style={{ backgroundColor: "var(--wise-canvas-soft)" }}>
            <CheckCircle size={16} style={{ color: "var(--wise-positive)" }} />
            <span className="wise-body-sm font-medium" style={{ color: "var(--wise-ink)" }}>
              {selectedIds.size} erreur(s) sélectionnée(s)
            </span>
            <Button
              onClick={handleDeleteSelected}
              size="sm"
              variant="outline"
              className="ml-auto flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
              disabled={deleteMutation.isPending}
            >
              <Trash2 size={14} />
              Supprimer la sélection
            </Button>
          </div>
        )}

        {/* Error table */}
        {errors.length === 0 ? (
          <div className="wise-card p-12 text-center">
            <AlertTriangle size={32} className="mx-auto mb-3" style={{ color: "var(--wise-mute)" }} />
            <p className="wise-body-md" style={{ color: "var(--wise-mute)" }}>
              Aucune erreur enregistrée
            </p>
          </div>
        ) : (
          <div className="wise-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "var(--wise-canvas-soft)", borderBottom: "1px solid var(--wise-canvas-soft)" }}>
                    <th className="px-4 py-3 text-left w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === errors.length && errors.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--wise-mute)" }}>Date</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--wise-mute)" }}>Type</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--wise-mute)" }}>Message</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--wise-mute)" }}>URL</th>
                    <th className="px-4 py-3 text-center font-semibold w-20" style={{ color: "var(--wise-mute)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {errors.map((error) => {
                    const source = sourceColors[error.source] || sourceColors.manual;
                    const time = new Date(error.receivedAt);
                    const isExpanded = expandedId === error.id;

                    return (
                      <tr key={error.id}>
                        <td colSpan={6} className="p-0">
                          <div>
                            <div
                              className="flex items-center cursor-pointer hover:bg-gray-50/50 transition-colors"
                              style={{ borderBottom: "1px solid var(--wise-canvas-soft)" }}
                            >
                              <div className="px-4 py-3 w-10">
                                <input
                                  type="checkbox"
                                  checked={selectedIds.has(error.id)}
                                  onChange={(e) => { e.stopPropagation(); toggleSelect(error.id); }}
                                  className="rounded border-gray-300"
                                />
                              </div>
                              <div className="px-4 py-3 whitespace-nowrap" onClick={() => setExpandedId(isExpanded ? null : error.id)}>
                                <span className="text-xs" style={{ color: "var(--wise-mute)" }}>
                                  {time.toLocaleDateString("fr-FR")}
                                </span>
                                <br />
                                <span className="text-[11px]" style={{ color: "var(--wise-mute)" }}>
                                  {time.toLocaleTimeString("fr-FR")}
                                </span>
                              </div>
                              <div className="px-4 py-3" onClick={() => setExpandedId(isExpanded ? null : error.id)}>
                                <Badge style={{ backgroundColor: source.bg, color: source.text }} className="text-[10px] font-semibold">
                                  {source.label}
                                </Badge>
                              </div>
                              <div className="px-4 py-3 flex-1 min-w-0" onClick={() => setExpandedId(isExpanded ? null : error.id)}>
                                <p className="text-xs font-medium truncate max-w-[400px]" style={{ color: "var(--wise-ink)" }}>
                                  {error.message}
                                </p>
                              </div>
                              <div className="px-4 py-3 min-w-0 max-w-[200px]" onClick={() => setExpandedId(isExpanded ? null : error.id)}>
                                <p className="text-[11px] truncate" style={{ color: "var(--wise-mute)" }}>
                                  {error.url.replace(/https?:\/\/[^/]+/, '')}
                                </p>
                              </div>
                              <div className="px-4 py-3 text-center w-20">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteOne(error.id); }}
                                  className="p-1.5 rounded-md hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500"
                                  title="Supprimer cette erreur"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            {/* Expanded detail */}
                            {isExpanded && (
                              <div className="px-6 py-4" style={{ backgroundColor: "var(--wise-canvas-soft)", borderBottom: "1px solid var(--wise-canvas-soft)" }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="wise-label mb-1 text-xs font-semibold" style={{ color: "var(--wise-mute)" }}>Message complet</p>
                                    <p className="text-xs break-all" style={{ color: "var(--wise-ink)" }}>{error.message}</p>
                                  </div>
                                  <div>
                                    <p className="wise-label mb-1 text-xs font-semibold" style={{ color: "var(--wise-mute)" }}>URL complète</p>
                                    <p className="text-xs break-all" style={{ color: "var(--wise-ink)" }}>{error.url}</p>
                                  </div>
                                </div>
                                {error.stack && (
                                  <div className="mt-3">
                                    <p className="wise-label mb-1 text-xs font-semibold" style={{ color: "var(--wise-mute)" }}>Stack Trace</p>
                                    <pre className="text-[11px] p-3 rounded-lg overflow-x-auto whitespace-pre-wrap break-all max-h-48 overflow-y-auto" style={{ backgroundColor: "white", color: "var(--wise-ink)", border: "1px solid var(--wise-canvas-soft)" }}>
                                      {error.stack}
                                    </pre>
                                  </div>
                                )}
                                {error.componentStack && (
                                  <div className="mt-3">
                                    <p className="wise-label mb-1 text-xs font-semibold" style={{ color: "var(--wise-mute)" }}>Component Stack</p>
                                    <pre className="text-[11px] p-3 rounded-lg overflow-x-auto whitespace-pre-wrap break-all max-h-32 overflow-y-auto" style={{ backgroundColor: "white", color: "var(--wise-ink)", border: "1px solid var(--wise-canvas-soft)" }}>
                                      {error.componentStack}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
