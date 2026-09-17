import trainingIndex from "../client/src/data/trainingIndex.json";
import { getCourseCatalogMetrics } from "../client/src/lib/catalogMetrics";
import { extractTargetJobRoles, resolveTrainingFormat } from "../client/src/lib/trainingCatalogTaxonomy";
import { localizePublicTrainingText, type PublicTrainingLocale } from "./publicTrainingLocale";

export type LocalizedText = { fr: string; en: string; ar?: string };
type LocalizedValue = string | LocalizedText;

type CatalogCourse = {
  id: string;
  certId: string;
  title?: LocalizedText;
  description?: LocalizedText;
  level?: LocalizedText;
  targetJob?: string;
  acquiredSkills?: string[];
  tags?: string[];
  subCategoryId?: string;
};

type CatalogCertification = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  level?: LocalizedText;
  icon?: string;
  group?: string;
  trainingFormat?: string;
  isStandaloneTP?: boolean;
};

type ThemeDefinition = {
  slug: string;
  title: LocalizedValue;
  shortTitle: LocalizedValue;
  description: LocalizedValue;
  introduction: LocalizedValue;
  seo: { title: LocalizedValue; description: LocalizedValue; keywords: LocalizedValue };
  groupIds?: string[];
  subcategoryIds?: string[];
  certificationIds?: string[];
  caseCourseIds: string[];
  accent: "blue" | "violet" | "emerald" | "amber" | "rose";
};

export type PublicTrainingMetrics = {
  certificationCount: number;
  courseCount: number;
  lessonCount: number;
  chapterCount: number;
  activityCount: number;
  exerciseCount: number;
  videoCount: number;
  downloadCount: number;
};

export type PublicTrainingCard = {
  id: string;
  title: string;
  description: string;
  level: string;
  icon: string;
  trainingFormat: string;
  metrics: PublicTrainingMetrics;
  relatedDomains: string[];
};

export type PublicTrainingUseCase = {
  courseId: string;
  certificationId: string;
  title: string;
  summary: string;
  skills: string[];
};

export type PublicTrainingTheme = Omit<ThemeDefinition, "title" | "shortTitle" | "description" | "introduction" | "seo"> & {
  title: string;
  shortTitle: string;
  description: string;
  introduction: string;
  seo: { title: string; description: string; keywords: string };
  metrics: PublicTrainingMetrics;
  roles: string[];
  skills: string[];
  useCases: PublicTrainingUseCase[];
  certifications: PublicTrainingCard[];
};

const catalog = trainingIndex as unknown as { certifications: CatalogCertification[]; courses: CatalogCourse[] };

const localized = (fr: string, en: string, ar: string): LocalizedText => ({ fr, en, ar });

