import { useEffect, useRef, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
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
  ChevronUp,
  Play,
  CheckCircle2,
  Sparkles,
  Target,
  Rocket,
  Menu,
  X,
  PlayCircle,
  LogOut,
} from "lucide-react";
import { useTrainingProgress } from "@/contexts/TrainingProgressContext";
import { useAuth } from "@/_core/hooks/useAuth";
import trainingIndex from "@/data/trainingIndex.json";
import { faqItems as faqItemsData } from "@/data/faqData";

// Chart.js
import { Chart as ChartJS, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
ChartJS.register(...registerables);

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
const LOGO_URL = "/api/assets/neopolis_dev_logo_4x_4011a55b.png";
const LOGO_ICON = "/api/assets/neopolis_dev_logo_original_60dc435f.png";
const HERO_IMG = "/api/assets/hero_tunisian_ai_08a6f956.png";
const CERT_IMG = "/api/assets/step2_certification_b2f65035.png";
const ELEARNING_IMG = "/api/assets/step1_elearning_d87a7198.png";
const AFRICA_IMG = "/api/assets/step3_ambassador_91fc256d.png";
const PARTNER_IMG = "/api/assets/wise_partnership_illustration_b3c56284.png";

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

/* ─── Logout Button ─── */
function LogoutButton() {
  const { isAuthenticated, logout, user } = useAuth();
  const { t } = useLanguage();
  if (!isAuthenticated) return null;

  return (
    <button
      onClick={() => logout()}
      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300"
      title={t({ fr: `Déconnexion (${user?.name || ''})`, en: `Logout (${user?.name || ''})`, ar: `تسجيل الخروج (${user?.name || ''})` })}
    >
      <LogOut size={13} />
      <span className="hidden md:inline">{t({ fr: "Déconnexion", en: "Logout", ar: "خروج" })}</span>
    </button>
  );
}

/* ─── Resume Reading Widget ─── */
function ResumeReadingWidget() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { getLastVisitedCourse, isLoading } = useTrainingProgress();

  if (!isAuthenticated || isLoading) return null;

  const lastVisited = getLastVisitedCourse();
  if (!lastVisited) return null;

  const course = trainingIndex.courses.find((c: any) => c.id === lastVisited.courseId);
  if (!course) return null;
  const cert = trainingIndex.certifications.find((c: any) => c.id === (course as any).certId);
  const progressPct = Math.round(((lastVisited.chapterIndex + 1) / lastVisited.totalChapters) * 100);

  return (
    <div className="container" style={{ padding: "0 clamp(1.25rem, 4vw, 3rem)" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="-mt-4 mb-8"
      >
        <Link
          href={`/training/${(course as any).certId}/${course.id}`}
          className="group block rounded-2xl border p-4 md:p-5 hover:shadow-lg transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, oklch(96% 0.02 145 / 0.5), oklch(97% 0.015 95 / 0.5))",
            borderColor: "oklch(82% 0.06 145 / 0.4)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "oklch(90% 0.06 145 / 0.4)" }}>
              <PlayCircle className="w-5 h-5 md:w-6 md:h-6" style={{ color: "oklch(45% 0.15 145)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "oklch(90% 0.06 145 / 0.5)", color: "oklch(40% 0.12 145)" }}>
                  {t({ fr: "Reprendre la lecture", en: "Resume reading", ar: "استئناف القراءة" })}
                </span>
                {cert && <span className="text-xs text-muted-foreground">{(cert as any).icon}</span>}
              </div>
              <h3 className="text-sm md:text-base font-semibold group-hover:opacity-80 transition-opacity truncate" style={{ color: "oklch(25% 0.02 250)" }}>
                {typeof (course as any).title === 'object' ? ((course as any).title.fr || (course as any).title.en) : (course as any).title}
              </h3>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex-1 max-w-[200px] h-1.5 rounded-full overflow-hidden" style={{ background: "oklch(88% 0.02 145 / 0.6)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%`, background: "oklch(55% 0.15 145)" }}
                  />
                </div>
                <span className="text-xs font-medium" style={{ color: "oklch(45% 0.08 145)" }}>
                  {t({ fr: `Chapitre ${lastVisited.chapterIndex + 1}/${lastVisited.totalChapters}`, en: `Chapter ${lastVisited.chapterIndex + 1}/${lastVisited.totalChapters}`, ar: `الفصل ${lastVisited.chapterIndex + 1}/${lastVisited.totalChapters}` })}
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" style={{ color: "oklch(55% 0.1 145)" }} />
          </div>
        </Link>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const { t, lang } = useLanguage();
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
            <img src={LOGO_URL} alt="Neopolis Development" className="h-8 md:h-9 object-contain" />
          </Link>

          {/* Center nav links */}
          <div className="hidden lg:flex items-center gap-1 mx-auto">
            <NavLink href="#formule">{t({ fr: "La Formule", en: "The Formula", ar: "الصيغة" })}</NavLink>
            <NavLink href="#pourquoi">{t({ fr: "Pourquoi maintenant", en: "Why now", ar: "لماذا الآن" })}</NavLink>
            <NavLink href="#partenaires">{t({ fr: "Partenaires", en: "Partners", ar: "الشركاء" })}</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
            <Link href="/training" className="text-[11px] font-semibold px-3.5 py-1.5 ml-1 rounded-full transition-all duration-200 bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md">{t({ fr: "Formation", en: "Training", ar: "التدريب" })}</Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto lg:ml-0 shrink-0">
            <LanguageSwitcher />
            <LogoutButton />
            <Link href="/apply">
              <button className="flex items-center gap-1.5 text-xs md:text-sm font-semibold px-4 md:px-5 py-2 md:py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all duration-200 hover:shadow-md active:scale-[0.97]">
                {t({ fr: "Postuler", en: "Apply", ar: "تقدّم" })} <ChevronRight size={14} />
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
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 mb-6">
                <Link href="/apply">
                  <button className="wise-btn-primary flex items-center gap-2 text-sm md:text-base px-5 md:px-7 py-3 md:py-3.5">
                    {t({ fr: "Déposer ma candidature", en: "Submit my application", ar: "تقديم طلبي" })} <ArrowRight size={18} />
                  </button>
                </Link>
                <a href="#formule">
                  <button className="wise-btn-secondary flex items-center gap-2 text-sm md:text-base px-5 md:px-7 py-3 md:py-3.5">
                    {t({ fr: "Découvrir le programme", en: "Discover the program", ar: "اكتشف البرنامج" })}
                  </button>
                </a>
              </motion.div>

              {/* Hero note (chips) */}
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-2">
                <span className="wise-badge-positive">{t({ fr: "100% Gratuit", en: "100% Free", ar: "مجاني 100%" })}</span>
                <span className="wise-badge-positive">{t({ fr: "296 places", en: "296 spots", ar: "296 مقعد" })}</span>
                <span className="wise-badge-negative">{t({ fr: "Avant le 31 août 2026", en: "Before August 31, 2026", ar: "قبل 31 أوت 2026" })}</span>
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

      {/* ─── Resume Reading Widget ─── */}
      <ResumeReadingWidget />

      {/* ─── Pourquoi maintenant (Gris Band) ─── */}
      <AnimatedSection id="pourquoi" style={{ background: "var(--wise-canvas-soft)", padding: "clamp(3rem, 6vh, 5rem) clamp(1.25rem, 4vw, 3rem)" }}>
        <div className="container py-12 md:py-20">
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
              <motion.div variants={scaleIn} className="wise-card" style={{ background: "var(--tint-coral)" }}>
                <TrendingDown size={20} style={{ color: "var(--wise-accent-coral)" }} className="mb-3" />
                <p className="wise-display-sm mb-1"><AnimatedStat value={300} suffix="M" /></p>
                <p className="wise-body-sm" style={{ color: "var(--wise-accent-coral)", fontWeight: 600 }}>{t({ fr: "d'emplois exposés à l'automatisation", en: "jobs exposed to automation", ar: "وظيفة معرّضة للأتمتة" })}</p>
                <p className="wise-label mt-2">Goldman Sachs, 2023</p>
              </motion.div>

              <motion.div variants={scaleIn} className="wise-card" style={{ background: "var(--tint-cyan)" }}>
                <Users size={20} style={{ color: "var(--wise-accent-cyan)" }} className="mb-3" />
                <p className="wise-display-sm mb-1"><AnimatedStat value={92} suffix="M" /></p>
                <p className="wise-body-sm" style={{ color: "var(--wise-accent-cyan)", fontWeight: 600 }}>{t({ fr: "d'emplois déplacés d'ici 2030", en: "jobs displaced by 2030", ar: "وظيفة ستُستبدل بحلول 2030" })}</p>
                <p className="wise-label mt-2">WEF Future of Jobs 2025</p>
              </motion.div>

              <motion.div variants={scaleIn} className="wise-card" style={{ background: "var(--tint-pear)" }}>
                <Shield size={20} style={{ color: "oklch(64% 0.18 95)" }} className="mb-3" />
                <p className="wise-display-sm mb-1"><AnimatedStat value={30} suffix="%" /></p>
                <p className="wise-body-sm" style={{ color: "oklch(52% 0.14 95)", fontWeight: 600 }}>{t({ fr: "des heures de travail automatisées", en: "of work hours automated", ar: "من ساعات العمل مؤتمتة" })}</p>
                <p className="wise-label mt-2">McKinsey Global Institute</p>
              </motion.div>

              <motion.div variants={scaleIn} className="wise-card" style={{ background: "var(--tint-mint)" }}>
                <TrendingDown size={20} style={{ color: "var(--wise-positive-deep)" }} className="mb-3" />
                <p className="wise-display-sm mb-1"><AnimatedStat value={220} suffix={t({ fr: " Milliards $", en: "B $", ar: " مليار $" })} /></p>
                <p className="wise-body-sm" style={{ color: "var(--wise-positive-deep)", fontWeight: 600 }}>{t({ fr: "de SaaS menacés par les agents IA", en: "of SaaS threatened by AI agents", ar: "من SaaS مهددة بوكلاء الذكاء الاصطناعي" })}</p>
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
      <AnimatedSection id="formule" style={{ background: "var(--wise-canvas)", padding: "clamp(3rem, 6vh, 5rem) clamp(1.25rem, 4vw, 3rem)" }}>
        <div className="container py-12">
          <motion.div variants={fadeInUp} className="text-center mb-14">
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
      <AnimatedSection id="partenaires" style={{ background: "var(--wise-canvas-soft)", padding: "clamp(2rem, 4vh, 3.5rem) clamp(1.25rem, 4vw, 3rem)" }}>
        <div className="container py-6">
          <motion.div variants={fadeInUp} className="text-center mb-8">
            <span className="wise-eyebrow mb-3 inline-flex">{t({ fr: "Écosystème", en: "Ecosystem", ar: "النظام البيئي" })}</span>
            <h2 className="wise-display-md mb-3" style={{ color: "var(--wise-ink)" }}>{t({ fr: "Nos Partenaires Technologiques", en: "Our Technology Partners", ar: "شركاؤنا التكنولوجيون" })}</h2>
            <p className="wise-body-md max-w-[56ch] mx-auto" style={{ color: "var(--wise-ink-muted)" }}>
              {t({ fr: "Registered Partner du Claude Partner Network — écosystème IA agentique Afrique & MENA.", en: "Registered Partner of the Claude Partner Network — agentic AI ecosystem for Africa & MENA.", ar: "شريك مسجل في شبكة Claude Partner Network — نظام بيئي للذكاء الاصطناعي الوكيلي لأفريقيا والشرق الأوسط." })} <a href="https://www.anthropic.com/news/claude-partner-network" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--wise-positive-deep)" }}>CPN ↗</a>
            </p>
          </motion.div>

          {/* Compact layout: Anthropic card + tech badges + features in one row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
            {/* Anthropic Partner Card - compact */}
            <motion.div variants={scaleIn} className="wise-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden" style={{ background: "var(--wise-canvas)" }}>
                  <img src="/api/assets/logo_anthropic_e6ab4160.png" alt="Anthropic" className="w-7 h-7 object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-base" style={{ color: "var(--wise-ink)" }}>Anthropic</h3>
                  <span className="text-xs" style={{ color: "var(--wise-mute)" }}>Registered Partner</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--wise-ink-muted)" }}>
                {t({ fr: "Voucher CCA gratuit pour nos candidats. Accès facilité à la certification Claude Certified Architect.", en: "Free CCA voucher for our candidates. Easy access to Claude Certified Architect certification.", ar: "قسيمة CCA مجانية لمرشحينا. وصول سهل إلى شهادة Claude Certified Architect." })}
              </p>
            </motion.div>

            {/* Tech ecosystem - compact network badges */}
            <motion.div variants={fadeInUp} className="wise-card p-5">
              <h4 className="font-semibold text-sm mb-3" style={{ color: "var(--wise-ink)" }}>{t({ fr: "Écosystème technologique", en: "Tech ecosystem", ar: "النظام التقني" })}</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Neopolis", color: "#9fe870" },
                  { label: "Anthropic", color: "#d4a574" },
                  { label: "OpenAI", color: "#10a37f" },
                  { label: "Agents IA", color: "#38c8ff" },
                  { label: "Multi-LLM", color: "#a78bfa" },
                  { label: "Infra", color: "#34d399" },
                  { label: "Support", color: "#fbbf24" },
                ].map((item) => (
                  <span key={item.label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${item.color}18`, color: "var(--wise-ink)" }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.label}
                  </span>
                ))}
              </div>
              <p className="text-xs mt-3" style={{ color: "var(--wise-mute)" }}>
                {t({ fr: "Statut Select en cours d'obtention", en: "Select status in progress", ar: "حالة Select قيد الحصول" })}
              </p>
            </motion.div>

            {/* What we provide - compact list */}
            <motion.div variants={fadeInRight} className="wise-card p-5">
              <h4 className="font-semibold text-sm mb-3" style={{ color: "var(--wise-ink)" }}>{t({ fr: "Ce que nous fournissons", en: "What we provide", ar: "ما نوفره" })}</h4>
              <div className="space-y-1.5">
                {[
                  t({ fr: "Ressources humaines & techniques", en: "Human & technical resources", ar: "موارد بشرية وتقنية" }),
                  t({ fr: "Agents IA prêts à l'emploi", en: "Ready-to-use AI agents", ar: "وكلاء ذكاء اصطناعي جاهزون" }),
                  t({ fr: "Multi-LLM (Claude, Gemini, OpenAI)", en: "Multi-LLM (Claude, Gemini, OpenAI)", ar: "نماذج متعددة (Claude, Gemini, OpenAI)" }),
                  t({ fr: "Infra serveurs on-premise", en: "On-premise server infra", ar: "بنية تحتية محلية" }),
                  t({ fr: "Support commercial & marketing", en: "Commercial & marketing support", ar: "دعم تجاري وتسويقي" }),
                  t({ fr: "Support technique continu", en: "Continuous tech support", ar: "دعم فني مستمر" }),
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={13} style={{ color: "var(--wise-positive-deep)", flexShrink: 0 }} />
                    <span className="text-xs" style={{ color: "var(--wise-ink-muted)" }}>{item}</span>
                  </div>
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
                {t({ fr: "Votre futur statut", en: "Your future status", ar: "حالتك المستقبلية" })}
              </span>
              <h2 className="wise-display-md mb-6">{t({ fr: "Devenez AI Solutions Partner", en: "Become an AI Solutions Partner", ar: "كن شريك حلول ذكاء اصطناعي" })}</h2>
              <p className="wise-body-lg mb-6">
                {t({ fr: "Après votre certification, vous obtenez le statut d'AI Solutions Partner - Ambassadeur Certifié. Vous devenez un entrepreneur indépendant qui distribue des solutions IA auprès des PME/TPE de votre secteur d'activité.", en: "After your certification, you obtain the status of AI Solutions Partner - Certified Ambassador. You become an independent entrepreneur who distributes AI solutions to SMEs in your industry.", ar: "بعد الحصول على الشهادة، تحصل على مركز شريك حلول ذكاء اصطناعي - سفير معتمد. أنت تصبح رائد أعمال مستقلاً يوزع حلول الذكاء الاصطناعي للشركات الصغيرة والمتوسطة في قطاعك." })}
              </p>
              <div className="wise-card-sage p-6">
                <h4 className="font-semibold text-lg mb-3" style={{ color: "var(--wise-ink)" }}>{t({ fr: "Votre mission :", en: "Your mission:", ar: "مهمتك:" })}</h4>
                <p className="wise-body-md">
                  {t({ fr: "Identifier les entreprises de votre secteur dont les processus peuvent être automatisés par des agents IA, leur proposer des solutions concrètes, et les accompagner dans leur transformation digitale - avec tout le soutien de Neopolis Development.", en: "Identify companies in your sector whose processes can be automated by AI agents, propose concrete solutions to them, and support them in their digital transformation - with full support from Neopolis Development.", ar: "تحديد الشركات في قطاعك التي يمكن أتمتة عملياتها بواسطة وكلاء الذكاء الاصطناعي، والعرض عليهم حلولاً عملية، ودعمهم في التحول الرقمي - مع الدعم الكامل من Neopolis Development." })}
                </p>
              </div>
            </motion.div>
            <motion.div variants={fadeInRight}>
              <img src={AFRICA_IMG} alt="Réseau Afrique" className="w-full max-w-xs md:max-w-sm mx-auto object-contain rounded-3xl" />
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* ─── Process Commercial & Modèle Économique ─── */}
      <AnimatedSection id="process" style={{ background: "var(--wise-canvas-soft)", padding: "clamp(3rem, 6vh, 5rem) clamp(1.25rem, 4vw, 3rem)" }}>
        <div className="container py-12 md:py-20">
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
          {(() => {
            const [activePhase, setActivePhase] = useState(0);
            const phases = [
              {
                color: "var(--wise-primary)",
                textColor: "var(--wise-ink)",
                title: t({ fr: "G\u00e9n\u00e9ration de Leads", en: "Lead Generation", ar: "\u062a\u0648\u0644\u064a\u062f \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062d\u062a\u0645\u0644\u064a\u0646" }),
                description: t({ fr: "L'Ambassadeur prospecte en B2B par tous les moyens (r\u00e9seau, \u00e9v\u00e9nements, cold outreach, recommandations) pour identifier des projets IA potentiels aupr\u00e8s des entreprises de son secteur.", en: "The Ambassador prospects in B2B through all means (networking, events, cold outreach, referrals) to identify potential AI projects with companies in their sector.", ar: "\u064a\u0642\u0648\u0645 \u0627\u0644\u0633\u0641\u064a\u0631 \u0628\u0627\u0644\u0628\u062d\u062b B2B \u0628\u0643\u0644 \u0627\u0644\u0637\u0631\u0642 (\u0627\u0644\u0634\u0628\u0643\u0627\u062a\u060c \u0627\u0644\u0623\u062d\u062f\u0627\u062b\u060c \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0627\u0644\u0628\u0627\u0631\u062f\u060c \u0627\u0644\u062a\u0648\u0635\u064a\u0627\u062a) \u0644\u062a\u062d\u062f\u064a\u062f \u0645\u0634\u0627\u0631\u064a\u0639 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a \u0627\u0644\u0645\u062d\u062a\u0645\u0644\u0629 \u0644\u062f\u0649 \u0627\u0644\u0634\u0631\u0643\u0627\u062a \u0641\u064a \u0642\u0637\u0627\u0639\u0647\u0645." }),
                extra: <div className="wise-card-sage p-4 inline-block mt-3"><p className="wise-body-sm font-medium">→ {t({ fr: "Le projet identifi\u00e9 est envoy\u00e9 vers la Centrale d'\u00c9tude et d'\u00c9valuation de Neopolis", en: "The identified project is sent to Neopolis Study and Evaluation Center", ar: "\u064a\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0627\u0644\u0645\u062d\u062f\u062f \u0625\u0644\u0649 \u0645\u0631\u0643\u0632 Neopolis \u0644\u0644\u062f\u0631\u0627\u0633\u0629 \u0648\u0627\u0644\u062a\u0642\u064a\u064a\u0645" })}</p></div>
              },
              {
                color: "var(--wise-sage)",
                textColor: "#fff",
                title: t({ fr: "\u00c9tude & \u00c9valuation", en: "Study & Assessment", ar: "\u0627\u0644\u062f\u0631\u0627\u0633\u0629 \u0648\u0627\u0644\u062a\u0642\u064a\u064a\u0645" }),
                description: t({ fr: "La Centrale classe le projet selon 3 axes pour d\u00e9terminer la solution optimale :", en: "The Central classifies the project along 3 axes to determine the optimal solution:", ar: "\u062a\u0635\u0646\u0651\u0641 \u0627\u0644\u0645\u0631\u0643\u0632\u064a\u0629 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0648\u0641\u0642 3 \u0645\u062d\u0627\u0648\u0631 \u0644\u062a\u062d\u062f\u064a\u062f \u0627\u0644\u062d\u0644 \u0627\u0644\u0623\u0645\u062b\u0644:" }),
                extra: (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 mb-4">
                      <div className="wise-card-sage p-4 text-center">
                        <p className="wise-label mb-1">{t({ fr: "Taille du projet", en: "Project size", ar: "\u062d\u062c\u0645 \u0627\u0644\u0645\u0634\u0631\u0648\u0639" })}</p>
                        <p className="wise-body-sm font-semibold">{t({ fr: "Petit · Moyen · Grand", en: "Small · Medium · Large", ar: "\u0635\u063a\u064a\u0631 · \u0645\u062a\u0648\u0633\u0637 · \u0643\u0628\u064a\u0631" })}</p>
                      </div>
                      <div className="wise-card-sage p-4 text-center">
                        <p className="wise-label mb-1">{t({ fr: "Besoin identifi\u00e9", en: "Identified need", ar: "\u0627\u0644\u062d\u0627\u062c\u0629 \u0627\u0644\u0645\u062d\u062f\u062f\u0629" })}</p>
                        <p className="wise-body-sm font-semibold">Smarter Employees · Faster Processes · Transformational Products</p>
                      </div>
                      <div className="wise-card-sage p-4 text-center">
                        <p className="wise-label mb-1">{t({ fr: "Solution propos\u00e9e", en: "Proposed solution", ar: "\u0627\u0644\u062d\u0644 \u0627\u0644\u0645\u0642\u062a\u0631\u062d" })}</p>
                        <p className="wise-body-sm font-semibold">{t({ fr: "Logiciel sans IA · Outils standard · Workflow automation · Agent full autonome", en: "Non-AI software · Standard tools · Workflow automation · Full autonomous agent", ar: "\u0628\u0631\u0645\u062c\u064a\u0627\u062a \u0628\u062f\u0648\u0646 \u0630\u0643\u0627\u0621 \u0627\u0635\u0637\u0646\u0627\u0639\u064a · \u0623\u062f\u0648\u0627\u062a \u0642\u064a\u0627\u0633\u064a\u0629 · \u0623\u062a\u0645\u062a\u0629 \u0633\u064a\u0631 \u0627\u0644\u0639\u0645\u0644 · \u0648\u0643\u064a\u0644 \u0645\u0633\u062a\u0642\u0644 \u0628\u0627\u0644\u0643\u0627\u0645\u0644" })}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: "var(--tint-mint)" }}>
                      <Users size={16} className="flex-shrink-0 mt-0.5" style={{ color: "var(--wise-positive-deep)" }} />
                      <p className="wise-body-sm" dangerouslySetInnerHTML={{ __html: t({ fr: "La Centrale peut <strong>affilier d'autres Ambassadeurs ou experts en renfort</strong> au projet selon sa complexit\u00e9.", en: "The Central can <strong>affiliate other Ambassadors or expert reinforcements</strong> to the project based on its complexity.", ar: "\u064a\u0645\u0643\u0646 \u0644\u0644\u0645\u0631\u0643\u0632\u064a\u0629 <strong>\u0625\u0634\u0631\u0627\u0643 \u0633\u0641\u0631\u0627\u0621 \u0622\u062e\u0631\u064a\u0646 \u0623\u0648 \u062e\u0628\u0631\u0627\u0621 \u0643\u062f\u0639\u0645</strong> \u0644\u0644\u0645\u0634\u0631\u0648\u0639 \u062d\u0633\u0628 \u062a\u0639\u0642\u064a\u062f\u0647." }) }} />
                    </div>
                  </>
                )
              },
              {
                color: "var(--wise-accent-cyan)",
                textColor: "#fff",
                title: t({ fr: "Contractualisation", en: "Contracting", ar: "\u0627\u0644\u062a\u0639\u0627\u0642\u062f" }),
                description: t({ fr: "Signature du contrat avec le client. D\u00e9finition du p\u00e9rim\u00e8tre, des livrables, du calendrier et des conditions commerciales. L'Ambassadeur est impliqu\u00e9 dans la relation client.", en: "Contract signing with the client. Definition of scope, deliverables, timeline and commercial terms. The Ambassador is involved in the client relationship.", ar: "\u062a\u0648\u0642\u064a\u0639 \u0627\u0644\u0639\u0642\u062f \u0645\u0639 \u0627\u0644\u0639\u0645\u064a\u0644. \u062a\u062d\u062f\u064a\u062f \u0627\u0644\u0646\u0637\u0627\u0642 \u0648\u0627\u0644\u0645\u062e\u0631\u062c\u0627\u062a \u0648\u0627\u0644\u062c\u062f\u0648\u0644 \u0627\u0644\u0632\u0645\u0646\u064a \u0648\u0627\u0644\u0634\u0631\u0648\u0637 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629. \u064a\u0634\u0627\u0631\u0643 \u0627\u0644\u0633\u0641\u064a\u0631 \u0641\u064a \u0639\u0644\u0627\u0642\u0629 \u0627\u0644\u0639\u0645\u064a\u0644." }),
                extra: null
              },
              {
                color: "var(--wise-accent-coral)",
                textColor: "#fff",
                title: t({ fr: "Impl\u00e9mentation", en: "Implementation", ar: "\u0627\u0644\u062a\u0646\u0641\u064a\u0630" }),
                description: t({ fr: "D\u00e9ploiement de la solution IA par l'\u00e9quipe technique de Neopolis Development. L'Ambassadeur assure le lien avec le client et facilite l'adoption de la solution.", en: "Deployment of the AI solution by Neopolis Development's technical team. The Ambassador ensures the link with the client and facilitates solution adoption.", ar: "\u0646\u0634\u0631 \u062d\u0644 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a \u0645\u0646 \u0642\u0628\u0644 \u0641\u0631\u064a\u0642 Neopolis Development \u0627\u0644\u062a\u0642\u0646\u064a. \u064a\u0636\u0645\u0646 \u0627\u0644\u0633\u0641\u064a\u0631 \u0627\u0644\u0631\u0628\u0637 \u0645\u0639 \u0627\u0644\u0639\u0645\u064a\u0644 \u0648\u064a\u0633\u0647\u0644 \u0627\u0639\u062a\u0645\u0627\u062f \u0627\u0644\u062d\u0644." }),
                extra: null
              },
              {
                color: "var(--wise-accent-pear)",
                textColor: "var(--wise-ink)",
                title: t({ fr: "Monitoring & Revenus R\u00e9currents", en: "Monitoring & Recurring Revenue", ar: "\u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0648\u0627\u0644\u0625\u064a\u0631\u0627\u062f\u0627\u062a \u0627\u0644\u0645\u062a\u0643\u0631\u0631\u0629" }),
                description: t({ fr: "Suivi de la solution en production. L'Ambassadeur g\u00e9n\u00e8re des revenus r\u00e9currents passifs sur la consommation de tokens du client pendant toute la dur\u00e9e de vie du projet.", en: "Monitoring of the solution in production. The Ambassador generates passive recurring revenue from the client's token consumption throughout the project lifecycle.", ar: "\u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u062d\u0644 \u0641\u064a \u0627\u0644\u0625\u0646\u062a\u0627\u062c. \u064a\u0648\u0644\u062f \u0627\u0644\u0633\u0641\u064a\u0631 \u0625\u064a\u0631\u0627\u062f\u0627\u062a \u0645\u062a\u0643\u0631\u0631\u0629 \u0633\u0644\u0628\u064a\u0629 \u0645\u0646 \u0627\u0633\u062a\u0647\u0644\u0627\u0643 \u0627\u0644\u0639\u0645\u064a\u0644 \u0644\u0644\u0631\u0645\u0648\u0632 \u0637\u0648\u0627\u0644 \u062f\u0648\u0631\u0629 \u062d\u064a\u0627\u0629 \u0627\u0644\u0645\u0634\u0631\u0648\u0639." }),
                extra: null
              },
            ];
            return (
              <motion.div variants={fadeInUp} className="max-w-4xl mx-auto mb-14">
                {/* Stepper dots + labels */}
                <div className="flex items-center justify-between mb-8 relative">
                  {/* Connecting line */}
                  <div className="absolute top-5 left-[5%] right-[5%] h-0.5" style={{ background: "var(--neo-border)" }} />
                  {phases.map((phase, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhase(i)}
                      className="relative flex flex-col items-center gap-2 group z-10"
                      style={{ cursor: "pointer" }}
                    >
                      <span
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all duration-200"
                        style={{
                          background: activePhase === i ? phase.color : "var(--neo-surface-raised)",
                          color: activePhase === i ? phase.textColor : "var(--neo-ink-secondary)",
                          border: activePhase === i ? "none" : "2px solid var(--neo-border)",
                          transform: activePhase === i ? "scale(1.15)" : "scale(1)",
                          boxShadow: activePhase === i ? "0 4px 12px rgba(0,0,0,0.15)" : "none"
                        }}
                      >
                        {i + 1}
                      </span>
                      <span
                        className="text-[11px] md:text-xs font-medium text-center max-w-[80px] md:max-w-[100px] leading-tight transition-colors duration-200"
                        style={{ color: activePhase === i ? "var(--neo-ink)" : "var(--neo-ink-muted)" }}
                      >
                        {phase.title}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Content panel */}
                <div
                  className="wise-card p-6 md:p-8 relative overflow-hidden"
                  style={{ borderTop: `3px solid ${phases[activePhase].color}` }}
                >
                  <h3 className="wise-display-xs mb-3" style={{ color: "var(--neo-ink)" }}>{phases[activePhase].title}</h3>
                  <p className="wise-body-md" style={{ color: "var(--neo-ink-secondary)" }}>{phases[activePhase].description}</p>
                  {phases[activePhase].extra}
                </div>
              </motion.div>
            );
          })()}

          {/* Rémunération */}
          <motion.div variants={fadeInUp} className="max-w-4xl mx-auto">
            <div className="wise-card p-8 md:p-10" style={{ background: "var(--tint-mint)" }}>
              <div className="text-center mb-8">
                <span className="wise-eyebrow mb-3 inline-flex" style={{ color: "var(--neo-ink-secondary)" }}>{t({ fr: "Rémunération", en: "Compensation", ar: "التعويض" })}</span>
                <h3 className="wise-display-sm" style={{ color: "var(--neo-ink)" }}>{t({ fr: "Votre modèle de revenus", en: "Your revenue model", ar: "نموذج إيراداتك" })}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="wise-card p-6 text-center">
                  <p className="wise-display-md mb-2" style={{ color: "var(--wise-positive-deep)", fontFamily: "var(--font-mono)" }}>{t({ fr: "20% à 60%", en: "20% to 60%", ar: "20% إلى 60%" })}</p>
                  <p className="wise-body-md font-semibold mb-2">{t({ fr: "Frais de Setup", en: "Setup Fees", ar: "رسوم الإعداد" })}</p>
                  <p className="wise-body-sm">{t({ fr: "Selon votre niveau d'implication dans le projet (prospection, accompagnement, coordination)", en: "Based on your level of involvement in the project (prospecting, support, coordination)", ar: "حسب مستوى مشاركتك في المشروع (التنقيب، المرافقة، التنسيق)" })}</p>
                </div>
                <div className="wise-card p-6 text-center">
                  <p className="wise-display-md mb-2" style={{ color: "var(--wise-positive-deep)", fontFamily: "var(--font-mono)" }}>10%</p>
                  <p className="wise-body-md font-semibold mb-2">{t({ fr: "Tokens consommés (Run)", en: "Tokens consumed (Run)", ar: "الرموز المستهلكة (Run)" })}</p>
                  <p className="wise-body-sm">{t({ fr: "Revenus récurrents sur la consommation de tokens pendant toute la vie du projet client", en: "Recurring revenue on token consumption throughout the client project lifetime", ar: "إيرادات متكررة على استهلاك الرموز طوال عمر مشروع العميل" })}</p>
                </div>
              </div>
              <p className="wise-body-sm text-center mt-6" style={{ color: "var(--wise-sage)" }}>
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
      <AnimatedSection style={{ background: "var(--tint-mint)", padding: "clamp(3rem, 6vh, 5rem) clamp(1.25rem, 4vw, 3rem)" }}>
        <div className="container py-10 md:py-20 text-center">
          <motion.div variants={fadeInUp}>
            <Rocket size={36} style={{ color: "var(--wise-positive-deep)" }} className="mx-auto mb-6" />
            <h2 className="wise-display-xl mb-5" style={{ textWrap: "balance" }}>
              <span dangerouslySetInnerHTML={{ __html: t({ fr: "Ne subissez pas la disruption.<br />Devenez-en l'acteur.", en: "Don't suffer the disruption.<br />Become the agent of change.", ar: "لا تكن ضحية التحوّل.<br />كن صانع التغيير." }) }} />
            </h2>
            <p className="wise-body-lg mb-10 max-w-[42ch] mx-auto">
              {t({ fr: "Formation et certification 100% gratuites – 296 places seulement", en: "Training and certification 100% free – only 296 spots", ar: "تدريب وشهادة مجانية 100% – 296 مقعداً فقط" })}
            </p>
            <Link href="/apply">
              <button className="wise-btn-primary text-base md:text-lg px-8 md:px-10 py-4 md:py-5 flex items-center gap-3 mx-auto">
                {t({ fr: "Postuler maintenant", en: "Apply now", ar: "قدّم الآن" })} <ArrowRight size={20} />
              </button>
            </Link>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── FAQ Section ─── */}
      <AnimatedSection id="faq" style={{ background: "var(--wise-canvas-soft)", padding: "clamp(3rem, 6vh, 5rem) clamp(1.25rem, 4vw, 3rem)" }}>
        <div className="container py-12">
          <motion.div variants={fadeInUp} className="text-center mb-14">
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
                <img src="/api/assets/logo_anthropic_e6ab4160.png" alt="Anthropic" className="h-8 md:h-10 object-contain opacity-60 hover:opacity-100 transition-opacity" />

                <img src="/api/assets/claude_ba4537f3.png" alt="Claude" className="h-8 md:h-10 object-contain opacity-60 hover:opacity-100 transition-opacity" />


                <img src="/api/assets/openai_73a9a1b1.png" alt="OpenAI" className="h-8 md:h-10 object-contain opacity-60 hover:opacity-100 transition-opacity" />
                <img src="/api/assets/gemini_c13269e9.png" alt="Gemini" className="h-8 md:h-10 object-contain opacity-60 hover:opacity-100 transition-opacity" />
                <img src="/api/assets/langchain_9c5e065b.png" alt="LangChain" className="h-8 md:h-10 object-contain opacity-60 hover:opacity-100 transition-opacity" />
                <img src="/api/assets/crewai_7df89ab8.png" alt="CrewAI" className="h-8 md:h-10 object-contain opacity-60 hover:opacity-100 transition-opacity" />
                <img src="/api/assets/n8n_7ff20c9e.png" alt="n8n" className="h-8 md:h-10 object-contain opacity-60 hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Footer (Dark) ─── */}
      <footer className="wise-footer">
        <div className="container py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <img src={LOGO_URL} alt="Neopolis Akademy" className="h-12 object-contain mb-3" />
              <p className="wise-body-sm">
                {t({ fr: "Transformer la menace de l'IA en opportunité.", en: "Turning the AI threat into opportunity.", ar: "تحويل تهديد الذكاء الاصطناعي إلى فرصة." })}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--wise-positive-deep)" }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span className="wise-body-sm" style={{ color: "var(--wise-positive-deep)" }}>{t({ fr: "Registered Partner du Claude Partner Network", en: "Registered Partner of the Claude Partner Network", ar: "شريك مسجل في Claude Partner Network" })}</span>
              </div>
            </div>
            <div>
              <h4 className="wise-label mb-3">{t({ fr: "Programme", en: "Program", ar: "البرنامج" })}</h4>
              <ul className="space-y-1.5">
                <li><a href="#formule" className="wise-body-sm hover:underline">{t({ fr: "La Formule", en: "The Formula", ar: "الصيغة" })}</a></li>
                <li><a href="#pourquoi" className="wise-body-sm hover:underline">{t({ fr: "Pourquoi maintenant", en: "Why now", ar: "لماذا الآن" })}</a></li>
                <li><a href="#partenaires" className="wise-body-sm hover:underline">{t({ fr: "Partenaires", en: "Partners", ar: "الشركاء" })}</a></li>
                <li><a href="#process" className="wise-body-sm hover:underline">{t({ fr: "Process Commercial", en: "Sales Process", ar: "العملية التجارية" })}</a></li>
                <li><a href="#faq" className="wise-body-sm hover:underline">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="wise-label mb-3">{t({ fr: "Outils", en: "Tools", ar: "الأدوات" })}</h4>
              <ul className="space-y-1.5">
                <li><Link href="/training" className="wise-body-sm hover:underline">{t({ fr: "Formation", en: "Training", ar: "التدريب" })}</Link></li>
                <li><Link href="/diagnostic" className="wise-body-sm hover:underline">{t({ fr: "Diagnostic IA", en: "AI Diagnostic", ar: "تشخيص الذكاء الاصطناعي" })}</Link></li>
                <li><Link href="/apply" className="wise-body-sm hover:underline">{t({ fr: "Postuler", en: "Apply", ar: "تقدّم" })}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="wise-label mb-3">{t({ fr: "Contact", en: "Contact", ar: "الاتصال" })}</h4>
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
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] rounded-full group-hover:w-3/5 transition-all duration-300 ease-out bg-emerald-600" />
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
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-400 ease-out group-hover:scale-105"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="absolute top-3 right-3 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm" style={{ backgroundColor: "rgba(255,255,255,0.9)", color: "var(--wise-ink)" }}>
          {t({ fr: "ÉTAPE", en: "STEP", ar: "المرحلة" })} {step}
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

