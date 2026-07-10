import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  GraduationCap,
  Award,
  Globe,
  Users,
  TrendingDown,
  Shield,
  Zap,
  BookOpen,
  ArrowRight,
  ChevronDown,
  Play,
  CheckCircle2,
  Sparkles,
  Target,
  Rocket,
  Menu,
  X,
} from "lucide-react";

// Chart.js
import { Chart as ChartJS, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
ChartJS.register(...registerables);

/* ─── Animated Counter Hook ─── */
function useCountUp(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: "-100px" });
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView || !inView || started.current) return;
    started.current = true;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, end, duration, startOnView]);

  return { count, ref };
}

function AnimatedStat({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const { count, ref } = useCountUp(value);
  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

/* ─── Asset URLs ─── */
const LOGO_URL = "/manus-storage/neopolis_logo_transparent_0b0de1c9.png";
const LOGO_ICON = "/manus-storage/favicon_neopolis_d1316b46.png";
const HERO_IMG = "/manus-storage/hero_tunisian_ai_08a6f956.png";
const CERT_IMG = "/manus-storage/step2_certification_b2f65035.png";
const ELEARNING_IMG = "/manus-storage/step1_elearning_d87a7198.png";
const AFRICA_IMG = "/manus-storage/step3_ambassador_91fc256d.png";
const PARTNER_IMG = "/manus-storage/wise_partnership_illustration_b3c56284.png";

/* ─── Animation Variants ─── */
const easeOut: [number, number, number, number] = [0.23, 1, 0.32, 1];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: easeOut } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: easeOut } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeOut } },
};

/* ─── FAQ Data ─── */
const faqItems = [
  { q: "Quels sont les prérequis pour postuler ?", a: "Aucun prérequis technique n'est exigé. Le programme est ouvert à tous les professionnels dont le métier est menacé par l'IA : développeurs, comptables, juristes, traducteurs, agents de service client, etc. Une motivation forte et une capacité d'apprentissage sont les seuls critères essentiels." },
  { q: "La formation et la certification sont-elles vraiment gratuites ?", a: "Oui, 100% gratuites. La formation e-learning de 7 jours, l'accès à la plateforme Anthropic, et le voucher pour la certification Claude Certified Architect (CCA) sont entièrement pris en charge par Neopolis Development grâce à nos partenariats stratégiques." },
  { q: "Combien de temps dure le programme complet ?", a: "La formation e-learning dure 7 jours intensifs. Ensuite, vous disposez d'un accès à la plateforme Anthropic pour préparer la certification CCA à votre rythme, avec une date limite de passage fixée au 31 août 2026." },
  { q: "Quels sont les débouchés après la certification ?", a: "Les candidats certifiés obtiennent le statut d'AI Solutions Partner - Ambassadeur Certifié. Vous devenez un entrepreneur indépendant distribuant des solutions IA auprès des entreprises de votre secteur d'activité, avec le soutien technique et commercial complet de Neopolis Development." },
  { q: "Quels pays sont concernés ?", a: "Le programme est ouvert aux professionnels tunisiens. Il vise à créer un réseau d'ambassadeurs certifiés couvrant tous les secteurs d'activité en Tunisie et dans la région MENA." },
  { q: "Comment fonctionne le processus de sélection ?", a: "Après soumission de votre candidature, un score est calculé automatiquement basé sur vos compétences techniques (40%), votre expertise métier (35%) et vos capacités de communication (25%). Les 200 à 300 meilleurs profils seront sélectionnés pour intégrer le programme." },
  { q: "Quelles ressources Neopolis Development fournit-elle aux ambassadeurs ?", a: "Neopolis fournit : ressources humaines et techniques, matériel et appliances, agents IA prêts à l'emploi, accès à des LLM multiples (pas seulement Anthropic), infrastructure de serveurs puissants hébergés on-premise, et toute l'assistance nécessaire pour attaquer votre marché cible." },
];

