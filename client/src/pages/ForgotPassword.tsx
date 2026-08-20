import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { BrandLogo } from "@/components/BrandLogo";

export default function ForgotPassword() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t({ fr: "Erreur lors de l'envoi", en: "Error sending request", ar: "خطأ في الإرسال" }));
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <BrandLogo className="h-14 max-w-[280px]" />
          </div>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="w-5 h-5" />
              {t({ fr: "Mot de passe oublié", en: "Forgot Password", ar: "نسيت كلمة المرور" })}
            </CardTitle>
            <CardDescription>
              {t({
                fr: "Entrez votre adresse email pour recevoir un lien de réinitialisation",
                en: "Enter your email address to receive a reset link",
                ar: "أدخل بريدك الإلكتروني لتلقي رابط إعادة التعيين"
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
                      {t({ fr: "Email envoyé !", en: "Email sent!", ar: "تم إرسال البريد الإلكتروني!" })}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400/80 leading-relaxed">
                      {t({
                        fr: "Si un compte existe avec cette adresse email, vous recevrez un lien de réinitialisation dans quelques minutes. Vérifiez également votre dossier spam.",
                        en: "If an account exists with this email address, you will receive a reset link within a few minutes. Also check your spam folder.",
                        ar: "إذا كان هناك حساب مرتبط بهذا البريد الإلكتروني، ستتلقى رابط إعادة التعيين في غضون دقائق قليلة. تحقق أيضًا من مجلد البريد العشوائي."
                      })}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/login")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t({ fr: "Retour à la connexion", en: "Back to login", ar: "العودة لتسجيل الدخول" })}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">{t({ fr: "Adresse email", en: "Email address", ar: "البريد الإلكتروني" })}</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder={t({ fr: "votre@email.com", en: "your@email.com", ar: "بريدك@email.com" })}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
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
                    ? t({ fr: "Envoi en cours...", en: "Sending...", ar: "جاري الإرسال..." })
                    : t({ fr: "Envoyer le lien de réinitialisation", en: "Send reset link", ar: "إرسال رابط إعادة التعيين" })}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate("/login")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t({ fr: "Retour à la connexion", en: "Back to login", ar: "العودة لتسجيل الدخول" })}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
