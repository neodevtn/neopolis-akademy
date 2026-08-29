import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ProcessStepper } from "@/components/ProcessStepper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  ChevronRight,
  Award,
  Globe,
  Users,
  TrendingDown,
  Shield,
  Zap,
  BookOpen,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
  Target,
  Rocket,
  Menu,
  X,
  PlayCircle,
} from "lucide-react";
import { faqItems as faqItemsData } from "@/data/faqData";
import DeferredHomeAuth from "@/components/DeferredHomeAuth";

// Chart.js is loaded only when the below-the-fold chart becomes visible.
import type { Chart as ChartJS } from "chart.js";

/* ─── Animated Counter Hook ─── */
function useCountUp(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: "0px" });
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView) return;
    if (!inView && !started.current) {
      // Fallback: if inView never triggers (e.g. element hidden by parent animation), start after 3s
      const fallback = setTimeout(() => {
        if (!started.current) {
          started.current = true;
          setCount(end);
        }
      }, 3000);
      return () => clearTimeout(fallback);
    }
    if (!inView || started.current) return;
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
const LOGO_URL = "/api/assets/neopolis-akademy-official-logo_40a16b6c.svg";
const LOGO_ICON = "/api/assets/neopolis-akademy-official-logo_40a16b6c.svg";
// const HERO_IMG = "/api/assets/hero_tunisian_ai_08a6f956.png";
const CERT_IMG = {
  src: "/api/assets/neopolis-home-certification-768_6f11d44f.webp",
  srcSet: "/api/assets/neopolis-home-certification-384_0d87fca8.webp 384w, /api/assets/neopolis-home-certification-768_6f11d44f.webp 600w",
};
const ELEARNING_IMG = {
  src: "/api/assets/neopolis-home-elearning-768_faf0c9fd.webp",
  srcSet: "/api/assets/neopolis-home-elearning-384_34e452fc.webp 384w, /api/assets/neopolis-home-elearning-768_faf0c9fd.webp 600w",
};
const AFRICA_IMG = {
  src: "/api/assets/neopolis-home-ambassador-768_c840b19b.webp",
  srcSet: "/api/assets/neopolis-home-ambassador-384_fd8ba033.webp 384w, /api/assets/neopolis-home-ambassador-768_c840b19b.webp 600w",
};
// const PARTNER_IMG = "/api/assets/wise_partnership_illustration_b3c56284.png";

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

// fadeInRight kept for potential future use

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeOut } },
};

/* ─── FAQ Data ─── */
// FAQ items with full translations (fr, en, ar)
const faqItems = faqItemsData;

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

