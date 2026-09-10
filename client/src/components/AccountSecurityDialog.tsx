import { useEffect, useState } from "react";
import { KeyRound, Loader2, Mail, Settings2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AccountSecurityDialogProps = {
  email?: string | null;
  compact?: boolean;
};

/** Paramètres d’identifiants du compte connecté : aucun secret ne quitte jamais le navigateur en clair hors soumission chiffrée. */
export function AccountSecurityDialog({ email, compact = false }: AccountSecurityDialogProps) {
  const [open, setOpen] = useState(false);
  const [emailDraft, setEmailDraft] = useState(email || "");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const utils = trpc.useUtils();

  useEffect(() => { if (open) setEmailDraft(email || ""); }, [email, open]);

  const updateEmail = trpc.auth.updateMyEmail.useMutation({
    onSuccess: async (result) => {
      await utils.auth.me.invalidate();
      setEmailCurrentPassword("");
      toast.success(result.changed ? "Adresse e-mail mise à jour. Votre session sécurisée a été renouvelée." : "Cette adresse e-mail est déjà enregistrée sur votre compte.");
    },
    onError: (error) => toast.error(error.message || "Impossible de modifier l’adresse e-mail."),
  });
  const changePassword = trpc.auth.changeMyPassword.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmation("");
      toast.success("Mot de passe mis à jour. Votre session sécurisée a été renouvelée.");
    },
    onError: (error) => toast.error(error.message || "Impossible de modifier le mot de passe."),
  });

  const submitEmail = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = emailDraft.trim().toLowerCase();
    if (!normalized) return toast.error("Saisissez une adresse e-mail valide.");
    updateEmail.mutate({ email: normalized, currentPassword: emailCurrentPassword });
  };
  const submitPassword = (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmation) return toast.error("La confirmation du nouveau mot de passe ne correspond pas.");
    changePassword.mutate({ currentPassword, newPassword });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={compact ? "icon" : "sm"} className="gap-2" title="Sécurité du compte">
          <Settings2 className="h-4 w-4" />
          {!compact && <span>Compte</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Sécurité du compte</DialogTitle>
          <DialogDescription>Modifiez vos identifiants. Les sessions antérieures sont invalidées après chaque changement.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <form onSubmit={submitEmail} className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold">Adresse e-mail</h3></div>
            <div className="space-y-3"><div className="space-y-1.5"><Label htmlFor="account-email">Nouvelle adresse e-mail</Label><Input id="account-email" type="email" autoComplete="email" value={emailDraft} onChange={(event) => setEmailDraft(event.target.value)} required /></div><div className="space-y-1.5"><Label htmlFor="account-email-password">Mot de passe actuel</Label><Input id="account-email-password" type="password" autoComplete="current-password" value={emailCurrentPassword} onChange={(event) => setEmailCurrentPassword(event.target.value)} required /></div></div>
            <Button type="submit" size="sm" disabled={updateEmail.isPending}>{updateEmail.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Enregistrer l’adresse</Button>
          </form>
          <form onSubmit={submitPassword} className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold">Mot de passe</h3></div>
            <p className="text-xs text-muted-foreground">Choisissez au moins 12 caractères. Votre mot de passe actuel est requis pour confirmer ce changement.</p>
            <div className="grid gap-3"><div className="space-y-1.5"><Label htmlFor="current-password">Mot de passe actuel</Label><Input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></div><div className="space-y-1.5"><Label htmlFor="new-password">Nouveau mot de passe</Label><Input id="new-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></div><div className="space-y-1.5"><Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label><Input id="confirm-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></div></div>
            <Button type="submit" size="sm" disabled={changePassword.isPending}>{changePassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Mettre à jour le mot de passe</Button>
          </form>
        </div>
        <DialogFooter><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Fermer</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