/* ─── Animated Section Wrapper ─── */
function AnimatedSection({ children, className, style, id }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      style={style}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
    >
      {children}
    </motion.section>
  );
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--wise-canvas)" }}>
      {/* ─── Navigation (Bubble N10 floating-on-scroll morph) ─── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center"
        style={{ height: "66px" }}
      >
        <div
          className="flex items-center gap-5 w-full transition-all duration-[420ms]"
          style={{
            maxWidth: scrolled ? "min(64rem, calc(100% - 1.5rem))" : "100%",
            height: "66px",
            paddingInline: scrolled ? "1.1rem" : "clamp(1.25rem, 4vw, 3rem)",
            background: scrolled ? "oklch(97% 0.012 95 / 0.9)" : "oklch(97% 0.012 95 / 0.82)",
            backdropFilter: "blur(18px) saturate(160%)",
            WebkitBackdropFilter: "blur(18px) saturate(160%)",
            border: "1px solid transparent",
            borderBottomColor: scrolled ? "oklch(86% 0.014 90)" : "oklch(86% 0.014 90)",
            borderRadius: scrolled ? "999px" : "0",
            transform: scrolled ? "translateY(0.7rem)" : "translateY(0)",
            boxShadow: scrolled ? "0 24px 56px -20px oklch(20% 0.012 250 / 0.18), 0 2px 6px oklch(20% 0.012 250 / 0.08)" : "none",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="flex items-center gap-3">
            <img src={LOGO_ICON} alt="Neopolis Akademy" className="h-9 md:hidden object-contain" />
            <img src={LOGO_URL} alt="Neopolis Akademy" className="hidden md:block h-11 object-contain" />
          </div>
          <div className="hidden md:flex items-center gap-1 ml-auto">
            <NavLink href="#formule">La Formule</NavLink>
            <NavLink href="#pourquoi">Pourquoi maintenant</NavLink>
            <NavLink href="#partenaires">Partenaires</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
          </div>
          <div className="flex items-center gap-2 ml-auto md:ml-2">
            <Link href="/apply">
              <button className="wise-btn-primary flex items-center gap-1.5 text-xs md:text-sm px-3 md:px-5 py-2 md:py-2.5">
                Postuler <ChevronRight size={14} />
              </button>
            </Link>
            <MobileMenuButton />
          </div>
        </div>
      </motion.nav>

      {/* ─── Hero Band (Bubble cream paper) ─── */}
      <section className="overflow-hidden pt-[66px]" style={{ background: "var(--wise-canvas)" }}>
        <div className="container" style={{ padding: "clamp(2.5rem, 6vh, 5rem) clamp(1.25rem, 4vw, 3rem)" }}>
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 lg:gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* Eyebrow */}
              <motion.div variants={fadeInUp} className="wise-eyebrow mb-6">
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--wise-primary)" }} />
                <span>Programme 2026 · Places limitées</span>
              </motion.div>

              {/* Title */}
              <motion.h1 variants={fadeInUp} className="wise-display-mega mb-5" style={{ textWrap: "balance" }}>
                Transformez la menace de l'IA{" "}
                <span className="wise-highlight">en opportunité</span>
              </motion.h1>

              {/* Lede */}
              <motion.p variants={fadeInUp} className="wise-body-lg max-w-[46ch] mb-8">
                Formation certifiante <strong style={{ fontWeight: 600, color: "var(--wise-ink)" }}>100% gratuite</strong>.
                <br />
                Devenez{" "}
                <strong style={{ fontWeight: 600, color: "var(--wise-ink)" }}>AI Solutions Partner</strong> et conquérez le marché de l'IA agentique.
              </motion.p>

              {/* CTA buttons */}
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 mb-6">
                <Link href="/apply">
                  <button className="wise-btn-primary flex items-center gap-2 text-sm md:text-base px-5 md:px-7 py-3 md:py-3.5">
                    Déposer ma candidature <ArrowRight size={18} />
                  </button>
                </Link>
                <a href="#formule">
                  <button className="wise-btn-secondary flex items-center gap-2 text-sm md:text-base px-5 md:px-7 py-3 md:py-3.5">
                    Découvrir le programme
                  </button>
                </a>
              </motion.div>

              {/* Hero note (chips) */}
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-2">
                <span className="wise-badge-positive">100% Gratuit</span>
                <span className="wise-badge-positive">296 places</span>
                <span className="wise-badge-negative">Avant le 31 août 2026</span>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92, x: 28 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.62, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block relative"
            >
              <HeroGraphic />
            </motion.div>
          </div>
        </div>
      </section>



      {/* ─── Bandeau Marquee Partenaires ─── */}
      <div className="py-6 md:py-10 overflow-hidden" style={{ background: "var(--wise-canvas)" }}>
        <p className="wise-label text-center mb-4 tracking-widest uppercase">Nos partenaires technologiques</p>
        <div className="marquee-container">
          <div className="marquee-track">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="marquee-content">
                <img src="/manus-storage/logo_anthropic_e6ab4160.png" alt="Anthropic" className="h-8 md:h-10 object-contain opacity-70 hover:opacity-100 transition-opacity" />
                <img src="/manus-storage/logo_alibaba_cloud_847f5740.png" alt="Alibaba Cloud" className="h-8 md:h-10 object-contain opacity-70 hover:opacity-100 transition-opacity" />
                <span className="wise-body-sm font-semibold opacity-70">Claude</span>
                <span className="wise-body-sm font-semibold opacity-70">Qwen</span>
                <span className="wise-body-sm font-semibold opacity-70">DeepSeek</span>
                <span className="wise-body-sm font-semibold opacity-70">GPT</span>
                <span className="wise-body-sm font-semibold opacity-70">Gemini</span>
                <span className="wise-body-sm font-semibold opacity-70">LangChain</span>
                <span className="wise-body-sm font-semibold opacity-70">CrewAI</span>
                <span className="wise-body-sm font-semibold opacity-70">n8n</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Pourquoi maintenant (Gris Band) ─── */}
      <AnimatedSection id="pourquoi" style={{ background: "var(--wise-canvas-soft)", padding: "clamp(3rem, 6vh, 5rem) clamp(1.25rem, 4vw, 3rem)" }}>
        <div className="container py-12 md:py-20">
          <motion.div variants={fadeInUp} className="text-center mb-10 md:mb-14">
            <span className="wise-eyebrow mb-4 inline-flex">Urgence du marché</span>
            <h2 className="wise-display-md mb-4">Pourquoi se transformer maintenant ?</h2>
            <p className="wise-body-lg max-w-[52ch] mx-auto">
              L'IA agentique redéfinit le marché du travail. Ceux qui ne s'adaptent pas seront remplacés.
            </p>
          </motion.div>

          {/* Chart full width */}
          <motion.div variants={fadeInUp} className="wise-card mb-8 md:mb-12">
            <h3 className="wise-display-xs mb-1" style={{ color: "var(--wise-accent-coral)" }}>Emplois exposés à l'automatisation IA (en millions)</h3>
            <p className="wise-label mb-4">WEF (85M/2025, 92M/2030) · Goldman Sachs (300M/2030) · McKinsey (400-800M/2030)</p>
            <div className="h-[280px] md:h-[340px]">
                <Line
                  data={{
                    labels: ["2020", "2023", "2025", "2027", "2030"],
                    datasets: [
                      {
                        label: "Goldman Sachs (emplois exposés, M)",
                        data: [30, 85, 150, 220, 300],
                        borderColor: "#ff6b6b",
                        backgroundColor: "rgba(255,107,107,0.1)",
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: "#ff6b6b",
                        pointBorderColor: "#ff6b6b",
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        borderWidth: 3,
                      },
                      {
                        label: "WEF (emplois déplacés, M)",
                        data: [12, 40, 85, 88, 92],
                        borderColor: "#38c8ff",
                        backgroundColor: "rgba(56,200,255,0.08)",
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: "#38c8ff",
                        pointBorderColor: "#38c8ff",
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        borderWidth: 2.5,
                      },
                      {
                        label: "McKinsey (scénario haut, M)",
                        data: [50, 150, 300, 550, 800],
                        borderColor: "#ffc091",
                        backgroundColor: "rgba(255,192,145,0.05)",
                        fill: false,
                        tension: 0.4,
                        pointBackgroundColor: "#ffc091",
                        pointBorderColor: "#ffc091",
                        pointRadius: 3,
                        pointHoverRadius: 5,
                        borderWidth: 2,
                        borderDash: [5, 5],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: "bottom" as const,
                        labels: { color: "#454745", font: { size: 11 }, boxWidth: 12, padding: 16 },
                      },
                      tooltip: {
                        backgroundColor: "rgba(0,0,0,0.85)",
                        titleColor: "#fff",
                        bodyColor: "rgba(255,255,255,0.8)",
                        borderColor: "rgba(255,107,107,0.3)",
                        borderWidth: 1,
                      },
                    },
                    scales: {
                      x: {
                        grid: { color: "rgba(0,0,0,0.06)" },
                        ticks: { color: "#454745", font: { size: 11 } },
                      },
                      y: {
                        grid: { color: "rgba(0,0,0,0.06)" },
                        ticks: { color: "#454745", font: { size: 11 } },
                        beginAtZero: true,
                      },
                    },
                  }}
                />
            </div>
          </motion.div>

          {/* Stats cards grid */}
          <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 md:mb-12">
              <motion.div variants={scaleIn} className="wise-card" style={{ background: "var(--tint-coral)" }}>
                <TrendingDown size={20} style={{ color: "var(--wise-accent-coral)" }} className="mb-3" />
                <p className="wise-display-sm mb-1"><AnimatedStat value={300} suffix="M" /></p>
                <p className="wise-body-sm" style={{ color: "var(--wise-accent-coral)", fontWeight: 600 }}>d'emplois exposés à l'automatisation</p>
                <p className="wise-label mt-2">Goldman Sachs, 2023</p>
              </motion.div>

              <motion.div variants={scaleIn} className="wise-card" style={{ background: "var(--tint-cyan)" }}>
                <Users size={20} style={{ color: "var(--wise-accent-cyan)" }} className="mb-3" />
                <p className="wise-display-sm mb-1"><AnimatedStat value={92} suffix="M" /></p>
                <p className="wise-body-sm" style={{ color: "var(--wise-accent-cyan)", fontWeight: 600 }}>d'emplois déplacés d'ici 2030</p>
                <p className="wise-label mt-2">WEF Future of Jobs 2025</p>
              </motion.div>

              <motion.div variants={scaleIn} className="wise-card" style={{ background: "var(--tint-pear)" }}>
                <Shield size={20} style={{ color: "oklch(64% 0.18 95)" }} className="mb-3" />
                <p className="wise-display-sm mb-1"><AnimatedStat value={30} suffix="%" /></p>
                <p className="wise-body-sm" style={{ color: "oklch(52% 0.14 95)", fontWeight: 600 }}>des heures de travail automatisées</p>
                <p className="wise-label mt-2">McKinsey Global Institute</p>
              </motion.div>

              <motion.div variants={scaleIn} className="wise-card" style={{ background: "var(--tint-mint)" }}>
                <TrendingDown size={20} style={{ color: "var(--wise-positive-deep)" }} className="mb-3" />
                <p className="wise-display-sm mb-1"><AnimatedStat value={220} suffix=" Milliards $" /></p>
                <p className="wise-body-sm" style={{ color: "var(--wise-positive-deep)", fontWeight: 600 }}>de SaaS menacés par les agents IA</p>
                <p className="wise-label mt-2">Gartner, 2025</p>
              </motion.div>
          </motion.div>

          {/* CTA bottom */}
          <motion.div variants={fadeInUp} className="text-center">
            <button className="wise-btn-tertiary">
              <Zap size={16} />
              Ne subissez pas la disruption. Devenez l'acteur du changement.
            </button>
            <p className="wise-label mt-4">Sources : WEF Future of Jobs 2025, Goldman Sachs 2023/2026, McKinsey Global Institute, Gartner 2025</p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── La Formule (Green Band) ─── */}
      <AnimatedSection id="formule" style={{ background: "var(--wise-canvas)", padding: "clamp(3rem, 6vh, 5rem) clamp(1.25rem, 4vw, 3rem)" }}>
        <div className="container py-12">
          <motion.div variants={fadeInUp} className="text-center mb-14">
            <span className="wise-badge-positive mb-4">100% Gratuit</span>
            <h2 className="wise-display-md mb-4">La Formule Complète</h2>
            <p className="wise-body-lg max-w-[52ch] mx-auto">
              Un parcours en 3 étapes pour devenir AI Solutions Partner – Ambassadeur Certifié
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
            <motion.div variants={fadeInUp}>
              <FormulaCard
                icon={<BookOpen size={28} />}
                step="01"
                title="E-Learning 7 jours"
                description="Formation intensive sur l'IA générale, les LLM, les agents IA et leurs applications métier concrètes."
                badge="Gratuit"
                image={ELEARNING_IMG}
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <FormulaCard
                icon={<Award size={28} />}
                step="02"
                title="Certification CCA"
                description="Accès à la plateforme Anthropic + voucher pour passer la certification Claude Certified Architect avant le 31 août 2026."
                badge="Gratuit"
                image={CERT_IMG}
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <FormulaCard
                icon={<Globe size={28} />}
                step="03"
                title="Statut Ambassadeur"
                description="Devenez AI Solutions Partner indépendant et distribuez des solutions IA auprès des entreprises de votre secteur."
                badge="Accompagnement complet"
                image={AFRICA_IMG}
              />
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── Partenariats (Sage Band) ─── */}
      <AnimatedSection id="partenaires" style={{ background: "var(--wise-canvas-soft)", padding: "clamp(3rem, 6vh, 5rem) clamp(1.25rem, 4vw, 3rem)" }}>
        <div className="container py-12">
          <motion.div variants={fadeInUp} className="text-center mb-14">
            <span className="wise-eyebrow mb-4 inline-flex">Écosystème</span>
            <h2 className="wise-display-md mb-4">Partenariats Stratégiques</h2>
            <p className="wise-body-lg max-w-[52ch] mx-auto">
              Neopolis Development a noué des partenariats avec les leaders mondiaux de l'IA pour conquérir le marché de l'IA agentique.
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 mb-8 md:mb-12">
            <motion.div variants={scaleIn}>
              <PartnerCard
                name="Anthropic"
                logo="/manus-storage/logo_anthropic_e6ab4160.png"
                description="Créateur de Claude, l'un des LLM les plus avancés au monde. Notre partenariat offre un accès exclusif à la certification CCA et aux outils de développement d'agents IA de nouvelle génération."
              />
            </motion.div>
            <motion.div variants={scaleIn}>
              <PartnerCard
                name="Alibaba Cloud"
                logo="/manus-storage/logo_alibaba_cloud_847f5740.png"
                description="Infrastructure cloud mondiale. Notre partenariat garantit des ressources de calcul puissantes, des modèles ML complémentaires et une infrastructure on-premise pour l'Afrique."
              />
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
            {/* Graphique animé - Réseau de nœuds */}
            <motion.div variants={fadeInLeft} className="relative flex items-center justify-center">
              <NetworkGraph />
            </motion.div>
            <motion.div variants={fadeInRight}>
              <h3 className="wise-display-xs mb-4">Ce que nous fournissons</h3>
              <div className="space-y-2">
                {[
                  "Ressources humaines et techniques dédiées",
                  "Agents IA prêts à l'emploi (ready-to-use)",
                  "Accès multi-LLM (Claude, Qwen, DeepSeek...)",
                  "Infrastructure serveurs on-premise puissante",
                  "Accompagnement commercial et marketing",
                  "Support technique continu",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    viewport={{ once: true }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg cursor-default"
                  >
                    <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--wise-primary)" }}>
                      <CheckCircle2 size={14} style={{ color: "var(--wise-ink)" }} />
                    </span>
                    <span className="text-sm font-medium" style={{ color: "var(--wise-ink)" }}>{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* ─── AI Solutions Partner Section ─── */}
      <AnimatedSection style={{ background: "var(--wise-canvas)", padding: "clamp(3rem, 6vh, 5rem) clamp(1.25rem, 4vw, 3rem)" }}>
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
            <motion.div variants={fadeInLeft}>
              <span className="wise-eyebrow mb-6 inline-flex">
                <Target size={12} />
                Votre futur statut
              </span>
              <h2 className="wise-display-md mb-6">Devenez AI Solutions Partner</h2>
              <p className="wise-body-lg mb-6">
                Après votre certification, vous obtenez le statut d'<strong>AI Solutions Partner - Ambassadeur Certifié</strong>. Vous devenez un entrepreneur indépendant qui distribue des solutions IA auprès des PME/TPE de votre secteur d'activité.
              </p>
              <div className="wise-card-sage p-6">
                <h4 className="font-semibold text-lg mb-3" style={{ color: "var(--wise-ink)" }}>Votre mission :</h4>
                <p className="wise-body-md">
                  Identifier les entreprises de votre secteur dont les processus peuvent être automatisés par des agents IA, leur proposer des solutions concrètes, et les accompagner dans leur transformation digitale - avec tout le soutien de Neopolis Development.
                </p>
              </div>
            </motion.div>
            <motion.div variants={fadeInRight}>
              <img src={AFRICA_IMG} alt="Réseau Afrique" className="w-full max-w-xs md:max-w-sm mx-auto object-contain rounded-3xl" />
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* ─── CTA Band ─── */}
      <AnimatedSection style={{ background: "var(--tint-mint)", padding: "clamp(3rem, 6vh, 5rem) clamp(1.25rem, 4vw, 3rem)" }}>
        <div className="container py-10 md:py-20 text-center">
          <motion.div variants={fadeInUp}>
            <Rocket size={36} style={{ color: "var(--wise-positive-deep)" }} className="mx-auto mb-6" />
            <h2 className="wise-display-xl mb-5" style={{ textWrap: "balance" }}>
              Ne subissez pas la disruption.<br />Devenez-en l'acteur.
            </h2>
            <p className="wise-body-lg mb-10 max-w-[42ch] mx-auto">
              Formation et certification 100% gratuites – 296 places seulement
            </p>
            <Link href="/apply">
              <button className="wise-btn-primary text-base md:text-lg px-8 md:px-10 py-4 md:py-5 flex items-center gap-3 mx-auto">
                Postuler maintenant <ArrowRight size={20} />
              </button>
            </Link>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── FAQ Section ─── */}
      <AnimatedSection id="faq" style={{ background: "var(--wise-canvas-soft)", padding: "clamp(3rem, 6vh, 5rem) clamp(1.25rem, 4vw, 3rem)" }}>
        <div className="container py-12">
          <motion.div variants={fadeInUp} className="text-center mb-14">
            <span className="wise-eyebrow mb-4 inline-flex">Support</span>
            <h2 className="wise-display-md">Questions fréquentes</h2>
          </motion.div>
          <motion.div variants={staggerContainer} className="max-w-3xl mx-auto space-y-3">
            {faqItems.map((item, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <FAQItem question={item.q} answer={item.a} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── Footer (Dark) ─── */}
      <footer className="wise-footer">
        <div className="container py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <img src={LOGO_URL} alt="Neopolis Akademy" className="h-12 object-contain mb-3" />
              <p className="wise-body-sm">
                Neopolis Development – Transformer la menace de l'IA en opportunité.
              </p>
            </div>
            <div>
              <h4 className="wise-label mb-3">Programme</h4>
              <ul className="space-y-1.5">
                <li><a href="#formule" className="wise-body-sm hover:underline">La Formule</a></li>
                <li><a href="#pourquoi" className="wise-body-sm hover:underline">Pourquoi maintenant</a></li>
                <li><a href="#partenaires" className="wise-body-sm hover:underline">Partenaires</a></li>
                <li><a href="#faq" className="wise-body-sm hover:underline">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="wise-label mb-3">Contact</h4>
              <ul className="space-y-1.5">
                <li><a href="mailto:info@neopolis-dev.com" className="wise-body-sm hover:underline">info@neopolis-dev.com</a></li>
                <li><a href="https://www.neopolis-dev.com" target="_blank" rel="noopener noreferrer" className="wise-body-sm hover:underline">www.neopolis-dev.com</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--wise-rule)" }}>
            <p className="text-center wise-body-sm" style={{ color: "var(--wise-mute)" }}>
              © 2026 Neopolis Development. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-sm font-semibold relative group"
      style={{ color: "var(--wise-ink)" }}
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 rounded-full group-hover:w-full transition-all duration-300" style={{ backgroundColor: "var(--wise-primary)" }} />
    </a>
  );
}

