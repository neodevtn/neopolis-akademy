import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Brain, Globe, Shield, Clock, TrendingDown, Users, Award, Zap, BookOpen, CheckCircle } from "lucide-react";

const LOGO_URL = "/manus-storage/logo_neopolis_dev_04585f1b.png";

const africanCountries = [
  "Algérie", "Angola", "Bénin", "Botswana", "Burkina Faso", "Burundi", "Cameroun",
  "Cap-Vert", "Centrafrique", "Comores", "Congo", "Côte d'Ivoire", "Djibouti",
  "Égypte", "Érythrée", "Eswatini", "Éthiopie", "Gabon", "Gambie", "Ghana",
  "Guinée", "Guinée-Bissau", "Guinée équatoriale", "Kenya", "Lesotho", "Libéria",
  "Libye", "Madagascar", "Malawi", "Mali", "Maroc", "Maurice", "Mauritanie",
  "Mozambique", "Namibie", "Niger", "Nigéria", "Ouganda", "RD Congo", "Rwanda",
  "São Tomé-et-Príncipe", "Sénégal", "Seychelles", "Sierra Leone", "Somalie",
  "Soudan", "Soudan du Sud", "Tanzanie", "Tchad", "Togo", "Tunisie", "Zambie", "Zimbabwe"
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Neopolis Development" className="h-8" />
            <span className="font-bold text-lg font-[Montserrat]">Akademy</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#formule" className="hover:text-primary transition-colors">La Formule</a>
            <a href="#pourquoi" className="hover:text-primary transition-colors">Pourquoi se transformer ?</a>
            <a href="#partenariats" className="hover:text-primary transition-colors">Partenariats</a>
            <Link href="/apply">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Postuler maintenant
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f0f4ff] via-[#f8faff] to-[#fff5f5]" />
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Date limite : 31 Août 2026</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-[Montserrat] leading-tight mb-6">
              Devenez <span className="text-primary">Architecte d'Agents IA</span> certifié
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Formation e-learning + Certification Claude Certified Architect (CCA) + Statut de technico-commercial indépendant ambassadeur pour conquérir le marché africain de l'IA.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/apply">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
                  Soumettre ma candidature <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#formule">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Découvrir la formule
                </Button>
              </a>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              200 à 300 profils sélectionnés parmi les secteurs les plus impactés par l'IA
            </p>
          </div>
        </div>
      </section>

      {/* La Formule Section */}
      <section id="formule" className="py-20 border-t border-border">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-[Montserrat] mb-4">La Formule Complète</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Un parcours intensif en 3 étapes pour vous transformer en expert certifié de l'IA Agentique
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative p-8 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="absolute top-4 right-4 text-5xl font-bold text-primary/10 font-[Montserrat]">01</div>
              <h3 className="text-xl font-bold mb-3">E-Learning 7 jours</h3>
              <p className="text-muted-foreground">
                Formation intensive sur l'IA générative, les LLMs, les architectures multi-agents et les cas d'usage métier.
              </p>
            </div>
            {/* Step 2 */}
            <div className="relative p-8 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div className="absolute top-4 right-4 text-5xl font-bold text-primary/10 font-[Montserrat]">02</div>
              <h3 className="text-xl font-bold mb-3">Accès Plateforme Anthropic</h3>
              <p className="text-muted-foreground">
                Accès dédié à la plateforme Anthropic pour préparer la certification Claude Certified Architect (CCA).
              </p>
            </div>
            {/* Step 3 */}
            <div className="relative p-8 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div className="absolute top-4 right-4 text-5xl font-bold text-primary/10 font-[Montserrat]">03</div>
              <h3 className="text-xl font-bold mb-3">Voucher Certification CCA</h3>
              <p className="text-muted-foreground">
                Voucher offert pour passer la certification Claude Certified Architect (CCA) avant le <strong className="text-primary">31 Août 2026</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi se transformer Section */}
      <section id="pourquoi" className="py-20 bg-card border-t border-border">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-[Montserrat] mb-4">Pourquoi se transformer ?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Les chiffres sont sans appel. L'IA agentique bouleverse tous les secteurs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <StatCard
              icon={<TrendingDown className="w-6 h-6" />}
              value="234 Mds $"
              label="de dépenses SaaS menacées d'ici 2030"
              source="Gartner, Juillet 2026"
            />
            <StatCard
              icon={<Users className="w-6 h-6" />}
              value="92 millions"
              label="d'emplois déplacés par l'IA d'ici 2030"
              source="World Economic Forum, 2025"
            />
            <StatCard
              icon={<TrendingDown className="w-6 h-6" />}
              value="-36%"
              label="d'offres d'emploi développeur vs 2020"
              source="Indeed Hiring Lab, 2025"
            />
            <StatCard
              icon={<Zap className="w-6 h-6" />}
              value="9/10"
              label="Score d'exposition IA des développeurs"
              source="Karpathy, Mars 2026"
            />
            <StatCard
              icon={<Globe className="w-6 h-6" />}
              value="700 000+"
              label="emplois tech perdus entre 2022-2025"
              source="Layoffs.fyi"
            />
            <StatCard
              icon={<Brain className="w-6 h-6" />}
              value="50%"
              label="du code sera généré par l'IA fin 2026"
              source="Goldman Sachs / BLS"
            />
          </div>
          <div className="mt-12 max-w-3xl mx-auto text-center">
            <blockquote className="text-lg italic text-muted-foreground border-l-4 border-primary pl-6 text-left">
              « Vous n'achetez plus un logiciel pour des humains, vous l'achetez pour des agents. »
              <footer className="mt-2 text-sm not-italic text-primary">— George Brocklehurst, Gartner (2026)</footer>
            </blockquote>
          </div>
          <div className="mt-12 text-center">
            <h3 className="text-xl font-bold mb-6">Secteurs les plus menacés</h3>
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {["Développement logiciel", "Service client", "Comptabilité & Finance", "Juridique & Paralégal", "Administration", "Marketing & Rédaction", "Traduction", "Support technique", "Assurance", "Banque"].map((sector) => (
                <span key={sector} className="px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-sm font-medium">
                  {sector}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partenariats Section */}
      <section id="partenariats" className="py-20 border-t border-border">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-[Montserrat] mb-4">Partenariats Stratégiques</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Neopolis Development construit des partenariats avec les leaders mondiaux de l'IA pour l'Afrique
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-8 rounded-xl border border-border bg-card">
              <div className="w-16 h-16 rounded-xl bg-[#ff6a00]/10 flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-[#ff6a00]" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Alibaba Cloud</h3>
              <p className="text-muted-foreground mb-4">
                Infrastructure IA de classe mondiale et modèles Qwen. Partenariat stratégique pour déployer des solutions IA à grande échelle sur le continent africain.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Infrastructure cloud haute performance</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Modèles Qwen (LLM)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Appliances IA on-premise</li>
              </ul>
            </div>
            <div className="p-8 rounded-xl border border-border bg-card">
              <div className="w-16 h-16 rounded-xl bg-[#d4a574]/10 flex items-center justify-center mb-6">
                <Brain className="w-8 h-8 text-[#d4a574]" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Anthropic</h3>
              <p className="text-muted-foreground mb-4">
                Créateur de Claude, l'IA la plus avancée au monde. Partenariat pour la certification CCA et le déploiement d'agents IA de nouvelle génération en Afrique.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Certification Claude Certified Architect</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Agents IA autonomes (Claude)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Model Context Protocol (MCP)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Statut Ambassadeur Section */}
      <section className="py-20 bg-card border-t border-border">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-[Montserrat] mb-4">
                Technico-commercial indépendant ambassadeur
              </h2>
              <p className="text-muted-foreground text-lg">
                Après votre certification CCA, devenez un acteur clé de la révolution IA en Afrique
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4 text-primary">Ce que vous recevez</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>Statut d'ambassadeur officiel Anthropic via Neopolis Development</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>Ressources humaines, techniques et matérielles fournies par Neopolis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>Agents IA "ready to use" pour vos clients PME/TPE</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>Accès à d'autres LLMs et appliances hébergés on-premise sur infrastructure dédiée</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>Assistance complète pour attaquer votre marché cible en Afrique</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 text-primary">Votre mission</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>Identifier les PME/TPE de votre secteur prêtes pour la transformation IA</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>Proposer et déployer des agents IA adaptés à leurs besoins métier</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>Accompagner la transition logiciel classique → agents IA</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>Couvrir un ou plusieurs pays africains selon votre expertise</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">200-300 profils sélectionnés uniquement</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-[Montserrat] mb-6">
              Prêt à transformer votre carrière ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Soumettez votre candidature maintenant. Votre score sera calculé immédiatement et les meilleurs profils seront contactés sous 48h.
            </p>
            <Link href="/apply">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-10 py-6">
                Soumettre ma candidature <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Date limite de certification : <strong className="text-primary">31 Août 2026</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Neopolis Development" className="h-6" />
              <span className="text-sm text-muted-foreground">Akademy</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Neopolis Development — FINTECH & Editeur d'Intelligence | Plus de 15 ans d'expérience à l'international
            </p>
            <p className="text-sm text-muted-foreground">
              © 2026 Neopolis Development. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon, value, label, source }: { icon: React.ReactNode; value: string; label: string; source: string }) {
  return (
    <div className="p-6 rounded-xl border border-border bg-background hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <span className="text-2xl font-bold text-primary font-[Montserrat]">{value}</span>
      </div>
      <p className="text-sm text-foreground mb-2">{label}</p>
      <p className="text-xs text-muted-foreground">Source : {source}</p>
    </div>
  );
}