const themeDefinitions: ThemeDefinition[] = [
  {
    slug: "comptabilite-finance",
    title: localized("Formations IA gratuites en comptabilité et finance", "Free AI training in accounting and finance", "تدريب مجاني في الذكاء الاصطناعي للمحاسبة والمالية"),
    shortTitle: localized("Comptabilité & Finance", "Accounting & Finance", "المحاسبة والمالية"),
    description: localized("Formations IA gratuites pour la comptabilité, la facturation, le contrôle de gestion et l’analyse financière.", "Free AI training for accounting, invoicing, management control and financial analysis.", "تدريب مجاني في الذكاء الاصطناعي للمحاسبة والفوترة والرقابة الإدارية والتحليل المالي."),
    introduction: localized("Ce domaine réunit les formations consacrées aux opérations comptables, aux pièces justificatives, à la facturation, aux relances et au reporting. Les cas d’usage associés conservent une validation humaine et une piste d’audit lorsque les décisions sont sensibles.", "This domain brings together training on accounting operations, supporting documents, invoicing, payment reminders and reporting. Associated use cases retain human validation and an audit trail when decisions are sensitive.", "يجمع هذا المجال التدريب على العمليات المحاسبية والمستندات الداعمة والفوترة والمتابعات والتقارير. وتحافظ حالات الاستخدام المرتبطة على التحقق البشري ومسار التدقيق عندما تكون القرارات حساسة."),
    seo: { title: localized("Formation IA comptabilité et finance | Neopolis", "AI training for accounting and finance | Neopolis", "تدريب الذكاء الاصطناعي للمحاسبة والمالية | نيوبوليس"), description: localized("Trouvez des formations IA gratuites en comptabilité, facturation, contrôle de gestion et analyse financière.", "Find free AI training in accounting, invoicing, management control and financial analysis.", "اعثر على تدريب مجاني في الذكاء الاصطناعي للمحاسبة والفوترة والرقابة الإدارية والتحليل المالي."), keywords: localized("formation IA comptabilité, formation IA finance, automatisation comptable, contrôle de gestion IA, analyse financière IA", "AI accounting training, AI finance training, accounting automation, AI management control, AI financial analysis", "تدريب الذكاء الاصطناعي للمحاسبة, تدريب الذكاء الاصطناعي للمالية, أتمتة المحاسبة, الرقابة الإدارية بالذكاء الاصطناعي, التحليل المالي بالذكاء الاصطناعي") },
    groupIds: ["finance_accounting"],
    subcategoryIds: ["finance_accounting_control"],
    certificationIds: ["datacamp_ai_for_finance"],
    caseCourseIds: ["automatisation_comptable_ia__01", "ia_appliquee_metiers_tp__17", "ia_appliquee_metiers_tp__20", "ia_appliquee_metiers_tp__21"],
    accent: "emerald",
  },
  {
    slug: "informatique-developpement",
    title: localized("Formations IA gratuites en informatique et développement", "Free AI training in IT and development", "تدريب مجاني في الذكاء الاصطناعي لتقنية المعلومات والتطوير"),
    shortTitle: localized("Informatique & Développement", "IT & Development", "تقنية المعلومات والتطوير"),
    description: localized("Formations IA gratuites pour développer des applications, des agents, des systèmes RAG et des intégrations API.", "Free AI training to build applications, agents, RAG systems and API integrations.", "تدريب مجاني في الذكاء الاصطناعي لبناء التطبيقات والوكلاء وأنظمة RAG وعمليات تكامل API."),
    introduction: localized("Ce domaine s’adresse aux personnes qui conçoivent, développent, intègrent, évaluent ou exploitent des systèmes d’IA. Les parcours couvrent les fondations, les API, les agents, le RAG, l’évaluation et les pratiques de déploiement présentes dans le catalogue.", "This domain is for people who design, develop, integrate, evaluate or operate AI systems. The learning paths cover foundations, APIs, agents, RAG, evaluation and deployment practices listed in the catalogue.", "هذا المجال مخصص لمن يصممون أنظمة الذكاء الاصطناعي أو يطورونها أو يدمجونها أو يقيمونها أو يشغلونها. وتغطي المسارات الأسس وواجهات API والوكلاء وRAG والتقييم وممارسات النشر الواردة في الكتالوج."),
    seo: { title: localized("Formation IA informatique et développement | Neopolis", "AI training for IT and development | Neopolis", "تدريب الذكاء الاصطناعي لتقنية المعلومات والتطوير | نيوبوليس"), description: localized("Formations IA gratuites pour les développeurs : agents, RAG, API, applications et évaluation des systèmes IA.", "Free AI training for developers: agents, RAG, APIs, applications and AI system evaluation.", "تدريب مجاني للمطورين في الذكاء الاصطناعي: الوكلاء وRAG وواجهات API والتطبيقات وتقييم أنظمة الذكاء الاصطناعي."), keywords: localized("formation IA développeur, développement IA, agents IA, RAG, API IA", "AI developer training, AI development, AI agents, RAG, AI APIs", "تدريب المطورين على الذكاء الاصطناعي, تطوير الذكاء الاصطناعي, وكلاء الذكاء الاصطناعي, RAG, واجهات API للذكاء الاصطناعي") },
    groupIds: ["fullstack_ai_engineering", "generative_ai_api_development", "claude_ai_agents", "anthropic_certification_preparation"],
    caseCourseIds: ["advanced_rag_evaluation_specialist__01", "developing_ai_systems_with_the_openai_api__01", "ai_assisted_coding_for_developers__01", "building_scalable_agentic_systems__01"],
    accent: "violet",
  },
  {
    slug: "data-bi-recherche",
    title: localized("Formations IA gratuites en data, BI et recherche", "Free AI training in data, BI and research", "تدريب مجاني في الذكاء الاصطناعي للبيانات وذكاء الأعمال والبحث"),
    shortTitle: localized("Data, BI & Recherche", "Data, BI & Research", "البيانات وذكاء الأعمال والبحث"),
    description: localized("Formations IA gratuites pour l’analyse de données, le reporting, la BI, la recherche et les décisions documentées.", "Free AI training for data analysis, reporting, BI, research and evidence-based decisions.", "تدريب مجاني في الذكاء الاصطناعي لتحليل البيانات والتقارير وذكاء الأعمال والبحث والقرارات المستندة إلى الأدلة."),
    introduction: localized("Ce domaine rassemble les parcours dédiés à la préparation des données, aux livrables de reporting, aux requêtes en langage naturel et à la recherche documentée. Il comprend également des cas métiers en finance lorsque les données et l’analyse constituent le cœur de l’activité.", "This domain brings together learning paths for data preparation, reporting deliverables, natural-language querying and documented research. It also includes finance use cases where data and analysis are central to the work.", "يجمع هذا المجال المسارات المخصصة لإعداد البيانات ومخرجات التقارير والاستعلام باللغة الطبيعية والبحث الموثق. كما يشمل حالات استخدام في المالية عندما تكون البيانات والتحليل جوهر العمل."),
    seo: { title: localized("Formation IA data, BI et recherche | Neopolis", "AI training for data, BI and research | Neopolis", "تدريب الذكاء الاصطناعي للبيانات وذكاء الأعمال والبحث | نيوبوليس"), description: localized("Formations IA gratuites en data, BI, reporting, requêtes en langage naturel et recherche documentaire.", "Free AI training in data, BI, reporting, natural-language queries and document research.", "تدريب مجاني في الذكاء الاصطناعي للبيانات وذكاء الأعمال والتقارير والاستعلام باللغة الطبيعية والبحث في المستندات."), keywords: localized("formation IA data, formation IA BI, reporting IA, analyse de données IA, recherche documentaire IA", "AI data training, AI BI training, AI reporting, AI data analysis, AI document research", "تدريب الذكاء الاصطناعي للبيانات, تدريب ذكاء الأعمال, تقارير بالذكاء الاصطناعي, تحليل البيانات بالذكاء الاصطناعي, بحث المستندات بالذكاء الاصطناعي") },
    groupIds: ["bi_data_analytics"],
    subcategoryIds: ["data_bi_research"],
    caseCourseIds: ["analyse_donnees_reporting_bi_codex__01", "ia_appliquee_metiers_tp__32", "ia_appliquee_metiers_tp__33", "ia_appliquee_metiers_tp__35"],
    accent: "blue",
  },
  {
    slug: "administratif-ressources-humaines",
    title: localized("Formations IA gratuites en administratif et ressources humaines", "Free AI training in administration and human resources", "تدريب مجاني في الذكاء الاصطناعي للإدارة والموارد البشرية"),
    shortTitle: localized("Administratif & RH", "Administration & HR", "الإدارة والموارد البشرية"),
    description: localized("Formations IA gratuites pour le secrétariat, la coordination, les opérations et les ressources humaines.", "Free AI training for secretarial work, coordination, operations and human resources.", "تدريب مجاني في الذكاء الاصطناعي للأعمال المكتبية والتنسيق والعمليات والموارد البشرية."),
    introduction: localized("Ce domaine couvre les activités administratives, de coordination et de ressources humaines. Les formations associées abordent le traitement d’informations, la préparation de tâches, les parcours candidats et l’organisation des opérations, avec des contrôles adaptés aux actions sensibles.", "This domain covers administrative, coordination and HR activities. Associated training addresses information processing, task preparation, candidate journeys and operational organisation, with controls suited to sensitive actions.", "يغطي هذا المجال الأنشطة الإدارية والتنسيق والموارد البشرية. ويتناول التدريب المرتبط معالجة المعلومات وإعداد المهام ومسارات المرشحين وتنظيم العمليات، مع ضوابط مناسبة للإجراءات الحساسة."),
    seo: { title: localized("Formation IA administratif et RH | Neopolis", "AI training for administration and HR | Neopolis", "تدريب الذكاء الاصطناعي للإدارة والموارد البشرية | نيوبوليس"), description: localized("Formations IA gratuites pour l’administration, les RH, le recrutement, l’e-mail et les opérations.", "Free AI training for administration, HR, recruitment, email and operations.", "تدريب مجاني في الذكاء الاصطناعي للإدارة والموارد البشرية والتوظيف والبريد الإلكتروني والعمليات."), keywords: localized("formation IA administratif, formation IA RH, IA recrutement, automatisation administrative, IA opérations", "AI administration training, AI HR training, AI recruitment, administrative automation, AI operations", "تدريب الذكاء الاصطناعي للإدارة, تدريب الذكاء الاصطناعي للموارد البشرية, الذكاء الاصطناعي للتوظيف, أتمتة الإدارة, الذكاء الاصطناعي للعمليات") },
    groupIds: ["workplace_ai_productivity", "divers"],
    subcategoryIds: ["hr_recruitment", "productivity_operations"],
    caseCourseIds: ["ia_appliquee_metiers_tp__22", "ia_appliquee_metiers_tp__25", "ia_appliquee_metiers_tp__27", "ia_appliquee_metiers_tp__31"],
    accent: "amber",
  },
  {
    slug: "commerce-marketing-relation-client",
    title: localized("Formations IA gratuites en commerce, marketing et relation client", "Free AI training in sales, marketing and customer relations", "تدريب مجاني في الذكاء الاصطناعي للمبيعات والتسويق وعلاقات العملاء"),
    shortTitle: localized("Commerce, Marketing & Client", "Sales, Marketing & Customer", "المبيعات والتسويق والعملاء"),
    description: localized("Formations IA gratuites pour la prospection, le CRM, le contenu, le support client et les opérations e-commerce.", "Free AI training for prospecting, CRM, content, customer support and e-commerce operations.", "تدريب مجاني في الذكاء الاصطناعي للتنقيب وCRM والمحتوى ودعم العملاء وعمليات التجارة الإلكترونية."),
    introduction: localized("Ce domaine rassemble les usages liés au développement commercial, au marketing, au contenu, au support et à l’e-commerce. Les parcours présentent des méthodes pour structurer les informations, préparer des contenus, soutenir le suivi client et organiser les actions commerciales.", "This domain brings together use cases for business development, marketing, content, support and e-commerce. The learning paths show methods for structuring information, preparing content, supporting customer follow-up and organising sales actions.", "يجمع هذا المجال حالات الاستخدام المرتبطة بتطوير الأعمال والتسويق والمحتوى والدعم والتجارة الإلكترونية. وتعرض المسارات أساليب لتنظيم المعلومات وإعداد المحتوى ودعم متابعة العملاء وتنظيم الإجراءات التجارية."),
    seo: { title: localized("Formation IA commerce, marketing et client | Neopolis", "AI training for sales, marketing and customer care | Neopolis", "تدريب الذكاء الاصطناعي للمبيعات والتسويق والعملاء | نيوبوليس"), description: localized("Formations IA gratuites pour la prospection, CRM, marketing de contenu, support client et e-commerce.", "Free AI training for prospecting, CRM, content marketing, customer support and e-commerce.", "تدريب مجاني في الذكاء الاصطناعي للتنقيب وCRM وتسويق المحتوى ودعم العملاء والتجارة الإلكترونية."), keywords: localized("formation IA vente, formation IA marketing, IA CRM, IA support client, IA e-commerce", "AI sales training, AI marketing training, AI CRM, AI customer support, AI e-commerce", "تدريب الذكاء الاصطناعي للمبيعات, تدريب الذكاء الاصطناعي للتسويق, الذكاء الاصطناعي لـ CRM, الذكاء الاصطناعي لدعم العملاء, الذكاء الاصطناعي للتجارة الإلكترونية") },
    subcategoryIds: ["sales_crm_prospecting", "marketing_content", "support_ecommerce"],
    certificationIds: ["datacamp_building_marketing_workflows_with_n8n", "initiation_automatisation_workflows_n8n"],
    caseCourseIds: ["ia_appliquee_metiers_tp__01", "ia_appliquee_metiers_tp__07", "ia_appliquee_metiers_tp__11", "ia_appliquee_metiers_tp__15"],
    accent: "rose",
  },
  {
    slug: "juridique-conformite",
    title: localized("Formations IA gratuites en juridique et conformité", "Free AI training in legal work and compliance", "تدريب مجاني في الذكاء الاصطناعي للعمل القانوني والامتثال"),
    shortTitle: localized("Juridique & Conformité", "Legal & Compliance", "القانون والامتثال"),
    description: localized("Formations IA gratuites pour les contrats, la conformité, l’analyse de risques et les opérations juridiques.", "Free AI training for contracts, compliance, risk analysis and legal operations.", "تدريب مجاني في الذكاء الاصطناعي للعقود والامتثال وتحليل المخاطر والعمليات القانونية."),
    introduction: localized("Ce domaine regroupe les formations consacrées au travail contractuel, à la conformité et à l’organisation documentaire. Les cas d’usage abordent le repérage, la comparaison, la classification et le routage, sans substituer l’IA à la validation juridique humaine.", "This domain gathers training on contractual work, compliance and document organisation. The use cases cover identification, comparison, classification and routing, without replacing human legal review with AI.", "يجمع هذا المجال التدريب على العمل التعاقدي والامتثال وتنظيم الوثائق. وتتناول حالات الاستخدام التعرّف والمقارنة والتصنيف والتوجيه، من دون استبدال المراجعة القانونية البشرية بالذكاء الاصطناعي."),
    seo: { title: localized("Formation IA juridique et conformité | Neopolis", "AI training for legal work and compliance | Neopolis", "تدريب الذكاء الاصطناعي للعمل القانوني والامتثال | نيوبوليس"), description: localized("Formations IA gratuites pour contrats, conformité, revue documentaire, analyse de risques et opérations juridiques.", "Free AI training for contracts, compliance, document review, risk analysis and legal operations.", "تدريب مجاني في الذكاء الاصطناعي للعقود والامتثال ومراجعة الوثائق وتحليل المخاطر والعمليات القانونية."), keywords: localized("formation IA juridique, formation IA conformité, analyse de contrats IA, risques juridiques IA, opérations juridiques", "AI legal training, AI compliance training, AI contract analysis, AI legal risk, legal operations", "تدريب الذكاء الاصطناعي للقانون, تدريب الذكاء الاصطناعي للامتثال, تحليل العقود بالذكاء الاصطناعي, المخاطر القانونية بالذكاء الاصطناعي, العمليات القانونية") },
    subcategoryIds: ["legal_contracts_compliance"],
    certificationIds: ["ai_governance_compliance_responsible_ai_leader"],
    caseCourseIds: ["ia_appliquee_metiers_tp__37", "ia_appliquee_metiers_tp__38", "ia_appliquee_metiers_tp__39", "ia_appliquee_metiers_tp__40"],
    accent: "rose",
  },
  {
    slug: "strategie-transformation-ia",
    title: localized("Formations IA gratuites en stratégie et transformation", "Free AI training in strategy and transformation", "تدريب مجاني في الذكاء الاصطناعي للاستراتيجية والتحول"),
    shortTitle: localized("Stratégie & Transformation", "Strategy & Transformation", "الاستراتيجية والتحول"),
    description: localized("Formations IA gratuites pour la gouvernance, la stratégie, les processus et la mise en œuvre responsable de l’IA.", "Free AI training for governance, strategy, processes and responsible AI implementation.", "تدريب مجاني في الذكاء الاصطناعي للحوكمة والاستراتيجية والعمليات والتنفيذ المسؤول للذكاء الاصطناعي."),
    introduction: localized("Ce domaine s’adresse aux personnes qui cadrent une démarche IA au niveau d’une équipe ou d’une organisation. Les parcours associés couvrent la cartographie des processus, l’évaluation du potentiel IA, la gouvernance, les arbitrages produit et la préparation de cas d’usage.", "This domain is for people framing an AI initiative at team or organisational level. Associated learning paths cover process mapping, AI-potential assessment, governance, product trade-offs and use-case preparation.", "هذا المجال مخصص لمن يؤطرون مبادرة للذكاء الاصطناعي على مستوى فريق أو مؤسسة. وتغطي المسارات المرتبطة رسم العمليات وتقييم إمكانات الذكاء الاصطناعي والحوكمة ومفاضلات المنتج وإعداد حالات الاستخدام."),
    seo: { title: localized("Formation IA stratégie et transformation | Neopolis", "AI training for strategy and transformation | Neopolis", "تدريب الذكاء الاصطناعي للاستراتيجية والتحول | نيوبوليس"), description: localized("Formations IA gratuites en stratégie, gouvernance, cartographie des processus et transformation des organisations.", "Free AI training in strategy, governance, process mapping and organisational transformation.", "تدريب مجاني في الذكاء الاصطناعي للاستراتيجية والحوكمة ورسم العمليات وتحول المؤسسات."), keywords: localized("formation IA stratégie, transformation IA, gouvernance IA, cartographie processus, cas d’usage IA", "AI strategy training, AI transformation, AI governance, process mapping, AI use cases", "تدريب الذكاء الاصطناعي للاستراتيجية, تحول الذكاء الاصطناعي, حوكمة الذكاء الاصطناعي, رسم العمليات, حالات استخدام الذكاء الاصطناعي") },
    groupIds: ["business_ai_literacy", "divers"],
    caseCourseIds: ["transformation_processus_ia__01", "transformation_processus_ia__03", "transformation_processus_ia__04", "ai_governance_compliance_responsible_ai_leader__01"],
    accent: "blue",
  },
];

