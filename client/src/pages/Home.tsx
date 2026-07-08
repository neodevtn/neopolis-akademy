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
} from "lucide-react";

// Chart.js
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

/* ─── Asset URLs ─── */
const LOGO_URL = "/manus-storage/logo_neopolis_akademy_wise_ede57803.png";
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
  { q: "Quels sont les débouchés après la certification ?", a: "Les candidats certifiés obtiennent le statut d'AI Solutions Partner - Ambassadeur Certifié. Vous devenez un entrepreneur indépendant distribuant des solutions IA auprès des PME/TPE de votre secteur d'activité sur tout le continent africain, avec le soutien technique et commercial complet de Neopolis Development." },
  { q: "Quels pays africains sont concernés ?", a: "L'ensemble des 54 pays africains sont éligibles. Le programme vise à créer un réseau d'ambassadeurs couvrant tout le continent, avec un focus particulier sur les marchés francophones, anglophones et arabophones." },
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
      {/* ─── Navigation ─── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: "#ffffff",
          backdropFilter: "blur(12px)",
          boxShadow: scrolled ? "0 1px 3px rgba(14,15,12,0.08)" : "none",
        }}
      >
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Neopolis Akademy" className="h-14 object-contain" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#formule">La Formule</NavLink>
            <NavLink href="#pourquoi">Pourquoi maintenant</NavLink>
            <NavLink href="#partenaires">Partenaires</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
          </div>
          <Link href="/apply">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="wise-btn-primary flex items-center gap-2"
            >
              Postuler <ChevronRight size={16} />
            </motion.button>
          </Link>
        </div>
      </motion.nav>

      {/* ─── Hero Band (Sage) ─── */}
      <section className="wise-hero-band overflow-hidden">
        <div className="container py-8 md:py-14">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8" style={{ backgroundColor: "var(--wise-primary-pale)" }}>
                <motion.span
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "var(--wise-positive)" }}
                />
                <span className="text-sm font-semibold" style={{ color: "var(--wise-positive-deep)" }}>Programme 2026 - Places limitées</span>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="wise-display-xl mb-6" style={{ lineHeight: 1.05 }}>
                Transformez la menace de l'IA{" "}
                <span className="relative inline-block">
                  <span style={{ color: "var(--wise-positive)" }}>en opportunité</span>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                    className="absolute bottom-0 left-0 w-full h-1 rounded-full origin-left"
                    style={{ backgroundColor: "var(--wise-primary)" }}
                  />
                </span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="wise-body-lg mb-8 max-w-lg">
                Formation certifiante <strong>100% gratuite</strong>. Devenez{" "}
                <strong>AI Solutions Partner - Ambassadeur Certifié</strong> et conquérez le marché africain de l'IA agentique.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 mb-6">
                <Link href="/apply">
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(159,232,112,0.3)" }}
                    whileTap={{ scale: 0.97 }}
                    className="wise-btn-primary flex items-center gap-2 text-lg px-8 py-4"
                  >
                    Déposer ma candidature <ArrowRight size={20} />
                  </motion.button>
                </Link>
                <a href="#formule">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="wise-btn-secondary flex items-center gap-2 text-lg px-8 py-4"
                  >
                    Découvrir le programme
                  </motion.button>
                </a>
              </motion.div>

              <motion.div variants={fadeInUp} className="inline-flex items-center gap-3 px-4 py-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)" }}>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <CheckCircle2 size={16} style={{ color: "var(--wise-positive)" }} />
                  <span className="text-sm font-semibold" style={{ color: "var(--wise-ink)" }}>100% Gratuit</span>
                </div>
                <div className="w-px h-4" style={{ backgroundColor: "rgba(0,0,0,0.12)" }} />
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <CheckCircle2 size={16} style={{ color: "var(--wise-positive)" }} />
                  <span className="text-sm font-semibold" style={{ color: "var(--wise-ink)" }}>296 places</span>
                </div>
                <div className="w-px h-4" style={{ backgroundColor: "rgba(0,0,0,0.12)" }} />
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <CheckCircle2 size={16} style={{ color: "var(--wise-negative)" }} />
                  <span className="text-sm font-semibold" style={{ color: "var(--wise-negative)" }}>Avant le 31 août 2026</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="hidden md:block relative"
            >
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  <img src={HERO_IMG} alt="Professionnels tunisiens en formation IA" className="w-full max-w-lg mx-auto object-contain rounded-3xl" />
                </motion.div>
                {/* Floating badges */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -top-4 -right-4 wise-card px-4 py-2 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} style={{ color: "var(--wise-primary)" }} />
                    <span className="text-sm font-semibold" style={{ color: "var(--wise-ink)" }}>Certification CCA</span>
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-4 -left-4 wise-card px-4 py-2 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <Globe size={16} style={{ color: "var(--wise-accent-cyan)" }} />
                    <span className="text-sm font-semibold" style={{ color: "var(--wise-ink)" }}>Certification internationale</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Stats Band ─── */}
      <AnimatedSection className="wise-content-band">
        <div className="container py-10">
          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div variants={scaleIn}><StatCard value="220Mds$" label="Dépenses SaaS menacées par l'IA agentique d'ici 2030" source="Gartner, 2025" /></motion.div>
            <motion.div variants={scaleIn}><StatCard value="90M" label="Emplois à risque dans le monde d'ici 2030" source="WEF Future of Jobs, 2025" /></motion.div>
            <motion.div variants={scaleIn}><StatCard value="296" label="Candidats sélectionnés pour ce programme exclusif" source="Places disponibles" highlight /></motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── La Formule (Green Band) ─── */}
      <AnimatedSection id="formule" style={{ backgroundColor: "var(--wise-primary-pale)" }}>
        <div className="container py-12">
          <motion.div variants={fadeInUp} className="text-center mb-14">
            <span className="wise-badge-positive inline-block mb-4">100% GRATUIT</span>
            <h2 className="wise-display-md mb-4">La Formule Complète</h2>
            <p className="wise-body-lg max-w-2xl mx-auto">
              Un parcours en 3 étapes pour devenir AI Solutions Partner - Ambassadeur Certifié
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-8">
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
                description="Devenez AI Solutions Partner indépendant et distribuez des solutions IA sur tout le continent africain."
                badge="Accompagnement complet"
                image={AFRICA_IMG}
              />
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── Pourquoi maintenant (Dark Band) ─── */}
      <AnimatedSection id="pourquoi" className="wise-hero-band-dark">
        <div className="container py-12">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="wise-display-md mb-3" style={{ color: "var(--wise-primary)" }}>Pourquoi se transformer maintenant ?</h2>
            <p className="wise-body-lg max-w-2xl mx-auto" style={{ color: "var(--wise-canvas-soft)" }}>
              L'IA agentique redéfinit le marché du travail. Ceux qui ne s'adaptent pas seront remplacés.
            </p>
          </motion.div>

          {/* Stats grid - design moderne */}
          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <motion.div variants={scaleIn} className="relative overflow-hidden rounded-2xl p-6" style={{ background: "linear-gradient(135deg, rgba(159,232,112,0.12) 0%, rgba(159,232,112,0.03) 100%)", border: "1px solid rgba(159,232,112,0.2)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl" style={{ backgroundColor: "rgba(159,232,112,0.15)" }} />
              <TrendingDown size={24} style={{ color: "var(--wise-primary)" }} className="mb-3" />
              <p className="text-3xl font-bold mb-1" style={{ color: "#fff" }}>92M</p>
              <p className="text-sm font-medium mb-2" style={{ color: "var(--wise-primary)" }}>d'emplois menacés</p>
              <p className="text-xs" style={{ color: "var(--wise-mute)" }}>Déplacés par l'IA d'ici 2030 - World Economic Forum</p>
            </motion.div>

            <motion.div variants={scaleIn} className="relative overflow-hidden rounded-2xl p-6" style={{ background: "linear-gradient(135deg, rgba(56,200,255,0.12) 0%, rgba(56,200,255,0.03) 100%)", border: "1px solid rgba(56,200,255,0.2)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl" style={{ backgroundColor: "rgba(56,200,255,0.15)" }} />
              <Users size={24} style={{ color: "#38c8ff" }} className="mb-3" />
              <p className="text-3xl font-bold mb-1" style={{ color: "#fff" }}>41%</p>
              <p className="text-sm font-medium mb-2" style={{ color: "#38c8ff" }}>du code généré par l'IA</p>
              <p className="text-xs" style={{ color: "var(--wise-mute)" }}>Les développeurs classiques sont en première ligne</p>
            </motion.div>

            <motion.div variants={scaleIn} className="relative overflow-hidden rounded-2xl p-6" style={{ background: "linear-gradient(135deg, rgba(255,192,145,0.12) 0%, rgba(255,192,145,0.03) 100%)", border: "1px solid rgba(255,192,145,0.2)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl" style={{ backgroundColor: "rgba(255,192,145,0.15)" }} />
              <Shield size={24} style={{ color: "#ffc091" }} className="mb-3" />
              <p className="text-3xl font-bold mb-1" style={{ color: "#fff" }}>234Mds$</p>
              <p className="text-sm font-medium mb-2" style={{ color: "#ffc091" }}>de SaaS menacés</p>
              <p className="text-xs" style={{ color: "var(--wise-mute)" }}>Logiciels traditionnels remplacés par des agents IA</p>
            </motion.div>
          </motion.div>

          {/* CTA bottom */}
          <motion.div variants={fadeInUp} className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full" style={{ background: "linear-gradient(135deg, rgba(159,232,112,0.15) 0%, rgba(159,232,112,0.05) 100%)", border: "1px solid rgba(159,232,112,0.3)" }}>
              <Zap size={18} style={{ color: "var(--wise-primary)" }} />
              <span className="text-sm font-semibold" style={{ color: "#fff" }}>Ne subissez pas la disruption. Devenez l'acteur du changement.</span>
            </div>
            <p className="text-xs mt-4" style={{ color: "var(--wise-mute)" }}>Sources : WEF Future of Jobs 2025, Goldman Sachs, Gartner</p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── Partenariats (Sage Band) ─── */}
      <AnimatedSection id="partenaires" className="wise-hero-band">
        <div className="container py-12">
          <motion.div variants={fadeInUp} className="text-center mb-14">
            <h2 className="wise-display-md mb-4">Partenariats Stratégiques</h2>
            <p className="wise-body-lg max-w-2xl mx-auto">
              Neopolis Development a noué des partenariats avec les leaders mondiaux de l'IA pour conquérir le marché africain.
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid md:grid-cols-2 gap-8 mb-12">
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

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeInLeft}>
              <img src={PARTNER_IMG} alt="Partenariats globaux" className="w-full max-w-md mx-auto object-contain rounded-3xl" />
            </motion.div>
            <motion.div variants={fadeInRight}>
              <h3 className="wise-display-xs mb-6">Ce que nous fournissons</h3>
              <div className="space-y-4">
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
                    className="flex items-center gap-3"
                  >
                    <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--wise-primary)" }}>
                      <CheckCircle2 size={14} style={{ color: "var(--wise-ink)" }} />
                    </span>
                    <span className="wise-body-md font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* ─── AI Solutions Partner Section ─── */}
      <AnimatedSection className="wise-content-band">
        <div className="container py-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeInLeft}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ backgroundColor: "var(--wise-primary-pale)" }}>
                <Target size={14} style={{ color: "var(--wise-positive-deep)" }} />
                <span className="text-xs font-semibold" style={{ color: "var(--wise-positive-deep)" }}>VOTRE FUTUR STATUT</span>
              </div>
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
              <img src={AFRICA_IMG} alt="Réseau Afrique" className="w-full max-w-sm mx-auto object-contain rounded-3xl" />
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* ─── CTA Band ─── */}
      <AnimatedSection style={{ backgroundColor: "var(--wise-ink)" }}>
        <div className="container py-20 text-center">
          <motion.div variants={fadeInUp}>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="inline-block mb-6"
            >
              <Rocket size={40} style={{ color: "var(--wise-primary)" }} />
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-black mb-5" style={{ color: "var(--wise-primary)", lineHeight: 1.1 }}>
              Ne subissez pas la disruption.<br />Devenez-en l'acteur.
            </h2>
            <p className="text-lg mb-10" style={{ color: "var(--wise-canvas-soft)" }}>
              Formation et certification 100% gratuites - 296 places seulement
            </p>
            <Link href="/apply">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 12px 40px rgba(159,232,112,0.35)" }}
                whileTap={{ scale: 0.97 }}
                className="wise-btn-primary text-lg px-10 py-5 flex items-center gap-3 mx-auto"
              >
                Postuler maintenant <ArrowRight size={22} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── FAQ Section ─── */}
      <AnimatedSection id="faq" className="wise-hero-band">
        <div className="container py-12">
          <motion.div variants={fadeInUp}>
            <h2 className="wise-display-md text-center mb-14">Questions fréquentes</h2>
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
        <div className="container py-14">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <img src={LOGO_URL} alt="Neopolis Akademy" className="h-9 object-contain mb-4 brightness-0 invert" />
              <p className="text-sm" style={{ color: "var(--wise-mute)" }}>
                Neopolis Development - Transformer la menace de l'IA en opportunité pour l'Afrique.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "var(--wise-canvas-soft)" }}>Programme</h4>
              <ul className="space-y-3 text-sm" style={{ color: "var(--wise-mute)" }}>
                <li><a href="#formule" className="hover:text-white transition-colors duration-200">La Formule</a></li>
                <li><a href="#pourquoi" className="hover:text-white transition-colors duration-200">Pourquoi maintenant</a></li>
                <li><a href="#partenaires" className="hover:text-white transition-colors duration-200">Partenaires</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors duration-200">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "var(--wise-canvas-soft)" }}>Contact</h4>
              <ul className="space-y-3 text-sm" style={{ color: "var(--wise-mute)" }}>
                <li>info@neopolis-dev.com</li>
                <li>www.neopolis-dev.com</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-center text-sm" style={{ color: "var(--wise-mute)" }}>
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
      <p className="text-4xl md:text-5xl font-black mb-3" style={{ color: highlight ? "var(--wise-positive-deep)" : "var(--wise-ink)" }}>{value}</p>
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
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="wise-card-dark h-full"
    >
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
          <img src={logo} alt={name} className="w-10 h-10 object-contain" />
        </div>
        <h3 className="text-2xl font-bold" style={{ color: "var(--wise-primary)" }}>{name}</h3>
      </div>
      <p className="text-base leading-relaxed" style={{ color: "var(--wise-canvas-soft)" }}>
        {description}
      </p>
    </motion.div>
  );
}

function ImpactItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div
      whileHover={{ x: 4, transition: { duration: 0.2 } }}
      className="flex gap-4 p-4 rounded-xl transition-colors"
      style={{ backgroundColor: "rgba(159,232,112,0.05)" }}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--wise-primary)" }}>
        <span style={{ color: "var(--wise-ink)" }}>{icon}</span>
      </div>
      <div>
        <p className="font-semibold text-base" style={{ color: "var(--wise-canvas-soft)" }}>{title}</p>
        <p className="text-sm" style={{ color: "var(--wise-mute)" }}>{desc}</p>
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
  const chartRef = useRef<Chart | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });

  useEffect(() => {
    if (!canvasRef.current || !isInView) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
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
          y: { ticks: { color: "#868685", font: { family: "Inter" }, callback: (v) => v + "%" }, grid: { color: "rgba(255,255,255,0.04)" }, min: 0, max: 110 },
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
