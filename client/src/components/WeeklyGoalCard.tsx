import { CheckCircle2, Flame, Sparkles, Target } from "lucide-react";

export function WeeklyGoalCard({ gamification }: { gamification: any }) {
  if (!gamification?.settings) return null;
  const weekly = gamification.weekly;
  const percent = Math.min(100, weekly.target > 0 ? (weekly.points / weekly.target) * 100 : 0);
  return <section className="rounded-2xl border border-primary/20 bg-primary/[0.035] p-5 shadow-sm">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3"><div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${weekly.reached ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground"}`}>{weekly.reached ? <CheckCircle2 className="h-5 w-5" /> : <Target className="h-5 w-5" />}</div><div><p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">Objectif de la semaine {weekly.reached && <Sparkles className="h-4 w-4 text-amber-500 motion-safe:animate-pulse" aria-label="Objectif atteint" />}</p><p className="mt-0.5 text-xs text-muted-foreground">{weekly.reached ? "Objectif atteint : continuez à consolider vos compétences." : `${weekly.remaining.toFixed(1)} point${weekly.remaining !== 1 ? "s" : ""} restant${weekly.remaining !== 1 ? "s" : ""} pour atteindre votre objectif.`}</p></div></div>
      <div className="flex items-center gap-2 self-start rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-foreground"><Flame className="h-4 w-4 text-amber-500" />{weekly.points.toFixed(1)} / {weekly.target.toFixed(1)} pts</div>
    </div>
    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-primary/10" aria-label={`${weekly.points.toFixed(1)} points sur ${weekly.target.toFixed(1)} cette semaine`}><div className={`h-full rounded-full motion-safe:transition-[width] motion-safe:duration-300 ${weekly.reached ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${percent}%` }} /></div>
    <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{gamification.settings.rewardNotice}</p>
  </section>;
}