export const publicTrainingThemeAliases: Record<string, string> = {
  "ia-au-travail-productivite": "administratif-ressources-humaines",
  "ingenierie-ia-rag-mlops": "informatique-developpement",
  "data-bi-analytique": "data-bi-recherche",
  "ventes-crm-prospection": "commerce-marketing-relation-client",
  "marketing-contenu": "commerce-marketing-relation-client",
  "support-client-ecommerce": "commerce-marketing-relation-client",
  "finance-comptabilite-controle-gestion": "comptabilite-finance",
  "ressources-humaines-recrutement": "administratif-ressources-humaines",
  "productivite-secretariat-operations": "administratif-ressources-humaines",
  "juridique-contrats-conformite": "juridique-conformite",
};

const emptyMetrics = (): PublicTrainingMetrics => ({ certificationCount: 0, courseCount: 0, lessonCount: 0, chapterCount: 0, activityCount: 0, exerciseCount: 0, videoCount: 0, downloadCount: 0 });

function courseMatchesTheme(course: CatalogCourse, certification: CatalogCertification | undefined, definition: ThemeDefinition) {
  return Boolean(
    definition.certificationIds?.includes(course.certId)
    || (certification?.group && definition.groupIds?.includes(certification.group))
    || (course.subCategoryId && definition.subcategoryIds?.includes(course.subCategoryId)),
  );
}

