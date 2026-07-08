import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import {
  ChevronRight,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  Clock,
  Users,
  Zap,
  BookOpen,
  Award,
  Globe,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

// Chart.js
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

/* ─── Asset URLs ─── */
const LOGO_URL = "/manus-storage/logo_neopolis_akademy_wise_ede57803.png";
const HERO_IMG = "/manus-storage/wise_hero_illustration_0a3cf474.png";
const CERT_IMG = "/manus-storage/wise_certification_badge_c2e19576.png";
const ELEARNING_IMG = "/manus-storage/wise_elearning_illustration_a269c91a.png";
const AFRICA_IMG = "/manus-storage/wise_africa_network_650980bb.png";
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

/* ─── FAQ Data (réduit aux 5 questions les plus critiques) ─── */
const faqItems = [
  { q: "C'est vraiment 100% gratuit ?", a: "Oui. La formation de 7 jours, l'accès à la plateforme Anthropic, et le voucher de certification CCA sont entièrement pris en charge par Neopolis Development grâce à nos partenariats avec Anthropic et Alibaba Cloud. Aucun frais caché." },
  { q: "Qui peut postuler ?", a: "Tout professionnel africain dont le métier est impacté par l'IA : développeurs, comptables, juristes, traducteurs, commerciaux, agents de service client, etc. Aucun prérequis technique. Seule condition : être motivé et prêt à apprendre." },
  { q: "Que se passe-t-il après la certification ?", a: "Vous obtenez le statut d'AI Solutions Partner — Ambassadeur Certifié. Concrètement : vous devenez entrepreneur indépendant, vous distribuez des solutions IA aux entreprises de votre secteur, avec tout le support technique et commercial de Neopolis Development." },
  { q: "Combien de temps ça prend ?", a: "7 jours de formation intensive en e-learning. Ensuite, vous préparez la certification CCA à votre rythme (deadline : 31 août 2026). Le tout est compatible avec une activité professionnelle en parallèle." },
  { q: "Comment sont sélectionnés les candidats ?", a: "Un score automatique évalue vos compétences techniques (40%), votre expertise métier (35%) et vos capacités de communication (25%). Les 296 meilleurs profils sont retenus. Plus vous postulez tôt, plus vous avez de chances." },
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

/* ─── Countdown to deadline ─── */
function useCountdown() {
  const deadline = new Date("2026-08-31T23:59:59").getTime();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, deadline - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      });
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const countdown = useCountdown();
  const { data: spotsData } = trpc.applications.remainingSpots.useQuery(undefined, {
    refetchInterval: 60000, // refresh every minute
  });
  const remainingSpots = spotsData?.remaining ?? 296;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--wise-canvas)" }}>
      {/* ─── Navigation (simplifiée) ─── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: easeOut }}
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? "rgba(255,255,255,0.95)" : "var(--wise-canvas)",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          boxShadow: scrolled ? "0 1px 3px rgba(14,15,12,0.08)" : "none",
        }}
      >
        <div className="container flex items-center justify-between py-4">
          <img src={LOGO_URL} alt="Neopolis Akademy" className="h-10 object-contain" />
          <div className="hidden md:flex items-center gap-8">
            <a href="#parcours" className="text-sm font-semibold" style={{ color: "var(--wise-body)" }}>Le parcours</a>
            <a href="#faq" className="text-sm font-semibold" style={{ color: "var(--wise-body)" }}>FAQ</a>
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

      {/* ─── HERO : Message clair en 3 secondes ─── */}
      <section style={{ backgroundColor: "var(--wise-canvas-soft)" }}>
        <div className="container py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* Badge urgence */}
              <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm" style={{ backgroundColor: "var(--wise-primary)", color: "var(--wise-ink)" }}>
                  100% GRATUIT
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: "#fff0f0", color: "var(--wise-negative)" }}>
                  <Clock size={14} /> Plus que {countdown.days}j {countdown.hours}h
                </span>
              </motion.div>

              {/* Titre principal — direct et concret */}
              <motion.h1 variants={fadeInUp} className="wise-display-xl mb-5" style={{ lineHeight: 1.05 }}>
                Devenez certifié IA<br />
                <span style={{ color: "var(--wise-positive)" }}>en 7 jours</span>
              </motion.h1>

              {/* Sous-titre — QUI + QUOI + RÉSULTAT */}
              <motion.p variants={fadeInUp} className="text-lg mb-8 max-w-lg" style={{ color: "var(--wise-body)", lineHeight: 1.6 }}>
                Votre métier est menacé par l'IA ? Transformez cette menace en business. 
                Obtenez la <strong>certification Anthropic CCA</strong> et devenez distributeur 
                indépendant de solutions IA en Afrique.
              </motion.p>

              {/* CTA principal */}
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 mb-8">
                <Link href="/apply">
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(159,232,112,0.3)" }}
                    whileTap={{ scale: 0.97 }}
                    className="wise-btn-primary flex items-center gap-2 text-lg px-8 py-4"
                  >
                    Postuler maintenant <ArrowRight size={20} />
                  </motion.button>
                </Link>
                <a href="#parcours">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="wise-btn-secondary flex items-center gap-2 text-lg px-8 py-4"
                  >
                    Comment ça marche ?
                  </motion.button>
                </a>
              </motion.div>

              {/* Preuve sociale + urgence */}
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-5">
                <div className="flex items-center gap-2">
                  <Users size={16} style={{ color: "var(--wise-positive)" }} />
                  <span className="text-sm font-semibold" style={{ color: "var(--wise-ink)" }}>{remainingSpots} places restantes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={16} style={{ color: "var(--wise-accent-cyan)" }} />
                  <span className="text-sm font-semibold" style={{ color: "var(--wise-ink)" }}>54 pays africains</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={16} style={{ color: "var(--wise-positive)" }} />
                  <span className="text-sm font-semibold" style={{ color: "var(--wise-ink)" }}>Certification internationale</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Image hero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: easeOut }}
              className="hidden md:block relative"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <img src={HERO_IMG} alt="Professionnels africains en formation IA" className="w-full max-w-lg mx-auto object-contain rounded-3xl" />
              </motion.div>
              {/* Badge flottant */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
                className="absolute -top-2 -right-2 wise-card px-4 py-2 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={16} style={{ color: "var(--wise-primary)" }} />
                  <span className="text-sm font-bold" style={{ color: "var(--wise-ink)" }}>Certification CCA</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── BANDEAU URGENCE ─── */}
      <div style={{ backgroundColor: "var(--wise-ink)" }}>
        <div className="container py-4 flex flex-wrap items-center justify-center gap-6 md:gap-12">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} style={{ color: "var(--wise-negative)" }} />
            <span className="text-sm font-bold" style={{ color: "var(--wise-negative)" }}>90M d'emplois menacés d'ici 2030</span>
            <span className="text-xs" style={{ color: "var(--wise-mute)" }}>(WEF, 2025)</span>
          </div>
          <div className="h-4 w-px" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
          <div className="flex items-center gap-2">
            <Zap size={16} style={{ color: "var(--wise-primary)" }} />
            <span className="text-sm font-bold" style={{ color: "var(--wise-primary)" }}>Soyez du bon côté de l'IA</span>
          </div>
          <div className="h-4 w-px hidden md:block" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
          <Link href="/apply" className="hidden md:inline-flex">
            <span className="text-sm font-bold underline" style={{ color: "var(--wise-primary)" }}>Postuler maintenant →</span>
          </Link>
        </div>
      </div>

      {/* ─── LE PARCOURS (Timeline claire 1→2→3→Résultat) ─── */}
      <AnimatedSection id="parcours" className="wise-content-band">
        <div className="container py-20">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <span className="wise-badge-positive inline-block mb-4">FORMATION 100% GRATUITE</span>
            <h2 className="wise-display-md mb-3">Votre parcours en 3 étapes</h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--wise-body)" }}>
              De la candidature au statut d'entrepreneur IA — tout est pris en charge.
            </p>
          </motion.div>

          {/* Timeline horizontale */}
          <motion.div variants={staggerContainer} className="relative">
            {/* Ligne de connexion */}
            <div className="hidden md:block absolute top-24 left-[16%] right-[16%] h-0.5" style={{ backgroundColor: "var(--wise-canvas-soft)" }}>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3, ease: easeOut }}
                className="h-full origin-left"
                style={{ backgroundColor: "var(--wise-primary)" }}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div variants={scaleIn}>
                <TimelineStep
                  step={1}
                  icon={<BookOpen size={24} />}
                  title="Formation IA — 7 jours"
                  description="E-learning intensif : IA générale, LLM, agents IA, cas d'usage métier concrets."
                  image={ELEARNING_IMG}
                  badge="Gratuit"
                />
              </motion.div>
              <motion.div variants={scaleIn}>
                <TimelineStep
                  step={2}
                  icon={<Award size={24} />}
                  title="Certification CCA"
                  description="Passez la certification Claude Certified Architect d'Anthropic — voucher offert."
                  image={CERT_IMG}
                  badge="Gratuit"
                />
              </motion.div>
              <motion.div variants={scaleIn}>
                <TimelineStep
                  step={3}
                  icon={<Globe size={24} />}
                  title="Lancez votre business"
                  description="Devenez AI Solutions Partner indépendant. Distribuez des solutions IA dans votre pays."
                  image={AFRICA_IMG}
                  badge="Accompagnement inclus"
                  highlight
                />
              </motion.div>
            </div>
          </motion.div>

          {/* CTA après parcours */}
          <motion.div variants={fadeInUp} className="text-center mt-14">
            <Link href="/apply">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(159,232,112,0.3)" }}
                whileTap={{ scale: 0.97 }}
                className="wise-btn-primary flex items-center gap-2 mx-auto text-lg px-8 py-4"
              >
                Je postule — C'est gratuit <ArrowRight size={20} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── POURQUOI MAINTENANT (1 stat choc + graphique + CTA) ─── */}
      <AnimatedSection className="wise-hero-band-dark">
        <div className="container py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeInLeft}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ backgroundColor: "rgba(208,50,56,0.15)" }}>
                <AlertTriangle size={14} style={{ color: "var(--wise-negative)" }} />
                <span className="text-xs font-bold" style={{ color: "var(--wise-negative)" }}>URGENCE</span>
              </span>
              <h2 className="text-3xl md:text-4xl font-black mb-6" style={{ color: "var(--wise-canvas-soft)", lineHeight: 1.15 }}>
                D'ici 2030, <span style={{ color: "var(--wise-negative)" }}>90 millions</span> d'emplois disparaîtront à cause de l'IA.
              </h2>
              <p className="text-lg mb-8" style={{ color: "var(--wise-mute)", lineHeight: 1.6 }}>
                Comptables, juristes, développeurs, traducteurs, commerciaux... Tous les métiers sont touchés. 
                Ceux qui ne s'adaptent pas seront remplacés. Ceux qui maîtrisent l'IA créeront les emplois de demain.
              </p>
              <Link href="/apply">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="wise-btn-primary flex items-center gap-2"
                >
                  Passez du bon côté <ArrowRight size={18} />
                </motion.button>
              </Link>
              <p className="text-xs mt-4" style={{ color: "var(--wise-mute)" }}>Source : World Economic Forum, Future of Jobs Report 2025</p>
            </motion.div>
            <motion.div variants={fadeInRight}>
              <JobLossChart />
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* ─── GAINS CONCRETS ─── */}
      <AnimatedSection style={{ backgroundColor: "var(--wise-primary-pale)" }}>
        <div className="container py-16">
          <motion.div variants={fadeInUp} className="text-center mb-10">
            <h2 className="wise-display-md mb-3">Votre business après certification</h2>
            <p className="text-lg" style={{ color: "var(--wise-body)" }}>Concrètement, voici ce que vous pouvez gagner en tant qu'AI Solutions Partner.</p>
          </motion.div>
          <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-6 mb-10">
            <motion.div variants={scaleIn} className="wise-card text-center">
              <p className="text-3xl font-black mb-2" style={{ color: "var(--wise-positive-deep)" }}>2 000€— 5 000€</p>
              <p className="text-sm font-semibold" style={{ color: "var(--wise-ink)" }}>par mission d'automatisation</p>
              <p className="text-xs mt-2" style={{ color: "var(--wise-mute)" }}>Déploiement d'agents IA pour une PME</p>
            </motion.div>
            <motion.div variants={scaleIn} className="wise-card text-center">
              <p className="text-3xl font-black mb-2" style={{ color: "var(--wise-positive-deep)" }}>500€— 1 500€</p>
              <p className="text-sm font-semibold" style={{ color: "var(--wise-ink)" }}>revenus récurrents / client / mois</p>
              <p className="text-xs mt-2" style={{ color: "var(--wise-mute)" }}>Maintenance et support des solutions IA</p>
            </motion.div>
            <motion.div variants={scaleIn} className="wise-card text-center">
              <p className="text-3xl font-black mb-2" style={{ color: "var(--wise-positive-deep)" }}>100%</p>
              <p className="text-sm font-semibold" style={{ color: "var(--wise-ink)" }}>indépendance totale</p>
              <p className="text-xs mt-2" style={{ color: "var(--wise-mute)" }}>Vous êtes votre propre patron, support Neopolis inclus</p>
            </motion.div>
          </motion.div>
          <motion.div variants={fadeInUp} className="text-center">
            <p className="text-sm mb-2" style={{ color: "var(--wise-body)" }}>Types de missions : automatisation de processus, chatbots IA, analyse de données, assistants virtuels, génération de contenu, intégration CRM.</p>
            <p className="text-sm font-semibold" style={{ color: "var(--wise-positive-deep)" }}>Modèle : commission sur chaque déploiement + revenus récurrents sur la maintenance mensuelle.</p>
            <p className="text-xs mt-2" style={{ color: "var(--wise-mute)" }}>* Estimations basées sur les tarifs moyens du marché africain de l'IA en 2025-2026.</p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── CE QUE VOUS RECEVEZ (concret, pas de blabla) ─── */}
      <AnimatedSection className="wise-content-band">
        <div className="container py-20">
          <motion.div variants={fadeInUp} className="text-center mb-14">
            <h2 className="wise-display-md mb-3">Ce que vous recevez</h2>
            <p className="text-lg" style={{ color: "var(--wise-body)" }}>Tout est fourni. Vous n'avez qu'à apprendre et vendre.</p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <BookOpen size={22} />, title: "Formation IA complète", desc: "7 jours de e-learning intensif sur les LLM et agents IA" },
              { icon: <Award size={22} />, title: "Certification CCA", desc: "Voucher Anthropic offert (valeur 300$)" },
              { icon: <Zap size={22} />, title: "Agents IA prêts à vendre", desc: "Solutions déployables immédiatement chez vos clients" },
              { icon: <Globe size={22} />, title: "Accès multi-LLM", desc: "Claude, Qwen, DeepSeek — pas un seul modèle" },
              { icon: <Users size={22} />, title: "Support commercial", desc: "Accompagnement marketing et vente par Neopolis" },
              { icon: <Sparkles size={22} />, title: "Infrastructure serveurs", desc: "Serveurs on-premise puissants pour vos clients" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                className="wise-card-sage flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--wise-primary-pale)" }}>
                  <span style={{ color: "var(--wise-positive-deep)" }}>{item.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-base mb-1" style={{ color: "var(--wise-ink)" }}>{item.title}</h4>
                  <p className="text-sm" style={{ color: "var(--wise-body)" }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Partenaires en une ligne */}
          <motion.div variants={fadeInUp} className="mt-14 text-center">
            <p className="text-sm font-semibold mb-4" style={{ color: "var(--wise-mute)" }}>RENDU POSSIBLE PAR</p>
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2 px-5 py-3 rounded-full" style={{ backgroundColor: "var(--wise-canvas-soft)" }}>
                <Sparkles size={18} style={{ color: "var(--wise-positive)" }} />
                <span className="font-bold text-base" style={{ color: "var(--wise-ink)" }}>Anthropic</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-3 rounded-full" style={{ backgroundColor: "var(--wise-canvas-soft)" }}>
                <Sparkles size={18} style={{ color: "var(--wise-accent-cyan)" }} />
                <span className="font-bold text-base" style={{ color: "var(--wise-ink)" }}>Alibaba Cloud</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-3 rounded-full" style={{ backgroundColor: "var(--wise-canvas-soft)" }}>
                <Sparkles size={18} style={{ color: "var(--wise-accent-orange)" }} />
                <span className="font-bold text-base" style={{ color: "var(--wise-ink)" }}>Neopolis Development</span>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── CTA FINAL (urgence maximale) ─── */}
      <AnimatedSection style={{ backgroundColor: "var(--wise-ink)" }}>
        <div className="container py-20 text-center">
          <motion.div variants={fadeInUp}>
            {/* Countdown */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <CountdownBox value={countdown.days} label="jours" />
              <span className="text-2xl font-bold" style={{ color: "var(--wise-mute)" }}>:</span>
              <CountdownBox value={countdown.hours} label="heures" />
              <span className="text-2xl font-bold" style={{ color: "var(--wise-mute)" }}>:</span>
              <CountdownBox value={countdown.mins} label="minutes" />
            </div>

            <h2 className="text-3xl md:text-5xl font-black mb-5" style={{ color: "var(--wise-canvas-soft)", lineHeight: 1.1 }}>
              <span style={{ color: "var(--wise-primary)" }}>{remainingSpots}</span> places restantes. <span style={{ color: "var(--wise-primary)" }}>0€.</span><br />
              Votre futur commence ici.
            </h2>
            <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: "var(--wise-mute)" }}>
              Formation + certification + lancement business — tout gratuit. 
              Les candidatures ferment le 31 août 2026.
            </p>
            <Link href="/apply">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 12px 40px rgba(159,232,112,0.35)" }}
                whileTap={{ scale: 0.97 }}
                className="wise-btn-primary text-lg px-10 py-5 flex items-center gap-3 mx-auto"
              >
                Postuler maintenant — C'est gratuit <ArrowRight size={22} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── FAQ (5 questions essentielles) ─── */}
      <AnimatedSection id="faq" style={{ backgroundColor: "var(--wise-canvas-soft)" }}>
        <div className="container py-20">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="wise-display-md">Questions fréquentes</h2>
          </motion.div>
          <motion.div variants={staggerContainer} className="max-w-2xl mx-auto space-y-3">
            {faqItems.map((item, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <FAQItem question={item.q} answer={item.a} />
              </motion.div>
            ))}
          </motion.div>
          {/* CTA après FAQ */}
          <motion.div variants={fadeInUp} className="text-center mt-12">
            <p className="text-base mb-4" style={{ color: "var(--wise-body)" }}>Vous avez d'autres questions ? Postulez d'abord — on vous contacte sous 48h.</p>
            <Link href="/apply">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="wise-btn-primary flex items-center gap-2 mx-auto"
              >
                Déposer ma candidature <ArrowRight size={18} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── Footer (minimal) ─── */}
      <footer style={{ backgroundColor: "var(--wise-ink)" }}>
        <div className="container py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={LOGO_URL} alt="Neopolis Akademy" className="h-8 object-contain brightness-0 invert" />
              <span className="text-sm" style={{ color: "var(--wise-mute)" }}>
                Neopolis Development — L'IA au service de l'Afrique.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm" style={{ color: "var(--wise-mute)" }}>
              <span>info@neopolis-dev.com</span>
              <span>www.neopolis-dev.com</span>
            </div>
          </div>
          <div className="mt-8 pt-6 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs" style={{ color: "var(--wise-mute)" }}>
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

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-black tabular-nums" style={{ color: "var(--wise-primary)" }}>
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-xs font-medium mt-1" style={{ color: "var(--wise-mute)" }}>{label}</div>
    </div>
  );
}