function StatCard({ value, label, source, highlight }: { value: string; label: string; source: string; highlight?: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={highlight ? "wise-card-green text-center h-full" : "wise-card-sage text-center h-full"}
    >
      <p className="text-3xl md:text-4xl lg:text-5xl font-black mb-2 md:mb-3" style={{ color: highlight ? "var(--wise-positive-deep)" : "var(--wise-ink)" }}>{value}</p>
      <p className="wise-body-md mb-2">{label}</p>
      <p className="text-xs" style={{ color: "var(--wise-mute)" }}>{source}</p>
    </motion.div>
  );
}

function FormulaCard({ icon, step, title, description, badge, image }: { icon: React.ReactNode; step: string; title: string; description: string; badge: string; image: string }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] } }}
      className="wise-card h-full flex flex-col shadow-sm overflow-hidden group cursor-pointer"
      style={{ transition: "box-shadow 0.3s ease" }}
    >
      {/* Image en haut avec overlay au hover */}
      <div className="relative w-full h-44 -mx-6 -mt-6 mb-5 overflow-hidden" style={{ width: "calc(100% + 48px)" }}>
        <motion.img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="absolute top-3 right-3 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm" style={{ backgroundColor: "rgba(255,255,255,0.9)", color: "var(--wise-ink)" }}>
          ÉTAPE {step}
        </span>
      </div>

      {/* Contenu */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--wise-primary-pale)" }}>
          <span style={{ color: "var(--wise-positive-deep)" }}>{icon}</span>
        </div>
        <h3 className="wise-display-xs">{title}</h3>
      </div>
      <p className="wise-body-md flex-1 mb-4">{description}</p>

      {/* Badge en bas */}
      <div className="pt-4 mt-auto" style={{ borderTop: "1px solid var(--wise-canvas-soft)" }}>
        <motion.span
          className="wise-badge-positive inline-block"
          whileHover={{ scale: 1.05 }}
        >
          {badge}
        </motion.span>
      </div>
    </motion.div>
  );
}

