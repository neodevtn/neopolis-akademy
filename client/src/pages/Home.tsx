import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ChevronRight, GraduationCap, Award, Globe, Users, TrendingDown, Shield, Zap, BookOpen, ArrowRight, ChevronDown } from "lucide-react";

// Chart.js
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const LOGO_URL = "/manus-storage/logo_neopolis_akademy_9c9a0823.png";
const HERO_IMG = "/manus-storage/hero_ai_network_cb2c2cf9.png";
const AFRICA_IMG = "/manus-storage/africa_network_fb63ec75.png";
const CERT_IMG = "/manus-storage/certification_badge_35220f38.png";
const PARTNER_IMG = "/manus-storage/partnership_globe_2c18a400.png";

/* ─── FAQ Data ─── */
const faqItems = [
  { q: "Quels sont les prérequis pour postuler ?", a: "Aucun prérequis technique n'est exigé. Le programme est ouvert à tous les professionnels dont le métier est menacé par l'IA : développeurs, comptables, juristes, traducteurs, agents de service client, etc. Une motivation forte et une capacité d'apprentissage sont les seuls critères essentiels." },
  { q: "La formation et la certification sont-elles vraiment gratuites ?", a: "Oui, 100% gratuites. La formation e-learning de 7 jours, l'accès à la plateforme Anthropic, et le voucher pour la certification Claude Certified Architect (CCA) sont entièrement pris en charge par Neopolis Development grâce à nos partenariats stratégiques." },
  { q: "Combien de temps dure le programme complet ?", a: "La formation e-learning dure 7 jours intensifs. Ensuite, vous disposez d'un accès à la plateforme Anthropic pour préparer la certification CCA à votre rythme, avec une date limite de passage fixée au 31 août 2026." },
  { q: "Quels sont les débouchés après la certification ?", a: "Les candidats certifiés obtiennent le statut d'AI Solutions Partner — Ambassadeur Certifié. Vous devenez un entrepreneur indépendant distribuant des solutions IA auprès des PME/TPE de votre secteur d'activité sur tout le continent africain, avec le soutien technique et commercial complet de Neopolis Development." },
  { q: "Quels pays africains sont concernés ?", a: "L'ensemble des 54 pays africains sont éligibles. Le programme vise à créer un réseau d'ambassadeurs couvrant tout le continent, avec un focus particulier sur les marchés francophones, anglophones et arabophones." },
  { q: "Comment fonctionne le processus de sélection ?", a: "Après soumission de votre candidature, un score est calculé automatiquement basé sur vos compétences techniques (40%), votre expertise métier (35%) et vos capacités de communication (25%). Les 200 à 300 meilleurs profils seront sélectionnés pour intégrer le programme." },
  { q: "Quelles ressources Neopolis Development fournit-elle aux ambassadeurs ?", a: "Neopolis fournit : ressources humaines et techniques, matériel et appliances, agents IA prêts à l'emploi, accès à des LLM multiples (pas seulement Anthropic), infrastructure de serveurs puissants hébergés on-premise, et toute l'assistance nécessaire pour attaquer votre marché cible." },
];

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--wise-canvas)" }}>
      {/* ─── Navigation ─── */}
      <nav className="sticky top-0 z-50" style={{ backgroundColor: "var(--wise-canvas)", borderBottom: "1px solid var(--wise-canvas-soft)" }}>
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="Neopolis Akademy" className="h-9 object-contain" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#formule" className="text-sm font-semibold" style={{ color: "var(--wise-ink)" }}>La Formule</a>
            <a href="#pourquoi" className="text-sm font-semibold" style={{ color: "var(--wise-ink)" }}>Pourquoi maintenant</a>
            <a href="#partenaires" className="text-sm font-semibold" style={{ color: "var(--wise-ink)" }}>Partenaires</a>
            <a href="#faq" className="text-sm font-semibold" style={{ color: "var(--wise-ink)" }}>FAQ</a>
          </div>
          <Link href="/apply">
            <button className="wise-btn-primary flex items-center gap-2">
              Postuler <ChevronRight size={16} />
            </button>
          </Link>
        </div>
      </nav>

      {/* ─── Hero Band (Sage) ─── */}
      <section className="wise-hero-band">
        <div className="container py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8" style={{ backgroundColor: "var(--wise-primary-pale)" }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--wise-positive)" }}></span>
                <span className="text-sm font-semibold" style={{ color: "var(--wise-positive-deep)" }}>Programme 2026 — Places limitées</span>
              </div>
              <h1 className="wise-display-xl mb-6">
                Transformez la menace de l'IA<br />
                <span style={{ color: "var(--wise-positive)" }}>en opportunité</span>
              </h1>
              <p className="wise-body-lg mb-8 max-w-lg">
                Formation certifiante <strong>100% gratuite</strong>. Devenez <strong>AI Solutions Partner — Ambassadeur Certifié</strong> et conquérez le marché africain de l'IA agentique.
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                <Link href="/apply">
                  <button className="wise-btn-primary flex items-center gap-2 text-lg px-8 py-4">
                    Déposer ma candidature <ArrowRight size={20} />
                  </button>
                </Link>
                <a href="#formule">
                  <button className="wise-btn-secondary flex items-center gap-2 text-lg px-8 py-4">
                    Découvrir le programme
                  </button>
                </a>
              </div>
              <p className="text-sm" style={{ color: "var(--wise-mute)" }}>
                Date limite de candidature : <strong style={{ color: "var(--wise-negative)" }}>31 août 2026</strong>
              </p>
            </div>
            <div className="hidden md:block">
              <img src={HERO_IMG} alt="Réseau IA Afrique" className="w-full max-w-md mx-auto object-contain rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Band ─── */}
      <section className="wise-content-band">
        <div className="container py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard value="220Mds$" label="Dépenses SaaS menacées par l'IA agentique d'ici 2030" source="Gartner, 2025" />
            <StatCard value="90M" label="Emplois à risque dans le monde d'ici 2030" source="WEF Future of Jobs, 2025" />
            <StatCard value="296" label="Candidats sélectionnés pour ce programme exclusif" source="Places disponibles" highlight />
          </div>
        </div>
      </section>

      {/* ─── La Formule (Green Band) ─── */}
      <section id="formule" style={{ backgroundColor: "var(--wise-primary-pale)" }}>
        <div className="container py-20">
          <div className="text-center mb-12">
            <span className="wise-badge-positive inline-block mb-4">100% GRATUIT</span>
            <h2 className="wise-display-md mb-4">La Formule Complète</h2>
            <p className="wise-body-lg max-w-2xl mx-auto">
              Un parcours en 3 étapes pour devenir AI Solutions Partner — Ambassadeur Certifié
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="wise-card">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "var(--wise-primary-pale)" }}>
                <BookOpen size={24} style={{ color: "var(--wise-positive-deep)" }} />
              </div>
              <h3 className="wise-display-xs mb-2">E-Learning 7 jours</h3>
              <p className="wise-body-md">Formation intensive sur l'IA générale, les LLM, les agents IA et leurs applications métier concrètes.</p>
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--wise-canvas-soft)" }}>
                <span className="wise-badge-positive">Gratuit</span>
              </div>
            </div>
            <div className="wise-card">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "var(--wise-primary-pale)" }}>
                <Award size={24} style={{ color: "var(--wise-positive-deep)" }} />
              </div>
              <h3 className="wise-display-xs mb-2">Certification CCA</h3>
              <p className="wise-body-md">Accès à la plateforme Anthropic + voucher pour passer la certification Claude Certified Architect avant le 31 août 2026.</p>
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--wise-canvas-soft)" }}>
                <span className="wise-badge-positive">Gratuit</span>
              </div>
            </div>
            <div className="wise-card">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "var(--wise-primary-pale)" }}>
                <Globe size={24} style={{ color: "var(--wise-positive-deep)" }} />
              </div>
              <h3 className="wise-display-xs mb-2">Statut Ambassadeur</h3>
              <p className="wise-body-md">Devenez AI Solutions Partner indépendant et distribuez des solutions IA sur tout le continent africain.</p>
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--wise-canvas-soft)" }}>
                <span className="wise-badge-positive">Accompagnement complet</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pourquoi maintenant (Dark Band) ─── */}
      <section id="pourquoi" className="wise-hero-band-dark">
        <div className="container py-20">
          <div className="text-center mb-12">
            <h2 className="wise-display-md mb-4" style={{ color: "var(--wise-primary)" }}>Pourquoi se transformer maintenant ?</h2>
            <p className="wise-body-lg" style={{ color: "var(--wise-canvas-soft)" }}>
              L'IA agentique ne menace pas seulement les développeurs. Elle redéfinit l'ensemble du marché du travail.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <JobLossChart />
              <p className="text-xs mt-3" style={{ color: "var(--wise-mute)" }}>Sources : WEF Future of Jobs 2025, Goldman Sachs, BLS</p>
            </div>
            <div className="space-y-6">
              <ImpactItem icon={<TrendingDown size={20} />} title="92 millions d'emplois" desc="seront déplacés par l'IA d'ici 2030 selon le World Economic Forum." />
              <ImpactItem icon={<Users size={20} />} title="41% du code" desc="est déjà généré par l'IA en 2025. Les développeurs classiques sont en première ligne." />
              <ImpactItem icon={<Shield size={20} />} title="234 milliards $" desc="de dépenses SaaS menacées. Les logiciels traditionnels seront remplacés par des agents IA." />
              <ImpactItem icon={<Zap size={20} />} title="Ne subissez pas." desc="Devenez l'acteur de cette transformation. Passez du côté de ceux qui déploient l'IA." />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Partenariats (Sage Band) ─── */}
      <section id="partenaires" className="wise-hero-band">
        <div className="container py-20">
          <div className="text-center mb-12">
            <h2 className="wise-display-md mb-4">Partenariats Stratégiques</h2>
            <p className="wise-body-lg max-w-2xl mx-auto">
              Neopolis Development a noué des partenariats avec les leaders mondiaux de l'IA pour conquérir le marché africain.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="wise-card-dark">
              <h3 className="text-2xl font-bold mb-3" style={{ color: "var(--wise-primary)" }}>Anthropic</h3>
              <p className="text-base" style={{ color: "var(--wise-canvas-soft)" }}>
                Créateur de Claude, l'un des LLM les plus avancés au monde. Notre partenariat offre un accès exclusif à la certification CCA et aux outils de développement d'agents IA de nouvelle génération.
              </p>
            </div>
            <div className="wise-card-dark">
              <h3 className="text-2xl font-bold mb-3" style={{ color: "var(--wise-primary)" }}>Alibaba Cloud</h3>
              <p className="text-base" style={{ color: "var(--wise-canvas-soft)" }}>
                Infrastructure cloud mondiale. Notre partenariat garantit des ressources de calcul puissantes, des modèles ML complémentaires et une infrastructure on-premise pour l'Afrique.
              </p>
            </div>
          </div>
          <div className="mt-12 grid md:grid-cols-2 gap-8 items-center">
            <img src={PARTNER_IMG} alt="Partenariats globaux" className="w-full max-w-sm mx-auto object-contain rounded-3xl" />
            <div>
              <h3 className="wise-display-xs mb-4">Ce que nous fournissons</h3>
              <ul className="space-y-3">
                {["Ressources humaines et techniques dédiées", "Agents IA prêts à l'emploi (ready-to-use)", "Accès multi-LLM (Claude, Qwen, DeepSeek...)", "Infrastructure serveurs on-premise puissante", "Accompagnement commercial et marketing", "Support technique continu"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--wise-primary)" }}>
                      <ChevronRight size={12} style={{ color: "var(--wise-ink)" }} />
                    </span>
                    <span className="wise-body-md">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── AI Solutions Partner Section ─── */}
      <section className="wise-content-band">
        <div className="container py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="wise-display-md mb-6">Devenez AI Solutions Partner</h2>
              <p className="wise-body-lg mb-6">
                Après votre certification, vous obtenez le statut d'<strong>AI Solutions Partner — Ambassadeur Certifié</strong>. Vous devenez un entrepreneur indépendant qui distribue des solutions IA auprès des PME/TPE de votre secteur d'activité.
              </p>
              <div className="wise-card-sage p-6">
                <h4 className="font-semibold text-lg mb-3" style={{ color: "var(--wise-ink)" }}>Votre mission :</h4>
                <p className="wise-body-md">
                  Identifier les entreprises de votre secteur dont les processus peuvent être automatisés par des agents IA, leur proposer des solutions concrètes, et les accompagner dans leur transformation digitale — avec tout le soutien de Neopolis Development.
                </p>
              </div>
            </div>
            <img src={AFRICA_IMG} alt="Réseau Afrique" className="w-full max-w-sm mx-auto object-contain rounded-3xl" />
          </div>
        </div>
      </section>

      {/* ─── CTA Band ─── */}
      <section style={{ backgroundColor: "var(--wise-ink)" }}>
        <div className="container py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: "var(--wise-primary)" }}>
            Ne subissez pas la disruption. Devenez-en l'acteur.
          </h2>
          <p className="text-lg mb-8" style={{ color: "var(--wise-canvas-soft)" }}>
            Formation et certification 100% gratuites — 296 places seulement
          </p>
          <Link href="/apply">
            <button className="wise-btn-primary text-lg px-10 py-4 flex items-center gap-2 mx-auto">
              Postuler maintenant <ArrowRight size={20} />
            </button>
          </Link>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section id="faq" className="wise-hero-band">
        <div className="container py-20">
          <h2 className="wise-display-md text-center mb-12">Questions fréquentes</h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqItems.map((item, i) => (
              <FAQItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer (Dark) ─── */}
      <footer className="wise-footer">
        <div className="container py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <img src={LOGO_URL} alt="Neopolis Akademy" className="h-8 object-contain mb-4 brightness-0 invert" />
              <p className="text-sm" style={{ color: "var(--wise-mute)" }}>
                Neopolis Development — Transformer la menace de l'IA en opportunité pour l'Afrique.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3" style={{ color: "var(--wise-canvas-soft)" }}>Programme</h4>
              <ul className="space-y-2 text-sm" style={{ color: "var(--wise-mute)" }}>
                <li><a href="#formule" className="hover:text-white transition-colors">La Formule</a></li>
                <li><a href="#pourquoi" className="hover:text-white transition-colors">Pourquoi maintenant</a></li>
                <li><a href="#partenaires" className="hover:text-white transition-colors">Partenaires</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3" style={{ color: "var(--wise-canvas-soft)" }}>Contact</h4>
              <ul className="space-y-2 text-sm" style={{ color: "var(--wise-mute)" }}>
                <li>info@neopolis-dev.com</li>
                <li>www.neopolis-dev.com</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <p className="text-center text-sm" style={{ color: "var(--wise-mute)" }}>
              © 2026 Neopolis Development. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Sub-Components ─── */

function StatCard({ value, label, source, highlight }: { value: string; label: string; source: string; highlight?: boolean }) {
  return (
    <div className={highlight ? "wise-card-green text-center" : "wise-card-sage text-center"}>
      <p className="text-4xl md:text-5xl font-black mb-2" style={{ color: highlight ? "var(--wise-positive-deep)" : "var(--wise-ink)" }}>{value}</p>
      <p className="wise-body-md mb-2">{label}</p>
      <p className="text-xs" style={{ color: "var(--wise-mute)" }}>{source}</p>
    </div>
  );
}

function ImpactItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--wise-primary)" }}>
        {icon}
      </div>
      <div>
        <p className="font-semibold text-base" style={{ color: "var(--wise-canvas-soft)" }}>{title}</p>
        <p className="text-sm" style={{ color: "var(--wise-mute)" }}>{desc}</p>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="wise-card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="font-semibold text-base pr-4" style={{ color: "var(--wise-ink)" }}>{question}</span>
        <ChevronDown size={20} className={`flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} style={{ color: "var(--wise-mute)" }} />
      </button>
      {open && (
        <p className="mt-4 pt-4 wise-body-md" style={{ borderTop: "1px solid var(--wise-canvas-soft)" }}>
          {answer}
        </p>
      )}
    </div>
  );
}

function JobLossChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["2025", "2026", "2027", "2028", "2029", "2030"],
        datasets: [
          { label: "Saisie de données", data: [100, 82, 65, 48, 35, 22], borderColor: "#9fe870", backgroundColor: "rgba(159,232,112,0.1)", tension: 0.4, borderWidth: 2 },
          { label: "Service client", data: [100, 85, 70, 55, 42, 30], borderColor: "#38c8ff", backgroundColor: "rgba(56,200,255,0.1)", tension: 0.4, borderWidth: 2 },
          { label: "Comptabilité", data: [100, 88, 75, 62, 50, 40], borderColor: "#ffc091", backgroundColor: "rgba(255,192,145,0.1)", tension: 0.4, borderWidth: 2 },
          { label: "Développeurs", data: [100, 90, 78, 65, 55, 45], borderColor: "#ffd11a", backgroundColor: "rgba(255,209,26,0.1)", tension: 0.4, borderWidth: 2 },
          { label: "Traduction", data: [100, 78, 58, 40, 28, 18], borderColor: "#d03238", backgroundColor: "rgba(208,50,56,0.1)", tension: 0.4, borderWidth: 2 },
          { label: "Juridique", data: [100, 92, 82, 72, 62, 52], borderColor: "#c5edab", backgroundColor: "rgba(197,237,171,0.1)", tension: 0.4, borderWidth: 2 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { color: "#e8ebe6", font: { size: 11 }, boxWidth: 12, padding: 16 } },
          title: { display: true, text: "Emplois restants (%) — Projection 2025-2030", color: "#e8ebe6", font: { size: 14, weight: "bold" } },
        },
        scales: {
          x: { ticks: { color: "#868685" }, grid: { color: "rgba(255,255,255,0.05)" } },
          y: { ticks: { color: "#868685", callback: (v) => v + "%" }, grid: { color: "rgba(255,255,255,0.05)" }, min: 0, max: 110 },
        },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, []);

  return (
    <div className="wise-card-dark" style={{ height: "320px", padding: "16px" }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
