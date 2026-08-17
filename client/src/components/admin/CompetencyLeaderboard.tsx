import { useMemo, useState } from "react";
import { ArrowDownUp, Award, ChevronLeft, ChevronRight, Medal, Search, Trophy } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getRankForLevel } from "@shared/gamificationFramework";

function titleOf(value: any) { return typeof value === "string" ? value : value?.fr || value?.en || "Compétence"; }

export function CompetencyLeaderboard() {
  const framework = trpc.competencies.getFramework.useQuery();
  const gamification = trpc.competencies.getGamificationConfig.useQuery();
  const [competencyId, setCompetencyId] = useState("");
  const [sort, setSort] = useState<"level" | "name">("level");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const leaderboard = trpc.competencies.leaderboard.useQuery({ competencyId: competencyId || undefined, limit: 100 });
  const rows = useMemo(() => {
    return [...(leaderboard.data || [])]
      .filter((row) => `${row.name || ""} ${row.email || ""}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const labelA = a.name || a.email || "";
        const labelB = b.name || b.email || "";
        return sort === "name" ? labelA.localeCompare(labelB) : b.level - a.level || labelA.localeCompare(labelB);
      });
  }, [leaderboard.data, search, sort]);
  const pageSize = 15;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const updateCompetency = (value: string) => { setCompetencyId(value); setPage(1); };
  return <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><h2 className="flex items-center gap-2 text-lg font-semibold text-foreground"><Trophy className="h-5 w-5 text-amber-500" /> Classement par compétence</h2><p className="mt-1 text-sm text-muted-foreground">Classement fondé exclusivement sur les contributions vérifiées et les niveaux plafonnés à 100.</p></div><div className="flex flex-wrap gap-2"><label className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><input className="h-9 w-48 rounded-md border border-input bg-background pl-8 pr-3 text-sm" placeholder="Rechercher…" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></label><select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={competencyId} onChange={(event) => updateCompetency(event.target.value)}><option value="">Toutes les compétences</option>{(framework.data?.definitions || []).filter((item: any) => item.active).map((item: any) => <option key={item.id} value={item.id}>{titleOf(item.title)}</option>)}</select><button className="inline-flex h-9 items-center gap-1 rounded-md border border-input px-3 text-sm" onClick={() => setSort(sort === "level" ? "name" : "level")}><ArrowDownUp className="h-3.5 w-3.5" /> {sort === "level" ? "Niveau" : "Nom"}</button></div></div>{leaderboard.isLoading ? <p className="py-8 text-sm text-muted-foreground">Chargement du classement…</p> : rows.length === 0 ? <p className="py-8 text-sm text-muted-foreground">Aucune contribution de compétence n’est encore enregistrée pour ce filtre.</p> : <><div className="mt-5 overflow-x-auto"><table className="w-full text-sm"><thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-2 py-3">Rang</th><th className="px-2 py-3">Apprenant</th><th className="px-2 py-3">Compétence</th><th className="px-2 py-3 text-right">Niveau</th><th className="px-2 py-3 text-right">Statut</th><th className="px-2 py-3 text-right">Gains</th><th className="px-2 py-3 text-right">Action</th></tr></thead><tbody>{visibleRows.map((row, index) => { const rank = getRankForLevel(row.level, gamification.data?.ranks); const position = (currentPage - 1) * pageSize + index + 1; return <tr key={`${row.userId}-${row.competencyId}`} className="border-b border-border/70"><td className="px-2 py-3 font-semibold text-muted-foreground">{position <= 3 ? <Medal className={`h-4 w-4 ${position === 1 ? "text-amber-500" : position === 2 ? "text-slate-500" : "text-orange-700"}`} /> : position}</td><td className="px-2 py-3"><p className="font-medium text-foreground">{row.name || "Apprenant"}</p><p className="text-xs text-muted-foreground">{row.email}</p></td><td className="px-2 py-3 text-muted-foreground">{titleOf(row.title)}</td><td className="px-2 py-3 text-right font-bold text-foreground">{row.level}/100</td><td className="px-2 py-3 text-right"><span className="rounded-full bg-secondary px-2 py-1 text-xs font-semibold text-foreground"><Award className="mr-1 inline h-3 w-3" />{rank?.label || "À démarrer"}</span></td><td className="px-2 py-3 text-right text-muted-foreground">{row.contributionCount}</td><td className="px-2 py-3 text-right"><a className="text-xs font-semibold text-primary hover:underline" href={`/admin/training?tab=learners&learner=${row.userId}`}>Voir le profil</a></td></tr>; })}</tbody></table></div><div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span>{rows.length} ligne{rows.length > 1 ? "s" : ""} · page {currentPage}/{pageCount}</span><div className="flex gap-1"><button className="inline-flex h-8 w-8 items-center justify-center rounded border border-input disabled:opacity-40" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></button><button className="inline-flex h-8 w-8 items-center justify-center rounded border border-input disabled:opacity-40" onClick={() => setPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage === pageCount}><ChevronRight className="h-4 w-4" /></button></div></div></>}</section>;
}
