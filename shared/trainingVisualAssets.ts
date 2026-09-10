import type { PublicTrainingLocale } from "./publicTrainingLocale";
import { GENERATED_TRAINING_VISUAL_ASSETS } from "./trainingVisualAssets.generated";
import { PUBLIC_SOCIAL_ASSETS } from "./publicSocialAssets";

export type TrainingVisualAsset = {
  socialPath: string;
  socialWidth: number;
  socialHeight: number;
  cardPath: string;
  cardWidth: number;
  cardHeight: number;
  alt: Record<PublicTrainingLocale, string>;
};

export type TrainingVisualOverride = Partial<Pick<TrainingVisualAsset, "socialPath" | "socialWidth" | "socialHeight" | "cardPath" | "cardWidth" | "cardHeight" | "alt">>;

const DEFAULT_TRAINING_VISUAL: TrainingVisualAsset = {
  socialPath: PUBLIC_SOCIAL_ASSETS.openGraph.path,
  socialWidth: PUBLIC_SOCIAL_ASSETS.openGraph.width,
  socialHeight: PUBLIC_SOCIAL_ASSETS.openGraph.height,
  cardPath: PUBLIC_SOCIAL_ASSETS.square.path,
  cardWidth: PUBLIC_SOCIAL_ASSETS.square.width,
  cardHeight: PUBLIC_SOCIAL_ASSETS.square.height,
  alt: {
    fr: "Neopolis Akademy — formation IA",
    en: "Neopolis Akademy — AI training",
    ar: "Neopolis Akademy — تدريب في الذكاء الاصطناعي",
  },
};

/**
 * Registre unique des visuels validés. Les formations sans entrée conservent
 * les images sociales génériques jusqu’à la génération de leur visuel dédié.
 */
