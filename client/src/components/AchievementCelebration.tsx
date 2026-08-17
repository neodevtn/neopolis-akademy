import { useEffect, useState } from "react";
import { Award, Download, Sparkles, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type Achievement = { id: number; kind: "skill_badge" | "certification"; title: string; description?: string | null; credentialCode: string };

export function announceAchievement(achievement: Achievement) {
  window.dispatchEvent(new CustomEvent("neopolis:achievement-earned", { detail: achievement }));
}

export function AchievementCelebration() {
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  useEffect(() => {
    const onEarned = (event: Event) => setAchievement((event as CustomEvent<Achievement>).detail);
    window.addEventListener("neopolis:achievement-earned", onEarned);
    return () => window.removeEventListener("neopolis:achievement-earned", onEarned);
  }, []);
  const isCertification = achievement?.kind === "certification";
  return <Dialog open={Boolean(achievement)} onOpenChange={(open) => !open && setAchievement(null)}>
    <DialogContent className="max-w-lg overflow-hidden border-0 p-0 text-center">
      <div className="relative bg-gradient-to-br from-[#102d56] via-[#16406f] to-[#0f6b61] px-8 pb-12 pt-10 text-white">
        <button className="absolute right-4 top-4 rounded-full p-2 text-white/80 hover:bg-white/10" onClick={() => setAchievement(null)} aria-label="Fermer"><X className="h-4 w-4" /></button>
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#e1b16a] bg-white/15 shadow-2xl"><Sparkles className="h-10 w-10 text-[#ffe5ae]" /></div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#ffe5ae]">Bravo, vous avez réussi</p>
        <h2 className="mt-2 text-3xl font-bold">{isCertification ? "Certification obtenue" : "Compétence validée"}</h2>
      </div>
      <div className="-mt-6 px-8 pb-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">{isCertification ? <Trophy className="h-5 w-5" /> : <Award className="h-5 w-5" />}</div>
          <h3 className="text-lg font-bold text-slate-900">{achievement?.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{achievement?.description}</p>
          <p className="mt-3 text-xs font-medium text-slate-400">Référence : {achievement?.credentialCode}</p>
        </div>
        <p className="mt-5 text-sm text-slate-600">Votre diplôme officiel Neopolis Development a été envoyé par e-mail et peut être téléchargé à tout moment.</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center"><Button onClick={() => window.open(`/api/achievement-certificate/${achievement?.id}`, "_blank")} className="bg-[#12315b] hover:bg-[#0f2748]"><Download className="mr-2 h-4 w-4" /> Télécharger le diplôme</Button><Button variant="outline" onClick={() => setAchievement(null)}>Continuer mon parcours</Button></div>
      </div>
    </DialogContent>
  </Dialog>;
}
