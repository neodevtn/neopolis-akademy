import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import trainingIndex from "@/data/trainingIndex.json";

export function DirectExamInvitationManager() {
  const { t, lang } = useLanguage();
  const label = (fr: string, en: string) => t({ fr, en });
  const configurations = trpc.adminContent.getExamConfigurations.useQuery();
  const publishedCertificationIds = Object.entries(configurations.data || {}).filter(([, exam]) => exam.isPublished).map(([id]) => id);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [certificationId, setCertificationId] = useState("");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [manualLink, setManualLink] = useState("");
  const list = trpc.directExams.list.useQuery({ offset: page * 20, limit: 20, search: search.trim() || undefined });
  const create = trpc.directExams.create.useMutation({
    onSuccess: (result) => {
      list.refetch();
      setEmail("");
      setName("");
      if (result.delivered) { toast.success(label("Invitation envoyée par e-mail.", "Invitation emailed.")); setManualLink(""); }
      else { toast.warning(label("Invitation créée, mais courriel non livré. Copiez le lien privé pour le transmettre au destinataire.", "Invitation created, but the email was not delivered. Copy the private link for the recipient.")); setManualLink(result.url); }
    },
    onError: (error) => toast.error(error.message),
  });
  const revoke = trpc.directExams.revoke.useMutation({
    onSuccess: () => { list.refetch(); toast.success(label("Accès révoqué.", "Access revoked.")); },
    onError: (error) => toast.error(error.message),
  });

  return <Card className="mb-6">
    <CardHeader><CardTitle>{label("Inviter directement à un examen", "Direct exam invitation")}</CardTitle>
      <p className="text-sm text-muted-foreground">{label("Pour un apprenant existant ou un nouvel invité. L’examen s’ouvre sans parcourir les cours ; le compte invité est créé comme apprenant avec un profil complet. L’invitation n’expire pas, mais reste révocable.", "For an existing learner or a new guest. The exam opens without course completion; guests create a learner account and complete their profile. The invitation does not expire but can be revoked.")}</p>
    </CardHeader>
    <CardContent className="space-y-6">
      {configurations.isError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{label("Impossible de charger les examens publiés. Réessayez plus tard.", "Could not load published exams. Please try again later.")}</p>}
      {!configurations.isLoading && !configurations.isError && !publishedCertificationIds.length && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{label("Aucun examen n’est publié. Publiez d’abord un examen dans Pédagogie > Examens de certification.", "No exam is published. Publish an exam under Learning > Certification exams first.")}</p>}
      <form className="grid gap-3 md:grid-cols-[1fr_1fr_1.3fr_auto] md:items-end" onSubmit={(event) => { event.preventDefault(); setManualLink(""); create.mutate({ email: email.trim(), name: name.trim() || undefined, certificationId, origin: window.location.origin, language: lang === "en" ? "en" : "fr" }); }}>
        <div className="space-y-1"><Label htmlFor="direct-exam-email">{label("E-mail du destinataire", "Recipient email")}</Label><Input id="direct-exam-email" type="email" autoComplete="off" required maxLength={320} value={email} onChange={(event) => setEmail(event.target.value)} /></div>
        <div className="space-y-1"><Label htmlFor="direct-exam-name">{label("Nom (facultatif)", "Name (optional)")}</Label><Input id="direct-exam-name" maxLength={200} value={name} onChange={(event) => setName(event.target.value)} /></div>
        <div className="space-y-1"><Label htmlFor="direct-exam-cert">{label("Examen publié", "Published exam")}</Label><Select value={certificationId} onValueChange={setCertificationId} disabled={configurations.isLoading || !publishedCertificationIds.length}><SelectTrigger id="direct-exam-cert"><SelectValue placeholder={configurations.isLoading ? label("Chargement des examens…", "Loading exams…") : label("Choisir un examen", "Choose an exam")} /></SelectTrigger><SelectContent>{trainingIndex.certifications.filter((cert) => publishedCertificationIds.includes(cert.id)).map((cert) => <SelectItem key={cert.id} value={cert.id}>{t(cert.title)}</SelectItem>)}</SelectContent></Select></div>
        <Button disabled={create.isPending || !certificationId || !email.trim()} type="submit">{create.isPending ? label("Création…", "Creating…") : label("Envoyer l’invitation", "Send invitation")}</Button>
      </form>
      {manualLink && <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"><p>{label("Courriel non livré : transmettez ce lien uniquement au destinataire nommé.", "Email not delivered: share this link only with the named recipient.")}</p><Button className="mt-2" size="sm" variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(manualLink); toast.success(label("Lien copié.", "Link copied.")); } catch { toast.error(label("Impossible de copier. Vérifiez les permissions du navigateur.", "Could not copy; check browser permissions.")); } }}>{label("Copier le lien privé", "Copy private link")}</Button></div>}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{label("Invitations et accès", "Invitations and access")} ({list.data?.total || 0})</h3><Input className="max-w-xs" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} placeholder={label("Chercher un e-mail ou examen", "Search email or exam")} aria-label={label("Chercher une invitation", "Search invitations")} /></div>
        <div className="overflow-x-auto rounded-lg border"><table className="w-full min-w-[660px] text-left text-sm"><thead className="bg-slate-50 text-muted-foreground"><tr><th className="p-3">{label("Destinataire", "Recipient")}</th><th className="p-3">{label("Examen", "Exam")}</th><th className="p-3">{label("État", "Status")}</th><th className="p-3">{label("Créée le", "Created")}</th><th className="p-3 text-right">{label("Action", "Action")}</th></tr></thead><tbody>{list.data?.rows.map((row) => <tr className="border-t" key={row.id}><td className="p-3"><strong>{row.email}</strong>{row.name && <span className="block text-xs text-muted-foreground">{row.name}</span>}</td><td className="p-3">{trainingIndex.certifications.find((cert) => cert.id === row.certificationId)?.title?.[lang === "en" ? "en" : "fr"] || row.certificationId}</td><td className="p-3">{row.status === "pending" ? label("À accepter", "Pending") : row.status === "accepted" ? label("Accès actif", "Active access") : label("Révoquée", "Revoked")}</td><td className="p-3">{new Date(row.createdAt).toLocaleDateString()}</td><td className="p-3 text-right">{row.status !== "revoked" && <Button size="sm" variant="outline" disabled={revoke.isPending} onClick={() => { if (window.confirm(label("Révoquer l’accès direct à cet examen pour ce destinataire ?", "Revoke direct exam access for this recipient?"))) revoke.mutate({ id: row.id }); }}>{label("Révoquer", "Revoke")}</Button>}</td></tr>)}</tbody></table>{list.isLoading && <p className="p-3 text-sm text-muted-foreground">{label("Chargement…", "Loading…")}</p>}{!list.isLoading && !list.data?.rows.length && <p className="p-3 text-sm text-muted-foreground">{label("Aucune invitation.", "No invitations.")}</p>}</div>
        <div className="flex justify-end gap-2"><Button size="sm" variant="outline" disabled={page === 0 || list.isFetching} onClick={() => setPage(page - 1)}>{label("Précédent", "Previous")}</Button><Button size="sm" variant="outline" disabled={list.isFetching || (page + 1) * 20 >= (list.data?.total || 0)} onClick={() => setPage(page + 1)}>{label("Suivant", "Next")}</Button></div>
      </div>
    </CardContent>
  </Card>;
}