function summarizeCourses(courses: CatalogCourse[], certificationCount: number): PublicTrainingMetrics {
  return courses.reduce((metrics, course) => {
    const courseMetrics = getCourseCatalogMetrics(course);
    metrics.courseCount += 1;
    metrics.lessonCount += courseMetrics.lessonCount;
    metrics.chapterCount += courseMetrics.chapterCount;
    metrics.activityCount += courseMetrics.totalActivities;
    metrics.exerciseCount += courseMetrics.exerciseCount;
    metrics.videoCount += courseMetrics.videoCount;
    metrics.downloadCount += courseMetrics.downloadCount;
    return metrics;
  }, { ...emptyMetrics(), certificationCount });
}

function formatLabel(certification: CatalogCertification, locale: PublicTrainingLocale) {
  const format = resolveTrainingFormat(certification);
  const labels = {
    fr: { certification_preparation: "Préparation aux certifications", tutorial_tp: "Tutoriel / TP", training: "Formation" },
    en: { certification_preparation: "Certification preparation", tutorial_tp: "Tutorial / practical work", training: "Training" },
    ar: { certification_preparation: "التحضير للشهادات", tutorial_tp: "دليل تعليمي / عمل تطبيقي", training: "تدريب" },
  } as const;
  if (format === "certification_preparation") return labels[locale].certification_preparation;
  if (format === "tutorial_tp") return labels[locale].tutorial_tp;
  return labels[locale].training;
}

