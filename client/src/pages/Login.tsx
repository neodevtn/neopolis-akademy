import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, LogIn, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { BrandLogo } from "@/components/BrandLogo";
import { trackEvent } from "@/lib/analytics";

export default function Login() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || t({ fr: "Erreur de connexion", en: "Login error", ar: "خطأ في تسجيل الدخول" }));
        setLoginLoading(false);
        return;
      }

      // Redirect based on role
      trackEvent("login", { method: "password", role_type: data.role === "admin" ? "admin" : "learner" });
      if (data.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/training";
      }
    } catch (err) {
      setLoginError(t({ fr: "Erreur réseau. Veuillez réessayer.", en: "Network error. Please try again.", ar: "خطأ في الشبكة. يرجى المحاولة مرة أخرى." }));
      setLoginLoading(false);
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
          <p className="text-muted-foreground text-sm">
            {t({ fr: "Plateforme de formation certifiante en Intelligence Artificielle", en: "Certified AI Training Platform", ar: "منصة تدريب معتمدة في الذكاء الاصطناعي" })}
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <LogIn className="w-5 h-5" />
              {t({ fr: "Connexion", en: "Login", ar: "تسجيل الدخول" })}
            </CardTitle>
            <CardDescription>
              {t({ fr: "Accédez à votre espace de formation", en: "Access your training space", ar: "الوصول إلى مساحة التدريب الخاصة بك" })}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">{t({ fr: "Email", en: "Email", ar: "البريد الإلكتروني" })}</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder={t({ fr: "votre@email.com", en: "your@email.com", ar: "بريدك@email.com" })}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">{t({ fr: "Mot de passe", en: "Password", ar: "كلمة المرور" })}</Label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs text-primary hover:underline"
                  >
                    {t({ fr: "Mot de passe oublié ?", en: "Forgot password?", ar: "نسيت كلمة المرور؟" })}
                  </button>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {loginError && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {loginError}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading
                  ? t({ fr: "Connexion en cours...", en: "Logging in...", ar: "جاري تسجيل الدخول..." })
                  : t({ fr: "Se connecter", en: "Log in", ar: "تسجيل الدخول" })}
              </Button>
            </form>

            {/* Invitation-only notice */}
            <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    {t({ fr: "Accès sur invitation uniquement", en: "Invitation-only access", ar: "الوصول بدعوة فقط" })}
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400/80 leading-relaxed">
                    {t({
                      fr: "L'inscription est réservée aux candidats invités ou dont la candidature a été acceptée. Si vous avez reçu un email d'invitation, utilisez le lien qu'il contient pour créer votre compte.",
                      en: "Registration is reserved for invited candidates or those whose application has been accepted. If you received an invitation email, use the link it contains to create your account.",
                      ar: "التسجيل مخصص للمرشحين المدعوين أو الذين تم قبول طلبهم. إذا تلقيت بريدًا إلكترونيًا للدعوة، استخدم الرابط الموجود فيه لإنشاء حسابك."
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Apply link */}
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate("/apply")}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {t({ fr: "Vous souhaitez devenir ambassadeur ? Postulez ici", en: "Want to become an ambassador? Apply here", ar: "هل تريد أن تصبح سفيرًا؟ تقدم هنا" })}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
