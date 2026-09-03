import { useEffect } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { ArrowRight, BarChart3, BookOpen, BrainCircuit, CheckCircle2, ChevronLeft, PlayCircle, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getPublicTrainingCatalogMetrics,
  getPublicTrainingTheme,
  getPublicTrainingThemes,
  type PublicTrainingMetrics,
} from "@shared/publicTrainingThemes";

const accentClass = {
  blue: "bg-blue-600",
  violet: "bg-violet-600",
  emerald: "bg-emerald-600",
  amber: "bg-amber-600",
  rose: "bg-rose-600",
};

function Metric({ value, label }: { value: number; label: string }) {
  return <Card className="border-border/80 shadow-none"><CardContent className="p-4"><div className="text-2xl font-bold tracking-tight text-primary">{value.toLocaleString("fr-FR")}</div><div className="mt-1 text-xs font-medium text-muted-foreground">{label}</div></CardContent></Card>;
}

function MetricGrid({ metrics }: { metrics: PublicTrainingMetrics }) {
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-5"><Metric value={metrics.certificationCount} label="parcours" /><Metric value={metrics.courseCount} label="cours" /><Metric value={metrics.activityCount} label="activités" /><Metric value={metrics.exerciseCount} label="exercices" /><Metric value={metrics.videoCount} label="vidéos" /></div>;
}

function PublicHeader() {
  return <header className="border-b border-border bg-background"><div className="container flex min-h-16 items-center justify-between gap-3 py-3"><Link href="/" className="flex min-w-0 items-center"><BrandLogo className="h-8 max-w-[180px]" /></Link><nav className="flex items-center gap-1 text-sm font-medium"><Link href="/formations-ia" className="rounded-md px-2.5 py-2 text-foreground hover:bg-muted">Formations IA</Link><Link href="/ai-news" className="hidden rounded-md px-2.5 py-2 text-muted-foreground hover:bg-muted sm:block">AI News</Link><Link href="/login" className="rounded-md px-2.5 py-2 text-muted-foreground hover:bg-muted">Se connecter</Link></nav></div></header>;
}

function PublicHero({ title, description }: { title: string; description: string }) {
  return <section className="bg-gradient-to-br from-[#0c1f3e] via-[#173f7b] to-[#237c93] text-white"><div className="container py-14 md:py-18"><p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-blue-200">Neopolis Akademy · Formations IA gratuites</p><h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-5xl">{title}</h1><p className="mt-5 max-w-3xl text-base leading-7 text-blue-50 md:text-lg">{description}</p><div className="mt-7 flex flex-wrap gap-3"><Button asChild variant="secondary"><Link href="/training?tab=catalog">Voir le catalogue <ArrowRight className="ml-2 h-4 w-4" /></Link></Button><Button asChild variant="outline" className="border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white"><Link href="/apply">Découvrir l’accès</Link></Button></div></div></section>;
}

