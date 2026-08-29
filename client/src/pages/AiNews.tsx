import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, BookOpen, Clock3, ExternalLink, Filter, Loader2, Newspaper, RefreshCw, Search, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const LOGO_URL = "/api/assets/neopolis-akademy-official-logo_40a16b6c.svg";

function formatDate(value: string | null) {
  if (!value) return "Date non communiquée";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function sourceInitial(label: string) {
  return label.replace(/[^A-Za-zÀ-ÿ0-9]/g, "").slice(0, 2).toUpperCase() || "IA";
}

export default function AiNews() {
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const feed = trpc.aiNews.getFeed.useQuery(undefined, { staleTime: 5 * 60 * 1000, retry: 0 });

  const articles = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr-FR");
    return (feed.data?.articles || []).filter((article) => {
      if (sourceFilter !== "all" && article.sourceId !== sourceFilter) return false;
      if (categoryFilter !== "all" && article.sourceCategory !== categoryFilter) return false;
      if (!normalizedQuery) return true;
      return [article.title, article.excerpt, article.sourceLabel, article.sourceCategory, ...article.topics]
        .join(" ")
        .toLocaleLowerCase("fr-FR")
        .includes(normalizedQuery);
    });
  }, [categoryFilter, feed.data?.articles, query, sourceFilter]);

  const categories = useMemo(() => Array.from(new Set((feed.data?.sources || []).map((source) => source.category))), [feed.data?.sources]);
  const unavailableCount = feed.data?.sources.filter((source) => source.status === "unavailable").length || 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Accueil Neopolis Akademy" className="shrink-0"><img src={LOGO_URL} alt="Neopolis Akademy" className="h-8 w-auto sm:h-9" /></Link>
          <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Navigation publique">
            <Link href="/" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950">Accueil</Link>
            <Link href="/ai-news" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white" aria-current="page">AI News</Link>
            <Link href="/training" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950">Formations</Link>
          </nav>
          <LanguageSwitcher />
        </div>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-[radial-gradient(circle_at_84%_14%,rgba(30,58,110,0.15),transparent_30%),linear-gradient(135deg,#fff_0%,#edf4ff_100%)]">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.3fr_0.7fr] lg:px-8">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-xs font-bold tracking-wide text-blue-900"><Sparkles size={14} /> VEILLE SÉLECTIONNÉE</p>
              <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">AI News, sans bruit.</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Les annonces, outils, analyses et prépublications qui aident à suivre l’intelligence artificielle. Chaque carte renvoie directement vers sa source originale.</p>
            </div>
            <div className="grid grid-cols-2 gap-px self-end overflow-hidden rounded-2xl border border-slate-200 bg-slate-200">
              <div className="bg-white p-5"><p className="text-3xl font-bold text-slate-950">{feed.data?.sources.length || 6}</p><p className="mt-1 text-sm text-slate-500">sources suivies</p></div>
              <div className="bg-white p-5"><p className="text-3xl font-bold text-slate-950">{feed.data?.articles.length || "—"}</p><p className="mt-1 text-sm text-slate-500">articles récents</p></div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:flex-row lg:items-center">
            <label className="relative block min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un modèle, un outil, un sujet…" className="h-11 border-slate-200 pl-10" aria-label="Rechercher dans AI News" />
            </label>
            <div className="grid grid-cols-2 gap-3 sm:flex">
              <label className="relative"><span className="sr-only">Filtrer par source</span><select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)} className="h-11 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 pr-9 text-sm font-medium text-slate-700 outline-none ring-offset-2 focus:ring-2 focus:ring-slate-800 sm:w-48"><option value="all">Toutes les sources</option>{(feed.data?.sources || []).map((source) => <option key={source.id} value={source.id}>{source.label}</option>)}</select><Filter className="pointer-events-none absolute right-3 top-3 text-slate-400" size={16} /></label>
              <label className="relative"><span className="sr-only">Filtrer par catégorie</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-11 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 pr-9 text-sm font-medium text-slate-700 outline-none ring-offset-2 focus:ring-2 focus:ring-slate-800 sm:w-40"><option value="all">Tous les sujets</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select><Filter className="pointer-events-none absolute right-3 top-3 text-slate-400" size={16} /></label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-slate-600">{feed.isLoading ? "Mise à jour des flux…" : `${articles.length} résultat${articles.length > 1 ? "s" : ""} affiché${articles.length > 1 ? "s" : ""}`}</p>
            <div className="flex items-center gap-3"><span className="text-slate-500">{feed.data ? `Actualisé ${formatDate(feed.data.updatedAt)}` : ""}</span><Button type="button" variant="outline" size="sm" onClick={() => feed.refetch()} disabled={feed.isFetching} className="gap-2 border-slate-300"><RefreshCw size={15} className={feed.isFetching ? "animate-spin" : ""} />Actualiser</Button></div>
          </div>

          {unavailableCount > 0 && <p role="status" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{unavailableCount} source{unavailableCount > 1 ? "s sont" : " est"} temporairement indisponible{unavailableCount > 1 ? "s" : ""}. Les autres actualités restent consultables.</p>}

          {feed.isLoading ? <div className="flex min-h-72 items-center justify-center gap-3 text-slate-600"><Loader2 className="animate-spin" /> Lecture des sources AI News…</div> : articles.length ? <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{articles.map((article) => <article key={article.id} className="group flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"><div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-bold text-slate-700">{sourceInitial(article.sourceLabel)}</span><span className="truncate text-sm font-semibold text-slate-700">{article.sourceLabel}</span></div><span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-800">{article.sourceCategory}</span></div><h2 className="mt-5 text-lg font-bold leading-6 text-slate-950"><a href={article.url} target="_blank" rel="noopener noreferrer" className="outline-none hover:text-blue-800 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-blue-700">{article.title}<span className="sr-only"> — ouvre la source dans un nouvel onglet</span></a></h2><p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">{article.excerpt || "Consultez l’article original pour en savoir plus."}</p><div className="mt-5 flex items-end justify-between gap-3 border-t border-slate-100 pt-4"><div className="min-w-0"><p className="flex items-center gap-1.5 text-xs text-slate-500"><Clock3 size={13} />{formatDate(article.publishedAt)}</p>{article.topics.length > 0 && <p className="mt-2 truncate text-xs text-slate-500">{article.topics.join(" · ")}</p>}</div><a href={article.url} target="_blank" rel="noopener noreferrer" aria-label={`Lire ${article.title} sur ${article.sourceLabel}`} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"><ArrowUpRight size={17} /></a></div></article>)}</div> : <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center"><Newspaper size={34} className="text-slate-400" /><h2 className="mt-4 text-lg font-bold text-slate-900">Aucun article ne correspond à cette recherche.</h2><p className="mt-2 max-w-md text-sm text-slate-600">Essayez un autre mot-clé ou réinitialisez les filtres pour consulter toutes les sources.</p><Button type="button" variant="outline" className="mt-5" onClick={() => { setQuery(""); setSourceFilter("all"); setCategoryFilter("all"); }}>Réinitialiser les filtres</Button></div>}
        </section>

        <section className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8"><div><div className="flex items-center gap-2 text-sm font-bold text-slate-900"><BookOpen size={18} /> À propos des sources</div><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">AI News présente titres, extraits limités et liens issus de flux publics. Les prépublications arXiv n’ont pas nécessairement fait l’objet d’une évaluation par les pairs.</p></div><Link href="/training" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Explorer les formations <ExternalLink size={15} /></Link></div></section>
      </main>
    </div>
  );
}