/* ─── Parallax Image Component ─── */
function ParallaxImage() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1200], [40, -40]);
  const scale = useTransform(scrollY, [0, 600, 1200], [0.95, 1.02, 0.98]);

  return (
    <motion.div style={{ y, scale }} className="relative">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[var(--neo-primary)]/10 to-transparent -z-10 blur-2xl" />
      <img
        src="/api/assets/partner_section_navy_v2_dc6ef3c5.jpg"
        alt="AI Solutions Partner"
        width={960}
        height={720}
        loading="lazy"
        decoding="async"
        className="w-full max-w-xs md:max-w-sm mx-auto object-contain rounded-3xl shadow-xl"
      />
    </motion.div>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--wise-canvas)" }}>
      {/* ─── Navigation (Modern minimal header) ─── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div
          className="flex items-center w-full transition-all duration-[380ms]"
          style={{
            height: scrolled ? "56px" : "64px",
            paddingInline: "clamp(1rem, 3vw, 2.5rem)",
            background: "rgba(255, 255, 255, 0.97)",
            backdropFilter: "blur(12px) saturate(140%)",
            WebkitBackdropFilter: "blur(12px) saturate(140%)",
            borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
            boxShadow: scrolled ? "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)" : "none",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <img src={LOGO_URL} alt="Neopolis Development" width={180} height={63} decoding="async" className="h-8 md:h-9 object-contain" />
          </Link>

          {/* Center nav links */}
          <div className="hidden lg:flex items-center gap-1 mx-auto">
            <NavLink href="#formule">{t({ fr: "La Formule", en: "The Formula", ar: "الصيغة" })}</NavLink>
            <NavLink href="#pourquoi">{t({ fr: "Pourquoi maintenant", en: "Why now", ar: "لماذا الآن" })}</NavLink>
            <NavLink href="#partenaires">{t({ fr: "Partenaires", en: "Partners", ar: "الشركاء" })}</NavLink>
            <Link href="/ai-news" className="whitespace-nowrap text-[12.5px] font-medium px-3 py-2 rounded-md relative transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50">AI News</Link>
            <NavLink href="#faq">FAQ</NavLink>
            <DeferredHomeAuth
              slot="training"
              fallback={<Link href="/login" className="text-[11px] font-semibold px-3.5 py-1.5 ml-1 rounded-full transition-all duration-200 text-white hover:shadow-md" style={{ background: "#1e3a6e" }}>{t({ fr: "Se connecter", en: "Sign in", ar: "تسجيل الدخول" })}</Link>}
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto lg:ml-0 shrink-0">
            <LanguageSwitcher />
            <DeferredHomeAuth slot="logout" />
            <DeferredHomeAuth
              slot="header-primary"
              fallback={<Link href="/apply"><span className="flex items-center gap-1.5 text-xs md:text-sm font-semibold px-3 sm:px-4 md:px-5 py-2 md:py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all duration-200 hover:shadow-md active:scale-[0.97]">{t({ fr: "Postuler", en: "Apply", ar: "تقدّم" })} <ChevronRight size={14} /></span></Link>}
            />
            <MobileMenuButton />
          </div>
        </div>
      </motion.nav>

      <main>
      {/* ─── Hero Band (Bubble cream paper) ─── */}
      <section className="overflow-hidden pt-[66px]" style={{ background: "var(--wise-canvas)" }}>
        <div className="container" style={{ padding: "clamp(1.5rem, 3vh, 3rem) clamp(1.25rem, 4vw, 3rem)" }}>
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 lg:gap-12 items-center">
            <div>
              {/* Eyebrow */}
              <motion.div variants={fadeInUp} className="wise-eyebrow mb-6">
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--neo-primary)" }} />
                <span>{t({ fr: "Programme 2026 · Places limitées", en: "Program 2026 · Limited spots", ar: "برنامج 2026 · أماكن محدودة" })}</span>
              </motion.div>

              {/* Title */}
              <motion.h1 variants={fadeInUp} className="wise-display-mega mb-5" style={{ textWrap: "balance" }}>
                {t({ fr: "Transformez la menace de l'IA", en: "Turn the AI threat", ar: "حوّل تهديد الذكاء الاصطناعي" })}{" "}
                <span className="wise-highlight">{t({ fr: "en opportunité", en: "into opportunity", ar: "إلى فرصة" })}</span>
              </motion.h1>

              {/* Lede */}
              <motion.p variants={fadeInUp} className="wise-body-lg max-w-[46ch] mb-8">
                {t({ fr: "Formation certifiante", en: "Certified training", ar: "تدريب معتمد" })} <strong style={{ fontWeight: 600, color: "var(--wise-ink)" }}>{t({ fr: "100% gratuite", en: "100% free", ar: "مجاني 100%" })}</strong>.
                <br />
                {t({ fr: "Devenez", en: "Become an", ar: "كن" })}{" "}
                <strong style={{ fontWeight: 600, color: "var(--wise-ink)" }}>AI Solutions Partner</strong> {t({ fr: "et conquérez le marché de l'IA agentique.", en: "and conquer the agentic AI market.", ar: "واغزُ سوق الذكاء الاصطناعي الوكيلي." })}
              </motion.p>

              {/* CTA buttons */}
              <motion.div variants={fadeInUp} className="mb-6">
                <DeferredHomeAuth
                  slot="hero-actions"
                  fallback={<div className="flex flex-wrap gap-3"><Link href="/apply" className="wise-btn-primary flex items-center gap-2 text-sm md:text-base px-5 md:px-7 py-3 md:py-3.5">{t({ fr: "Déposer ma candidature", en: "Submit my application", ar: "تقديم طلبي" })} <ArrowRight size={18} /></Link><a href="#formule" className="wise-btn-secondary flex items-center gap-2 text-sm md:text-base px-5 md:px-7 py-3 md:py-3.5">{t({ fr: "Découvrir le programme", en: "Discover the program", ar: "اكتشف البرنامج" })}</a></div>}
                />
              </motion.div>

              {/* Hero note (chips) */}
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-2">
                <span className="wise-badge-positive">{t({ fr: "100% Gratuit", en: "100% Free", ar: "مجاني 100%" })}</span>
                <span className="wise-badge-positive">{t({ fr: "296 places", en: "296 spots", ar: "296 مقعد" })}</span>
                <span className="wise-badge-negative">{t({ fr: "Avant le 31 août 2026", en: "Before August 31, 2026", ar: "قبل 31 أوت 2026" })}</span>
              </motion.div>
            </div>

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

      {/* ─── Resume Reading Widget ─── */}
      <DeferredHomeAuth slot="resume" />

      {/* ─── Pourquoi maintenant (Gris Band) ─── */}
      <AnimatedSection id="pourquoi" className="home-deferred-section" style={{ background: "var(--wise-canvas-soft)", padding: "clamp(2rem, 4vh, 3rem) clamp(1.25rem, 4vw, 3rem)" }}>
        <div className="container py-8 md:py-12">
          <motion.div variants={fadeInUp} className="text-center mb-10 md:mb-14">
            <span className="wise-eyebrow mb-4 inline-flex">{t({ fr: "Urgence du marché", en: "Market urgency", ar: "إلحاح السوق" })}</span>
            <h2 className="wise-display-md mb-4">{t({ fr: "Pourquoi se transformer maintenant ?", en: "Why transform now?", ar: "لماذا التحوّل الآن؟" })}</h2>
            <p className="wise-body-lg max-w-[52ch] mx-auto">
              {t({ fr: "L'IA agentique redéfinit le marché du travail. Ceux qui ne s'adaptent pas seront remplacés.", en: "Agentic AI is redefining the job market. Those who don't adapt will be replaced.", ar: "الذكاء الاصطناعي الوكيلي يعيد تشكيل سوق العمل. من لا يتكيّف سيُستبدل." })}
            </p>
          </motion.div>

          {/* Chart full width — animated draw on scroll */}
          <AnimatedChart />

          {/* Stats cards grid */}
          <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 md:mb-12">
              <motion.div variants={scaleIn} className="wise-card">
                <TrendingDown size={20} style={{ color: "var(--neo-primary)" }} className="mb-3" />
                <p className="wise-display-sm mb-1"><AnimatedStat value={300} suffix="M" /></p>
                <p className="wise-body-sm" style={{ color: "var(--neo-ink-secondary)", fontWeight: 600 }}>{t({ fr: "d'emplois exposés à l'automatisation", en: "jobs exposed to automation", ar: "وظيفة معرّضة للأتمتة" })}</p>
                <p className="wise-label mt-2">Goldman Sachs, 2023</p>
              </motion.div>

              <motion.div variants={scaleIn} className="wise-card">
                <Users size={20} style={{ color: "var(--neo-primary)" }} className="mb-3" />
                <p className="wise-display-sm mb-1"><AnimatedStat value={92} suffix="M" /></p>
                <p className="wise-body-sm" style={{ color: "var(--neo-ink-secondary)", fontWeight: 600 }}>{t({ fr: "d'emplois déplacés d'ici 2030", en: "jobs displaced by 2030", ar: "وظيفة ستُستبدل بحلول 2030" })}</p>
                <p className="wise-label mt-2">WEF Future of Jobs 2025</p>
              </motion.div>

              <motion.div variants={scaleIn} className="wise-card">
                <Shield size={20} style={{ color: "var(--neo-primary)" }} className="mb-3" />
                <p className="wise-display-sm mb-1"><AnimatedStat value={30} suffix="%" /></p>
                <p className="wise-body-sm" style={{ color: "var(--neo-ink-secondary)", fontWeight: 600 }}>{t({ fr: "des heures de travail automatisées", en: "of work hours automated", ar: "من ساعات العمل مؤتمتة" })}</p>
                <p className="wise-label mt-2">McKinsey Global Institute</p>
              </motion.div>

              <motion.div variants={scaleIn} className="wise-card">
                <TrendingDown size={20} style={{ color: "var(--neo-primary)" }} className="mb-3" />
                <p className="wise-display-sm mb-1"><AnimatedStat value={220} suffix={t({ fr: " Milliards $", en: "B $", ar: " مليار $" })} /></p>
                <p className="wise-body-sm" style={{ color: "var(--neo-ink-secondary)", fontWeight: 600 }}>{t({ fr: "de SaaS menacés par les agents IA", en: "of SaaS threatened by AI agents", ar: "من SaaS مهددة بوكلاء الذكاء الاصطناعي" })}</p>
                <p className="wise-label mt-2">Gartner, 2025</p>
              </motion.div>
          </motion.div>

          {/* CTA bottom */}
          <motion.div variants={fadeInUp} className="text-center">
            <span className="wise-btn-tertiary" style={{ cursor: "default" }}>
              <Zap size={16} />
              {t({ fr: "Ne subissez pas la disruption. Devenez l'acteur du changement.", en: "Don't suffer the disruption. Become the agent of change.", ar: "لا تكن ضحية التحوّل. كن صانع التغيير." })}
            </span>
            <p className="wise-label mt-4">{t({ fr: "Sources : WEF Future of Jobs 2025, Goldman Sachs 2023/2026, McKinsey Global Institute, Gartner 2025", en: "Sources: WEF Future of Jobs 2025, Goldman Sachs 2023/2026, McKinsey Global Institute, Gartner 2025", ar: "المصادر: WEF Future of Jobs 2025, Goldman Sachs 2023/2026, McKinsey Global Institute, Gartner 2025" })}</p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── La Formule (Green Band) ─── */}
      <AnimatedSection id="formule" className="home-deferred-section" style={{ background: "var(--wise-canvas)", padding: "clamp(2rem, 4vh, 3rem) clamp(1.25rem, 4vw, 3rem)" }}>
        <div className="container py-8">
          <motion.div variants={fadeInUp} className="text-center mb-8">
            <span className="wise-badge-positive mb-4">{t({ fr: "100% Gratuit", en: "100% Free", ar: "مجاني 100%" })}</span>
            <h2 className="wise-display-md mb-4">{t({ fr: "La Formule Complète", en: "The Complete Formula", ar: "الصيغة الكاملة" })}</h2>
            <p className="wise-body-lg max-w-[52ch] mx-auto">
              {t({ fr: "Un parcours en 3 étapes pour devenir AI Solutions Partner – Ambassadeur Certifié", en: "A 3-step journey to become an AI Solutions Partner – Certified Ambassador", ar: "رحلة من 3 خطوات لتصبح شريك حلول ذكاء اصطناعي – سفير معتمد" })}
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
            <motion.div variants={fadeInUp}>
              <FormulaCard
                icon={<BookOpen size={28} />}
                step={t({ fr: "01", en: "01", ar: "01" })}
                title={t({ fr: "E-Learning 7 jours", en: "7-Day E-Learning", ar: "التعلم الإلكتروني 7 أيام" })}
                description={t({ fr: "Formation intensive sur l'IA générale, les LLM, les agents IA et leurs applications métier concrètes.", en: "Intensive training on general AI, LLMs, AI agents, and their concrete business applications.", ar: "تدريب مكثف على الذكاء الاصطناعي العام، نماذج اللغة الكبيرة، وكلاء الذكاء الاصطناعي، وتطبيقاتهم التجارية الملموسة." })}
                badge={t({ fr: "Gratuit", en: "Free", ar: "مجاني" })}
                image={ELEARNING_IMG}
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <FormulaCard
                icon={<Award size={28} />}
                step={t({ fr: "02", en: "02", ar: "02" })}
                title={t({ fr: "Certification CCA", en: "CCA Certification", ar: "شهادة CCA" })}
                description={t({ fr: "Accès à la plateforme Anthropic + voucher pour passer la certification Claude Certified Architect avant le 31 août 2026.", en: "Access to Anthropic platform + voucher to take the Claude Certified Architect certification before August 31, 2026.", ar: "الوصول إلى منصة Anthropic + قسيمة لاجتياز شهادة Claude Certified Architect قبل 31 أغسطس 2026." })}
                badge={t({ fr: "Gratuit", en: "Free", ar: "مجاني" })}
                image={CERT_IMG}
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <FormulaCard
                icon={<Globe size={28} />}
                step={t({ fr: "03", en: "03", ar: "03" })}
                title={t({ fr: "Statut Ambassadeur", en: "Ambassador Status", ar: "حالة السفير" })}
                description={t({ fr: "Devenez AI Solutions Partner indépendant et distribuez des solutions IA auprès des entreprises de votre secteur.", en: "Become an independent AI Solutions Partner and distribute AI solutions to companies in your sector.", ar: "كن شريك حلول ذكاء اصطناعي مستقلاً وزع حلول الذكاء الاصطناعي للشركات في قطاعك." })}
                badge={t({ fr: "Accompagnement complet", en: "Full support", ar: "دعم كامل" })}
                image={AFRICA_IMG}
              />
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── Partenariats (Sage Band) ─── */}
      <AnimatedSection id="partenaires" className="home-deferred-section" style={{ background: "var(--wise-canvas-soft)", padding: "clamp(2rem, 4vh, 3.5rem) clamp(1.25rem, 4vw, 3rem)" }}>
        <div className="container py-6">
          <motion.div variants={fadeInUp} className="text-center mb-8">
            <span className="wise-eyebrow mb-3 inline-flex">{t({ fr: "Écosystème", en: "Ecosystem", ar: "النظام البيئي" })}</span>
            <h2 className="wise-display-md mb-3" style={{ color: "var(--wise-ink)" }}>{t({ fr: "Nos Partenaires Technologiques", en: "Our Technology Partners", ar: "شركاؤنا التكنولوجيون" })}</h2>
            <p className="wise-body-md max-w-[56ch] mx-auto" style={{ color: "var(--wise-ink-muted)" }}>
              {t({ fr: "Registered Partner du Claude Partner Network — écosystème IA agentique Afrique & MENA.", en: "Registered Partner of the Claude Partner Network — agentic AI ecosystem for Africa & MENA.", ar: "شريك مسجل في شبكة Claude Partner Network — نظام بيئي للذكاء الاصطناعي الوكيلي لأفريقيا والشرق الأوسط." })} <a href="https://www.anthropic.com/news/claude-partner-network" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--neo-primary)" }}>CPN ↗</a>
            </p>
          </motion.div>

          {/* Premium Anthropic/Claude partnership card */}
          <motion.div variants={scaleIn} className="max-w-3xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
              {/* Subtle gradient accent */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #d4a574 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #6b9fff 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />
              
              <div className="relative p-8 md:p-10">
                {/* Header with logos */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#ffffff" }}>
                      <img src="/api/assets/logo-anthropic-64_459b0a03.webp" alt="Anthropic" width={32} height={32} decoding="async" className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Anthropic</h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(212,165,116,0.2)", color: "#d4a574" }}>Registered Partner</span>
                    </div>
                  </div>
                  <a href="https://www.anthropic.com/news/claude-partner-network" target="_blank" rel="noopener noreferrer" className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>
                    Claude Partner Network ↗
                  </a>
                </div>

                {/* Main content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.75)" }}>
                      {t({ fr: "Neopolis Development est Registered Partner du Claude Partner Network. Nos candidats bénéficient d'un accès privilégié à l'écosystème Anthropic.", en: "Neopolis Development is a Registered Partner of the Claude Partner Network. Our candidates benefit from privileged access to the Anthropic ecosystem.", ar: "Neopolis Development شريك مسجل في شبكة Claude Partner Network. يستفيد مرشحونا من وصول مميز إلى نظام Anthropic البيئي." })}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(212,165,116,0.15)" }}>
                        <CheckCircle2 size={14} style={{ color: "#d4a574" }} />
                        <span className="text-xs font-medium" style={{ color: "#d4a574" }}>{t({ fr: "Voucher CCA gratuit", en: "Free CCA voucher", ar: "قسيمة CCA مجانية" })}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(212,165,116,0.15)" }}>
                        <CheckCircle2 size={14} style={{ color: "#d4a574" }} />
                        <span className="text-xs font-medium" style={{ color: "#d4a574" }}>{t({ fr: "Certification CCA", en: "CCA Certification", ar: "شهادة CCA" })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl mb-2" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <img src="/api/assets/neopolis-home-claude-icon-64_ca898f2a.webp" alt="Claude AI" width={64} height={64} decoding="async" className="w-10 h-10 object-contain" />
                        <span className="text-2xl font-bold text-white">Claude</span>
                      </div>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{t({ fr: "Modèle IA le plus avancé au monde", en: "World's most advanced AI model", ar: "أكثر نماذج الذكاء الاصطناعي تقدمًا" })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── AI Solutions Partner Section ─── */}
      <AnimatedSection className="home-deferred-section" style={{ background: "var(--wise-canvas)", padding: "clamp(2rem, 4vh, 3rem) clamp(1.25rem, 4vw, 3rem)" }}>
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
            <motion.div variants={fadeInLeft}>
              <span className="wise-eyebrow mb-6 inline-flex">
                <Target size={12} />
                {t({ fr: "Votre futur statut", en: "Your future status", ar: "حالتك المستقبلية" })}
              </span>
              <h2 className="wise-display-md mb-6">{t({ fr: "Devenez AI Solutions Partner", en: "Become an AI Solutions Partner", ar: "كن شريك حلول ذكاء اصطناعي" })}</h2>
              <p className="wise-body-lg mb-6">
                {t({ fr: "Après votre certification, vous obtenez le statut d'AI Solutions Partner - Ambassadeur Certifié. Vous devenez un entrepreneur indépendant qui distribue des solutions IA auprès des PME/TPE de votre secteur d'activité.", en: "After your certification, you obtain the status of AI Solutions Partner - Certified Ambassador. You become an independent entrepreneur who distributes AI solutions to SMEs in your industry.", ar: "بعد الحصول على الشهادة، تحصل على مركز شريك حلول ذكاء اصطناعي - سفير معتمد. أنت تصبح رائد أعمال مستقلاً يوزع حلول الذكاء الاصطناعي للشركات الصغيرة والمتوسطة في قطاعك." })}
              </p>
              <div className="wise-card-sage p-6">
                <h3 className="font-semibold text-lg mb-3" style={{ color: "var(--wise-ink)" }}>{t({ fr: "Votre mission :", en: "Your mission:", ar: "مهمتك:" })}</h3>
                <p className="wise-body-md">
                  {t({ fr: "Identifier les entreprises de votre secteur dont les processus peuvent être automatisés par des agents IA, leur proposer des solutions concrètes, et les accompagner dans leur transformation digitale - avec tout le soutien de Neopolis Development.", en: "Identify companies in your sector whose processes can be automated by AI agents, propose concrete solutions to them, and support them in their digital transformation - with full support from Neopolis Development.", ar: "تحديد الشركات في قطاعك التي يمكن أتمتة عملياتها بواسطة وكلاء الذكاء الاصطناعي، والعرض عليهم حلولاً عملية، ودعمهم في التحول الرقمي - مع الدعم الكامل من Neopolis Development." })}
                </p>
              </div>
            </motion.div>
            <ParallaxImage />
          </div>
        </div>
      </AnimatedSection>

      {/* ─── Process Commercial & Modèle Économique ─── */}
      <AnimatedSection id="process" className="home-deferred-section" style={{ background: "var(--wise-canvas-soft)", padding: "clamp(2rem, 4vh, 3rem) clamp(1.25rem, 4vw, 3rem)" }}>
        <div className="container py-8 md:py-12">
          <motion.div variants={fadeInUp} className="text-center mb-12 md:mb-16">
            <span className="wise-eyebrow mb-4 inline-flex" style={{ color: "var(--neo-ink-secondary)" }}>
              <Zap size={12} />
              {t({ fr: "Modèle économique", en: "Economic model", ar: "النموذج الاقتصادي" })}
            </span>
            <h2 className="wise-display-md mb-4" style={{ color: "var(--neo-ink)" }}>{t({ fr: "Le Process Commercial de l'Ambassadeur", en: "The Ambassador's Commercial Process", ar: "عملية السفير التجارية" })}</h2>
            <p className="wise-body-lg max-w-[56ch] mx-auto" style={{ color: "var(--neo-ink-secondary)" }}>
              {t({ fr: "Un parcours structuré en 5 phases, de la prospection au monitoring, avec une rémunération attractive à chaque étape.", en: "A structured journey in 5 phases, from prospecting to monitoring, with attractive compensation at each stage.", ar: "رحلة منظمة في 5 مراحل، من البحث عن العملاء إلى مراقبة المشروع، مع تعويض جذاب في كل مرحلة." })}
            </p>
          </motion.div>

          {/* Stepper horizontal interactif - 5 phases */}
          <ProcessStepper />


          {/* Rémunération */}
          <motion.div variants={fadeInUp} className="max-w-4xl mx-auto">
            <div className="wise-card p-8 md:p-10" style={{ background: "var(--neo-primary-light)" }}>
              <div className="text-center mb-8">
                <span className="wise-eyebrow mb-3 inline-flex" style={{ color: "var(--neo-ink-secondary)" }}>{t({ fr: "Rémunération", en: "Compensation", ar: "التعويض" })}</span>
                <h3 className="wise-display-sm" style={{ color: "var(--neo-ink)" }}>{t({ fr: "Votre modèle de revenus", en: "Your revenue model", ar: "نموذج إيراداتك" })}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="wise-card p-6 text-center">
                  <p className="wise-display-md mb-2" style={{ color: "var(--neo-primary)", fontFamily: "var(--font-mono)" }}>{t({ fr: "20% à 60%", en: "20% to 60%", ar: "20% إلى 60%" })}</p>
                  <p className="wise-body-md font-semibold mb-2">{t({ fr: "Frais de Setup", en: "Setup Fees", ar: "رسوم الإعداد" })}</p>
                  <p className="wise-body-sm">{t({ fr: "Selon votre niveau d'implication dans le projet (prospection, accompagnement, coordination)", en: "Based on your level of involvement in the project (prospecting, support, coordination)", ar: "حسب مستوى مشاركتك في المشروع (التنقيب، المرافقة، التنسيق)" })}</p>
                </div>
                <div className="wise-card p-6 text-center">
                  <p className="wise-display-md mb-2" style={{ color: "var(--neo-primary)", fontFamily: "var(--font-mono)" }}>10%</p>
                  <p className="wise-body-md font-semibold mb-2">{t({ fr: "Tokens consommés (Run)", en: "Tokens consumed (Run)", ar: "الرموز المستهلكة (Run)" })}</p>
                  <p className="wise-body-sm">{t({ fr: "Revenus récurrents sur la consommation de tokens pendant toute la vie du projet client", en: "Recurring revenue on token consumption throughout the client project lifetime", ar: "إيرادات متكررة على استهلاك الرموز طوال عمر مشروع العميل" })}</p>
                </div>
              </div>
              <p className="wise-body-sm text-center mt-6" style={{ color: "var(--neo-ink-muted)" }}>
                {t({ fr: "Plus vous apportez de projets et plus vous êtes impliqué, plus vos revenus augmentent — avec un effet cumulatif sur le long terme.", en: "The more projects you bring and the more involved you are, the more your revenue grows — with a cumulative long-term effect.", ar: "كلما جلبت المزيد من المشاريع وزادت مشاركتك، زادت إيراداتك — مع تأثير تراكمي على المدى الطويل." })}
              </p>
            </div>
          </motion.div>

          {/* Diagramme de flux */}
          <motion.div variants={fadeInUp} className="max-w-4xl mx-auto mt-14 mb-14">
            <h3 className="wise-display-sm text-center mb-8" style={{ color: "var(--neo-ink)" }}>{t({ fr: "Le flux d'un projet", en: "Project workflow", ar: "مسار المشروع" })}</h3>
            <FlowDiagram />
          </motion.div>

          {/* Simulateur de revenus */}
          <motion.div variants={fadeInUp} className="max-w-4xl mx-auto">
            <RevenueSimulator />
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── CTA Band ─── */}
      <AnimatedSection className="home-deferred-section" style={{ background: "var(--neo-primary)", padding: "clamp(2rem, 4vh, 3rem) clamp(1.25rem, 4vw, 3rem)" }}>
        <div className="container py-6 md:py-10 text-center">
          <motion.div variants={fadeInUp}>
            <Rocket size={36} style={{ color: "#ffffff" }} className="mx-auto mb-6" />
            <h2 className="wise-display-xl mb-5" style={{ textWrap: "balance", color: "#ffffff" }}>
              <span dangerouslySetInnerHTML={{ __html: t({ fr: "Ne subissez pas la disruption.<br />Devenez-en l'acteur.", en: "Don't suffer the disruption.<br />Become the agent of change.", ar: "لا تكن ضحية التحوّل.<br />كن صانع التغيير." }) }} />
            </h2>
            <p className="wise-body-lg mb-10 max-w-[42ch] mx-auto" style={{ color: "rgba(255,255,255,0.85)" }}>
              {t({ fr: "Formation et certification 100% gratuites – 296 places seulement", en: "Training and certification 100% free – only 296 spots", ar: "تدريب وشهادة مجانية 100% – 296 مقعداً فقط" })}
            </p>
            <Link href="/apply" className="text-base md:text-lg px-8 md:px-10 py-4 md:py-5 flex items-center gap-3 mx-auto font-semibold rounded-lg transition-all" style={{ background: "#ffffff", color: "var(--neo-primary)" }}>
              {t({ fr: "Postuler maintenant", en: "Apply now", ar: "قدّم الآن" })} <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── FAQ Section ─── */}
      <AnimatedSection id="faq" className="home-deferred-section" style={{ background: "var(--wise-canvas-soft)", padding: "clamp(2rem, 4vh, 3rem) clamp(1.25rem, 4vw, 3rem)" }}>
        <div className="container py-8">
          <motion.div variants={fadeInUp} className="text-center mb-8">
            <span className="wise-eyebrow mb-4 inline-flex">{t({ fr: "Support", en: "Support", ar: "الدعم" })}</span>
            <h2 className="wise-display-md">{t({ fr: "Questions fréquentes", en: "Frequently Asked Questions", ar: "الأسئلة الشائعة" })}</h2>
          </motion.div>
          <motion.div variants={staggerContainer} className="max-w-3xl mx-auto space-y-3">
            {faqItems.map((item, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <FAQItem question={t(item.q)} answer={t(item.a)} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── Bandeau Marquee Partenaires ─── */}
      <div className="py-10 md:py-14 overflow-hidden" style={{ background: "var(--wise-canvas-soft)" }}>
        <p className="wise-label text-center mb-8 tracking-widest uppercase">Nos partenaires technologiques</p>
        <div className="marquee-container">
          <div className="marquee-track">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="marquee-content">
                <img src="/api/assets/logo_anthropic_e6ab4160.png" alt="Anthropic" width={120} height={40} loading="lazy" decoding="async" className="h-8 md:h-10 object-contain opacity-60 hover:opacity-100 transition-opacity" />

                <img src="/api/assets/claude_ba4537f3.png" alt="Claude" width={120} height={40} loading="lazy" decoding="async" className="h-8 md:h-10 object-contain opacity-60 hover:opacity-100 transition-opacity" />


                <img src="/api/assets/openai_73a9a1b1.png" alt="OpenAI" width={120} height={40} loading="lazy" decoding="async" className="h-8 md:h-10 object-contain opacity-60 hover:opacity-100 transition-opacity" />
                <img src="/api/assets/gemini_c13269e9.png" alt="Gemini" width={120} height={40} loading="lazy" decoding="async" className="h-8 md:h-10 object-contain opacity-60 hover:opacity-100 transition-opacity" />
                <img src="/api/assets/langchain_9c5e065b.png" alt="LangChain" width={120} height={40} loading="lazy" decoding="async" className="h-8 md:h-10 object-contain opacity-60 hover:opacity-100 transition-opacity" />
                <img src="/api/assets/crewai_7df89ab8.png" alt="CrewAI" width={120} height={40} loading="lazy" decoding="async" className="h-8 md:h-10 object-contain opacity-60 hover:opacity-100 transition-opacity" />
                <img src="/api/assets/n8n_7ff20c9e.png" alt="n8n" width={120} height={40} loading="lazy" decoding="async" className="h-8 md:h-10 object-contain opacity-60 hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </div>

      </main>
      {/* ─── Footer (Dark) ─── */}
      <footer className="wise-footer">
        <div className="container py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <img src={LOGO_URL} alt="Neopolis Akademy" width={137} height={48} decoding="async" className="h-12 object-contain mb-3" />
              <p className="wise-body-sm">
                {t({ fr: "Transformer la menace de l'IA en opportunité.", en: "Turning the AI threat into opportunity.", ar: "تحويل تهديد الذكاء الاصطناعي إلى فرصة." })}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--neo-primary)" }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span className="wise-body-sm" style={{ color: "var(--neo-primary)" }}>{t({ fr: "Registered Partner du Claude Partner Network", en: "Registered Partner of the Claude Partner Network", ar: "شريك مسجل في Claude Partner Network" })}</span>
              </div>
            </div>
            <div>
              <h3 className="wise-label mb-3">{t({ fr: "Programme", en: "Program", ar: "البرنامج" })}</h3>
              <ul className="space-y-1.5">
                <li><a href="#formule" className="wise-body-sm hover:underline">{t({ fr: "La Formule", en: "The Formula", ar: "الصيغة" })}</a></li>
                <li><a href="#pourquoi" className="wise-body-sm hover:underline">{t({ fr: "Pourquoi maintenant", en: "Why now", ar: "لماذا الآن" })}</a></li>
                <li><a href="#partenaires" className="wise-body-sm hover:underline">{t({ fr: "Partenaires", en: "Partners", ar: "الشركاء" })}</a></li>
                <li><a href="#process" className="wise-body-sm hover:underline">{t({ fr: "Process Commercial", en: "Sales Process", ar: "العملية التجارية" })}</a></li>
                <li><a href="#faq" className="wise-body-sm hover:underline">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="wise-label mb-3">{t({ fr: "Outils", en: "Tools", ar: "الأدوات" })}</h3>
              <ul className="space-y-1.5">
                <li><Link href="/training" className="wise-body-sm hover:underline">{t({ fr: "Formation", en: "Training", ar: "التدريب" })}</Link></li>
                <li><Link href="/apply" className="wise-body-sm hover:underline">{t({ fr: "Postuler", en: "Apply", ar: "تقدّم" })}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="wise-label mb-3">{t({ fr: "Contact", en: "Contact", ar: "الاتصال" })}</h3>
              <ul className="space-y-1.5">
                <li><a href="mailto:info@neopolis-dev.com" className="wise-body-sm hover:underline">info@neopolis-dev.com</a></li>
                <li><a href="https://www.neopolis-dev.com" target="_blank" rel="noopener noreferrer" className="wise-body-sm hover:underline">{t({ fr: "À propos de Neopolis Dev ↗", en: "About Neopolis Dev ↗", ar: "حول Neopolis Dev ↗" })}</a></li>
                <li><a href="https://www.anthropic.com/news/claude-partner-network" target="_blank" rel="noopener noreferrer" className="wise-body-sm hover:underline">Claude Partner Network ↗</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--wise-rule)" }}>
            <p className="text-center wise-body-sm" style={{ color: "var(--wise-mute)" }}>
              © 2026 <a href="https://www.neopolis-dev.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Neopolis Development</a>. {t({ fr: "Tous droits réservés.", en: "All rights reserved.", ar: "جميع الحقوق محفوظة." })} · <Link href="/mentions-legales" className="hover:underline">{t({ fr: "Mentions légales", en: "Legal notice", ar: "الإشعار القانوني" })}</Link>
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
      className="whitespace-nowrap text-[12.5px] font-medium px-3 py-2 rounded-md relative group transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
    >
      {children}
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] rounded-full group-hover:w-3/5 transition-all duration-300 ease-out" style={{ background: "#1e3a6e" }} />
    </a>
  );
}


