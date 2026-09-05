import { Link } from "wouter";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { BookOpen, Filter, GraduationCap, Layers3, Loader2, Search, X } from "lucide-react";
import { searchTrainingContent, type TrainingSearchEntry, type TrainingSearchKind } from "@/lib/trainingSearch";
import { trackEvent } from "@/lib/analytics";

type SearchKindFilter = TrainingSearchKind | "all";

const KIND_LABELS: Record<SearchKindFilter, string> = {
  all: "Tous",
  certification: "Certifications",
  course: "Cours",
  chapter: "Chapitres",
};

const KIND_ICONS: Record<TrainingSearchKind, typeof GraduationCap> = {
  certification: GraduationCap,
  course: BookOpen,
  chapter: Layers3,
};

export function TrainingSearchPanel({ groups, certificationTitles, initialQuery = "", onQueryChange }: {
  groups: Array<[string, { label: { en: string; fr: string }; order: number }]>;
  certificationTitles: Record<string, string>;
  initialQuery?: string;
  onQueryChange?: (value: string) => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [kind, setKind] = useState<SearchKindFilter>("all");
  const [group, setGroup] = useState("all");
  const [entries, setEntries] = useState<TrainingSearchEntry[] | null>(null);
  const [lastTrackedSearch, setLastTrackedSearch] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim();

  useEffect(() => { setQuery(initialQuery); }, [initialQuery]);

  useEffect(() => {
    if (normalizedQuery.length < 2 || entries) return;
    let mounted = true;
    fetch("/data/training-search-index.json", { cache: "force-cache" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Index de recherche indisponible")))
      .then((index: TrainingSearchEntry[]) => { if (mounted) setEntries(index); })
      .catch(() => { if (mounted) setEntries([]); });
    return () => { mounted = false; };
  }, [entries, normalizedQuery]);

  const results = useMemo(() => {
    if (!entries || normalizedQuery.length < 2) return [];
    return searchTrainingContent(entries, normalizedQuery, {
      kind,
      group: group === "all" ? undefined : group,
      limit: 12,
    });
  }, [entries, group, kind, normalizedQuery]);

  const searchPending = normalizedQuery.length >= 2 && !entries;

  useEffect(() => {
    if (!entries || normalizedQuery.length < 2) return;
    const fingerprint = `${normalizedQuery.length}:${kind}:${group}:${results.length}`;
    if (fingerprint === lastTrackedSearch) return;
    setLastTrackedSearch(fingerprint);
    trackEvent("search", { content_type: "training_catalog", search_category: kind, result_count: results.length });
  }, [entries, group, kind, lastTrackedSearch, normalizedQuery.length, results.length]);

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5" aria-labelledby="training-search-title">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 id="training-search-title" className="flex items-center gap-2 text-base font-semibold text-foreground"><Search className="h-4 w-4 text-primary" /> Trouver un contenu</h2>
          <p className="mt-1 text-sm text-muted-foreground">Recherchez une certification, un cours, un chapitre ou un concept : Claude, API, RAG, n8n, sécurité, reporting…</p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"><Filter className="h-3.5 w-3.5" /> Index sur demande</span>
      </div>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(event) => { setQuery(event.target.value); onQueryChange?.(event.target.value); }}
          placeholder="Ex. automatisation de workflows, RAG, API Claude…"
          aria-label="Rechercher dans les contenus de formation"
          className="h-11 w-full rounded-xl border border-input bg-background py-2 pl-10 pr-10 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        {query && <button type="button" onClick={() => { setQuery(""); onQueryChange?.(""); }} aria-label="Effacer la recherche" className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"><X className="h-4 w-4" /></button>}
      </div>

      {normalizedQuery.length >= 2 && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5" aria-label="Filtrer les résultats par type">
            {(Object.keys(KIND_LABELS) as SearchKindFilter[]).map((value) => <button key={value} type="button" onClick={() => setKind(value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${kind === value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{KIND_LABELS[value]}</button>)}
          </div>
          <label className="sr-only" htmlFor="training-search-group">Filtrer par catégorie</label>
          <select id="training-search-group" value={group} onChange={(event) => setGroup(event.target.value)} className="h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground">
            <option value="all">Toutes les catégories</option>
            {groups.slice().sort((a, b) => a[1].order - b[1].order).map(([id, config]) => <option key={id} value={id}>{config.label.fr}</option>)}
          </select>
        </div>
      )}

      {normalizedQuery.length > 0 && normalizedQuery.length < 2 && <p className="mt-3 text-xs text-muted-foreground" role="status">Saisissez au moins 2 caractères pour lancer la recherche.</p>}
      {searchPending && <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground" role="status"><Loader2 className="h-4 w-4 animate-spin" /> Préparation des résultats…</p>}
      {normalizedQuery.length >= 2 && entries && (
        <div className="mt-4" aria-live="polite">
          <p className="mb-2 text-xs font-medium text-muted-foreground">{results.length ? `${results.length} résultat${results.length > 1 ? "s" : ""} pertinent${results.length > 1 ? "s" : ""}` : "Aucun résultat précis"}</p>
          {results.length > 0 ? <ul className="divide-y divide-border rounded-xl border border-border">{results.map((result) => {
            const Icon = KIND_ICONS[result.kind];
            return <li key={result.id}><Link href={result.href} className="group flex items-start gap-3 p-3 transition-colors hover:bg-secondary/60"><span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="font-medium text-foreground group-hover:text-primary">{result.title}</span><span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{KIND_LABELS[result.kind]}</span></span><span className="mt-0.5 block text-xs text-muted-foreground">{certificationTitles[result.certId] || result.subtitle}</span>{result.snippet && <span className="mt-1 block line-clamp-2 text-sm text-muted-foreground">{result.snippet}</span>}</span></Link></li>;
          })}</ul> : <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">Essayez un terme plus court, un synonyme ou une autre catégorie. La recherche comprend les accents et les correspondances partielles.</div>}
        </div>
      )}
    </section>
  );
}
