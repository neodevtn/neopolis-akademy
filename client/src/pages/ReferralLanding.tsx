import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, Gift, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

const LOGO_URL = "/api/assets/neopolis-akademy-official-logo_40a16b6c.svg";

function readableIdentifier(value?: string | null) {
  if (!value) return "un parcours Neopolis Akademy";
  const cleaned = value
    .replace(/^(datacamp|neopolis)[_-]/i, "")
    .replace(/__\d+$/, "")
    .replace(/[_-]+/g, " ")
    .trim();
  return cleaned ? cleaned.replace(/\bai\b/gi, "IA").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "un parcours Neopolis Akademy";
}

export default function ReferralLanding() {
  const [, navigate] = useLocation();
  const search = typeof window === "undefined" ? "" : window.location.search;
  const params = new URLSearchParams(search);
  const content = params.get("utm_content") || "academy";
  const sharedTitle = params.get("share_title")?.trim();
  const courseId = params.get("course");
  const [canonicalCourseTitle, setCanonicalCourseTitle] = useState(sharedTitle || readableIdentifier(courseId || params.get("certification")));
  useEffect(() => {
    if (sharedTitle || !/^[a-z0-9_-]+$/i.test(courseId || "")) return;
    const safeCourseId = courseId || "";
    fetch(`/data/courses/${encodeURIComponent(safeCourseId)}.json`)
      .then((response) => response.ok ? response.json() : null)
      .then((course) => {
        const title = typeof course?.sourceCourseTitle === "string" ? course.sourceCourseTitle : (typeof course?.title === "string" ? course.title : (course?.title?.fr || course?.title?.en));
        if (typeof title === "string" && title.trim()) setCanonicalCourseTitle(title.trim());
      })
      .catch(() => undefined);
  }, [courseId, sharedTitle]);
  const trainingTitle = canonicalCourseTitle;
  const applyParams = new URLSearchParams(params);
  applyParams.set("referral_continue", "1");
  const applyUrl = `/apply?${applyParams.toString()}`;
  const isCourse = content === "course";
  const isAchievement = content === "achievement";

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/50 text-foreground">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" aria-label="Accueil Neopolis Akademy"><img src={LOGO_URL} alt="Neopolis Akademy" className="h-9 w-auto" /></Link>
        <Link href="/training" className="text-sm font-medium text-primary hover:underline">Découvrir les formations</Link>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:pt-16">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-semibold text-primary"><Users className="h-4 w-4" /> Recommandation Neopolis Akademy</div>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            {isAchievement ? "Une réussite vous est partagée." : isCourse ? "Une formation vous est recommandée." : "Vous êtes invité à découvrir Neopolis Akademy."}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            {isCourse ? <>Découvrez <strong className="text-slate-900">{trainingTitle}</strong>, un parcours pratique pour développer des compétences mobilisables dans votre métier.</> : <>Un membre de votre réseau vous invite à découvrir des formations pratiques en intelligence artificielle et en transformation numérique.</>}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">Prenez connaissance du parcours avant de commencer votre candidature. Votre lien de recommandation est conservé de manière sécurisée tout au long du formulaire.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => navigate(applyUrl)} className="gap-2"><GraduationCap className="h-4 w-4" /> Commencer ma candidature</Button>
            {isCourse && <Button size="lg" variant="outline" onClick={() => navigate(`/training/${params.get("certification") || ""}`)} className="gap-2"><BookOpen className="h-4 w-4" /> Voir le parcours</Button>}
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-label="Ce que comprend le programme">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Gift className="h-5 w-5" /></span><div><p className="font-semibold">Une invitation, pas une promesse automatique</p><p className="text-sm text-muted-foreground">Les conditions du programme restent transparentes.</p></div></div>
          <ul className="mt-7 space-y-4 text-sm leading-relaxed text-slate-700">
            <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>Des parcours structurés, des mises en pratique et un suivi progressif.</span></li>
            <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>Des compétences et acquis visibles dans votre espace apprenant.</span></li>
            <li className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>La candidature est indépendante ; le parrainage sert uniquement à attribuer l’origine de l’invitation.</span></li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
