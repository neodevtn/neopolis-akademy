import { useState, ReactNode } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface Phase {
  color: string;
  textColor: string;
  title: string;
  description: string;
  extra: ReactNode;
}

export function ProcessStepper() {
  const { t } = useLanguage();
  const [activePhase, setActivePhase] = useState(0);

  const phases: Phase[] = [
    {
      color: "var(--neo-primary)",
      textColor: "#fff",
      title: t({ fr: "Génération de Leads", en: "Lead Generation", ar: "توليد العملاء المحتملين" }),
      description: t({ fr: "L'Ambassadeur prospecte en B2B par tous les moyens (réseau, événements, cold outreach, recommandations) pour identifier des projets IA potentiels auprès des entreprises de son secteur.", en: "The Ambassador prospects in B2B through all means (networking, events, cold outreach, referrals) to identify potential AI projects with companies in their sector.", ar: "يقوم السفير بالبحث B2B بكل الطرق (الشبكات، الأحداث، الاتصال البارد، التوصيات) لتحديد مشاريع الذكاء الاصطناعي المحتملة لدى الشركات في قطاعهم." }),
      extra: <div className="wise-card-sage p-4 inline-block mt-3"><p className="wise-body-sm font-medium">→ {t({ fr: "Le projet identifié est envoyé vers la Centrale d'Étude et d'Évaluation de Neopolis", en: "The identified project is sent to Neopolis Study and Evaluation Center", ar: "يتم إرسال المشروع المحدد إلى مركز Neopolis للدراسة والتقييم" })}</p></div>
    },
    {
      color: "var(--neo-primary)",
      textColor: "#fff",
      title: t({ fr: "Étude & Évaluation", en: "Study & Assessment", ar: "الدراسة والتقييم" }),
      description: t({ fr: "La Centrale classe le projet selon 3 axes pour déterminer la solution optimale :", en: "The Central classifies the project along 3 axes to determine the optimal solution:", ar: "تصنّف المركزية المشروع وفق 3 محاور لتحديد الحل الأمثل:" }),
      extra: (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 mb-4">
            <div className="wise-card-sage p-4 text-center">
              <p className="wise-label mb-1">{t({ fr: "Taille du projet", en: "Project size", ar: "حجم المشروع" })}</p>
              <p className="wise-body-sm font-semibold">{t({ fr: "Petit · Moyen · Grand", en: "Small · Medium · Large", ar: "صغير · متوسط · كبير" })}</p>
            </div>
            <div className="wise-card-sage p-4 text-center">
              <p className="wise-label mb-1">{t({ fr: "Besoin identifié", en: "Identified need", ar: "الحاجة المحددة" })}</p>
              <p className="wise-body-sm font-semibold">Smarter Employees · Faster Processes · Transformational Products</p>
            </div>
            <div className="wise-card-sage p-4 text-center">
              <p className="wise-label mb-1">{t({ fr: "Solution proposée", en: "Proposed solution", ar: "الحل المقترح" })}</p>
              <p className="wise-body-sm font-semibold">{t({ fr: "Logiciel sans IA · Outils standard · Workflow automation · Agent full autonome", en: "Non-AI software · Standard tools · Workflow automation · Full autonomous agent", ar: "برمجيات بدون ذكاء اصطناعي · أدوات قياسية · أتمتة سير العمل · وكيل مستقل بالكامل" })}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: "var(--neo-primary-light)" }}>
            <Users size={16} className="flex-shrink-0 mt-0.5" style={{ color: "var(--neo-primary)" }} />
            <p className="wise-body-sm" dangerouslySetInnerHTML={{ __html: t({ fr: "La Centrale peut <strong>affilier d'autres Ambassadeurs ou experts en renfort</strong> au projet selon sa complexité.", en: "The Central can <strong>affiliate other Ambassadors or expert reinforcements</strong> to the project based on its complexity.", ar: "يمكن للمركزية <strong>إشراك سفراء آخرين أو خبراء كدعم</strong> للمشروع حسب تعقيده." }) }} />
          </div>
        </>
      )
    },
    {
      color: "var(--neo-primary)",
      textColor: "#fff",
      title: t({ fr: "Contractualisation", en: "Contracting", ar: "التعاقد" }),
      description: t({ fr: "Signature du contrat avec le client. Définition du périmètre, des livrables, du calendrier et des conditions commerciales. L'Ambassadeur est impliqué dans la relation client.", en: "Contract signing with the client. Definition of scope, deliverables, timeline and commercial terms. The Ambassador is involved in the client relationship.", ar: "توقيع العقد مع العميل. تحديد النطاق والمخرجات والجدول الزمني والشروط التجارية. يشارك السفير في علاقة العميل." }),
      extra: null
    },
    {
      color: "var(--neo-primary)",
      textColor: "#fff",
      title: t({ fr: "Implémentation", en: "Implementation", ar: "التنفيذ" }),
      description: t({ fr: "Déploiement de la solution IA par l'équipe technique de Neopolis Development. L'Ambassadeur assure le lien avec le client et facilite l'adoption de la solution.", en: "Deployment of the AI solution by Neopolis Development's technical team. The Ambassador ensures the link with the client and facilitates solution adoption.", ar: "نشر حل الذكاء الاصطناعي من قبل فريق Neopolis Development التقني. يضمن السفير الربط مع العميل ويسهل اعتماد الحل." }),
      extra: null
    },
    {
      color: "var(--neo-primary)",
      textColor: "#fff",
      title: t({ fr: "Monitoring & Revenus Récurrents", en: "Monitoring & Recurring Revenue", ar: "المراقبة والإيرادات المتكررة" }),
      description: t({ fr: "Suivi de la solution en production. L'Ambassadeur génère des revenus récurrents passifs sur la consommation de tokens du client pendant toute la durée de vie du projet.", en: "Monitoring of the solution in production. The Ambassador generates passive recurring revenue from the client's token consumption throughout the project lifecycle.", ar: "مراقبة الحل في الإنتاج. يولد السفير إيرادات متكررة سلبية من استهلاك العميل للرموز طوال دورة حياة المشروع." }),
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
}
