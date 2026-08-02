import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AdminNavbar } from "@/components/AdminNavbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getLoginUrl } from "@/const";
import { AlertTriangle, RefreshCw, Search, Filter, Clock, Globe, Code, Layers } from "lucide-react";

type SourceFilter = "all" | "window" | "promise" | "boundary" | "manual";

export default function AdminErrors() {
  const { user, loading, isAuthenticated } = useAuth();
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const errorsQuery = trpc.system.getClientErrors.useQuery(
    { limit: 100, source: sourceFilter === "all" ? undefined : sourceFilter, search: searchQuery.trim() || undefined },
    { enabled: isAuthenticated && user?.role === "admin", refetchInterval: 15_000 }
  );

  const statsQuery = trpc.system.getClientErrorStats.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin", refetchInterval: 15_000 }
  );

  const errors = errorsQuery.data || [];

  // Filtering is now done server-side, just use the results directly
  const filteredErrors = errors;

  // Use server-computed stats and chart data
  const chartData = statsQuery.data?.hourlyData || [];
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);
  const stats = {
    total: statsQuery.data?.total || 0,
    boundary: statsQuery.data?.boundary || 0,
    window: statsQuery.data?.window || 0,
    promise: statsQuery.data?.promise || 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--wise-canvas)" }}>
        <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full" style={{ borderColor: "var(--wise-positive)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--wise-canvas)" }}>
        <AlertTriangle size={48} style={{ color: "var(--wise-mute)" }} />
        <p className="wise-body-lg" style={{ color: "var(--wise-ink)" }}>Accès réservé aux administrateurs</p>
        <a href={getLoginUrl()} className="wise-btn-primary px-6 py-2">Se connecter</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--wise-canvas)" }}>
      <AdminNavbar activePage="errors" />

      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="wise-display-sm" style={{ color: "var(--wise-ink)" }}>Monitoring Erreurs Client</h1>
            <p className="wise-body-md mt-1" style={{ color: "var(--wise-mute)" }}>
              Dernières {errors.length} erreurs capturées en temps réel
            </p>
          </div>
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
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

        {/* Error list */}
        <div className="space-y-3">
          {filteredErrors.length === 0 ? (
            <div className="wise-card p-12 text-center">
              <AlertTriangle size={32} className="mx-auto mb-3" style={{ color: "var(--wise-mute)" }} />
              <p className="wise-body-md" style={{ color: "var(--wise-mute)" }}>
                {errors.length === 0 ? "Aucune erreur enregistrée" : "Aucune erreur ne correspond aux filtres"}
              </p>
            </div>
          ) : (
            filteredErrors.map((error, idx) => (
              <ErrorCard key={`${error.receivedAt}-${idx}`} error={error} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorCard({ error }: { error: { message: string; stack: string; source: string; url: string; timestamp: number; componentStack: string; receivedAt: number } }) {
  const [expanded, setExpanded] = useState(false);

  const sourceColors: Record<string, { bg: string; text: string; label: string }> = {
    window: { bg: "#fef3c7", text: "#92400e", label: "Window" },
    promise: { bg: "#dbeafe", text: "#1e40af", label: "Promise" },
    boundary: { bg: "#fee2e2", text: "#991b1b", label: "Crash" },
    manual: { bg: "#e0e7ff", text: "#3730a3", label: "Manuel" },
  };

  const source = sourceColors[error.source] || sourceColors.manual;
  const time = new Date(error.receivedAt);

  return (
    <div
      className="wise-card p-4 cursor-pointer transition-all hover:shadow-md"
      onClick={() => setExpanded(!expanded)}
      style={{ borderLeft: error.source === "boundary" ? "3px solid #ef4444" : undefined }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge style={{ backgroundColor: source.bg, color: source.text }} className="text-[10px] font-semibold">
              {source.label}
            </Badge>
            <span className="text-xs" style={{ color: "var(--wise-mute)" }}>
              {time.toLocaleDateString("fr-FR")} {time.toLocaleTimeString("fr-FR")}
            </span>
          </div>
          <p className="wise-body-sm font-medium truncate" style={{ color: "var(--wise-ink)" }}>
            {error.message}
          </p>
          <p className="text-xs truncate mt-1" style={{ color: "var(--wise-mute)" }}>
            {error.url}
          </p>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--wise-canvas-soft)" }}>
          {error.stack && (
            <div className="mb-3">
              <p className="wise-label mb-1" style={{ color: "var(--wise-mute)" }}>Stack Trace</p>
              <pre className="text-xs p-3 rounded-lg overflow-x-auto whitespace-pre-wrap break-all" style={{ backgroundColor: "var(--wise-canvas-soft)", color: "var(--wise-ink)" }}>
                {error.stack}
              </pre>
            </div>
          )}
          {error.componentStack && (
            <div>
              <p className="wise-label mb-1" style={{ color: "var(--wise-mute)" }}>Component Stack</p>
              <pre className="text-xs p-3 rounded-lg overflow-x-auto whitespace-pre-wrap break-all" style={{ backgroundColor: "var(--wise-canvas-soft)", color: "var(--wise-ink)" }}>
                {error.componentStack}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