function FormulaCard({ icon, step, title, description, badge, image }: { icon: React.ReactNode; step: string; title: string; description: string; badge: string; image: { src: string; srcSet: string } }) {
  const { t } = useLanguage();
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] } }}
      className="wise-card h-full flex flex-col shadow-sm overflow-hidden group cursor-pointer"
      style={{ transition: "box-shadow 0.3s ease" }}
    >
      {/* Image en haut avec overlay au hover */}
      <div className="relative w-full h-44 -mx-6 -mt-6 mb-5 overflow-hidden" style={{ width: "calc(100% + 48px)" }}>
        <img
          src={image.src}
          srcSet={image.srcSet}
          sizes="(max-width: 767px) calc(100vw - 3rem), (max-width: 1023px) calc(50vw - 3rem), 384px"
          alt={title}
          className="w-full h-full object-cover transition-transform duration-400 ease-out group-hover:scale-105"
          width={600}
          height={450}
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="absolute top-3 right-3 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm" style={{ backgroundColor: "rgba(255,255,255,0.9)", color: "var(--wise-ink)" }}>
          {t({ fr: "ÉTAPE", en: "STEP", ar: "المرحلة" })} {step}
        </span>
      </div>

      {/* Contenu */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--neo-primary-light)" }}>
          <span style={{ color: "var(--neo-primary)" }}>{icon}</span>
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

