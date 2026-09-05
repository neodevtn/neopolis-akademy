import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { trackEvent } from "@/lib/analytics";

export default function AcceptInvitation() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const token = new URLSearchParams(search).get("token") || "";

  const [status, setStatus] = useState<"loading" | "valid" | "error" | "success">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [invitationData, setInvitationData] = useState<{ email: string; name: string | null }>({ email: "", name: null });

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("Lien d'invitation invalide. Aucun token trouvé.");
      return;
    }

    fetch(`/api/auth/validate-invitation?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setInvitationData({ email: data.email, name: data.name });
          setName(data.name || "");
          setStatus("valid");
        } else {
          setStatus("error");
          setErrorMsg(data.error || "Invitation invalide");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("Erreur réseau. Veuillez réessayer.");
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (password.length < 6) {
      setSubmitError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError("Les mots de passe ne correspondent pas");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/accept-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, name: name.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        trackEvent("sign_up", { method: "invitation" });
        setStatus("success");
        setTimeout(() => {
          window.location.href = "/training";
        }, 2000);
      } else {
        setSubmitError(data.error || "Erreur lors de la création du compte");
        setSubmitting(false);
      }
    } catch {
      setSubmitError("Erreur réseau. Veuillez réessayer.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <BrandLogo className="h-14 max-w-[280px]" />
          </div>
          <p className="text-slate-500 text-sm">
            Acceptez votre invitation et créez votre compte
          </p>
        </div>

        {/* Loading State */}
        {status === "loading" && (
          <Card className="border-slate-200 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
              <p className="text-slate-600">Vérification de votre invitation...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {status === "error" && (
          <Card className="border-red-200 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Invitation invalide</h3>
              <p className="text-slate-600 text-sm mb-6">{errorMsg}</p>
              <Button variant="outline" onClick={() => navigate("/")}>
                Retour à l'accueil
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Success State */}
        {status === "success" && (
          <Card className="border-emerald-200 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Compte créé avec succès !</h3>
              <p className="text-slate-600 text-sm">Redirection vers votre espace formation...</p>
            </CardContent>
          </Card>
        )}

        {/* Form State */}
        {status === "valid" && (
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Créer votre compte</CardTitle>
              <CardDescription>
                Vous avez été invité(e) à rejoindre le programme de formation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={invitationData.email}
                    disabled
                    className="bg-slate-50 text-slate-600"
                  />
                  <p className="text-xs text-slate-400">L'email est lié à votre invitation et ne peut pas être modifié</p>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Prénom Nom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 6 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Retapez votre mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                {/* Error */}
                {submitError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {submitError}
                  </div>
                )}

                {/* Submit */}
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Création en cours...
                    </>
                  ) : (
                    "Créer mon compte et commencer"
                  )}
                </Button>
              </form>

              {/* Already have account */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate("/login")}
                  className="text-xs text-slate-500 hover:text-emerald-600 transition-colors"
                >
                  Vous avez déjà un compte ? Se connecter
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
