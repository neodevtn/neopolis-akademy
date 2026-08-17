import { Award, Download, FileCheck2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

type Achievement = {
  id: number;
  kind: "skill_badge" | "certification";
  title: string;
  description?: string | null;
  credentialCode: string;
  issuedAt: Date | string;
  emailedAt?: Date | string | null;
};

export function AchievementGallery({
  achievements,
  canDownload = false,
  adminView = false,
  emptyText = "Aucun badge ou diplôme obtenu pour le moment.",
}: {
  achievements: Achievement[];
  canDownload?: boolean;
  adminView?: boolean;
  emptyText?: string;
}) {
  const badges = achievements.filter((achievement) => achievement.kind === "skill_badge");
  const certificates = achievements.filter((achievement) => achievement.kind === "certification");

  return (
    <section className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><Award className="w-5 h-5 text-primary" /> Badges et diplômes obtenus</h3>
          <p className="mt-1 text-sm text-muted-foreground">{achievements.length} acquis vérifié{achievements.length > 1 ? "s" : ""} {adminView ? "dans le parcours de cet apprenant." : "dans votre parcours."}</p>
        </div>
        {achievements.length > 0 && <span className="self-start rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{badges.length} badge{badges.length > 1 ? "s" : ""} · {certificates.length} diplôme{certificates.length > 1 ? "s" : ""}</span>}
      </div>

      {achievements.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-border bg-secondary/20 px-4 py-7 text-center text-sm text-muted-foreground">{emptyText}</div>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {achievements.map((achievement) => {
            const isCertificate = achievement.kind === "certification";
            const issuedOn = new Date(achievement.issuedAt).toLocaleDateString("fr-FR");
            return <article key={achievement.id} className={`rounded-xl border p-4 ${isCertificate ? "border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/15" : "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/15"}`}>
              <div className="flex gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isCertificate ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"}`}>{isCertificate ? <Trophy className="h-5 w-5" /> : <Award className="h-5 w-5" />}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2"><p className="text-sm font-semibold leading-snug text-foreground">{achievement.title}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${isCertificate ? "bg-amber-200/70 text-amber-800 dark:bg-amber-900/70 dark:text-amber-200" : "bg-emerald-200/70 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200"}`}>{isCertificate ? "Diplôme" : "Badge"}</span></div>
                  {achievement.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{achievement.description}</p>}
                  <p className="mt-2 text-xs text-muted-foreground">Obtenu le {issuedOn}</p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-mono text-muted-foreground"><FileCheck2 className="h-3 w-3" /> {achievement.credentialCode}</p>
                  {adminView && <p className={`mt-2 text-xs font-medium ${achievement.emailedAt ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>{achievement.emailedAt ? `E-mail et PDF envoyés le ${new Date(achievement.emailedAt).toLocaleDateString("fr-FR")}` : "E-mail de notification non encore envoyé"}</p>}
                </div>
                {canDownload && <Button size="icon" variant="outline" className="shrink-0" onClick={() => window.open(`/api/achievement-certificate/${achievement.id}`, "_blank")} aria-label={`Télécharger ${achievement.title}`} title="Télécharger le diplôme PDF"><Download className="h-4 w-4" /></Button>}
              </div>
            </article>;
          })}
        </div>
      )}
    </section>
  );
}
