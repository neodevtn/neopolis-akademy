import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { BriefcaseBusiness, CalendarDays, CheckCircle2, Clock3, ExternalLink, Loader2, MapPin, Target, UserRoundSearch, Video } from "lucide-react";
import { toast } from "sonner";

const EVENT_LABELS = { interview: "Entretien", evaluation: "Évaluation", certification_test: "Test de certification", certification_review: "Revue de certification", onboarding: "Intégration", follow_up: "Suivi", other: "Autre" } as const;
const MODALITY_LABELS = { video: "Visio", in_person: "Présentiel", phone: "Téléphone", platform: "Plateforme", external: "Externe", other: "Autre" } as const;
const ASSIGNMENT_LABELS = { workgroup: "Groupe de travail", mission: "Mission", opportunity: "Opportunité", recruitment: "Recrutement", ambassador: "Ambassadeur", partnership: "Partenariat" } as const;
const RECOMMENDATION_LABELS = { continue: "Poursuivre", develop: "Développer", certify: "Préparer une certification", assign: "Rejoindre une activité", recruit: "Recrutement envisagé", ambassador: "Parcours ambassadeur", hold: "Mise en attente", decline: "Parcours non poursuivi" } as const;

function localized(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return String(record.fr || record.en || record.ar || "");
  }
  return "";
}

function dateLabel(value: unknown) {
  if (!value) return "Date à confirmer";
  const date = new Date(value as string | number | Date);
  return Number.isNaN(date.getTime()) ? "Date à confirmer" : date.toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" });
}

