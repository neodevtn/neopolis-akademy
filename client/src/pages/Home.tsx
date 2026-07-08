import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Clock, TrendingDown, Users, Zap, Globe, Brain, Award, BookOpen, CheckCircle, Shield, Gift, BadgeCheck } from "lucide-react";
import { useEffect, useRef } from "react";

const LOGO_URL = "/manus-storage/logo_neopolis_dev_04585f1b.png";
const HERO_IMG = "/manus-storage/hero_illustration_94c39ea2.png";
const FORMULE_ELEARNING_IMG = "/manus-storage/formule_elearning_d78ab794.png";
const FORMULE_CERT_IMG = "/manus-storage/formule_certification_370fa46d.png";
const FORMULE_AMBASSADOR_IMG = "/manus-storage/formule_ambassador_75216851.png";
const PARTENARIATS_IMG = "/manus-storage/partenariats_illustration_c658992c.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="Neopolis Development" className="h-7" />
            <span className="text-lg font-light tracking-tight">Akademy</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#formule" className="body-md text-muted-foreground hover:text-foreground transition-colors">La Formule</a>
            <a href="#pourquoi" className="body-md text-muted-foreground hover:text-foreground transition-colors">Pourquoi ?</a>
            <a href="#partenariats" className="body-md text-muted-foreground hover:text-foreground transition-colors">Partenariats</a>
            <Link href="/apply">
              <Button className="btn-pill bg-primary text-primary-foreground hover:bg-primary/90">
                Postuler
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — Message fort + Gratuité */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="container relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              {/* Badge GRATUIT */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-6">
                <Gift className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700 tracking-wide uppercase">100% Gratuit</span>
              </div>
              
              <h1 className="display-xxl text-foreground mb-4">
                Transformez la{" "}
                <span className="text-primary">menace de l'IA</span>{" "}
                en opportunité
              </h1>
              <p className="body-lg text-muted-foreground mb-4 max-w-lg">
                Formation e-learning <strong>gratuite</strong> + Certification Claude Certified Architect (CCA) <strong>offerte</strong> + Statut de technico-commercial indépendant ambassadeur pour conquérir le marché africain de l'IA.
              </p>
              
              {/* Badges gratuité */}
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-medium text-green-700">
                  <CheckCircle className="w-3 h-3" /> Formation gratuite
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-medium text-green-700">
                  <CheckCircle className="w-3 h-3" /> Certification offerte
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                  <Clock className="w-3 h-3" /> Avant le 31 Août 2026
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Link href="/apply">
                  <Button size="lg" className="btn-pill bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 py-5">
                    Soumettre ma candidature <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <a href="#formule">
                  <Button size="lg" variant="outline" className="btn-pill text-base px-8 py-5 border-border hover:border-foreground/20">
                    Découvrir la formule
                  </Button>
                </a>
              </div>
              <p className="mt-8 text-xs text-muted-foreground tracking-wide">
                200 à 300 profils sélectionnés · Tous secteurs · Toute l'Afrique
              </p>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <img 
                src={HERO_IMG} 
                alt="Professionnels africains en formation IA" 
                className="w-full max-w-lg object-contain drop-shadow-xl" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bandeau GRATUIT */}
      <section className="py-6 bg-green-600 text-white">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 text-center">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              <span className="font-semibold text-lg">Formation 100% GRATUITE</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-5 h-5" />
              <span className="font-semibold text-lg">Certification CCA OFFERTE</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="font-semibold text-lg">Aucun frais caché</span>
            </div>
          </div>
        </div>
      </section>

      {/* La Formule — 3 cards with illustrations */}
      <section id="formule" className="py-24 section-soft">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-xs font-medium text-primary tracking-widest uppercase mb-3">Parcours 100% gratuit</p>
            <h2 className="display-xl text-foreground mb-4">La Formule Complète</h2>
            <p className="body-lg text-muted-foreground max-w-xl mx-auto">
              Un parcours intensif en 3 étapes <strong>entièrement pris en charge</strong> pour vous transformer en expert certifié de l'IA Agentique
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <FormulaCard
              number="01"
              image={FORMULE_ELEARNING_IMG}
              title="E-Learning 7 jours"
              description="Formation intensive gratuite sur l'IA générative, les LLMs, les architectures multi-agents et les cas d'usage métier."
              free
            />
            <FormulaCard
              number="02"
              image={FORMULE_CERT_IMG}
              title="Accès Plateforme Anthropic"
              description="Accès dédié gratuit à la plateforme Anthropic pour préparer la certification Claude Certified Architect (CCA)."
              free
            />
            <FormulaCard
              number="03"
              image={FORMULE_AMBASSADOR_IMG}
              title="Voucher Certification CCA"
              description="Voucher offert pour passer la certification avant le 31 Août 2026. Devenez ambassadeur certifié."
              highlight
              free
            />
          </div>
        </div>
      </section>

      {/* Pourquoi se transformer — Stats + Graphique */}
      <section id="pourquoi" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-xs font-medium text-primary tracking-widest uppercase mb-3">L'urgence</p>
            <h2 className="display-xl text-foreground mb-4">Pourquoi se transformer ?</h2>
            <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
              <strong className="text-foreground">Transformez la menace de l'IA en opportunité.</strong>{" "}
              Les chiffres sont sans appel. L'IA agentique bouleverse tous les secteurs et détruit des millions d'emplois.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            <StatCard
              icon={<TrendingDown className="w-5 h-5" />}
              value="234 Mds $"
              label="de dépenses SaaS menacées d'ici 2030"
              source="Gartner, 2026"
            />
            <StatCard
              icon={<Users className="w-5 h-5" />}
              value="92 millions"
              label="d'emplois déplacés par l'IA d'ici 2030"
              source="World Economic Forum"
            />
            <StatCard
              icon={<TrendingDown className="w-5 h-5" />}
              value="-36%"
              label="d'offres d'emploi développeur vs 2020"
              source="Indeed Hiring Lab"
            />
            <StatCard
              icon={<Zap className="w-5 h-5" />}
              value="9/10"
              label="Score d'exposition IA des développeurs"
              source="Karpathy, 2026"
            />
            <StatCard
              icon={<Globe className="w-5 h-5" />}
              value="700 000+"
              label="emplois tech perdus entre 2022-2025"
              source="Layoffs.fyi"
            />
            <StatCard
              icon={<Brain className="w-5 h-5" />}
              value="50%"
              label="du code sera généré par l'IA fin 2026"
              source="Goldman Sachs / BLS"
            />
          </div>

          {/* Graphique de perte d'emplois */}
          <div className="max-w-4xl mx-auto mb-16">
            <h3 className="heading-lg text-foreground text-center mb-2">Perte d'emplois estimée par poste (2025-2030)</h3>
            <p className="text-sm text-muted-foreground text-center mb-6">Pourcentage d'emplois à risque d'automatisation par l'IA — Sources : WEF Future of Jobs 2025, Goldman Sachs, McKinsey</p>
            <div className="card-stripe p-6">
              <JobLossChart />
            </div>
          </div>

          {/* Quote */}
          <div className="max-w-3xl mx-auto mb-12">
            <blockquote className="border-l-2 border-primary pl-6 py-2">
              <p className="heading-md text-foreground italic">
                « Vous n'achetez plus un logiciel pour des humains, vous l'achetez pour des agents. »
              </p>
              <footer className="mt-3 text-sm text-muted-foreground">
                — George Brocklehurst, Gartner (2026)
              </footer>
            </blockquote>
          </div>

          {/* Threatened sectors */}
          <div className="text-center">
            <p className="heading-md text-foreground mb-6">Secteurs les plus menacés</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
              {["Développement logiciel", "Service client", "Comptabilité & Finance", "Juridique", "Administration", "Marketing & Rédaction", "Traduction", "Support technique", "Assurance", "Banque"].map((sector) => (
                <span key={sector} className="px-4 py-1.5 rounded-full bg-primary/5 border border-primary/15 text-xs font-medium text-foreground">
                  {sector}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Transformation message banner */}
      <section className="py-16 bg-gradient-to-r from-[#0a1628] to-[#1a2744] text-white">
        <div className="container text-center">
          <h2 className="display-lg text-white mb-4">
            Ne subissez pas la disruption.{" "}
            <span className="text-[#e63946]">Devenez-en l'acteur.</span>
          </h2>
          <p className="body-lg text-white/80 max-w-2xl mx-auto mb-8">
            Ceux qui maîtrisent l'IA Agentique aujourd'hui seront les leaders de demain. Les autres seront remplacés.
          </p>
          <Link href="/apply">
            <Button size="lg" className="btn-pill bg-[#e63946] hover:bg-[#c5303c] text-white text-base px-10 py-5">
              Je saisis l'opportunité <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Partenariats */}
      <section id="partenariats" className="py-24 section-cream">
        <div className="container">
          <div className="text-center mb-16">
            <img src={PARTENARIATS_IMG} alt="Partenariats technologiques" className="w-36 h-24 mx-auto mb-6 object-contain" />
            <p className="text-xs font-medium text-primary tracking-widest uppercase mb-3">Écosystème</p>
            <h2 className="display-xl text-foreground mb-4">Partenariats Stratégiques</h2>
            <p className="body-lg text-muted-foreground max-w-xl mx-auto">
              Neopolis Development construit des partenariats avec les leaders mondiaux de l'IA pour l'Afrique
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Alibaba Cloud */}
            <div className="card-stripe">
              <div className="w-12 h-12 rounded-lg bg-[#ff6a00]/10 flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-[#ff6a00]" />
              </div>
              <h3 className="display-md text-foreground mb-3">Alibaba Cloud</h3>
              <p className="body-md text-muted-foreground mb-6">
                Infrastructure IA de classe mondiale et modèles Qwen. Partenariat stratégique pour déployer des solutions IA à grande échelle sur le continent africain.
              </p>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" /> Infrastructure cloud haute performance
                </li>
                <li className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" /> Modèles Qwen (LLM)
                </li>
                <li className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" /> Appliances IA on-premise
                </li>
              </ul>
            </div>
            {/* Anthropic */}
            <div className="card-stripe">
              <div className="w-12 h-12 rounded-lg bg-[#d4a574]/10 flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-[#d4a574]" />
              </div>
              <h3 className="display-md text-foreground mb-3">Anthropic</h3>
              <p className="body-md text-muted-foreground mb-6">
                Créateur de Claude, l'IA la plus avancée au monde. Partenariat pour la certification CCA et le déploiement d'agents IA en Afrique.
              </p>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" /> Certification Claude Certified Architect
                </li>
                <li className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" /> Agents IA autonomes (Claude)
                </li>
                <li className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" /> Model Context Protocol (MCP)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Statut Ambassadeur */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <img src={FORMULE_AMBASSADOR_IMG} alt="Ambassadeur IA" className="w-28 h-28 mx-auto mb-6 object-contain" />
              <p className="text-xs font-medium text-primary tracking-widest uppercase mb-3">Votre futur rôle</p>
              <h2 className="display-xl text-foreground mb-4">
                Technico-commercial indépendant ambassadeur
              </h2>
              <p className="body-lg text-muted-foreground">
                Après votre certification CCA, devenez un acteur clé de la révolution IA en Afrique
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="heading-lg text-primary mb-6">Ce que vous recevez</h3>
                <ul className="space-y-4">
                  <BenefitItem text="Statut d'ambassadeur officiel Anthropic via Neopolis Development" />
                  <BenefitItem text="Ressources humaines, techniques et matérielles fournies par Neopolis" />
                  <BenefitItem text="Agents IA « ready to use » pour vos clients PME/TPE" />
                  <BenefitItem text="Accès à d'autres LLMs et appliances hébergés on-premise sur infrastructure dédiée" />
                  <BenefitItem text="Assistance complète pour attaquer votre marché cible en Afrique" />
                </ul>
              </div>
              <div>
                <h3 className="heading-lg text-primary mb-6">Votre mission</h3>
                <ul className="space-y-4">
                  <MissionItem text="Identifier les PME/TPE de votre secteur prêtes pour la transformation IA" />
                  <MissionItem text="Proposer et déployer des agents IA adaptés à leurs besoins métier" />
                  <MissionItem text="Accompagner la transition logiciel classique → agents IA" />
                  <MissionItem text="Couvrir un ou plusieurs pays africains selon votre expertise" />
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 section-soft border-t border-border">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-6">
              <Gift className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">Formation & Certification 100% GRATUITES</span>
            </div>
            <h2 className="display-lg text-foreground mb-6">
              Transformez la menace de l'IA en opportunité
            </h2>
            <p className="body-lg text-muted-foreground mb-10">
              Soumettez votre candidature maintenant. Votre score sera calculé immédiatement et les meilleurs profils seront contactés sous 48h.
            </p>
            <Link href="/apply">
              <Button size="lg" className="btn-pill bg-primary text-primary-foreground hover:bg-primary/90 text-base px-10 py-5">
                Soumettre ma candidature <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <p className="mt-6 text-xs text-muted-foreground">
              Date limite de certification : <strong className="text-primary">31 Août 2026</strong> · 200-300 profils sélectionnés uniquement
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={LOGO_URL} alt="Neopolis Development" className="h-5" />
              <span className="text-sm text-muted-foreground font-light">Akademy</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Neopolis Development — FINTECH & Editeur d'Intelligence · Plus de 15 ans d'expérience à l'international
            </p>
            <p className="text-xs text-muted-foreground">
              © 2026 Neopolis Development
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ============ Chart Component ============ */

function JobLossChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    const loadChart = async () => {
      // Dynamically import Chart.js
      const { Chart, registerables } = await import("chart.js");
      Chart.register(...registerables);

      if (cancelled || !canvasRef.current) return;

      // Destroy existing chart
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      // Data: % d'emplois à risque par poste entre 2025 et 2030
      // Sources: WEF Future of Jobs 2025, Goldman Sachs 2024, McKinsey Global Institute
      const years = ["2025", "2026", "2027", "2028", "2029", "2030"];

      chartRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: years,
          datasets: [
            {
              label: "Saisie de données / Admin",
              data: [25, 35, 48, 60, 72, 82],
              borderColor: "#e63946",
              backgroundColor: "rgba(230, 57, 70, 0.1)",
              borderWidth: 2.5,
              tension: 0.4,
              fill: false,
              pointRadius: 4,
              pointBackgroundColor: "#e63946",
            },
            {
              label: "Service client / Support",
              data: [20, 30, 42, 55, 65, 76],
              borderColor: "#ff6a00",
              backgroundColor: "rgba(255, 106, 0, 0.1)",
              borderWidth: 2.5,
              tension: 0.4,
              fill: false,
              pointRadius: 4,
              pointBackgroundColor: "#ff6a00",
            },
            {
              label: "Comptabilité / Finance",
              data: [15, 24, 35, 46, 58, 68],
              borderColor: "#457b9d",
              backgroundColor: "rgba(69, 123, 157, 0.1)",
              borderWidth: 2.5,
              tension: 0.4,
              fill: false,
              pointRadius: 4,
              pointBackgroundColor: "#457b9d",
            },
            {
              label: "Développeurs logiciel",
              data: [12, 22, 33, 44, 55, 65],
              borderColor: "#6c47b8",
              backgroundColor: "rgba(108, 71, 184, 0.1)",
              borderWidth: 2.5,
              tension: 0.4,
              fill: false,
              pointRadius: 4,
              pointBackgroundColor: "#6c47b8",
            },
            {
              label: "Traduction / Rédaction",
              data: [30, 42, 55, 65, 74, 80],
              borderColor: "#2a9d8f",
              backgroundColor: "rgba(42, 157, 143, 0.1)",
              borderWidth: 2.5,
              tension: 0.4,
              fill: false,
              pointRadius: 4,
              pointBackgroundColor: "#2a9d8f",
            },
            {
              label: "Juridique / Paralégal",
              data: [10, 18, 28, 38, 48, 58],
              borderColor: "#264653",
              backgroundColor: "rgba(38, 70, 83, 0.1)",
              borderWidth: 2.5,
              tension: 0.4,
              fill: false,
              pointRadius: 4,
              pointBackgroundColor: "#264653",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                padding: 20,
                usePointStyle: true,
                pointStyle: "circle",
                font: { size: 11, family: "Inter" },
              },
            },
            tooltip: {
              backgroundColor: "#0a1628",
              titleFont: { size: 13, family: "Inter" },
              bodyFont: { size: 12, family: "Inter" },
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: (context: any) => `${context.dataset.label}: ${context.parsed.y}% à risque`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: (value: any) => `${value}%`,
                font: { size: 11, family: "Inter" },
                color: "#6b7280",
              },
              title: {
                display: true,
                text: "% d'emplois à risque d'automatisation",
                font: { size: 12, family: "Inter" },
                color: "#374151",
              },
              grid: {
                color: "rgba(0,0,0,0.05)",
              },
            },
            x: {
              ticks: {
                font: { size: 12, family: "Inter" },
                color: "#6b7280",
              },
              grid: {
                display: false,
              },
            },
          },
        },
      });
    };

    loadChart();

    return () => {
      cancelled = true;
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return (
    <div style={{ height: "380px" }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

/* ============ Sub-components ============ */

function FormulaCard({ number, image, title, description, highlight, free }: { 
  number: string; image: string; title: string; description: string; highlight?: boolean; free?: boolean 
}) {
  return (
    <div className={`card-stripe relative text-center ${highlight ? 'border-primary/30' : ''}`}>
      {free && (
        <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
          <Gift className="w-3 h-3 text-green-600" />
          <span className="text-[10px] font-bold text-green-700 uppercase">Gratuit</span>
        </div>
      )}
      <span className="absolute top-4 right-4 text-4xl font-extralight text-border">{number}</span>
      <img src={image} alt={title} className="w-20 h-20 mx-auto mb-5 object-contain" />
      <h3 className="heading-md text-foreground mb-3">{title}</h3>
      <p className="body-md text-muted-foreground">{description}</p>
      {highlight && (
        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/20">
          <Award className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">Avant le 31 Août 2026</span>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, value, label, source }: { icon: React.ReactNode; value: string; label: string; source: string }) {
  return (
    <div className="card-stripe">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
          {icon}
        </div>
        <span className="display-md text-primary">{value}</span>
      </div>
      <p className="body-md text-foreground mb-1.5">{label}</p>
      <p className="text-xs text-muted-foreground">Source : {source}</p>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle className="w-4.5 h-4.5 text-primary mt-0.5 shrink-0" />
      <span className="body-md text-foreground">{text}</span>
    </li>
  );
}

function MissionItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <span className="body-md text-foreground">{text}</span>
    </li>
  );
}