function localizedDefinitionText(value: LocalizedValue, locale: PublicTrainingLocale, fallback: string) {
  return localizePublicTrainingText(value, locale, fallback);
}

function relatedDomainLabels(certification: CatalogCertification, currentSlug: string, locale: PublicTrainingLocale) {
  return themeDefinitions.filter((definition) => definition.slug !== currentSlug && catalog.courses.some((course) => course.certId === certification.id && courseMatchesTheme(course, certification, definition)))
    .map((definition) => localizedDefinitionText(definition.shortTitle, locale, ""));
}

function createUseCases(definition: ThemeDefinition, courses: CatalogCourse[], locale: PublicTrainingLocale) {
  const byId = new Map(courses.map((course) => [course.id, course]));
  return definition.caseCourseIds.flatMap((courseId) => {
    const course = byId.get(courseId);
    if (!course) return [];
    const skills = (course.acquiredSkills || []).slice(0, 3).map((skill) => localizePublicTrainingText(skill, locale, skill));
    return [{
      courseId: course.id,
      certificationId: course.certId,
      title: localizePublicTrainingText(course.title, locale, "Cas d’usage IA"),
      summary: skills.slice(0, 2).join(" · ") || localizePublicTrainingText(course.description, locale, ""),
      skills,
    }];
  });
}