function AnimatedChart() {
  const { t, lang } = useLanguage();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // The chart is informative rather than critical: wait until a meaningful
  // portion is visible instead of competing with the hero on small screens.
  const isInView = useInView(chartContainerRef, { once: true, margin: "0px", amount: 0.5 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || !canvasRef.current) return;
    let cancelled = false;

    const renderChart = async () => {
      const { Chart, CategoryScale, LinearScale, PointElement, LineController, LineElement, Filler, Tooltip, Legend } = await import("chart.js");
      if (cancelled || !canvasRef.current) return;

      Chart.register(CategoryScale, LinearScale, PointElement, LineController, LineElement, Filler, Tooltip, Legend);
      hasAnimated.current = true;
      chartInstanceRef.current?.destroy();

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["2020", "2023", "2025", "2027", "2030"],
        datasets: [
          {
            label: "Goldman Sachs (emplois expos\u00e9s, M)",
            data: [30, 85, 150, 220, 300],
            borderColor: "#1e3a6e",
            backgroundColor: "rgba(30,58,110,0.08)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#1e3a6e",
            pointBorderColor: "#1e3a6e",
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 3,
          },
          {
            label: "WEF (emplois d\u00e9plac\u00e9s, M)",
            data: [12, 40, 85, 88, 92],
            borderColor: "#94a3b8",
            backgroundColor: "rgba(148,163,184,0.06)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#94a3b8",
            pointBorderColor: "#94a3b8",
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2.5,
          },
          {
            label: "McKinsey (sc\u00e9nario haut, M)",
            data: [50, 150, 300, 550, 800],
            borderColor: "#dc1428",
            backgroundColor: "rgba(220,20,40,0.05)",
            fill: false,
            tension: 0.4,
            pointBackgroundColor: "#dc1428",
            pointBorderColor: "#dc1428",
            pointRadius: 3,
            pointHoverRadius: 5,
            borderWidth: 2,
            borderDash: [5, 5],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 2000,
          easing: "easeOutQuart" as const,
          delay: (ctx: any) => {
            let delay = 0;
            if (ctx.type === "data" && ctx.mode === "default") {
              delay = ctx.dataIndex * 200 + ctx.datasetIndex * 100;
            }
            return delay;
          },
        },
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
        interaction: { intersect: false, mode: "index" as const },
      },
      });
    };

    void renderChart();

    return () => {
      cancelled = true;
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, [isInView, lang]);

  return (
    <motion.div variants={fadeInUp} className="wise-card mb-8 md:mb-12">
      <h3 className="wise-display-xs mb-1" style={{ color: "var(--neo-primary)" }}>{t({ fr: "Emplois exposés à l'automatisation IA (en millions)", en: "Jobs exposed to AI automation (in millions)", ar: "الوظائف المعرّضة لأتمتة الذكاء الاصطناعي (بالملايين)" })}</h3>
      <p className="wise-label mb-4">WEF (85M/2025, 92M/2030) · Goldman Sachs (300M/2030) · McKinsey (400-800M/2030)</p>
      <div ref={chartContainerRef} className="h-[280px] md:h-[340px]">
        <canvas ref={canvasRef}></canvas>
      </div>
    </motion.div>
  );
}



