import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, GraduationCap, LogIn, UserPlus } from "lucide-react";

export default function Login() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"login" | "register">("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

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
        setLoginError(data.error || "Erreur de connexion");
        setLoginLoading(false);
        return;
      }

      // Redirect based on role
      window.location.href = "/training";
    } catch (err) {
      setLoginError("Erreur réseau. Veuillez réessayer.");
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (regPassword !== regConfirm) {
      setRegError("Les mots de passe ne correspondent pas");
      return;
    }

    if (regPassword.length < 6) {
      setRegError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setRegLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRegError(data.error || "Erreur lors de l'inscription");
        setRegLoading(false);
        return;
      }

      // Redirect to training after successful registration
      window.location.href = "/training";
    } catch (err) {
      setRegError("Erreur réseau. Veuillez réessayer.");
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-10 h-10 text-primary" />
            <span className="text-2xl font-bold text-foreground">Neopolis Akademy</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Plateforme de formation certifiante en Intelligence Artificielle
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border-border/50 shadow-lg">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")}>
            <CardHeader className="pb-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center gap-1.5">
                  <LogIn className="w-4 h-4" />
                  Connexion
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  Inscription
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              {/* Login Tab */}
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
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
                    {loginLoading ? "Connexion en cours..." : "Se connecter"}
                  </Button>
                </form>

                {/* Demo account hint */}
                <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Compte démo :</span>{" "}
                    apprenant@neopolis.demo / NeoDemo2026!
                  </p>
                </div>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="mt-0">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Nom complet</Label>
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="Prénom Nom"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Mot de passe</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Min. 6 caractères"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm">Confirmer le mot de passe</Label>
                    <Input
                      id="reg-confirm"
                      type="password"
                      placeholder="Retapez le mot de passe"
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>

                  {regError && (
                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {regError}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={regLoading}>
                    {regLoading ? "Inscription en cours..." : "Créer mon compte"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