function createTheme(definition: ThemeDefinition, locale: PublicTrainingLocale): PublicTrainingTheme {
  const certificationById = new Map(catalog.certifications.map((certification) => [certification.id, certification]));
  const courses = catalog.courses.filter((course) => courseMatchesTheme(course, certificationById.get(course.certId), definition));
  const certificationIds = new Set(courses.map((course) => course.certId));
  const certifications = catalog.certifications
    .filter((certification) => certificationIds.has(certification.id))
    .map((certification) => {
      const certificationCourses = courses.filter((course) => course.certId === certification.id);
      return {
        id: certification.id,
        title: localizePublicTrainingText(certification.title, locale, "AI training"),
        description: localizePublicTrainingText(certification.description, locale, ""),
        level: localizePublicTrainingText(certification.level, locale, ""),
        icon: certification.icon || "◈",
        trainingFormat: formatLabel(certification, locale),
        metrics: summarizeCourses(certificationCourses, 1),
        relatedDomains: relatedDomainLabels(certification, definition.slug, locale),
      };
    });
  const skills = Array.from(new Set(courses.flatMap((course) => [
    ...(course.acquiredSkills || []),
    ...(course.tags || []).filter((tag) => !/^(débutant|intermédiaire|avancé)$/i.test(tag)),
  ]).map((skill) => localizePublicTrainingText(skill.trim(), locale, skill.trim())).filter(Boolean))).sort((left, right) => left.localeCompare(right, locale));
  const roles = extractTargetJobRoles(courses).map((role) => localizePublicTrainingText(role, locale, role)).sort((left, right) => left.localeCompare(right, locale));

  return {
    ...definition,
    title: localizedDefinitionText(definition.title, locale, "AI training"),
    shortTitle: localizedDefinitionText(definition.shortTitle, locale, "AI training"),
    description: localizedDefinitionText(definition.description, locale, ""),
    introduction: localizedDefinitionText(definition.introduction, locale, ""),
    seo: {
      title: localizedDefinitionText(definition.seo.title, locale, "AI training | Neopolis Akademy"),
      description: localizedDefinitionText(definition.seo.description, locale, ""),
      keywords: localizedDefinitionText(definition.seo.keywords, locale, "AI training"),
    },
    metrics: summarizeCourses(courses, certifications.length),
    roles,
    skills,
    useCases: createUseCases(definition, courses, locale),
    certifications,
  };
}

export function getPublicTrainingThemes(locale: PublicTrainingLocale = "fr") {
  return themeDefinitions.map((definition) => createTheme(definition, locale)).filter((theme) => theme.metrics.courseCount > 0);
}

export function getPublicTrainingTheme(slug: string, locale: PublicTrainingLocale = "fr") {
  return getPublicTrainingThemes(locale).find((theme) => theme.slug === slug) || null;
}

export function getPublicTrainingThemeAlias(slug: string) {
  return publicTrainingThemeAliases[slug] || null;
}

export function getPublicTrainingCatalogMetrics() {
  return summarizeCourses(catalog.courses, catalog.certifications.length);
}

export function getPublicTrainingCatalogRevision() {
  return (trainingIndex as { catalogRevision?: string }).catalogRevision || "catalogue-actuel";
}