export default function PublicTrainingThemes() {
  const [match, params] = useRoute("/formations-ia/:themeSlug");
  const [location] = useLocation();
  const theme = match ? getPublicTrainingTheme(params?.themeSlug || "") : null;
  const metrics = getPublicTrainingCatalogMetrics();
  const themes = getPublicTrainingThemes();
  useEffect(() => {
    document.title = theme ? `${theme.title} | Neopolis Akademy` : "Formations IA gratuites par métier | Neopolis Akademy";
  }, [theme]);

  if (match && !theme) {
    return <><PublicHeader /><main className="container py-20"><Button asChild variant="ghost" className="mb-5"><Link href="/formations-ia"><ChevronLeft className="mr-1 h-4 w-4" /> Toutes les formations IA</Link></Button><h1 className="text-3xl font-bold">Thème de formation introuvable</h1><p className="mt-3 max-w-xl text-muted-foreground">La page demandée n’existe pas ou n’est plus disponible.</p></main></>;
  }

  if (!theme) {
    return <><PublicHeader /><PublicHero title="Formations IA gratuites par métier" description="Explorez l’offre Neopolis Akademy par domaine d’activité : compétences, exercices, vidéos et formations disponibles sur la plateforme." /><main className="container py-10 md:py-14"><section><h2 className="text-2xl font-bold tracking-tight text-foreground">Une offre structurée autour des usages professionnels</h2><p className="mt-3 max-w-3xl text-muted-foreground">Choisissez un thème correspondant à votre métier ou à l’objectif que vous souhaitez développer. Ces indicateurs décrivent l’offre déclarée dans le catalogue Neopolis Akademy.</p><div className="mt-7"><MetricGrid metrics={metrics} /></div></section><section className="mt-14"><h2 className="text-2xl font-bold tracking-tight text-foreground">Choisir une formation IA par métier</h2><p className="mt-3 max-w-3xl text-muted-foreground">Chaque page rassemble les formations rattachées à un thème précis, leurs indicateurs réels et les métiers visés.</p><div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{themes.map((item) => <Link key={item.slug} href={`/formations-ia/${item.slug}`} className="group"><Card className="h-full border-border/80 transition-colors group-hover:border-primary/40"><CardContent className="p-5"><span className={`mb-5 block h-1 w-11 rounded-full ${accentClass[item.accent]}`} /><h3 className="text-lg font-bold text-foreground">{item.shortTitle}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p><p className="mt-5 flex items-center gap-1 text-sm font-semibold text-primary">{item.metrics.certificationCount} parcours · {item.metrics.courseCount} cours <ArrowRight className="ml-1 h-4 w-4" /></p></CardContent></Card></Link>)}</div></section><section className="mt-14 rounded-xl border border-teal-200 bg-teal-50 p-6 text-teal-950"><div className="flex gap-3"><BrainCircuit className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" /><div><h2 className="text-lg font-bold">Pourquoi développer des compétences IA ?</h2><p className="mt-2 max-w-4xl text-sm leading-6">L’OCDE indique que son enquête 2024 auprès de plus de 5 000 PME a observé un usage de l’IA générative dans 31 % des entreprises interrogées ; 65 % des PME utilisatrices rapportaient une amélioration de la performance des salariés. Ce contexte ne constitue pas une promesse de résultat : il souligne l’intérêt d’un apprentissage structuré, adapté au métier et à l’organisation. <a className="font-semibold underline" href="https://www.oecd.org/en/publications/generative-ai-and-the-sme-workforce_2d08b99d-en.html" target="_blank" rel="noreferrer">Consulter la publication de l’OCDE</a>.</p></div></div></section></main></>;
  }

  const maximum = Math.max(...theme.certifications.map((item) => item.metrics.activityCount), 1);
  return <><PublicHeader /><PublicHero title={theme.title} description={theme.description} /><main className="container py-10 md:py-14"><Button asChild variant="ghost" className="mb-6"><Link href="/formations-ia"><ChevronLeft className="mr-1 h-4 w-4" /> Toutes les formations IA</Link></Button><section><h2 className="text-2xl font-bold tracking-tight text-foreground">Développer les compétences utiles pour ce domaine</h2><p className="mt-3 max-w-3xl text-muted-foreground">{theme.introduction}</p><div className="mt-7"><MetricGrid metrics={theme.metrics} /></div></section><div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_.85fr]"><Card className="border-border/80"><CardContent className="p-5 md:p-6"><div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /><h2 className="text-lg font-bold">Répartition des activités par formation</h2></div><p className="mt-2 text-sm text-muted-foreground">La visualisation représente les activités déclarées dans l’offre Neopolis Akademy de ce thème.</p><div className="mt-6 space-y-4">{theme.certifications.map((item) => <div key={item.id}><div className="flex items-start justify-between gap-3 text-sm font-medium"><span className="text-foreground">{item.title}</span><span className="shrink-0 text-muted-foreground">{item.metrics.activityCount}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-to-r from-primary to-teal-500" style={{ width: `${Math.max(4, Math.round((item.metrics.activityCount / maximum) * 100))}%` }} aria-label={`${item.title} : ${item.metrics.activityCount} activités`} /></div></div>)}</div></CardContent></Card><Card className="border-border/80"><CardContent className="p-5 md:p-6"><div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /><h2 className="text-lg font-bold">Métiers et compétences associés</h2></div><h3 className="mt-5 text-sm font-bold">Métiers cibles</h3><div className="mt-3 flex flex-wrap gap-2">{(theme.roles.length ? theme.roles : ["Parcours transversal"]).slice(0, 14).map((item) => <span key={item} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{item}</span>)}</div><h3 className="mt-6 text-sm font-bold">Compétences abordées</h3><div className="mt-3 flex flex-wrap gap-2">{(theme.skills.length ? theme.skills : ["Compétences IA appliquées"]).slice(0, 14).map((item) => <span key={item} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{item}</span>)}</div></CardContent></Card></div><section className="mt-12"><h2 className="text-2xl font-bold tracking-tight text-foreground">Formations disponibles dans ce thème</h2><p className="mt-3 max-w-3xl text-muted-foreground">Accédez au catalogue pour consulter le détail des cours, les conditions d’accès et votre progression personnelle.</p><div className="mt-7 grid gap-4 md:grid-cols-2">{theme.certifications.map((item) => <Link key={item.id} href={`/training/${item.id}`} className="group"><Card className="h-full border-border/80 transition-colors group-hover:border-primary/40"><CardContent className="p-5"><div className="flex items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10">{item.icon}</div><div><h3 className="font-bold text-foreground">{item.title}</h3><p className="mt-1 text-sm text-muted-foreground">{item.trainingFormat} · {item.level}</p></div></div><p className="mt-4 text-sm leading-6 text-muted-foreground">{item.description}</p><div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground"><span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {item.metrics.courseCount} cours</span><span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> {item.metrics.exerciseCount} exercices</span><span className="inline-flex items-center gap-1"><PlayCircle className="h-3.5 w-3.5" /> {item.metrics.videoCount} vidéos</span></div></CardContent></Card></Link>)}</div></section></main></>;
}
