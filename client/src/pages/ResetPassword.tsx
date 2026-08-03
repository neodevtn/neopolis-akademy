import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, CheckCircle2, GraduationCap, KeyRound, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setValidating(false);
      setTokenValid(false);
      return;
    }

    fetch(`/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`)
      .then(res => res.json())
      .then(data => {
        setTokenValid(data.valid === true);
        setValidating(false);
      })
      .catch(() => {
        setTokenValid(false);
        setValidating(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(t({ fr: "Le mot de passe doit contenir au moins 6 caractères", en: "Password must be at least 6 characters", ar: "يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل" }));
      return;
    }

    if (password !== confirmPassword) {
      setError(t({ fr: "Les mots de passe ne correspondent pas", en: "Passwords do not match", ar: "كلمات المرور غير متطابقة" }));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t({ fr: "Erreur lors de la réinitialisation", en: "Error resetting password", ar: "خطأ في إعادة تعيين كلمة المرور" }));
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(t({ fr: "Erreur réseau. Veuillez réessayer.", en: "Network error. Please try again.", ar: "خطأ في الشبكة. يرجى المحاولة مرة أخرى." }));
    } finally {
      setLoading(false);
    }
  };

  // Loading state while validating token
  if (validating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {t({ fr: "Vérification du lien...", en: "Verifying link...", ar: "جاري التحقق من الرابط..." })}
          </p>
        </div>
      </div>
    );
  }

  // Invalid or missing token
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <GraduationCap className="w-10 h-10 text-primary" />
              <span className="text-2xl font-bold text-foreground">Neopolis Akademy</span>
            </div>
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                      {t({ fr: "Lien invalide ou expiré", en: "Invalid or expired link", ar: "رابط غير صالح أو منتهي الصلاحية" })}
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-400/80 leading-relaxed">
                      {t({
                        fr: "Ce lien de réinitialisation est invalide ou a expiré. Les liens sont valables pendant 1 heure. Veuillez refaire une demande.",
                        en: "This reset link is invalid or has expired. Links are valid for 1 hour. Please request a new one.",
                        ar: "رابط إعادة التعيين هذا غير صالح أو منتهي الصلاحية. الروابط صالحة لمدة ساعة واحدة. يرجى طلب رابط جديد."
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/login")}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t({ fr: "Connexion", en: "Login", ar: "تسجيل الدخول" })}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => navigate("/forgot-password")}
                  >
                    {t({ fr: "Nouveau lien", en: "New link", ar: "رابط جديد" })}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-10 h-10 text-primary" />
            <span className="text-2xl font-bold text-foreground">Neopolis Akademy</span>
          </div>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <KeyRound className="w-5 h-5" />
              {t({ fr: "Nouveau mot de passe", en: "New Password", ar: "كلمة مرور جديدة" })}
            </CardTitle>
            <CardDescription>
              {t({
                fr: "Choisissez un nouveau mot de passe pour votre compte",
                en: "Choose a new password for your account",
                ar: "اختر كلمة مرور جديدة لحسابك"
              })}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      {t({ fr: "Mot de passe réinitialisé !", en: "Password reset!", ar: "تم إعادة تعيين كلمة المرور!" })}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400/80 leading-relaxed">
                      {t({
                        fr: "Votre mot de passe a été modifié avec succès. Vous êtes maintenant connecté.",
                        en: "Your password has been changed successfully. You are now logged in.",
                        ar: "تم تغيير كلمة المرور بنجاح. أنت الآن مسجل الدخول."
                      })}
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => { window.location.href = "/training"; }}
                >
                  {t({ fr: "Accéder à ma formation", en: "Go to my training", ar: "الذهاب إلى التدريب" })}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t({ fr: "Nouveau mot de passe", en: "New password", ar: "كلمة المرور الجديدة" })}</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    {t({ fr: "Minimum 6 caractères", en: "Minimum 6 characters", ar: "6 أحرف على الأقل" })}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t({ fr: "Confirmer le mot de passe", en: "Confirm password", ar: "تأكيد كلمة المرور" })}</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? t({ fr: "Réinitialisation...", en: "Resetting...", ar: "جاري إعادة التعيين..." })
                    : t({ fr: "Réinitialiser le mot de passe", en: "Reset password", ar: "إعادة تعيين كلمة المرور" })}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