function AnimatedChart() {
  const { t, lang } = useLanguage();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInView = useInView(chartContainerRef, { once: true, margin: "0px" });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || !canvasRef.current) return;
    const shouldAnimate = !hasAnimated.current;
    hasAnimated.current = true;

    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    chartInstanceRef.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: ["2020", "2023", "2025", "2027", "2030"],
        datasets: [
          {
            label: "Goldman Sachs (emplois expos\u00e9s, M)",
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
            label: "WEF (emplois d\u00e9plac\u00e9s, M)",
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
            label: "McKinsey (sc\u00e9nario haut, M)",
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

    return () => { chartInstanceRef.current?.destroy(); };
  }, [isInView, lang]);

  return (
    <motion.div variants={fadeInUp} className="wise-card mb-8 md:mb-12">
      <h3 className="wise-display-xs mb-1" style={{ color: "var(--wise-accent-coral)" }}>{t({ fr: "Emplois exposés à l'automatisation IA (en millions)", en: "Jobs exposed to AI automation (in millions)", ar: "الوظائف المعرّضة لأتمتة الذكاء الاصطناعي (بالملايين)" })}</h3>
      <p className="wise-label mb-4">WEF (85M/2025, 92M/2030) · Goldman Sachs (300M/2030) · McKinsey (400-800M/2030)</p>
      <div ref={chartContainerRef} className="h-[280px] md:h-[340px]">
        <canvas ref={canvasRef}></canvas>
      </div>
    </motion.div>
  );
}