const PILOT_AND_EARLY_TRAINING_VISUAL_ASSETS: Record<string, TrainingVisualAsset> = {
  claude_certified_architect_foundations: {
    socialPath: "/manus-storage/claude-certified-architect-foundations-social_9bdfe681.png",
    socialWidth: 1200,
    socialHeight: 630,
    cardPath: "/api/assets/claude-certified-architect-foundations-card_4ad48d9c.png",
    cardWidth: 1200,
    cardHeight: 900,
    alt: {
      fr: "Claude Certified Architect – Fondations : architecture de systèmes IA à l’échelle",
      en: "Claude Certified Architect – Foundations: scalable AI systems architecture",
      ar: "Claude Certified Architect – Foundations: هندسة أنظمة ذكاء اصطناعي قابلة للتوسع",
    },
  },
  claude_certified_architect_professional: {
    socialPath: "/manus-storage/claude-certified-architect-professional-social_d033ab10.png",
    socialWidth: 1200,
    socialHeight: 630,
    cardPath: "/api/assets/claude-certified-architect-professional-card_06492b39.png",
    cardWidth: 1200,
    cardHeight: 900,
    alt: {
      fr: "Claude Certified Architect – Professionnel : architecture IA d’entreprise et gouvernance responsable",
      en: "Claude Certified Architect – Professional: enterprise AI architecture and responsible governance",
      ar: "Claude Certified Architect – Professional: هندسة الذكاء الاصطناعي للمؤسسات والحوكمة المسؤولة",
    },
  },
  claude_certified_associate_foundations: {
    socialPath: "/manus-storage/claude-certified-associate-foundations-social-og-1200x630_69657ad3.png",
    socialWidth: 1200,
    socialHeight: 630,
    // Le proxy applicatif évite la redirection edge /manus-storage, qui peut être
    // refusée par des navigateurs ou extensions pendant le rendu de la carte.
    cardPath: "/api/assets/claude-certified-associate-foundations-card-official_e70e023d.png",
    cardWidth: 2176,
    cardHeight: 1632,
    alt: {
      fr: "Claude Certified Associate – Fondations : préparation à une certification officielle Anthropic",
      en: "Claude Certified Associate – Foundations: preparation for an official Anthropic certification",
      ar: "Claude Certified Associate – Fundamentals: التحضير لشهادة Anthropic رسمية",
    },
  },
  claude_certified_developer_foundations: {
    socialPath: "/manus-storage/claude-certified-developer-foundations-social_c6177642.png",
    socialWidth: 1200,
    socialHeight: 630,
    cardPath: "/api/assets/claude-certified-developer-foundations-card_f440596c.png",
    cardWidth: 1200,
    cardHeight: 900,
    alt: {
      fr: "Claude Certified Developer – Fondations : développement d’applications IA sécurisées",
      en: "Claude Certified Developer – Foundations: secure AI application development",
      ar: "Claude Certified Developer – Foundations: تطوير تطبيقات ذكاء اصطناعي آمنة",
    },
  },
  analyse_donnees_reporting_bi_codex: {
    socialPath: "/manus-storage/analyse-donnees-reporting-bi-codex-social_b1ae74ff.png",
    socialWidth: 1200,
    socialHeight: 630,
    cardPath: "/api/assets/analyse-donnees-reporting-bi-codex-card_258bfe68.png",
    cardWidth: 1200,
    cardHeight: 900,
    alt: {
      fr: "Analyse de données, reporting et BI avec Codex : tableaux de bord et flux de données",
      en: "Data analysis, reporting and BI with Codex: dashboards and data workflows",
      ar: "تحليل البيانات وإعداد التقارير وذكاء الأعمال مع Codex: لوحات معلومات وتدفقات بيانات",
    },
  },
  datacamp_ai_for_data_analysts: {
    socialPath: "/manus-storage/ai-for-data-analysts-social_0af0cd44.png",
    socialWidth: 1200,
    socialHeight: 630,
    cardPath: "/api/assets/ai-for-data-analysts-card_1024835f.png",
    cardWidth: 1200,
    cardHeight: 900,
    alt: {
      fr: "L’IA pour les data analysts : validation d’insights et qualité des données",
      en: "AI for data analysts: insight validation and data quality",
      ar: "الذكاء الاصطناعي لمحللي البيانات: التحقق من الرؤى وجودة البيانات",
    },
  },
  datacamp_ai_for_finance: {
    socialPath: "/manus-storage/ai-for-finance-social_70557d98.png",
    socialWidth: 1200,
    socialHeight: 630,
    cardPath: "/api/assets/ai-for-finance-card_3e78796d.png",
    cardWidth: 1200,
    cardHeight: 900,
    alt: {
      fr: "L’IA pour la finance : analyse financière et aide responsable à la décision",
      en: "AI for finance: financial analysis and responsible decision support",
      ar: "الذكاء الاصطناعي للمالية: التحليل المالي ودعم القرار المسؤول",
    },
  },
  datacamp_building_marketing_workflows_with_n8n: {
    socialPath: "/manus-storage/building-marketing-workflows-social_28a4d906.png",
    socialWidth: 1200,
    socialHeight: 630,
    cardPath: "/api/assets/building-marketing-workflows-card_14623ff0.png",
    cardWidth: 1200,
    cardHeight: 900,
    alt: {
      fr: "Concevoir des workflows marketing automatisés : parcours client et campagnes connectées",
      en: "Build automated marketing workflows: customer journeys and connected campaigns",
      ar: "تصميم تدفقات عمل تسويقية مؤتمتة: رحلة العميل والحملات المتصلة",
    },
  },
  datacamp_intermediate_workflow_automation_with_n8n: {
    socialPath: "/manus-storage/intermediate-workflow-automation-social_338e17f0.png",
    socialWidth: 1200,
    socialHeight: 630,
    cardPath: "/api/assets/intermediate-workflow-automation-card_33ebc47a.png",
    cardWidth: 1200,
    cardHeight: 900,
    alt: {
      fr: "Automatisation de workflows avancée : intégrations, supervision et fiabilité",
      en: "Advanced workflow automation: integrations, monitoring and reliability",
      ar: "أتمتة متقدمة لتدفقات العمل: تكاملات ومراقبة وموثوقية",
    },
  },
  initiation_automatisation_workflows_n8n: {
    socialPath: "/manus-storage/introduction-workflow-automation-social_3675d37b.png",
    socialWidth: 1200,
    socialHeight: 630,
    cardPath: "/api/assets/introduction-workflow-automation-card_d46451c7.png",
    cardWidth: 1200,
    cardHeight: 900,
    alt: {
      fr: "Initiation à l’automatisation de workflows : formulaires, API et données connectées",
      en: "Introduction to workflow automation: forms, APIs and connected data",
      ar: "مقدمة في أتمتة تدفقات العمل: نماذج وواجهات API وبيانات متصلة",
    },
  },
  ai_finops_cost_engineering_specialist: {
    socialPath: "/manus-storage/ai-finops-cost-engineering-social_5a24920b.png",
    socialWidth: 1200,
    socialHeight: 630,
    cardPath: "/api/assets/ai-finops-cost-engineering-card_a0d62363.png",
    cardWidth: 1200,
    cardHeight: 900,
    alt: {
      fr: "AI FinOps and Cost Engineering Specialist : prévision et optimisation des coûts IA",
      en: "AI FinOps and Cost Engineering Specialist: forecasting and optimizing AI costs",
      ar: "AI FinOps and Cost Engineering Specialist: التنبؤ بتكاليف الذكاء الاصطناعي وتحسينها",
    },
  },
  ai_governance_compliance_responsible_ai_leader: {
    socialPath: "/manus-storage/ai-governance-responsible-leader-social_e1a56137.png",
    socialWidth: 1200,
    socialHeight: 630,
    cardPath: "/api/assets/ai-governance-responsible-leader-card_13ce84e5.png",
    cardWidth: 1200,
    cardHeight: 900,
    alt: {
      fr: "AI Governance, Compliance and Responsible AI Leader : conformité et gouvernance IA auditable",
      en: "AI Governance, Compliance and Responsible AI Leader: auditable AI governance and compliance",
      ar: "AI Governance, Compliance and Responsible AI Leader: حوكمة وامتثال قابلان للتدقيق",
    },
  },
  ai_product_management_human_centered_ux_specialist: {
    socialPath: "/manus-storage/ai-product-management-ux-social_8b1f0cf2.png",
    socialWidth: 1200,
    socialHeight: 630,
    cardPath: "/api/assets/ai-product-management-ux-card_8198ee88.png",
    cardWidth: 1200,
    cardHeight: 900,
    alt: {
      fr: "AI Product Management and Human-Centered UX Specialist : produits IA utiles et centrés sur les utilisateurs",
      en: "AI Product Management and Human-Centered UX Specialist: useful human-centered AI products",
      ar: "AI Product Management and Human-Centered UX Specialist: منتجات ذكاء اصطناعي مفيدة ومتمحورة حول المستخدم",
    },
  },
  ia_pour_les_nuls: {
    socialPath: "/manus-storage/ia-pour-les-nuls-social_8ce4b152.png",
    socialWidth: 1200,
    socialHeight: 630,
    cardPath: "/api/assets/ia-pour-les-nuls-card_50aea3c7.png",
    cardWidth: 1200,
    cardHeight: 900,
    alt: {
      fr: "IA pour les nuls – Initiation : découverte accessible de l’intelligence artificielle",
      en: "AI for beginners: an accessible introduction to artificial intelligence",
      ar: "الذكاء الاصطناعي للمبتدئين: مقدمة سهلة إلى الذكاء الاصطناعي",
    },
  },
  datacamp_building_scalable_agentic_systems: {
    socialPath: "/manus-storage/scalable-agentic-systems-social_421eaf7c.png",
    socialWidth: 1200,
    socialHeight: 630,
    cardPath: "/api/assets/scalable-agentic-systems-card_9fa4daae.png",
    cardWidth: 1200,
    cardHeight: 900,
    alt: {
      fr: "Concevoir des systèmes agentiques évolutifs : agents, observabilité et déploiements résilients",
      en: "Build scalable agentic systems: agents, observability and resilient deployments",
      ar: "تصميم أنظمة وكلاء قابلة للتوسع: وكلاء ومراقبة ونشر مرن",
    },
  },
  datacamp_claude_101: {
    socialPath: "/manus-storage/claude-101-social_49fb2c47.png",
    socialWidth: 1200,
    socialHeight: 630,
    cardPath: "/api/assets/claude-101-card_b7c15784.png",
    cardWidth: 1200,
    cardHeight: 900,
    alt: {
      fr: "Claude 101 : prompting, projets et outils d’assistant IA au quotidien",
      en: "Claude 101: prompting, projects and everyday AI assistant tools",
      ar: "Claude 101: المطالبات والمشاريع وأدوات المساعد الذكي اليومية",
    },
  },
  datacamp_claude_code_101: {
    socialPath: "/manus-storage/claude-code-101-social_4a9868f1.png",
    socialWidth: 1200,
    socialHeight: 630,
    cardPath: "/api/assets/claude-code-101-card_caeb5bc1.png",
    cardWidth: 1200,
    cardHeight: 900,
    alt: {
      fr: "Claude Code 101 : découverte du développement assisté par IA",
      en: "Claude Code 101: introduction to AI-assisted software development",
      ar: "Claude Code 101: مقدمة إلى تطوير البرمجيات بمساعدة الذكاء الاصطناعي",
    },
  },
  datacamp_claude_code_in_action: {
    socialPath: "/manus-storage/claude-code-in-action-social_e1bb45fc.png",
    socialWidth: 1200,
    socialHeight: 630,
    cardPath: "/api/assets/claude-code-in-action-card_090b316e.png",
    cardWidth: 1200,
    cardHeight: 900,
    alt: {
      fr: "Claude Code en action : automatisation, sécurité et validation de sessions longues",
      en: "Claude Code in action: automation, security and long-session validation",
      ar: "Claude Code en action: الأتمتة والأمان والتحقق من الجلسات الطويلة",
    },
  },
  datacamp_introduction_to_agent_skills: {
    socialPath: "/manus-storage/agent-skills-social_d7ef553a.png",
    socialWidth: 1200,
    socialHeight: 630,
    cardPath: "/api/assets/agent-skills-card_16ccf1e5.png",
    cardWidth: 1200,
    cardHeight: 900,
    alt: {
      fr: "Introduction aux Agent Skills : outils réutilisables et sorties structurées",
      en: "Introduction to Agent Skills: reusable tools and structured outputs",
      ar: "مقدمة إلى مهارات الوكلاء: أدوات قابلة لإعادة الاستخدام ومخرجات منظمة",
    },
  },
  datacamp_introduction_to_claude_models: {
    socialPath: "/manus-storage/introduction-claude-models-social_01ef9129.png",
    socialWidth: 1200,
    socialHeight: 630,
    cardPath: "/api/assets/introduction-claude-models-card_dfd8e087.png",
    cardWidth: 1200,
    cardHeight: 900,
    alt: {
      fr: "Introduction aux modèles Claude : capacités et connexions API",
      en: "Introduction to Claude models: capabilities and API connections",
      ar: "مقدمة إلى نماذج Claude: القدرات واتصالات API",
    },
  },
  datacamp_introduction_to_subagents: {
    socialPath: "/manus-storage/introduction-subagents-social_186ec9d2.png",
    socialWidth: 1200,
    socialHeight: 630,
    cardPath: "/api/assets/introduction-subagents-card_89a54808.png",
    cardWidth: 1200,
    cardHeight: 900,
    alt: {
      fr: "Introduction aux sous-agents : délégation et revue de tâches structurées",
      en: "Introduction to subagents: structured task delegation and review",
      ar: "مقدمة إلى الوكلاء الفرعيين: تفويض المهام المنظمة ومراجعتها",
    },
  },
};

export const TRAINING_VISUAL_ASSETS: Record<string, TrainingVisualAsset> = {
  ...GENERATED_TRAINING_VISUAL_ASSETS,
  claude_certified_associate_foundations:
    PILOT_AND_EARLY_TRAINING_VISUAL_ASSETS.claude_certified_associate_foundations,
};

export function getTrainingVisualAsset(certificationId?: string | null) {
  return certificationId ? TRAINING_VISUAL_ASSETS[certificationId] : undefined;
}

/** La configuration catalogue prend priorité ; le repli de marque évite toute image cassée. */
export function resolveTrainingVisualAsset(certificationId?: string | null, override?: TrainingVisualOverride | null): TrainingVisualAsset {
  const generated = getTrainingVisualAsset(certificationId);
  return {
    ...DEFAULT_TRAINING_VISUAL,
    ...generated,
    ...(override || {}),
    alt: override?.alt || generated?.alt || DEFAULT_TRAINING_VISUAL.alt,
  };
}