function PartnerCard({ name, description, logo }: { name: string; description: string; logo: string }) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] } }}
      className="wise-card h-full"
    >
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden" style={{ background: "var(--wise-canvas-soft)" }}>
          <img src={logo} alt={name} className="w-8 h-8 object-contain" />
        </div>
        <h3 className="wise-display-xs">{name}</h3>
      </div>
      <p className="wise-body-md">{description}</p>
    </motion.div>
  );
}

function ImpactItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div
      whileHover={{ x: 4, transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] } }}
      className="flex gap-4 p-4 rounded-xl"
      style={{ background: "var(--tint-mint)" }}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--wise-primary)" }}>
        <span style={{ color: "var(--wise-ink)" }}>{icon}</span>
      </div>
      <div>
        <p className="wise-body-sm" style={{ fontWeight: 600 }}>{title}</p>
        <p className="wise-label">{desc}</p>
      </div>
    </motion.div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      className="wise-card overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="font-semibold text-base pr-4" style={{ color: "var(--wise-ink)" }}>{question}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="flex-shrink-0"
        >
          <ChevronDown size={20} style={{ color: "var(--wise-mute)" }} />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <p className="mt-4 pt-4 wise-body-md" style={{ borderTop: "1px solid var(--wise-canvas-soft)" }}>
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function JobLossChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });

  useEffect(() => {
    if (!canvasRef.current || !isInView) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    chartRef.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: ["2025", "2026", "2027", "2028", "2029", "2030"],
        datasets: [
          { label: "Saisie de données", data: [100, 82, 65, 48, 35, 22], borderColor: "#9fe870", backgroundColor: "rgba(159,232,112,0.08)", fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: "#9fe870" },
          { label: "Service client", data: [100, 85, 70, 55, 42, 30], borderColor: "#38c8ff", backgroundColor: "rgba(56,200,255,0.08)", fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: "#38c8ff" },
          { label: "Comptabilité", data: [100, 88, 75, 62, 50, 40], borderColor: "#ffc091", backgroundColor: "rgba(255,192,145,0.08)", fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: "#ffc091" },
          { label: "Développeurs", data: [100, 90, 78, 65, 55, 45], borderColor: "#ffd11a", backgroundColor: "rgba(255,209,26,0.08)", fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: "#ffd11a" },
          { label: "Traduction", data: [100, 78, 58, 40, 28, 18], borderColor: "#d03238", backgroundColor: "rgba(208,50,56,0.08)", fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: "#d03238" },
          { label: "Juridique", data: [100, 92, 82, 72, 62, 52], borderColor: "#c5edab", backgroundColor: "rgba(197,237,171,0.08)", fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: "#c5edab" },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1500, easing: "easeOutQuart" },
        plugins: {
          legend: { position: "bottom", labels: { color: "#e8ebe6", font: { size: 11, family: "Inter" }, boxWidth: 12, padding: 16, usePointStyle: true } },
          title: { display: true, text: "Emplois restants (%) - Projection 2025-2030", color: "#e8ebe6", font: { size: 14, weight: "bold", family: "Inter" }, padding: { bottom: 16 } },
        },
        scales: {
          x: { ticks: { color: "#868685", font: { family: "Inter" } }, grid: { color: "rgba(255,255,255,0.04)" } },
          y: { ticks: { color: "#868685", font: { family: "Inter" }, callback: (v: any) => v + "%" }, grid: { color: "rgba(255,255,255,0.04)" }, min: 0, max: 110 },
        },
        interaction: { intersect: false, mode: "index" },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [isInView]);

  return (
    <div ref={containerRef} className="wise-card-dark" style={{ height: "340px", padding: "20px" }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

function NetworkGraph() {
  const nodes = [
    { id: "neopolis", label: "Neopolis", x: 50, y: 50, size: 28, color: "#9fe870" },
    { id: "anthropic", label: "Anthropic", x: 20, y: 20, size: 22, color: "#d4a574" },
    { id: "alibaba", label: "Alibaba Cloud", x: 80, y: 20, size: 22, color: "#ff8c42" },
    { id: "agents", label: "Agents IA", x: 15, y: 70, size: 18, color: "#38c8ff" },
    { id: "llm", label: "Multi-LLM", x: 85, y: 70, size: 18, color: "#a78bfa" },
    { id: "infra", label: "Infra", x: 30, y: 90, size: 16, color: "#34d399" },
    { id: "support", label: "Support", x: 70, y: 90, size: 16, color: "#fbbf24" },
  ];

  const edges = [
    { from: "neopolis", to: "anthropic" },
    { from: "neopolis", to: "alibaba" },
    { from: "neopolis", to: "agents" },
    { from: "neopolis", to: "llm" },
    { from: "neopolis", to: "infra" },
    { from: "neopolis", to: "support" },
    { from: "anthropic", to: "agents" },
    { from: "alibaba", to: "llm" },
    { from: "alibaba", to: "infra" },
  ];

  return (
    <div className="relative w-full" style={{ height: "280px" }}>
      {/* Lignes de connexion animées */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
        {edges.map((edge, i) => {
          const fromNode = nodes.find(n => n.id === edge.from)!;
          const toNode = nodes.find(n => n.id === edge.to)!;
          return (
            <motion.line
              key={i}
              x1={`${fromNode.x}%`}
              y1={`${fromNode.y}%`}
              x2={`${toNode.x}%`}
              y2={`${toNode.y}%`}
              stroke="rgba(159,232,112,0.3)"
              strokeWidth="1.5"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
            />
          );
        })}
        {/* Particules animées sur les lignes */}
        {edges.slice(0, 4).map((edge, i) => {
          const fromNode = nodes.find(n => n.id === edge.from)!;
          const toNode = nodes.find(n => n.id === edge.to)!;
          return (
            <motion.circle
              key={`particle-${i}`}
              r="3"
              fill="#9fe870"
              initial={{ opacity: 0.8 }}
              animate={{
                cx: [`${fromNode.x}%`, `${toNode.x}%`],
                cy: [`${fromNode.y}%`, `${toNode.y}%`],
              }}
              transition={{
                duration: 2.5 + i * 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: i * 0.8,
              }}
            />
          );
        })}
      </svg>

      {/* Nœuds */}
      {nodes.map((node, i) => (
        <motion.div
          key={node.id}
          className="absolute flex flex-col items-center"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            transform: "translate(-50%, -50%)",
            zIndex: 1,
          }}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 + i * 0.1, ease: [0.23, 1, 0.32, 1] }}
          viewport={{ once: true }}
        >
          <motion.div
            className="rounded-full flex items-center justify-center shadow-lg"
            style={{
              width: node.size * 2,
              height: node.size * 2,
              backgroundColor: node.color,
              boxShadow: `0 0 20px ${node.color}40`,
            }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-xs font-semibold mt-1 whitespace-nowrap" style={{ color: "var(--wise-ink)" }}>
            {node.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function HeroGraphic() {
  return (
    <div className="relative w-full flex items-center justify-center" style={{ height: "320px" }}>
      {/* Masquer sur mobile pour performance */}
      <div className="hidden md:block absolute inset-0">
      {/* Fond radial subtil */}
      <div className="absolute inset-0 rounded-3xl" style={{ background: "radial-gradient(circle at 50% 50%, rgba(159,232,112,0.08) 0%, transparent 60%)" }} />

      {/* Orbites animées */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
        {/* Orbite extérieure */}
        <motion.circle
          cx="200" cy="200" r="160"
          fill="none"
          stroke="rgba(159,232,112,0.15)"
          strokeWidth="1"
          strokeDasharray="8 6"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "center" }}
        />
        {/* Orbite moyenne */}
        <motion.circle
          cx="200" cy="200" r="110"
          fill="none"
          stroke="rgba(159,232,112,0.2)"
          strokeWidth="1.5"
          strokeDasharray="4 8"
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "center" }}
        />
        {/* Orbite intérieure */}
        <motion.circle
          cx="200" cy="200" r="60"
          fill="none"
          stroke="rgba(159,232,112,0.25)"
          strokeWidth="1"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "center" }}
        />

        {/* Lignes de connexion entre les nœuds satellites et le centre */}
        {[
          { angle: 0, r: 160 },
          { angle: 72, r: 160 },
          { angle: 144, r: 160 },
          { angle: 216, r: 160 },
          { angle: 288, r: 160 },
          { angle: 30, r: 110 },
          { angle: 120, r: 110 },
          { angle: 210, r: 110 },
          { angle: 300, r: 110 },
        ].map((pos, i) => {
          const x = 200 + pos.r * Math.cos((pos.angle * Math.PI) / 180);
          const y = 200 + pos.r * Math.sin((pos.angle * Math.PI) / 180);
          return (
            <motion.line
              key={`line-${i}`}
              x1="200" y1="200"
              x2={x} y2={y}
              stroke="rgba(159,232,112,0.12)"
              strokeWidth="1"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
            />
          );
        })}

        {/* Particules qui voyagent sur les orbites */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.circle
            key={`particle-orbit-${i}`}
            r="3"
            fill="#9fe870"
            opacity="0.8"
            animate={{
              cx: [
                200 + 160 * Math.cos((i * 72 * Math.PI) / 180),
                200 + 160 * Math.cos(((i * 72 + 180) * Math.PI) / 180),
                200 + 160 * Math.cos(((i * 72 + 360) * Math.PI) / 180),
              ],
              cy: [
                200 + 160 * Math.sin((i * 72 * Math.PI) / 180),
                200 + 160 * Math.sin(((i * 72 + 180) * Math.PI) / 180),
                200 + 160 * Math.sin(((i * 72 + 360) * Math.PI) / 180),
              ],
            }}
            transition={{ duration: 8 + i, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </svg>

      {/* Nœud central - Logo Neopolis Akademy */}
      <motion.div
        className="absolute flex items-center justify-center rounded-full overflow-hidden"
        style={{
          width: "110px",
          height: "110px",
          background: "#ffffff",
          boxShadow: "0 0 40px rgba(159,232,112,0.4), 0 0 80px rgba(159,232,112,0.15), 0 4px 20px rgba(0,0,0,0.1)",
          border: "3px solid rgba(159,232,112,0.6)",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <img src={LOGO_URL} alt="Neopolis Akademy" className="w-20 h-20 object-contain" />
      </motion.div>

      {/* Nœuds satellites - Orbite extérieure */}
      {[
        { label: "Claude", angle: 0, icon: "ai" },
        { label: "Qwen", angle: 72, icon: "ai" },
        { label: "DeepSeek", angle: 144, icon: "ai" },
        { label: "Agents", angle: 216, icon: "bot" },
        { label: "Deploy", angle: 288, icon: "rocket" },
      ].map((node, i) => {
        const x = 50 + 38 * Math.cos((node.angle * Math.PI) / 180);
        const y = 50 + 38 * Math.sin((node.angle * Math.PI) / 180);
        return (
          <motion.div
            key={node.label}
            className="absolute flex flex-col items-center"
            style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.15, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <motion.div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: "rgba(159,232,112,0.15)",
                border: "1.5px solid rgba(159,232,112,0.4)",
                backdropFilter: "blur(4px)",
              }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-xs font-bold" style={{ color: "#9fe870" }}>
                {node.label.charAt(0)}
              </span>
            </motion.div>
            <span className="text-xs font-medium mt-1 whitespace-nowrap" style={{ color: "var(--wise-ink)", opacity: 0.7 }}>
              {node.label}
            </span>
          </motion.div>
        );
      })}

      {/* Nœuds satellites - Orbite moyenne */}
      {[
        { label: "Formation", angle: 30 },
        { label: "Certification", angle: 120 },
        { label: "Business", angle: 210 },
        { label: "Support", angle: 300 },
      ].map((node, i) => {
        const x = 50 + 26 * Math.cos((node.angle * Math.PI) / 180);
        const y = 50 + 26 * Math.sin((node.angle * Math.PI) / 180);
        return (
          <motion.div
            key={node.label}
            className="absolute flex flex-col items-center"
            style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 + i * 0.15, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <motion.div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: "rgba(56,200,255,0.1)",
                border: "1px solid rgba(56,200,255,0.3)",
              }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-xs font-bold" style={{ color: "#38c8ff" }}>
                {node.label.charAt(0)}
              </span>
            </motion.div>
            <span className="text-[10px] font-medium mt-0.5 whitespace-nowrap" style={{ color: "var(--wise-ink)", opacity: 0.6 }}>
              {node.label}
            </span>
          </motion.div>
        );
      })}

      </div>
      {/* Version mobile simplifiée */}
      <div className="md:hidden w-full flex items-center justify-center">
        <motion.div
          className="flex items-center justify-center rounded-full overflow-hidden"
          style={{
            width: "120px",
            height: "120px",
            background: "#ffffff",
            boxShadow: "0 0 40px rgba(159,232,112,0.3), 0 4px 20px rgba(0,0,0,0.1)",
            border: "3px solid rgba(159,232,112,0.6)",
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <img src={LOGO_URL} alt="Neopolis Akademy" className="w-20 h-20 object-contain" />
        </motion.div>
      </div>
      {/* Badges flottants */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
        className="absolute -top-2 right-0 wise-card px-3 py-2 shadow-lg hidden md:block"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={14} style={{ color: "var(--wise-primary)" }} />
          <span className="text-xs font-semibold" style={{ color: "var(--wise-ink)" }}>Certification CCA</span>
        </div>
      </motion.div>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-2 left-0 wise-card px-3 py-2 shadow-lg hidden md:block"
      >
        <div className="flex items-center gap-2">
          <Globe size={14} style={{ color: "var(--wise-accent-cyan)" }} />
          <span className="text-xs font-semibold" style={{ color: "var(--wise-ink)" }}>Certification internationale</span>
        </div>
      </motion.div>
    </div>
  );
}

function MobileMenuButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg"
        style={{ backgroundColor: "var(--wise-primary-pale)" }}
        aria-label="Menu"
      >
        {open ? <X size={20} style={{ color: "var(--wise-ink)" }} /> : <Menu size={20} style={{ color: "var(--wise-ink)" }} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="md:hidden fixed top-16 left-0 right-0 z-50 px-4 pt-2"
          >
            <div className="rounded-2xl p-4 shadow-xl" style={{ backgroundColor: "#ffffff", border: "1px solid rgba(0,0,0,0.06)" }}>
              <nav className="flex flex-col gap-3">
                <a href="#formule" onClick={() => setOpen(false)} className="text-sm font-semibold py-2 px-3 rounded-lg hover:bg-gray-50" style={{ color: "var(--wise-ink)" }}>La Formule</a>
                <a href="#pourquoi" onClick={() => setOpen(false)} className="text-sm font-semibold py-2 px-3 rounded-lg hover:bg-gray-50" style={{ color: "var(--wise-ink)" }}>Pourquoi maintenant</a>
                <a href="#partenaires" onClick={() => setOpen(false)} className="text-sm font-semibold py-2 px-3 rounded-lg hover:bg-gray-50" style={{ color: "var(--wise-ink)" }}>Partenaires</a>
                <a href="#faq" onClick={() => setOpen(false)} className="text-sm font-semibold py-2 px-3 rounded-lg hover:bg-gray-50" style={{ color: "var(--wise-ink)" }}>FAQ</a>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
