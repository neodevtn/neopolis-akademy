import { useState } from "react";
import { Award, BadgeCheck, ChevronDown, ChevronUp, CircleDot, Crown, Medal, Sparkles, Sprout } from "lucide-react";
import { COMPETENCY_PATHS } from "@shared/competencyProgression";
import { getNextRank, getRankForLevel, type RankDefinition } from "@shared/gamificationFramework";

type Competency = {
  id: string;
  title: any;
  description?: any;
  category: string;
  color: string;
  level: number;
  rawPoints: number;
  contributionCount: number;
  contributions: Array<{ id: number; points: string | number; sourceType: string; sourceKey: string; awardedAt: Date | string }>;
};

const colors: Record<string, string> = {
  blue: "bg-blue-500", violet: "bg-violet-500", indigo: "bg-indigo-500", cyan: "bg-cyan-500", purple: "bg-purple-500", slate: "bg-slate-500", emerald: "bg-emerald-500", amber: "bg-amber-500", rose: "bg-rose-500",
};
const rankTextColors: Record<string, string> = { slate: "text-slate-600", sky: "text-sky-600", blue: "text-blue-600", emerald: "text-emerald-600", amber: "text-amber-600", yellow: "text-yellow-600", rose: "text-rose-600", violet: "text-violet-600", purple: "text-purple-600" };
const rankIcons: Record<string, any> = { circle: CircleDot, sprout: Sprout, medal: Medal, "badge-check": BadgeCheck, crown: Crown, award: Award };

function textOf(value: any) { return typeof value === "string" ? value : value?.fr || value?.en || "Compétence"; }

export function CompetencyProfile({ competencies, adminView = false, ranks }: { competencies: Competency[]; adminView?: boolean; ranks?: RankDefinition[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const acquired = competencies.filter((competency) => competency.level > 0);
  return <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
      <div><h3 className="flex items-center gap-2 text-lg font-semibold text-foreground"><Sparkles className="h-5 w-5 text-primary" /> Compétences graduées</h3><p className="mt-1 text-sm text-muted-foreground">{adminView ? "Niveaux calculés à partir des contributions vérifiées de cet apprenant." : "Vos niveaux progressent grâce aux cours, évaluations, badges et certifications réussis."}</p></div>
      <span className="self-start rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{acquired.length}/{competencies.length} développée{acquired.length > 1 ? "s" : ""}</span>
    </div>
    <div className="mt-5 grid gap-3 md:grid-cols-2">
      {competencies.map((competency) => {
        const open = expanded === competency.id;
        const rank = getRankForLevel(competency.level, ranks);
        const nextRank = getNextRank(competency.level, ranks);
        const RankIcon = rankIcons[rank?.icon || "award"] || Award;
        const path = COMPETENCY_PATHS[competency.id];
        return <article key={competency.id} className="rounded-xl border border-border bg-background/40 p-4">
          <button className="w-full text-left" onClick={() => setExpanded(open ? null : competency.id)} aria-expanded={open}>
            <div className="flex items-start gap-3"><div className={`mt-1 h-3 w-3 rounded-full ${colors[competency.color] || "bg-primary"}`} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-semibold text-foreground">{textOf(competency.title)}</p><p className="mt-0.5 text-xs text-muted-foreground">{competency.category}</p></div><div className="text-right"><span className="text-lg font-bold text-foreground">{competency.level}<small className="ml-0.5 text-xs font-medium text-muted-foreground">/100</small></span><span className={`mt-1 flex items-center justify-end gap-1 text-[11px] font-semibold ${rankTextColors[rank?.color || ""] || "text-foreground"}`}><RankIcon className="h-3 w-3" /> {rank?.label || "À démarrer"}</span></div></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary"><div className={`h-full rounded-full motion-safe:transition-[width] motion-safe:duration-300 ${colors[competency.color] || "bg-primary"}`} style={{ width: `${competency.level}%` }} /></div><p className="mt-1.5 text-xs text-muted-foreground">{competency.rawPoints.toFixed(1)} point{competency.rawPoints !== 1 ? "s" : ""} · {competency.contributionCount} contribution{competency.contributionCount > 1 ? "s" : ""}{nextRank ? ` · ${Math.max(0, nextRank.minPoints - competency.level).toFixed(1)} pour ${nextRank.label}` : " · Niveau maximal atteint"}</p></div>{open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}</div>
          </button>
          {open && <div className="mt-4 border-t border-border pt-3"><p className="mb-2 text-xs text-muted-foreground">{textOf(competency.description)}</p>{path && !adminView && <a href={`/training/${path.certificationId}`} className="mb-3 block rounded-lg bg-primary/5 px-3 py-2 text-xs text-primary hover:bg-primary/10"><span className="font-semibold">Parcours recommandé : {path.label}</span><span className="mt-0.5 block text-muted-foreground">{path.description}</span></a>}{competency.contributions.length === 0 ? <p className="text-xs italic text-muted-foreground">Aucune contribution validée pour le moment.</p> : <div className="space-y-2">{competency.contributions.slice(0, 6).map((contribution) => <div key={contribution.id} className="flex items-center justify-between gap-3 text-xs"><span className="flex items-center gap-1.5 text-muted-foreground"><BadgeCheck className="h-3.5 w-3.5 text-emerald-600" /> {contribution.sourceType.replaceAll("_", " ")}</span><span className="font-semibold text-emerald-700 dark:text-emerald-400">+{Number(contribution.points).toFixed(1)}</span></div>)}</div>}</div>}
        </article>;
      })}
    </div>
  </section>;
}
