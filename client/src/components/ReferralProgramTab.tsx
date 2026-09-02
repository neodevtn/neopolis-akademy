import { Gift, Link2, Mail, MessageCircle, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { ReferralShareCard } from "@/components/ReferralShareCard";
import { trpc } from "@/lib/trpc";

type Copy = (value: { en: string; fr: string }) => string;

export function ReferralProgramTab({ t }: { t: Copy }) {
  const referralQuery = trpc.referral.getMine.useQuery();
  const program = referralQuery.data;
  const campaign = program?.campaign;
  const counts = program?.counts;
  const totalShared = (counts?.pending || 0) + (counts?.eligible || 0) + (counts?.rewarded || 0) + (counts?.rejected || 0);

  if (referralQuery.isLoading) {
    return <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">{t({ en: "Loading your referral programme…", fr: "Chargement de votre programme de parrainage…" })}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-amber-500/10 p-5 sm:p-8">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"><Sparkles className="h-3.5 w-3.5" />{t({ en: "Referral programme", fr: "Programme de parrainage" })}</div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t({ en: "Share a learning opportunity with your network", fr: "Partagez une opportunité d’apprentissage avec votre réseau" })}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{t({ en: "Your personal link records the origin of a candidate. When the campaign conditions are met and validated, the announced rewards can be granted.", fr: "Votre lien personnel trace l’origine d’une candidature. Lorsque les conditions de campagne sont réunies et validées, les récompenses annoncées peuvent être attribuées." })}</p>
            {!campaign || campaign.active !== 1 ? <p className="mt-4 rounded-lg bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-800 dark:text-amber-300">{t({ en: "The referral programme is temporarily unavailable.", fr: "Le programme de parrainage est temporairement indisponible." })}</p> : null}
          </div>
          <div className="relative mx-auto grid h-48 w-full max-w-[280px] place-items-center overflow-hidden rounded-2xl border border-primary/15 bg-card/85 sm:h-52">
            <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-primary/15" /><div className="absolute -bottom-8 -right-5 h-32 w-32 rounded-full bg-amber-400/20" />
            <div className="relative grid h-24 w-24 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg"><Gift className="h-10 w-10" /><span className="mt-1 text-[10px] font-bold uppercase tracking-wider">Neopolis</span></div>
            <div className="absolute left-7 top-9 grid h-9 w-9 place-items-center rounded-full border border-border bg-background text-primary"><UsersRound className="h-4 w-4" /></div>
            <div className="absolute bottom-7 right-7 grid h-9 w-9 place-items-center rounded-full border border-border bg-background text-amber-600"><Sparkles className="h-4 w-4" /></div>
          </div>
        </div>
      </section>

      {campaign ? <section className="grid gap-3 md:grid-cols-2"><div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-5"><Gift className="h-5 w-5 text-amber-600" /><p className="mt-3 text-sm font-semibold text-foreground">{t({ en: "Reward announced", fr: "Récompense annoncée" })}</p><p className="mt-1 text-sm text-muted-foreground">{campaign.tokenRewardLabel}</p></div><div className="rounded-xl border border-primary/20 bg-primary/5 p-5"><Gift className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-semibold text-foreground">{t({ en: "Gift announced", fr: "Cadeau annoncé" })}</p><p className="mt-1 text-sm text-muted-foreground">{campaign.giftRewardLabel}</p></div></section> : null}

      <ReferralShareCard title={t({ en: "Your personal referral link", fr: "Votre lien personnel de parrainage" })} />

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5"><Link2 className="h-5 w-5 text-primary" /><h3 className="mt-3 font-semibold text-foreground">{t({ en: "1. Copy your link", fr: "1. Copiez votre lien" })}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{t({ en: "Use the copy button to keep your unique, tracked link.", fr: "Utilisez le bouton Copier pour conserver votre lien unique et traçable." })}</p></div>
        <div className="rounded-xl border border-border bg-card p-5"><MessageCircle className="h-5 w-5 text-primary" /><h3 className="mt-3 font-semibold text-foreground">{t({ en: "2. Send it instantly", fr: "2. Envoyez-le instantanément" })}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{t({ en: "Share via WhatsApp, Messenger or your usual instant messaging app.", fr: "Partagez via WhatsApp, Messenger ou votre messagerie instantanée habituelle." })}</p></div>
        <div className="rounded-xl border border-border bg-card p-5"><Mail className="h-5 w-5 text-primary" /><h3 className="mt-3 font-semibold text-foreground">{t({ en: "3. Or send an email", fr: "3. Ou envoyez un e-mail" })}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{t({ en: "The Email button opens a prefilled message; you choose the recipients.", fr: "Le bouton E-mail ouvre un message prérempli ; vous choisissez les destinataires." })}</p></div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /><h3 className="font-semibold text-foreground">{t({ en: "Your referral follow-up", fr: "Le suivi de vos parrainages" })}</h3></div><p className="mt-1 text-sm text-muted-foreground">{campaign?.eligibilityText || t({ en: "Campaign eligibility is verified by the Neopolis Akademy team.", fr: "L’éligibilité est vérifiée par l’équipe Neopolis Akademy." })}</p></div><div className="rounded-lg bg-secondary px-4 py-3 text-sm text-muted-foreground"><strong className="text-lg text-foreground">{totalShared}</strong> {t({ en: "candidate(s) linked to your code", fr: "candidature(s) liée(s) à votre code" })}</div></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Status count={counts?.pending || 0} label={t({ en: "Under review", fr: "À examiner" })} /><Status count={counts?.eligible || 0} label={t({ en: "Eligible", fr: "Éligibles" })} /><Status count={counts?.rewarded || 0} label={t({ en: "Rewarded", fr: "Récompensés" })} /><Status count={counts?.rejected || 0} label={t({ en: "Not retained", fr: "Non retenus" })} /></div></section>
    </div>
  );
}

function Status({ count, label }: { count: number; label: string }) { return <div className="rounded-lg border border-border px-3 py-3"><p className="text-xl font-bold text-foreground">{count}</p><p className="mt-0.5 text-xs text-muted-foreground">{label}</p></div>; }