function TimelineStep({ step, icon, title, description, image, badge, highlight }: {
  step: number; icon: React.ReactNode; title: string; description: string; image: string; badge: string; highlight?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className={`h-full flex flex-col text-center ${highlight ? "wise-card-green" : "wise-card"}`}
      style={{ boxShadow: highlight ? "0 8px 30px rgba(159,232,112,0.15)" : "0 2px 12px rgba(0,0,0,0.04)" }}
    >
      {/* Step number */}
      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: highlight ? "var(--wise-primary)" : "var(--wise-primary-pale)" }}>
        <span className="font-black text-lg" style={{ color: highlight ? "var(--wise-ink)" : "var(--wise-positive-deep)" }}>{step}</span>
      </div>
      {/* Icon + title */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <span style={{ color: "var(--wise-positive-deep)" }}>{icon}</span>
        <h3 className="font-bold text-lg" style={{ color: "var(--wise-ink)" }}>{title}</h3>
      </div>
      {/* Description */}
      <p className="text-sm flex-1 mb-4" style={{ color: "var(--wise-body)" }}>{description}</p>
      {/* Image */}
      <img src={image} alt={title} className="w-full h-28 object-contain rounded-xl mb-4" />
      {/* Badge */}
      <div className="pt-3" style={{ borderTop: "1px solid var(--wise-canvas-soft)" }}>
        <span className="wise-badge-positive text-xs">{badge}</span>
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
          transition={{ duration: 0.25, ease: easeOut }}
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
            transition={{ duration: 0.3, ease: easeOut }}
          >
            <p className="mt-4 pt-4 text-sm leading-relaxed" style={{ color: "var(--wise-body)", borderTop: "1px solid var(--wise-canvas-soft)" }}>
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
          { label: "Traduction", data: [100, 78, 58, 40, 28, 18], borderColor: "#d03238", backgroundColor: "rgba(208,50,56,0.08)", fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: "#d03238" },
          { label: "Saisie de données", data: [100, 82, 65, 48, 35, 22], borderColor: "#ffc091", backgroundColor: "rgba(255,192,145,0.08)", fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: "#ffc091" },
          { label: "Service client", data: [100, 85, 70, 55, 42, 30], borderColor: "#38c8ff", backgroundColor: "rgba(56,200,255,0.08)", fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: "#38c8ff" },
          { label: "Développeurs", data: [100, 90, 78, 65, 55, 45], borderColor: "#9fe870", backgroundColor: "rgba(159,232,112,0.08)", fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: "#9fe870" },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1500, easing: "easeOutQuart" },
        plugins: {
          legend: { position: "bottom", labels: { color: "#e8ebe6", font: { size: 11, family: "Inter" }, boxWidth: 12, padding: 16, usePointStyle: true } },
          title: { display: true, text: "Emplois restants (%) — Projection 2025-2030", color: "#e8ebe6", font: { size: 13, weight: "bold", family: "Inter" }, padding: { bottom: 12 } },
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
    <div ref={containerRef} className="wise-card-dark" style={{ height: "320px", padding: "16px" }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