export function TalentJourneyTab() {
  const journey = trpc.talent.getMine.useQuery();
  const [responseEventId, setResponseEventId] = useState<number | null>(null);
  const [responseType, setResponseType] = useState<"accepted" | "declined" | "reschedule_requested">("accepted");
  const [note, setNote] = useState("");
  const respondMutation = trpc.talent.respondToEvent.useMutation({
    onSuccess: async () => { toast.success("Votre réponse a été transmise"); setResponseEventId(null); setNote(""); await journey.refetch(); },
    onError: (error) => toast.error(error.message || "Impossible de transmettre votre réponse"),
  });

  if (journey.isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  if (!journey.data?.profile) return <section className="rounded-2xl border border-border bg-card p-8 text-center"><UserRoundSearch className="mx-auto h-10 w-10 text-muted-foreground" /><h2 className="mt-4 text-xl font-semibold">Votre parcours d’évolution sera bientôt disponible</h2><p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">Lorsque l’équipe vous proposera un entretien, une évaluation, une certification, un groupe de travail ou une opportunité, vous la retrouverez ici.</p></section>;

  const { profile, stage, events, assignments, evaluations } = journey.data;
  const actionableEvents = events.filter((event) => !["completed", "cancelled", "missed"].includes(event.status));

  return <div className="space-y-6">
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border p-6"><p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Parcours professionnel</p><div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-2xl font-semibold text-foreground">{localized(stage?.label) || "Suivi en cours"}</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">{localized(stage?.description) || profile.headline || "L’équipe Neopolis suit votre évolution et vous informera des prochaines étapes."}</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold" style={{ backgroundColor: `${stage?.color || "#2563eb"}18`, color: stage?.color || "#2563eb" }}><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage?.color || "#2563eb" }} />Étape actuelle</span></div></div>
      <div className="grid grid-cols-3 divide-x divide-border py-4 text-center"><div><p className="text-2xl font-semibold">{actionableEvents.length}</p><p className="text-xs text-muted-foreground">Rendez-vous</p></div><div><p className="text-2xl font-semibold">{assignments.filter((item) => ["proposed", "active"].includes(item.status)).length}</p><p className="text-xs text-muted-foreground">Opportunités</p></div><div><p className="text-2xl font-semibold">{evaluations.length}</p><p className="text-xs text-muted-foreground">Évaluations</p></div></div>
    </section>

    <section><div className="mb-4 flex items-center gap-3"><CalendarDays className="h-5 w-5 text-primary" /><div><h2 className="text-lg font-semibold">Convocations et rendez-vous</h2><p className="text-sm text-muted-foreground">Répondez aux demandes de l’équipe ou proposez une replanification.</p></div></div>{events.length ? <div className="space-y-3">{events.map((event) => <article key={event.id} className="rounded-xl border border-border bg-card p-5"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{EVENT_LABELS[event.type]}</Badge><Badge variant="outline">{MODALITY_LABELS[event.modality]}</Badge>{event.responseStatus !== "pending" && <Badge>{event.responseStatus === "accepted" ? "Accepté" : event.responseStatus === "declined" ? "Refusé" : "Replanification demandée"}</Badge>}</div><h3 className="mt-3 text-lg font-semibold">{event.title}</h3><p className="mt-1 text-sm text-muted-foreground">{event.description}</p><div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2"><span className="flex items-center gap-2"><Clock3 className="h-4 w-4" />{dateLabel(event.startsAt)}</span>{event.location && <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{event.location}</span>}</div>{event.learnerInstructions && <p className="mt-4 rounded-lg bg-secondary/60 p-3 text-sm">{event.learnerInstructions}</p>}{event.meetingUrl && event.responseStatus === "accepted" && <a href={event.meetingUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><Video className="h-4 w-4" />Ouvrir le lien de réunion<ExternalLink className="h-3.5 w-3.5" /></a>}</div>{!["completed", "cancelled", "missed"].includes(event.status) && <div className="flex shrink-0 flex-wrap gap-2"><Button size="sm" onClick={() => { setResponseEventId(event.id); setResponseType("accepted"); }}>Accepter</Button><Button size="sm" variant="outline" onClick={() => { setResponseEventId(event.id); setResponseType("reschedule_requested"); }}>Replanifier</Button><Button size="sm" variant="ghost" onClick={() => { setResponseEventId(event.id); setResponseType("declined"); }}>Refuser</Button></div>}</div></article>)}</div> : <EmptyState icon={<CalendarDays className="h-7 w-7" />} text="Aucune convocation pour le moment." />}</section>

    <section><div className="mb-4 flex items-center gap-3"><BriefcaseBusiness className="h-5 w-5 text-primary" /><div><h2 className="text-lg font-semibold">Affectations et opportunités</h2><p className="text-sm text-muted-foreground">Groupes de travail, missions, recrutement ou rôle d’ambassadeur.</p></div></div>{assignments.length ? <div className="grid gap-4 md:grid-cols-2">{assignments.map((assignment) => <article key={assignment.id} className="rounded-xl border border-border bg-card p-5"><div className="flex items-center justify-between gap-3"><Badge variant="secondary">{ASSIGNMENT_LABELS[assignment.kind]}</Badge><Badge variant="outline">{assignment.status}</Badge></div><h3 className="mt-3 font-semibold">{assignment.title}</h3><p className="mt-2 text-sm text-muted-foreground">{assignment.description || "Les détails seront précisés par l’équipe."}</p>{(assignment.startsAt || assignment.endsAt) && <p className="mt-4 text-xs text-muted-foreground">{assignment.startsAt ? new Date(assignment.startsAt).toLocaleDateString("fr-FR") : "À définir"} — {assignment.endsAt ? new Date(assignment.endsAt).toLocaleDateString("fr-FR") : "durée ouverte"}</p>}</article>)}</div> : <EmptyState icon={<BriefcaseBusiness className="h-7 w-7" />} text="Aucune affectation ou opportunité active." />}</section>

    <section><div className="mb-4 flex items-center gap-3"><Target className="h-5 w-5 text-primary" /><div><h2 className="text-lg font-semibold">Retours d’évaluation</h2><p className="text-sm text-muted-foreground">Seuls les retours que l’évaluateur a choisi de partager apparaissent ici.</p></div></div>{evaluations.length ? <div className="space-y-3">{evaluations.map((evaluation) => <article key={evaluation.id} className="rounded-xl border border-border bg-card p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{evaluation.evaluationType}</p><p className="text-xs text-muted-foreground">{new Date(evaluation.createdAt).toLocaleDateString("fr-FR")}</p></div><Badge>{RECOMMENDATION_LABELS[evaluation.recommendation]}</Badge></div>{evaluation.score && <p className="mt-3 text-sm font-semibold">Résultat : {evaluation.score}/{evaluation.maxScore || "—"}</p>}{evaluation.learnerFeedback && <p className="mt-3 text-sm text-muted-foreground">{evaluation.learnerFeedback}</p>}{evaluation.strengths && <p className="mt-3 text-sm"><strong>Points forts :</strong> {evaluation.strengths}</p>}{evaluation.improvements && <p className="mt-2 text-sm"><strong>Axes de progrès :</strong> {evaluation.improvements}</p>}</article>)}</div> : <EmptyState icon={<CheckCircle2 className="h-7 w-7" />} text="Aucun retour d’évaluation partagé." />}</section>

    <Dialog open={responseEventId !== null} onOpenChange={(open) => !open && setResponseEventId(null)}><DialogContent><DialogHeader><DialogTitle>{responseType === "accepted" ? "Confirmer votre présence" : responseType === "declined" ? "Refuser la demande" : "Demander une replanification"}</DialogTitle><DialogDescription>Votre réponse sera transmise à l’équipe et enregistrée dans votre dossier.</DialogDescription></DialogHeader><Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder={responseType === "reschedule_requested" ? "Indiquez vos disponibilités…" : "Ajouter un commentaire facultatif…"} /><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setResponseEventId(null)}>Annuler</Button><Button disabled={respondMutation.isPending} onClick={() => responseEventId && respondMutation.mutate({ eventId: responseEventId, responseStatus: responseType, note: note.trim() || undefined })}>{respondMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Transmettre</Button></div></DialogContent></Dialog>
  </div>;
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-muted-foreground"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">{icon}</span><p className="mt-3 text-sm">{text}</p></div>;
}