function HeroGraphic() {
  const { t } = useLanguage();
  
  const orbitNodes = [
    { label: "Claude", icon: "C", angle: 30, orbit: 2, color: "#d4a574" },
    { label: "Agents", icon: "A", angle: 90, orbit: 2, color: "#4a6fa5" },
    { label: "Business", icon: "B", angle: 150, orbit: 2, color: "#2c4a7c" },
    { label: "Deploy", icon: "D", angle: 210, orbit: 2, color: "#3d5a8e" },
    { label: "Support", icon: "S", angle: 270, orbit: 2, color: "#6b7fa8" },
    { label: "Formation", icon: "F", angle: 330, orbit: 2, color: "#1e3a6e" },
    { label: "Gemini", icon: "G", angle: 60, orbit: 1, color: "#5a7a9e" },
    { label: "OpenAI", icon: "O", angle: 180, orbit: 1, color: "#3d5a8e" },
    { label: "RAG", icon: "R", angle: 300, orbit: 1, color: "#2c4a7c" },
  ];

  // Container size and orbit radii
  const size = 320;
  const center = size / 2;
  const innerRadius = 72;
  const outerRadius = 130;

  return (
    <div className="relative w-full flex items-center justify-center" style={{ minHeight: "360px" }}>
      {/* Orbital system - use SVG for precise positioning */}
      <div className="relative" style={{ width: `${size}px`, height: `${size}px` }}>
        
        {/* SVG for orbit rings and connection lines */}
        <svg
          className="absolute inset-0"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ overflow: "visible" }}
        >
          {/* Inner orbit ring */}
          <motion.circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="none"
            stroke="rgba(30, 58, 110, 0.12)"
            strokeWidth="1"
            strokeDasharray="4 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          {/* Outer orbit ring */}
          <motion.circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="none"
            stroke="rgba(30, 58, 110, 0.10)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.8, delay: 0.2, ease: "easeOut" }}
          />
          {/* Subtle connection lines from center to outer nodes */}
          {orbitNodes.filter(n => n.orbit === 2).map((node, i) => {
            const angleRad = (node.angle * Math.PI) / 180;
            const endX = center + Math.cos(angleRad) * outerRadius;
            const endY = center + Math.sin(angleRad) * outerRadius;
            return (
              <motion.line
                key={`line-${node.label}`}
                x1={center}
                y1={center}
                x2={endX}
                y2={endY}
                stroke="rgba(30, 58, 110, 0.06)"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 + i * 0.08, ease: "easeOut" }}
              />
            );
          })}
        </svg>

        {/* Rotating glow effect on outer ring */}
        <motion.div
          className="absolute"
          style={{
            width: `${outerRadius * 2}px`,
            height: `${outerRadius * 2}px`,
            top: `${center - outerRadius}px`,
            left: `${center - outerRadius}px`,
            borderRadius: "50%",
            background: "conic-gradient(from 0deg, transparent 0%, rgba(30,58,110,0.06) 8%, transparent 16%)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />

        {/* Center logo */}
        <motion.div
          className="absolute flex items-center justify-center rounded-full shadow-lg"
          style={{
            width: "64px",
            height: "64px",
            top: `${center - 32}px`,
            left: `${center - 32}px`,
            background: "white",
            boxShadow: "0 4px 24px rgba(30, 58, 110, 0.12)",
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
          <img src={LOGO_ICON} alt="Neopolis" width={40} height={40} decoding="async" className="w-10 h-10 object-contain" />
        </motion.div>

        {/* Orbital nodes - positioned with absolute pixel offsets from top-left */}
        {orbitNodes.map((node, i) => {
          const radius = node.orbit === 1 ? innerRadius : outerRadius;
          const angleRad = (node.angle * Math.PI) / 180;
          const nodeX = center + Math.cos(angleRad) * radius;
          const nodeY = center + Math.sin(angleRad) * radius;
          const nodeSize = node.orbit === 1 ? 28 : 32;
          
          return (
            <motion.div
              key={node.label}
              className="absolute flex flex-col items-center"
              style={{
                top: `${nodeY - nodeSize / 2}px`,
                left: `${nodeX - nodeSize / 2}px`,
                width: `${nodeSize}px`,
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.5 + i * 0.08, 
                ease: [0.23, 1, 0.32, 1] 
              }}
            >
              <motion.div
                className="rounded-full flex items-center justify-center text-white font-bold shadow-md"
                style={{ 
                  width: `${nodeSize}px`,
                  height: `${nodeSize}px`,
                  fontSize: node.orbit === 1 ? "10px" : "11px",
                  backgroundColor: node.color,
                  boxShadow: `0 2px 10px ${node.color}30`,
                }}
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 3 + i * 0.4, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
              >
                {node.icon}
              </motion.div>
              <span 
                className="font-semibold whitespace-nowrap mt-1" 
                style={{ color: "#475569", fontSize: "8px" }}
              >
                {node.label}
              </span>
            </motion.div>
          );
        })}

        {/* Animated pulse dots on the outer orbit */}
        {[0, 1, 2].map((i) => {
          const startAngle = i * 120; // evenly spaced
          return (
            <motion.div
              key={`pulse-${i}`}
              className="absolute rounded-full"
              style={{
                width: "6px",
                height: "6px",
                backgroundColor: "#1e3a6e",
                opacity: 0.5,
                top: `${center - 3}px`,
                left: `${center - 3}px`,
              }}
              animate={{
                x: Array.from({ length: 37 }, (_, k) => Math.cos(((startAngle + k * 10) * Math.PI) / 180) * outerRadius),
                y: Array.from({ length: 37 }, (_, k) => Math.sin(((startAngle + k * 10) * Math.PI) / 180) * outerRadius),
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "linear",
                delay: i * 4,
              }}
            />
          );
        })}
      </div>

      {/* Badges flottants */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
        className="absolute -top-2 right-0 hidden md:block"
      >
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-md" style={{ background: "linear-gradient(135deg, #1e3a6e, #3d5a8e)", border: "none" }}>
          <Sparkles size={14} className="text-white" />
          <span className="text-xs font-bold text-white tracking-wide">Certification CCA</span>
        </div>
      </motion.div>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-2 left-0 hidden md:block"
      >
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-md" style={{ background: "linear-gradient(135deg, oklch(0.60 0.15 240), oklch(0.55 0.18 270))", border: "none" }}>
          <Globe size={14} className="text-white" />
          <span className="text-xs font-bold text-white tracking-wide">{t({ fr: "Certification internationale", en: "International certification", ar: "شهادة دولية" })}</span>
        </div>
      </motion.div>
    </div>
  );
}

function MobileMenuButton() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg"
        style={{ backgroundColor: "var(--neo-primary-light)" }}
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
              <nav className="flex flex-col gap-2">
                <a href="#formule" onClick={() => setOpen(false)} className="text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors" style={{ color: "var(--wise-ink)" }}>{t({ fr: "La Formule", en: "The Formula", ar: "الصيغة" })}</a>
                <a href="#pourquoi" onClick={() => setOpen(false)} className="text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors" style={{ color: "var(--wise-ink)" }}>{t({ fr: "Pourquoi maintenant", en: "Why now", ar: "لماذا الآن" })}</a>
                <a href="#partenaires" onClick={() => setOpen(false)} className="text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors" style={{ color: "var(--wise-ink)" }}>{t({ fr: "Partenaires", en: "Partners", ar: "الشركاء" })}</a>
                <Link href="/ai-news" onClick={() => setOpen(false)} className="text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors" style={{ color: "var(--wise-ink)" }}>AI News</Link>
                <a href="#faq" onClick={() => setOpen(false)} className="text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors" style={{ color: "var(--wise-ink)" }}>FAQ</a>
                <div className="h-px my-1" style={{ background: "var(--wise-rule)" }} />
                <DeferredHomeAuth
                  slot="mobile-training"
                  onNavigate={() => setOpen(false)}
                  fallback={<a href="/login" onClick={() => setOpen(false)} className="text-sm font-semibold py-2.5 px-3 rounded-lg transition-colors" style={{ background: "rgba(30,58,110,0.08)", color: "#1e3a6e" }}>{t({ fr: "Se connecter 🔒", en: "Sign in 🔒", ar: "تسجيل الدخول 🔒" })}</a>}
                />
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


/* ─── Flow Diagram (animated on scroll) ─── */
function FlowDiagram() {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const steps = [
    { id: "ambassadeur", label: t({ fr: "Ambassadeur", en: "Ambassador", ar: "السفير" }), sub: t({ fr: "Prospection B2B", en: "B2B Prospecting", ar: "التنقيب B2B" }), bg: "var(--neo-primary-light)", iconColor: "var(--neo-primary)", icon: Target },
    { id: "centrale", label: t({ fr: "Centrale", en: "Central", ar: "المركز" }), sub: t({ fr: "Étude & Évaluation", en: "Study & Evaluation", ar: "الدراسة والتقييم" }), bg: "var(--neo-primary-light)", iconColor: "var(--neo-primary)", icon: Shield },
    { id: "contrat", label: t({ fr: "Contrat", en: "Contract", ar: "العقد" }), sub: t({ fr: "Contractualisation", en: "Contracting", ar: "التعاقد" }), bg: "var(--neo-primary-light)", iconColor: "var(--neo-primary)", icon: BookOpen },
    { id: "implementation", label: "Neopolis", sub: t({ fr: "Implémentation", en: "Implementation", ar: "التنفيذ" }), bg: "var(--neo-primary-light)", iconColor: "var(--neo-primary)", icon: Rocket },
    { id: "client", label: "Client", sub: t({ fr: "Monitoring & Run", en: "Monitoring & Run", ar: "المراقبة والتشغيل" }), bg: "var(--neo-primary-light)", iconColor: "var(--neo-primary)", icon: CheckCircle2 },
  ];

  const stepVariant = {
    hidden: { opacity: 0, y: 16, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.12,
        duration: 0.45,
        ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
      },
    }),
  };

  const arrowVariant = {
    hidden: { opacity: 0, x: -4 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.12 + 0.08,
        duration: 0.3,
        ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <div ref={ref} className="wise-card p-5 md:p-8">
      {/* Desktop flow - compact with arrows */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="flex items-center">
              <motion.div
                className="flex flex-col items-center text-center"
                custom={i}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={stepVariant}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-2"
                  style={{ backgroundColor: step.bg }}
                >
                  <Icon size={24} style={{ color: step.iconColor }} />
                </div>
                <p className="font-semibold text-xs" style={{ color: "var(--neo-ink)" }}>{step.label}</p>
                <p className="text-[10px] font-medium mt-0.5" style={{ color: "var(--neo-ink-muted)" }}>{step.sub}</p>
              </motion.div>
              {i < steps.length - 1 && (
                <motion.div
                  className="flex items-center mx-3 lg:mx-4"
                  custom={i}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  variants={arrowVariant}
                >
                  <div className="w-5 lg:w-8 h-[2px] rounded-full" style={{ background: "var(--neo-primary)", opacity: 0.35 }}></div>
                  <ArrowRight size={18} strokeWidth={2.5} style={{ color: "var(--neo-primary)", opacity: 0.7 }} />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile flow - compact horizontal scroll */}
      <div className="md:hidden flex items-center gap-1 overflow-x-auto pb-2">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <motion.div
                className="flex flex-col items-center text-center"
                custom={i}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={stepVariant}
              >
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center mb-1.5"
                  style={{ backgroundColor: step.bg }}
                >
                  <Icon size={18} style={{ color: step.iconColor }} />
                </div>
                <p className="font-semibold text-[10px]" style={{ color: "var(--neo-ink)" }}>{step.label}</p>
                <p className="text-[9px] font-medium" style={{ color: "var(--neo-ink-muted)" }}>{step.sub}</p>
              </motion.div>
              {i < steps.length - 1 && (
                <ArrowRight size={14} strokeWidth={2.5} className="mx-1.5 flex-shrink-0" style={{ color: "var(--neo-primary)", opacity: 0.6 }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Compact legend */}
      <motion.div
        className="mt-5 pt-4 border-t flex flex-wrap justify-center gap-x-6 gap-y-2"
        style={{ borderColor: "var(--neo-border)" }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--neo-primary)" }}></div>
          <span className="text-xs" style={{ color: "var(--neo-ink-secondary)" }}>{t({ fr: "Ambassadeur apporte le lead", en: "Ambassador brings the lead", ar: "السفير يجلب العميل" })}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--neo-primary)" }}></div>
          <span className="text-xs" style={{ color: "var(--neo-ink-secondary)" }}>{t({ fr: "Neopolis évalue & implémente", en: "Neopolis evaluates & implements", ar: "Neopolis تقيّم وتنفّذ" })}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "oklch(0.50 0.12 110)" }}></div>
          <span className="text-xs" style={{ color: "var(--neo-ink-secondary)" }}>{t({ fr: "Client bénéficie de la solution", en: "Client benefits from the solution", ar: "العميل يستفيد من الحل" })}</span>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Revenue Simulator ─── */
function RevenueSimulator() {
  const { t } = useLanguage();
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [projects, setProjects] = useState(3);
  const [avgSetup, setAvgSetup] = useState(5000);
  const [implication, setImplication] = useState(40);
  const [monthlyTokens, setMonthlyTokens] = useState(500);

  const setupRevenue = projects * avgSetup * (implication / 100);
  const monthlyRecurring = projects * monthlyTokens * 0.10;
  const annualRecurring = monthlyRecurring * 12;
  const totalFirstYear = setupRevenue + annualRecurring;

  return (
    <div className="wise-card p-6 md:p-10" style={{ background: "var(--wise-canvas)" }}>
      <div className="text-center mb-8">
        <span className="wise-eyebrow mb-3 inline-flex">
          <Sparkles size={12} />
          {t({ fr: "Simulateur", en: "Simulator", ar: "محاكي" })}
        </span>
        <h3 className="wise-display-sm">{t({ fr: "Estimez vos revenus potentiels", en: "Estimate your potential earnings", ar: "قدّر أرباحك المحتملة" })}</h3>
        <p className="wise-body-sm mt-2 max-w-[48ch] mx-auto">{t({ fr: "Ajustez les paramètres pour simuler vos gains en tant qu'Ambassadeur certifié.", en: "Adjust the parameters to simulate your earnings as a Certified Ambassador.", ar: "اضبط المعايير لمحاكاة أرباحك كسفير معتمد." })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div>
            <label htmlFor="revenue-projects" className="wise-label mb-2 block">{t({ fr: "Nombre de projets apportés / an", en: "Number of projects brought / year", ar: "عدد المشاريع المقدمة / سنة" })}</label>
            <input
              id="revenue-projects"
              type="range"
              min={1}
              max={20}
              value={projects}
              onChange={(e) => setProjects(Number(e.target.value))}
              className="w-full accent-[var(--neo-primary)]"
            />
            <div className="flex justify-between mt-1">
              <span className="wise-label">1</span>
              <span className="font-semibold text-sm" style={{ color: "var(--neo-primary)", fontFamily: "var(--font-mono)" }}>{projects} {t({ fr: "projets", en: "projects", ar: "مشاريع" })}</span>
              <span className="wise-label">20</span>
            </div>
          </div>

          <div>
            <label htmlFor="revenue-setup-fee" className="wise-label mb-2 block">{t({ fr: "Frais de setup moyen par project (€)", en: "Average setup fee per project (€)", ar: "رسوم الإعداد المتوسطة لكل مشروع (€)" })}</label>
            <input
              id="revenue-setup-fee"
              type="range"
              min={1000}
              max={30000}
              step={1000}
              value={avgSetup}
              onChange={(e) => setAvgSetup(Number(e.target.value))}
              className="w-full accent-[var(--neo-primary)]"
            />
            <div className="flex justify-between mt-1">
              <span className="wise-label">1 000€</span>
              <span className="font-semibold text-sm" style={{ color: "var(--neo-primary)", fontFamily: "var(--font-mono)" }}>{avgSetup.toLocaleString("fr-FR")} €</span>
              <span className="wise-label">30 000€</span>
            </div>
          </div>

          <div>
            <label htmlFor="revenue-involvement" className="wise-label mb-2 block">{t({ fr: "Votre taux d'implication (%)", en: "Your involvement rate (%)", ar: "نسبة مشاركتك (%)" })}</label>
            <input
              id="revenue-involvement"
              type="range"
              min={20}
              max={60}
              step={5}
              value={implication}
              onChange={(e) => setImplication(Number(e.target.value))}
              className="w-full accent-[var(--neo-primary)]"
            />
            <div className="flex justify-between mt-1">
              <span className="wise-label">20%</span>
              <span className="font-semibold text-sm" style={{ color: "var(--neo-primary)", fontFamily: "var(--font-mono)" }}>{implication}%</span>
              <span className="wise-label">60%</span>
            </div>
          </div>

          <div>
            <label htmlFor="revenue-tokens" className="wise-label mb-2 block">{t({ fr: "Consommation tokens mensuelle / projet (€)", en: "Monthly token consumption / project (€)", ar: "استهلاك الرموز الشهري / مشروع (€)" })}</label>
            <input
              id="revenue-tokens"
              type="range"
              min={100}
              max={5000}
              step={100}
              value={monthlyTokens}
              onChange={(e) => setMonthlyTokens(Number(e.target.value))}
              className="w-full accent-[var(--neo-primary)]"
            />
            <div className="flex justify-between mt-1">
              <span className="wise-label">100€</span>
              <span className="font-semibold text-sm" style={{ color: "var(--neo-primary)", fontFamily: "var(--font-mono)" }}>{monthlyTokens.toLocaleString("fr-FR")} €/mois</span>
              <span className="wise-label">5 000€</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col justify-center">
          <div className="wise-card-sage p-6 md:p-8 space-y-5">
            <div>
              <p className="wise-label mb-1">{t({ fr: "Revenus Setup (one-shot)", en: "Setup Revenue (one-shot)", ar: "إيرادات الإعداد (دفعة واحدة)" })}</p>
              <p className="wise-display-sm" style={{ color: "var(--wise-ink)", fontFamily: "var(--font-mono)" }}>
                {setupRevenue.toLocaleString("fr-FR")} €
              </p>
              <p className="wise-body-sm mt-1">{projects} {t({ fr: "projets", en: "projects", ar: "مشاريع" })} × {avgSetup.toLocaleString("fr-FR")}€ × {implication}%</p>
            </div>
            <div className="border-t pt-5" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
              <p className="wise-label mb-1">{t({ fr: "Revenus récurrents (10% tokens)", en: "Recurring Revenue (10% tokens)", ar: "إيرادات متكررة (10% رموز)" })}</p>
              <p className="wise-display-sm" style={{ color: "var(--wise-ink)", fontFamily: "var(--font-mono)" }}>
                {monthlyRecurring.toLocaleString("fr-FR")} €<span className="text-sm font-normal"> /mois</span>
              </p>
              <p className="wise-body-sm mt-1">{projects} × {monthlyTokens.toLocaleString("fr-FR")}€ × 10% = {annualRecurring.toLocaleString("fr-FR")} €/an</p>
            </div>
            <div className="border-t pt-5" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
              <p className="wise-label mb-1">{t({ fr: "Total 1ère année estimé", en: "Estimated 1st year total", ar: "إجمالي السنة الأولى المقدّر" })}</p>
              <p className="wise-display-md" style={{ color: "var(--neo-primary)", fontFamily: "var(--font-mono)" }}>
                {totalFirstYear.toLocaleString("fr-FR")} €
              </p>
              <p className="wise-body-sm mt-1">{t({ fr: "Setup + 12 mois de récurrent", en: "Setup + 12 months recurring", ar: "الإعداد + 12 شهراً متكرراً" })}</p>
            </div>
          </div>
          <p className="wise-label text-center mt-4">
            * {t({ fr: "* Estimation indicative basée sur vos paramètres", en: "* Indicative estimate based on your parameters", ar: "* تقدير إرشادي بناءً على معاييرك" })}
          </p>
        </div>
      </div>

      {/* Exemples concrets */}
      <div className="mt-10 pt-8 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <h4 className="wise-display-xs text-center mb-6">{t({ fr: "Exemples concrets de projets", en: "Concrete project examples", ar: "أمثلة ملموسة للمشاريع" })}</h4>
        <p className="wise-body-sm text-center mb-8 max-w-[56ch] mx-auto">{t({ fr: "Scénarios réalistes dans le contexte Afrique / MENA — les montants varient selon la complexité.", en: "Realistic scenarios in the Africa / MENA context — amounts vary depending on complexity.", ar: "سيناريوهات واقعية في سياق أفريقيا / الشرق الأوسط — المبالغ تختلف حسب التعقيد." })}</p>
        {(() => {
          const toggleCard = (idx: number) => {
            setExpandedCards(prev => {
              const next = new Set(prev);
              if (next.has(idx)) next.delete(idx); else next.add(idx);
              return next;
            });
          };
          const projectExamples = [
            { icon: "✈️", title: t({ fr: "Agence de Voyage", en: "Travel Agency", ar: "وكالة سفر" }), roi: t({ fr: "+35% conversions", en: "+35% conversions", ar: "+35% تحويلات" }), desc: t({ fr: "Chatbot IA multilingue (arabe/français) pour devis Omra & circuits touristiques, avec relance automatique des prospects inactifs", en: "Multilingual AI chatbot (Arabic/French) for Omra quotes & tourist circuits, with automatic follow-up of inactive prospects", ar: "روبوت محادثة ذكي متعدد اللغات" }), setup: "6 000 €", tokens: "800 €", earnings: "2 400 € + 80 €/mois", pct: "40%" },
            { icon: "📣", title: t({ fr: "Agence Marketing", en: "Marketing Agency", ar: "وكالة تسويق" }), roi: t({ fr: "3 employés remplacés", en: "3 employees replaced", ar: "3 موظفين مستبدلين" }), desc: t({ fr: "Agent autonome de création de contenu social media (posts, visuels, planning) pour clients PME au Maghreb", en: "Autonomous social media content creation agent (posts, visuals, planning) for SME clients in the Maghreb", ar: "وكيل مستقل لإنشاء محتوى وسائل التواصل الاجتماعي" }), setup: "10 000 €", tokens: "1 500 €", earnings: "4 500 € + 150 €/mois", pct: "45%" },
            { icon: "🛡️", title: t({ fr: "Compagnie d'Assurance", en: "Insurance Company", ar: "شركة تأمين" }), roi: t({ fr: "-60% temps traitement", en: "-60% processing time", ar: "-60% وقت المعالجة" }), desc: t({ fr: "Workflow automation pour le traitement des sinistres : extraction documents, vérification fraude, calcul indemnités", en: "Workflow automation for claims processing: document extraction, fraud verification, compensation calculation", ar: "أتمتة سير العمل لمعالجة المطالبات" }), setup: "45 000 €", tokens: "8 000 €", earnings: "22 500 € + 800 €/mois", pct: "50%" },
            { icon: "🏦", title: t({ fr: "Banque Régionale", en: "Regional Bank", ar: "بنك إقليمي" }), roi: t({ fr: "x4 dossiers traités/jour", en: "x4 files processed/day", ar: "x4 ملفات معالجة/يوم" }), desc: t({ fr: "Agent IA d'analyse de dossiers de crédit PME/TPE : scoring automatisé, vérification KYC et recommandation d'offres", en: "AI agent for SME credit file analysis: automated scoring, KYC verification and offer recommendations", ar: "وكيل ذكاء اصطناعي لتحليل ملفات الائتمان" }), setup: "60 000 €", tokens: "12 000 €", earnings: "33 000 € + 1 200 €/mois", pct: "55%" },
            { icon: "🩺", title: t({ fr: "Cabinet Médical", en: "Medical Practice", ar: "عيادة طبية" }), roi: t({ fr: "-70% appels manqués", en: "-70% missed calls", ar: "-70% مكالمات فائتة" }), desc: t({ fr: "Assistant IA pour prise de RDV, tri des urgences, rappels patients et pré-diagnostic orienté", en: "AI assistant for appointment booking, emergency triage, patient reminders and guided pre-diagnosis", ar: "مساعد ذكاء اصطناعي لحجز المواعيد" }), setup: "8 000 €", tokens: "600 €", earnings: "3 200 € + 60 €/mois", pct: "40%" },
            { icon: "🚢", title: t({ fr: "Société Import-Export", en: "Import-Export Company", ar: "شركة استيراد وتصدير" }), roi: t({ fr: "-45% retards douane", en: "-45% customs delays", ar: "-45% تأخيرات جمركية" }), desc: t({ fr: "Agent de suivi logistique : tracking conteneurs, alertes douanes, génération documents d'import (ports Tanger Med, Abidjan)", en: "Logistics tracking agent: container tracking, customs alerts, import document generation", ar: "وكيل متابعة لوجستية" }), setup: "35 000 €", tokens: "6 000 €", earnings: "17 500 € + 600 €/mois", pct: "50%" },
            { icon: "🏗️", title: t({ fr: "Promoteur Immobilier", en: "Real Estate Developer", ar: "مطور عقاري" }), roi: t({ fr: "+50% leads qualifiés", en: "+50% qualified leads", ar: "+50% عملاء محتملين مؤهلين" }), desc: t({ fr: "Chatbot de qualification acheteurs, visite virtuelle IA et génération de compromis (programmes neufs Maroc/Tunisie)", en: "Buyer qualification chatbot, AI virtual tours and sales agreement generation", ar: "روبوت محادثة لتأهيل المشترين" }), setup: "14 000 €", tokens: "1 800 €", earnings: "6 300 € + 180 €/mois", pct: "45%" },
            { icon: "🎓", title: t({ fr: "École Privée / Université", en: "Private School / University", ar: "مدرسة خاصة / جامعة" }), roi: t({ fr: "-80% temps correction", en: "-80% grading time", ar: "-80% وقت التصحيح" }), desc: t({ fr: "Plateforme de tutorat IA personnalisé et correction automatique d'examens pour établissements privés", en: "Personalized AI tutoring platform and automatic exam grading for private institutions", ar: "منصة تعليم خصوصي بالذكاء الاصطناعي" }), setup: "12 000 €", tokens: "1 200 €", earnings: "5 400 € + 120 €/mois", pct: "45%" },
          ];
          return (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {projectExamples.map((p: any, idx: number) => (
            <div key={idx} className="wise-card-sage p-4 flex flex-col">
              {/* Always visible: icon + title + ROI */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{p.icon}</span>
                <p className="font-semibold text-sm" style={{ color: "var(--neo-ink)" }}>{p.title}</p>
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="wise-label">{t({ fr: "ROI client", en: "Client ROI", ar: "عائد العميل" })}</span>
                <span className="font-semibold text-xs" style={{ color: "var(--neo-ink-secondary)", fontFamily: "var(--font-mono)" }}>{p.roi}</span>
              </div>
              {/* Expand/collapse button */}
              <button
                onClick={() => toggleCard(idx)}
                className="flex items-center gap-1 text-xs font-medium mt-auto pt-2 border-t cursor-pointer"
                style={{ borderColor: "rgba(0,0,0,0.06)", color: "var(--neo-primary)" }}
              >
                {expandedCards.has(idx) ? (
                  <><ChevronUp size={14} /> {t({ fr: "Masquer", en: "Show less", ar: "إخفاء" })}</>
                ) : (
                  <><ChevronDown size={14} /> {t({ fr: "Afficher plus", en: "Show more", ar: "عرض المزيد" })}</>
                )}
              </button>
              {/* Expanded details */}
              {expandedCards.has(idx) && (
                <div className="mt-3 space-y-2 animate-in fade-in duration-200">
                  <p className="wise-body-sm">{p.desc}</p>
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between">
                      <span className="wise-label">Setup</span>
                      <span className="font-semibold text-xs" style={{ fontFamily: "var(--font-mono)" }}>{p.setup}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="wise-label">Tokens/mois</span>
                      <span className="font-semibold text-xs" style={{ fontFamily: "var(--font-mono)" }}>{p.tokens}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                      <span className="wise-label">{t({ fr: `Votre gain (${p.pct})`, en: `Your earnings (${p.pct})`, ar: `أرباحك (${p.pct})` })}</span>
                      <span className="font-semibold text-xs" style={{ color: "var(--neo-primary)", fontFamily: "var(--font-mono)" }}>{p.earnings}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="wise-label text-center mt-6">
          {t({ fr: "Tous les scénarios sont basés sur des cas réels du marché Afrique/MENA — les montants varient selon la taille et la complexité du projet.", en: "All scenarios are based on real cases from the Africa/MENA market — amounts vary depending on size and complexity.", ar: "جميع السيناريوهات مبنية على حالات حقيقية من سوق أفريقيا/الشرق الأوسط — المبالغ تختلف حسب الحجم والتعقيد." })}
        </p>
        </>
          );
        })()}
      </div>
    </div>
  );
}
