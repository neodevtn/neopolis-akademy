import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";

type Invitation = {
  status: "pending" | "accepted";
  email: string;
  name: string | null;
  examTitle: string;
  existingAccount: boolean;
  destination: string;
};

export default function AcceptExamInvitation() {
  const [token] = useState(() => {
    const supplied = new URLSearchParams(window.location.search).get("token");
    if (supplied && /^[a-f0-9]{64}$/.test(supplied)) {
      window.sessionStorage.setItem("directExamInvitationToken", supplied);
    }
    return supplied || window.sessionStorage.getItem("directExamInvitationToken") || "";
  });
  const { t } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const invitationPath = "/accept-exam-invitation";
  const loginPath = `/login?returnTo=${encodeURIComponent(invitationPath)}`;
  const translate = (fr: string, en: string) => t({ fr, en });

  useEffect(() => {
    // Le jeton est privé : ni historique, ni Referer, ni navigation vers /login.
    if (window.location.search) window.history.replaceState(window.history.state, "", invitationPath);
    if (!/^[a-f0-9]{64}$/.test(token)) { setLoading(false); setError(translate("Lien d’invitation invalide.", "Invalid invitation link.")); return; }
    const controller = new AbortController();
    fetch(`/api/auth/validate-exam-invitation?token=${encodeURIComponent(token)}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Invitation non disponible");
        setInvitation(result as Invitation);
      })
      .catch((cause) => { if (!controller.signal.aborted) setError(cause.message || "Invitation non disponible"); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [token]);

  const accept = async (path: string, body: object) => {
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || translate("Action impossible.", "Unable to proceed."));
      window.sessionStorage.removeItem("directExamInvitationToken");
      window.location.assign(result.destination);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : translate("Erreur réseau.", "Network error."));
      setSubmitting(false);
    }
  };
  const register = (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) { setError(translate("Les mots de passe ne correspondent pas.", "Passwords do not match.")); return; }
    if (!/^\+[1-9]\d{6,14}$/.test(phone)) { setError(translate("Saisissez un téléphone international au format +21612345678.", "Enter an international phone number such as +21612345678.")); return; }
    void accept("/api/auth/register-exam-guest", { token, firstName: firstName.trim(), lastName: lastName.trim(), phone, password });
  };

  const sameAccount = Boolean(user?.email && invitation?.email && user.email.toLowerCase().trim() === invitation.email.toLowerCase().trim());
  const needsSignIn = Boolean(invitation && (invitation.existingAccount || invitation.status === "accepted"));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-10">
      <div className="mx-auto max-w-lg space-y-6">
        <Link href="/" className="flex justify-center" aria-label="Neopolis Akademy"><BrandLogo className="h-12 max-w-[250px]" /></Link>
        <Card className="shadow-lg">
          <CardHeader><CardTitle>{translate("Invitation à un examen", "Exam invitation")}</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {(loading || authLoading) && <p className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />{translate("Vérification de l’invitation…", "Checking your invitation…")}</p>}
            {invitation && !authLoading && <>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-2">
                <h1 className="font-semibold text-blue-950">{invitation.examTitle}</h1>
                <p className="text-sm text-blue-900">{translate("Accès direct à cet examen de pratique, sans devoir terminer les cours. Vous pourrez le repasser ; cette invitation reste valable jusqu’à révocation par l’administration.", "Direct access to this practice exam without completing the courses. You may retake it; this invitation is valid until the administration revokes it.")}</p>
                <p className="text-xs text-blue-800">{translate("Il ne s’agit pas d’un examen officiel de certification.", "This is not an official certification exam.")}</p>
              </div>
              <div className="text-sm"><span className="text-muted-foreground">{translate("Compte invité : ", "Invited account: ")}</span><strong>{invitation.email}</strong></div>
              {needsSignIn ? (
                isAuthenticated && sameAccount ? <Button disabled={submitting} className="w-full" onClick={() => void accept("/api/auth/claim-exam-invitation", { token })}>{translate("Activer mon accès à l’examen", "Activate my exam access")} <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  : <div className="space-y-3"><p className="text-sm text-muted-foreground">{translate("Connectez-vous avec le compte invité indiqué ci-dessus pour accéder à l’examen.", "Sign in with the invited account shown above to access the exam.")}</p><Button asChild className="w-full"><Link href={loginPath}>{translate("Se connecter avec le compte invité", "Sign in with invited account")}</Link></Button></div>
              ) : isAuthenticated ? (
                sameAccount ? <Button disabled={submitting} className="w-full" onClick={() => void accept("/api/auth/claim-exam-invitation", { token })}>{translate("Activer mon accès à l’examen", "Activate my exam access")}</Button>
                  : <p className="text-sm text-amber-800">{translate("Une autre session est ouverte. Déconnectez-vous avant de créer le compte invité.", "Another account is signed in. Sign out before creating the invited account.")}</p>
              ) : (
                <form onSubmit={register} className="space-y-4">
                  <p className="text-sm text-muted-foreground">{translate("Créez votre compte apprenant et complétez votre profil pour passer l’examen.", "Create a learner account and complete your profile to take the exam.")}</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1"><Label htmlFor="exam-first-name">{translate("Prénom", "First name")}</Label><Input id="exam-first-name" required minLength={2} maxLength={100} autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
                    <div className="space-y-1"><Label htmlFor="exam-last-name">{translate("Nom", "Last name")}</Label><Input id="exam-last-name" required minLength={2} maxLength={100} autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
                  </div>
                  <div className="space-y-1"><Label htmlFor="exam-phone">{translate("Téléphone (international)", "Phone (international)")}</Label><Input id="exam-phone" type="tel" required autoComplete="tel" placeholder="+21612345678" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                  <div className="space-y-1"><Label htmlFor="exam-password">{translate("Mot de passe (12 caractères minimum)", "Password (at least 12 characters)")}</Label><Input id="exam-password" type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                  <div className="space-y-1"><Label htmlFor="exam-confirm-password">{translate("Confirmer le mot de passe", "Confirm password")}</Label><Input id="exam-confirm-password" type="password" required minLength={12} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
                  <Button type="submit" disabled={submitting} className="w-full">{submitting ? translate("Création du compte…", "Creating account…") : translate("Créer mon compte et accéder à l’examen", "Create account and access exam")}</Button>
                </form>
              )}
            </>}
            {error && <p role="alert" className="flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>}
            {!loading && !invitation && <Link href="/" className="text-sm text-blue-700 underline">{translate("Retour à l’accueil", "Back to home")}</Link>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
