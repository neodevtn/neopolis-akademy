import { Check, Copy, Facebook, Gift, Linkedin, MessageCircle, Send, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { buildReferralShareUrl, buildReferralUrl, type ReferralShareContent, type ReferralShareTarget } from "@shared/referral";

type ReferralShareCardProps = {
  content?: ReferralShareContent;
  courseId?: string;
  certificationId?: string;
  achievementId?: number;
  title?: string;
  compact?: boolean;
};

const SOCIAL_TARGETS: Array<{ id: Exclude<ReferralShareTarget, "copy">; label: string; icon: typeof MessageCircle }> = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "x", label: "X", icon: Send },
];

export function ReferralShareCard({ content = "academy", courseId, certificationId, achievementId, title = "Invitez votre réseau", compact = false }: ReferralShareCardProps) {
  const referralQuery = trpc.referral.getMine.useQuery();
  const [copied, setCopied] = useState(false);
  const program = referralQuery.data;
  const referralCode = program?.code?.code;
  const origin = typeof window === "undefined" ? "https://akademy.neodev.click" : window.location.origin;

  const baseLink = useMemo(() => {
    if (!referralCode) return "";
    return buildReferralUrl({ origin, referralCode, content, courseId, certificationId, achievementId, shareTitle: content === "course" ? title : undefined, target: "copy" });
  }, [achievementId, certificationId, content, courseId, origin, referralCode]);

  if (referralQuery.isLoading || !program?.campaign || !referralCode || !baseLink) return null;

  const share = (target: Exclude<ReferralShareTarget, "copy">) => {
    const referralUrl = buildReferralUrl({ origin, referralCode, content, courseId, certificationId, achievementId, shareTitle: content === "course" ? title : undefined, target });
    const message = program.campaign.shareMessage || "Rejoignez Neopolis Akademy avec mon lien de parrainage.";
    window.open(buildReferralShareUrl(target, referralUrl, message), "_blank", "noopener,noreferrer");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(baseLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copiez votre lien de parrainage", baseLink);
    }
  };

  const invited = program.counts?.pending + program.counts?.eligible + program.counts?.rewarded + program.counts?.rejected;
  return (
    <section className={`rounded-xl border border-primary/20 bg-primary/[0.035] text-foreground ${compact ? "p-4" : "p-5 sm:p-6"}`} aria-label="Parrainage et partage">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-primary"><Gift className="h-5 w-5" /><p className="text-sm font-semibold">Programme de parrainage</p></div>
          <h2 className="mt-1 text-lg font-bold">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Partagez un lien unique. Les candidatures sont tracées et toute récompense reste soumise à validation par Neopolis Akademy.</p>
        </div>
        <div className="flex shrink-0 gap-2 text-xs text-muted-foreground"><Users className="mt-0.5 h-4 w-4 text-primary" /><span><strong className="text-foreground">{invited}</strong> candidature{invited !== 1 ? "s" : ""} attribuée{invited !== 1 ? "s" : ""}</span></div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-background px-3 py-2.5 text-xs text-muted-foreground">{baseLink}</code>
        <Button type="button" variant="outline" onClick={copy} className="gap-2">{copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}{copied ? "Lien copié" : "Copier le lien"}</Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {SOCIAL_TARGETS.map(({ id, label, icon: Icon }) => <Button key={id} type="button" variant="outline" size="sm" onClick={() => share(id)} className="gap-1.5"><Icon className="h-3.5 w-3.5" />{label}</Button>)}
      </div>
      <p className="mt-4 border-t border-border/70 pt-3 text-xs text-muted-foreground"><strong>Récompenses annoncées :</strong> {program.campaign.tokenRewardLabel} et {program.campaign.giftRewardLabel}. {program.campaign.eligibilityText}</p>
    </section>
  );
}