function JobLossChart() {
  const { t, lang } = useLanguage();
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
          { label: t({ fr: "Saisie de données", en: "Data Entry", ar: "إدخال البيانات" }), data: [100, 82, 65, 48, 35, 22], borderColor: "#9fe870", backgroundColor: "rgba(159,232,112,0.08)", fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: "#9fe870" },
          { label: t({ fr: "Service client", en: "Customer Service", ar: "خدمة العملاء" }), data: [100, 85, 70, 55, 42, 30], borderColor: "#38c8ff", backgroundColor: "rgba(56,200,255,0.08)", fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: "#38c8ff" },
          { label: t({ fr: "Comptabilité", en: "Accounting", ar: "المحاسبة" }), data: [100, 88, 75, 62, 50, 40], borderColor: "#ffc091", backgroundColor: "rgba(255,192,145,0.08)", fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: "#ffc091" },
          { label: t({ fr: "Développeurs", en: "Developers", ar: "المطورون" }), data: [100, 90, 78, 65, 55, 45], borderColor: "#ffd11a", backgroundColor: "rgba(255,209,26,0.08)", fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: "#ffd11a" },
          { label: t({ fr: "Traduction", en: "Translation", ar: "الترجمة" }), data: [100, 78, 58, 40, 28, 18], borderColor: "#d03238", backgroundColor: "rgba(208,50,56,0.08)", fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: "#d03238" },
          { label: t({ fr: "Juridique", en: "Legal", ar: "القانونية" }), data: [100, 92, 82, 72, 62, 52], borderColor: "#c5edab", backgroundColor: "rgba(197,237,171,0.08)", fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: "#c5edab" },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1500, easing: "easeOutQuart" },
        plugins: {
          legend: { position: "bottom", labels: { color: "#e8ebe6", font: { size: 11, family: "Inter" }, boxWidth: 12, padding: 16, usePointStyle: true } },
          title: { display: true, text: t({ fr: "Emplois restants (%) - Projection 2025-2030", en: "Remaining Jobs (%) - Projection 2025-2030", ar: "الوظائف المتبقية (%) - توقعات 2025-2030" }), color: "#e8ebe6", font: { size: 14, weight: "bold", family: "Inter" }, padding: { bottom: 16 } },
        },
        scales: {
          x: { ticks: { color: "#868685", font: { family: "Inter" } }, grid: { color: "rgba(255,255,255,0.04)" } },
          y: { ticks: { color: "#868685", font: { family: "Inter" }, callback: (v: any) => v + "%" }, grid: { color: "rgba(255,255,255,0.04)" }, min: 0, max: 110 },
        },
        interaction: { intersect: false, mode: "index" },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [isInView, lang]);

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
    { id: "openai", label: "OpenAI", x: 80, y: 20, size: 22, color: "#10a37f" },
    { id: "agents", label: "Agents IA", x: 15, y: 70, size: 18, color: "#38c8ff" },
    { id: "llm", label: "Multi-LLM", x: 85, y: 70, size: 18, color: "#a78bfa" },
    { id: "infra", label: "Infra", x: 30, y: 90, size: 16, color: "#34d399" },
    { id: "support", label: "Support", x: 70, y: 90, size: 16, color: "#fbbf24" },
  ];

  const edges = [
    { from: "neopolis", to: "anthropic" },
    { from: "neopolis", to: "openai" },
    { from: "neopolis", to: "agents" },
    { from: "neopolis", to: "llm" },
    { from: "neopolis", to: "infra" },
    { from: "neopolis", to: "support" },
    { from: "anthropic", to: "agents" },
    { from: "openai", to: "llm" },
    { from: "openai", to: "infra" },
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
  const { t } = useLanguage();
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
        { label: "Gemini", angle: 72, icon: "ai" },
        { label: "OpenAI", angle: 144, icon: "ai" },
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
          <span className="text-xs font-semibold" style={{ color: "var(--wise-ink)" }}>{t({ fr: "Certification internationale", en: "International certification", ar: "شهادة دولية" })}</span>
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
              <nav className="flex flex-col gap-2">
                <a href="#formule" onClick={() => setOpen(false)} className="text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors" style={{ color: "var(--wise-ink)" }}>{t({ fr: "La Formule", en: "The Formula", ar: "الصيغة" })}</a>
                <a href="#pourquoi" onClick={() => setOpen(false)} className="text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors" style={{ color: "var(--wise-ink)" }}>{t({ fr: "Pourquoi maintenant", en: "Why now", ar: "لماذا الآن" })}</a>
                <a href="#partenaires" onClick={() => setOpen(false)} className="text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors" style={{ color: "var(--wise-ink)" }}>{t({ fr: "Partenaires", en: "Partners", ar: "الشركاء" })}</a>
                <a href="#faq" onClick={() => setOpen(false)} className="text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors" style={{ color: "var(--wise-ink)" }}>FAQ</a>
                <div className="h-px my-1" style={{ background: "var(--wise-rule)" }} />
                <a href="/training" onClick={() => setOpen(false)} className="text-sm font-semibold py-2.5 px-3 rounded-lg bg-emerald-50 text-emerald-700 transition-colors">{t({ fr: "Formation 🎓", en: "Training 🎓", ar: "التدريب 🎓" })}</a>
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
    { id: "ambassadeur", label: t({ fr: "Ambassadeur", en: "Ambassador", ar: "السفير" }), sub: t({ fr: "Prospection B2B", en: "B2B Prospecting", ar: "التنقيب B2B" }), bg: "var(--wise-primary-pale)", iconColor: "var(--wise-primary)", icon: Target },
    { id: "centrale", label: t({ fr: "Centrale", en: "Central", ar: "المركز" }), sub: t({ fr: "Étude & Évaluation", en: "Study & Evaluation", ar: "الدراسة والتقييم" }), bg: "var(--tint-cyan)", iconColor: "var(--wise-accent-cyan)", icon: Shield },
    { id: "contrat", label: t({ fr: "Contrat", en: "Contract", ar: "العقد" }), sub: t({ fr: "Contractualisation", en: "Contracting", ar: "التعاقد" }), bg: "var(--tint-mint)", iconColor: "oklch(0.45 0.12 160)", icon: BookOpen },
    { id: "implementation", label: "Neopolis", sub: t({ fr: "Implémentation", en: "Implementation", ar: "التنفيذ" }), bg: "var(--tint-coral)", iconColor: "var(--wise-accent-coral)", icon: Rocket },
    { id: "client", label: "Client", sub: t({ fr: "Monitoring & Run", en: "Monitoring & Run", ar: "المراقبة والتشغيل" }), bg: "var(--tint-pear)", iconColor: "oklch(0.50 0.12 110)", icon: CheckCircle2 },
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
                  <div className="w-5 lg:w-8 h-[2px] rounded-full" style={{ background: "var(--wise-primary)", opacity: 0.35 }}></div>
                  <ArrowRight size={18} strokeWidth={2.5} style={{ color: "var(--wise-primary)", opacity: 0.7 }} />
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
                <ArrowRight size={14} strokeWidth={2.5} className="mx-1.5 flex-shrink-0" style={{ color: "var(--wise-primary)", opacity: 0.6 }} />
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
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--wise-primary)" }}></div>
          <span className="text-xs" style={{ color: "var(--neo-ink-secondary)" }}>{t({ fr: "Ambassadeur apporte le lead", en: "Ambassador brings the lead", ar: "السفير يجلب العميل" })}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--wise-accent-cyan)" }}></div>
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
            <label className="wise-label mb-2 block">{t({ fr: "Nombre de projets apportés / an", en: "Number of projects brought / year", ar: "عدد المشاريع المقدمة / سنة" })}</label>
            <input
              type="range"
              min={1}
              max={20}
              value={projects}
              onChange={(e) => setProjects(Number(e.target.value))}
              className="w-full accent-[var(--wise-primary)]"
            />
            <div className="flex justify-between mt-1">
              <span className="wise-label">1</span>
              <span className="font-semibold text-sm" style={{ color: "var(--wise-positive-deep)", fontFamily: "var(--font-mono)" }}>{projects} {t({ fr: "projets", en: "projects", ar: "مشاريع" })}</span>
              <span className="wise-label">20</span>
            </div>
          </div>

          <div>
            <label className="wise-label mb-2 block">{t({ fr: "Frais de setup moyen par projet (€)", en: "Average setup fee per project (€)", ar: "رسوم الإعداد المتوسطة لكل مشروع (€)" })}</label>
            <input
              type="range"
              min={1000}
              max={30000}
              step={1000}
              value={avgSetup}
              onChange={(e) => setAvgSetup(Number(e.target.value))}
              className="w-full accent-[var(--wise-primary)]"
            />
            <div className="flex justify-between mt-1">
              <span className="wise-label">1 000€</span>
              <span className="font-semibold text-sm" style={{ color: "var(--wise-positive-deep)", fontFamily: "var(--font-mono)" }}>{avgSetup.toLocaleString("fr-FR")} €</span>
              <span className="wise-label">30 000€</span>
            </div>
          </div>

          <div>
            <label className="wise-label mb-2 block">{t({ fr: "Votre taux d'implication (%)", en: "Your involvement rate (%)", ar: "نسبة مشاركتك (%)" })}</label>
            <input
              type="range"
              min={20}
              max={60}
              step={5}
              value={implication}
              onChange={(e) => setImplication(Number(e.target.value))}
              className="w-full accent-[var(--wise-primary)]"
            />
            <div className="flex justify-between mt-1">
              <span className="wise-label">20%</span>
              <span className="font-semibold text-sm" style={{ color: "var(--wise-positive-deep)", fontFamily: "var(--font-mono)" }}>{implication}%</span>
              <span className="wise-label">60%</span>
            </div>
          </div>

          <div>
            <label className="wise-label mb-2 block">{t({ fr: "Consommation tokens mensuelle / projet (€)", en: "Monthly token consumption / project (€)", ar: "استهلاك الرموز الشهري / مشروع (€)" })}</label>
            <input
              type="range"
              min={100}
              max={5000}
              step={100}
              value={monthlyTokens}
              onChange={(e) => setMonthlyTokens(Number(e.target.value))}
              className="w-full accent-[var(--wise-primary)]"
            />
            <div className="flex justify-between mt-1">
              <span className="wise-label">100€</span>
              <span className="font-semibold text-sm" style={{ color: "var(--wise-positive-deep)", fontFamily: "var(--font-mono)" }}>{monthlyTokens.toLocaleString("fr-FR")} €/mois</span>
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
              <p className="wise-display-md" style={{ color: "var(--wise-positive-deep)", fontFamily: "var(--font-mono)" }}>
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
                <span className="font-semibold text-xs" style={{ color: "var(--wise-accent-cyan)", fontFamily: "var(--font-mono)" }}>{p.roi}</span>
              </div>
              {/* Expand/collapse button */}
              <button
                onClick={() => toggleCard(idx)}
                className="flex items-center gap-1 text-xs font-medium mt-auto pt-2 border-t cursor-pointer"
                style={{ borderColor: "rgba(0,0,0,0.06)", color: "var(--wise-primary)" }}
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
                      <span className="font-semibold text-xs" style={{ color: "var(--wise-positive-deep)", fontFamily: "var(--font-mono)" }}>{p.earnings}</span>
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
