import type { PublicTrainingLocale } from "./publicTrainingLocale";

type Localized = Record<PublicTrainingLocale, string>;

export type GoldenJob = {
  slug: string;
  title: Localized;
  summary: Localized;
  scope: Localized;
  skills: Localized[];
  salary: string | null;
  recommendedCertificationIds: string[];
  videoGroup: "data" | "engineering" | "leadership";
};

export const GOLDEN_JOBS_SOURCE_URL = "https://www.digirocks.fr/recrutement-en-intelligence-artificielle/";

const text = (fr: string, en: string, ar: string): Localized => ({ fr, en, ar });

/**
 * Career profiles documented from the cited recruitment guide. Learning links
 * are deliberately curated against existing Neopolis certification IDs, not
 * inferred from a keyword-only recommender. They describe a development path,
 * never a job or salary guarantee.
 */
export const goldenJobs: GoldenJob[] = [
  {
    slug: "data-engineer",
    title: text("Data Engineer", "Data Engineer", "مهندس بيانات"),
    summary: text("Faire circuler des données fiables pour les équipes Data et IA.", "Build reliable data flows for data and AI teams.", "بناء تدفقات بيانات موثوقة لفرق البيانات والذكاء الاصطناعي."),
    scope: text("Conçoit les pipelines qui collectent, transforment et rendent les données exploitables pour les produits, les analyses et les systèmes d’IA.", "Designs the pipelines that collect, transform and make data usable for products, analytics and AI systems.", "يصمم خطوط البيانات التي تجمع البيانات وتحولها وتجعلها قابلة للاستخدام في المنتجات والتحليلات وأنظمة الذكاء الاصطناعي."),
    skills: [text("Python & SQL", "Python & SQL", "بايثون وSQL"), text("Pipelines & orchestration", "Pipelines & orchestration", "خطوط البيانات والتنسيق"), text("Data Lake / Warehouse", "Data Lake / Warehouse", "بحيرات ومستودعات البيانات")],
    salary: "48–75 k€ · 75–95 k€ · 95–125 k€",
    recommendedCertificationIds: ["ai_data_engineering_rag_practitioner", "datacamp_databricks_with_the_python_sdk", "analyse_donnees_reporting_bi_codex"],
    videoGroup: "data",
  },
  {
    slug: "data-scientist",
    title: text("Data Scientist", "Data Scientist", "عالم بيانات"),
    summary: text("Transformer les données en modèles, hypothèses et décisions mesurables.", "Turn data into models, hypotheses and measurable decisions.", "تحويل البيانات إلى نماذج وفرضيات وقرارات قابلة للقياس."),
    scope: text("Analyse des données, teste des hypothèses et construit des modèles prédictifs ou de segmentation pour répondre à un problème métier défini.", "Analyses data, tests hypotheses and builds predictive or segmentation models for a defined business problem.", "يحلل البيانات ويختبر الفرضيات ويبني نماذج تنبؤية أو للتقسيم لمعالجة مشكلة أعمال محددة."),
    skills: [text("Statistiques & probabilités", "Statistics & probability", "الإحصاء والاحتمالات"), text("Python & SQL", "Python & SQL", "بايثون وSQL"), text("Modélisation & évaluation", "Modelling & evaluation", "النمذجة والتقييم")],
    salary: "45–75 k€ · 75–95 k€ · 95–120 k€",
    recommendedCertificationIds: ["claude_certified_associate_foundations", "datacamp_ai_for_data_analysts", "datacamp_efficient_ai_model_training_with_pytorch", "analyse_donnees_reporting_bi_codex"],
    videoGroup: "data",
  },
  {
    slug: "machine-learning-engineer",
    title: text("Machine Learning Engineer", "Machine Learning Engineer", "مهندس تعلم الآلة"),
    summary: text("Faire passer les modèles de l’expérimentation à la production.", "Move models from experimentation into production.", "نقل النماذج من التجارب إلى بيئة الإنتاج."),
    scope: text("Industrialise les modèles avec des services robustes, du déploiement, du monitoring et des boucles de réentraînement adaptés à l’usage.", "Productionizes models with robust services, deployment, monitoring and retraining loops suited to the use case.", "يحول النماذج إلى خدمات موثوقة مع النشر والمراقبة ودورات إعادة التدريب الملائمة لحالة الاستخدام."),
    skills: [text("Python & frameworks ML", "Python & ML frameworks", "بايثون وأطر تعلم الآلة"), text("Déploiement de modèles", "Model deployment", "نشر النماذج"), text("MLOps & Cloud", "MLOps & cloud", "MLOps والسحابة")],
    salary: "50–80 k€ · 80–105 k€ · 105–140 k€",
    recommendedCertificationIds: ["claude_certified_developer_foundations", "datacamp_efficient_ai_model_training_with_pytorch", "datacamp_deploying_ai_into_production_with_fastapi", "ai_production_infrastructure_model_serving_engineer"],
    videoGroup: "data",
  },
  {
    slug: "genai-engineer",
    title: text("AI / GenAI Engineer", "AI / GenAI Engineer", "مهندس الذكاء الاصطناعي التوليدي"),
    summary: text("Construire des assistants, RAG, agents et applications IA utiles.", "Build useful assistants, RAG systems, agents and AI applications.", "بناء مساعدين وأنظمة RAG ووكلاء وتطبيقات ذكاء اصطناعي مفيدة."),
    scope: text("Assemble des modèles existants, APIs, embeddings, bases de connaissances et évaluations pour créer des applications d’IA générative maintenables.", "Combines existing models, APIs, embeddings, knowledge bases and evaluations into maintainable generative AI applications.", "يجمع نماذج موجودة وواجهات API وتمثيلات دلالية وقواعد معرفة وتقييمات لبناء تطبيقات ذكاء اصطناعي توليدي قابلة للصيانة."),
    skills: [text("APIs LLM & prompting", "LLM APIs & prompting", "واجهات LLM وهندسة المطالبات"), text("RAG & embeddings", "RAG & embeddings", "RAG والتمثيلات الدلالية"), text("Agents & évaluation", "Agents & evaluation", "الوكلاء والتقييم")],
    salary: null,
    recommendedCertificationIds: ["claude_certified_developer_foundations", "advanced_rag_evaluation_specialist", "datacamp_developing_ai_systems_with_the_openai_api"],
    videoGroup: "engineering",
  },
  {
    slug: "mlops-llmops-engineer",
    title: text("MLOps / LLMOps Engineer", "MLOps / LLMOps Engineer", "مهندس MLOps / LLMOps"),
    summary: text("Rendre les systèmes IA observables, fiables et maîtrisés dans le temps.", "Keep AI systems observable, reliable and controlled over time.", "جعل أنظمة الذكاء الاصطناعي قابلة للمراقبة وموثوقة وتحت السيطرة مع مرور الوقت."),
    scope: text("Automatise le cycle de vie des modèles et des LLM : versions, évaluations, performance, coût, latence, sécurité et détection des dégradations.", "Automates model and LLM lifecycles: versions, evaluations, performance, cost, latency, security and degradation detection.", "يؤتمت دورة حياة النماذج وLLM: الإصدارات والتقييمات والأداء والتكلفة وزمن الاستجابة والأمن واكتشاف التدهور."),
    skills: [text("Observabilité IA", "AI observability", "مراقبة الذكاء الاصطناعي"), text("Évaluations automatisées", "Automated evaluations", "التقييمات الآلية"), text("Coûts & performance", "Cost & performance", "التكلفة والأداء")],
    salary: null,
    recommendedCertificationIds: ["claude_certified_developer_foundations", "ai_production_infrastructure_model_serving_engineer", "datacamp_deploying_ai_into_production_with_fastapi", "ai_finops_cost_engineering_specialist"],
    videoGroup: "engineering",
  },
  {
    slug: "ai-architect",
    title: text("AI Architect", "AI Architect", "معماري الذكاء الاصطناعي"),
    summary: text("Concevoir une architecture IA cohérente, sécurisée et intégrable.", "Design a coherent, secure and integrable AI architecture.", "تصميم بنية ذكاء اصطناعي متماسكة وآمنة وقابلة للتكامل."),
    scope: text("Arbitre les choix de modèles, données, RAG, APIs, Cloud, sécurité et intégration au système d’information à l’échelle d’un portefeuille de cas d’usage.", "Makes trade-offs across models, data, RAG, APIs, cloud, security and systems integration for a portfolio of use cases.", "يتخذ القرارات بين النماذج والبيانات وRAG وواجهات API والسحابة والأمن والتكامل مع أنظمة المعلومات عبر مجموعة من حالات الاستخدام."),
    skills: [text("Architecture de systèmes IA", "AI systems architecture", "هندسة أنظمة الذكاء الاصطناعي"), text("Données, RAG & APIs", "Data, RAG & APIs", "البيانات وRAG وواجهات API"), text("Sécurité & gouvernance", "Security & governance", "الأمن والحوكمة")],
    salary: null,
    recommendedCertificationIds: ["claude_certified_architect_foundations", "claude_certified_architect_professional", "datacamp_building_scalable_agentic_systems"],
    videoGroup: "engineering",
  },
  {
    slug: "forward-deployed-engineer",
    title: text("Forward Deployed Engineer", "Forward Deployed Engineer", "مهندس نشر ميداني"),
    summary: text("Relier le besoin client, le prototype et un déploiement réellement adopté.", "Connect client needs, prototypes and truly adopted deployments.", "ربط احتياجات العميل بالنموذج الأولي وبنشر يتم اعتماده فعلياً."),
    scope: text("Travaille au plus près des métiers ou des clients pour cadrer, prototyper, intégrer, déployer et mesurer l’adoption de solutions IA.", "Works closely with business teams or clients to frame, prototype, integrate, deploy and measure adoption of AI solutions.", "يعمل عن قرب مع فرق الأعمال أو العملاء لتأطير حلول الذكاء الاصطناعي ونمذجتها الأولية ودمجها ونشرها وقياس اعتمادها."),
    skills: [text("Cadrage métier", "Business framing", "تأطير احتياجات الأعمال"), text("Prototypage & intégration", "Prototyping & integration", "النمذجة الأولية والتكامل"), text("Déploiement & adoption", "Deployment & adoption", "النشر والاعتماد")],
    salary: "55–90 k€ · 90–120 k€ · 110–150 k€",
    recommendedCertificationIds: ["datacamp_ai_for_consulting", "claude_certified_architect_foundations", "datacamp_building_scalable_agentic_systems"],
    videoGroup: "engineering",
  },
  {
    slug: "ai-product-manager",
    title: text("AI Product Manager", "AI Product Manager", "مدير منتج الذكاء الاصطناعي"),
    summary: text("Transformer une capacité IA en produit utile, compréhensible et mesurable.", "Turn an AI capability into a useful, understandable and measurable product.", "تحويل قدرات الذكاء الاصطناعي إلى منتج مفيد ومفهوم وقابل للقياس."),
    scope: text("Qualifie les cas d’usage, l’expérience, le niveau d’automatisation, la valeur et les limites d’un produit assisté par IA.", "Qualifies use cases, experience, automation level, value and limitations of an AI-assisted product.", "يحدد حالات الاستخدام وتجربة المستخدم ومستوى الأتمتة والقيمة والقيود لمنتج مدعوم بالذكاء الاصطناعي."),
    skills: [text("Stratégie produit IA", "AI product strategy", "استراتيجية منتج الذكاء الاصطناعي"), text("UX & fiabilité", "UX & reliability", "تجربة المستخدم والموثوقية"), text("Valeur & métriques", "Value & metrics", "القيمة والمقاييس")],
    salary: null,
    recommendedCertificationIds: ["claude_certified_associate_foundations", "ai_product_management_human_centered_ux_specialist", "datacamp_ai_for_consulting", "transformation_processus_ia"],
    videoGroup: "leadership",
  },
  {
    slug: "ai-project-manager",
    title: text("Chef de Projet IA", "AI Project Manager", "مدير مشروع الذكاء الاصطناعي"),
    summary: text("Faire converger métiers, Data, IT, sécurité et conduite du changement.", "Align business, data, IT, security and change management.", "مواءمة الأعمال والبيانات وتقنية المعلومات والأمن وإدارة التغيير."),
    scope: text("Pilote la transformation d’un cas d’usage en projet déployé, coordonne les parties prenantes et suit les risques, le budget, les fournisseurs et l’adoption.", "Leads the transformation of a use case into a deployed project, coordinating stakeholders and tracking risk, budget, vendors and adoption.", "يقود تحويل حالة الاستخدام إلى مشروع منشور، وينسق الأطراف المعنية ويتابع المخاطر والميزانية والموردين والاعتماد."),
    skills: [text("Pilotage de projet", "Project delivery", "إدارة المشاريع"), text("Conduite du changement", "Change management", "إدارة التغيير"), text("Risques & parties prenantes", "Risk & stakeholders", "المخاطر والأطراف المعنية")],
    salary: "48–75 k€ · 75–95 k€ · 95–130 k€",
    recommendedCertificationIds: ["claude_certified_associate_foundations", "transformation_processus_ia", "datacamp_ai_for_consulting", "ai_governance_compliance_responsible_ai_leader"],
    videoGroup: "leadership",
  },
  {
    slug: "responsible-ai-governance",
    title: text("Responsible AI / AI Governance", "Responsible AI / AI Governance", "مسؤول الذكاء الاصطناعي والحوكمة"),
    summary: text("Installer des garde-fous, une traçabilité et des usages responsables.", "Establish safeguards, traceability and responsible uses.", "إرساء الضوابط والتتبع والاستخدامات المسؤولة."),
    scope: text("Définit le cadre de risques, d’évaluation, de documentation, de conformité et de sécurité des systèmes d’IA, notamment dans les environnements régulés.", "Defines risk, evaluation, documentation, compliance and security frameworks for AI systems, especially in regulated environments.", "يحدد أطر المخاطر والتقييم والتوثيق والامتثال والأمن لأنظمة الذكاء الاصطناعي، خاصة في البيئات المنظمة."),
    skills: [text("Gouvernance IA", "AI governance", "حوكمة الذكاء الاصطناعي"), text("Risques & évaluation", "Risk & evaluation", "المخاطر والتقييم"), text("Conformité & données", "Compliance & data", "الامتثال والبيانات")],
    salary: null,
    recommendedCertificationIds: ["ai_governance_compliance_responsible_ai_leader", "claude_certified_architect_professional", "transformation_processus_ia"],
    videoGroup: "leadership",
  },
  {
    slug: "ai-research-scientist",
    title: text("AI Research Scientist", "AI Research Scientist", "باحث في الذكاء الاصطناعي"),
    summary: text("Explorer, entraîner et évaluer de nouvelles méthodes d’IA.", "Explore, train and evaluate new AI methods.", "استكشاف وتدريب وتقييم أساليب جديدة في الذكاء الاصطناعي."),
    scope: text("Travaille sur les modèles, leurs architectures, l’optimisation, le raisonnement, la vision, le NLP ou la multimodalité dans une démarche de R&D.", "Works on models, architectures, optimization, reasoning, vision, NLP or multimodality in an R&D approach.", "يعمل على النماذج وبناها وتحسينها والاستدلال والرؤية وNLP أو تعدد الوسائط ضمن نهج بحث وتطوير."),
    skills: [text("Recherche & expérimentation", "Research & experimentation", "البحث والتجريب"), text("Deep Learning", "Deep learning", "التعلم العميق"), text("Évaluation de modèles", "Model evaluation", "تقييم النماذج")],
    salary: null,
    recommendedCertificationIds: ["datacamp_efficient_ai_model_training_with_pytorch", "advanced_rag_evaluation_specialist", "datacamp_ai_for_data_analysts"],
    videoGroup: "data",
  },
  {
    slug: "chief-ai-officer",
    title: text("Head of AI / Chief AI Officer", "Head of AI / Chief AI Officer", "رئيس الذكاء الاصطناعي"),
    summary: text("Donner une direction commune aux investissements, équipes et cas d’usage IA.", "Give a common direction to AI investments, teams and use cases.", "وضع اتجاه موحد لاستثمارات الذكاء الاصطناعي وفرق العمل وحالات الاستخدام."),
    scope: text("Construit la feuille de route, priorise les investissements, organise les équipes, pilote la gouvernance et met la valeur créée au centre des décisions.", "Builds the roadmap, prioritizes investments, organizes teams, steers governance and keeps created value at the center of decisions.", "يبني خارطة الطريق ويعطي الأولوية للاستثمارات وينظم الفرق ويوجه الحوكمة ويضع القيمة المتحققة في مركز القرارات."),
    skills: [text("Stratégie & roadmap", "Strategy & roadmap", "الاستراتيجية وخارطة الطريق"), text("Gouvernance & ROI", "Governance & ROI", "الحوكمة والعائد"), text("Leadership & acculturation", "Leadership & enablement", "القيادة وبناء الثقافة")],
    salary: "120–160 k€ · 160–250 k€",
    recommendedCertificationIds: ["claude_certified_architect_foundations", "claude_certified_architect_professional", "transformation_processus_ia", "ai_governance_compliance_responsible_ai_leader"],
    videoGroup: "leadership",
  },
];

export const goldenJobsPromotionalVideos = [
  {
    id: "fr",
    embedUrl: "https://www.youtube.com/embed/6L7XD5pvfP8",
    watchUrl: "https://www.youtube.com/watch?v=6L7XD5pvfP8",
    channel: "Axel Denem - Expert IA",
    duration: "26:52",
    title: text("Voici 10 nouveaux métiers IA d’avenir", "10 emerging AI careers (French video)", "10 مهن واعدة جديدة في الذكاء الاصطناعي (فيديو فرنسي)"),
    description: text("Présentation des nouveaux métiers de l’IA et des compétences qui deviennent recherchées en 2026.", "An overview of emerging AI jobs and the skills becoming sought after in 2026.", "عرض للمهن الجديدة في الذكاء الاصطناعي والمهارات المطلوبة في عام 2026."),
  },
  {
    id: "en",
    embedUrl: "https://www.youtube.com/embed/plbqT4dBNwo",
    watchUrl: "https://www.youtube.com/watch?v=plbqT4dBNwo",
    channel: "TED",
    duration: "26:52",
    title: text("L’IA, le travail et les évolutions de carrière", "AI, work and career change", "الذكاء الاصطناعي والعمل وتغير المسارات المهنية"),
    description: text("Discussion TED sur l’évolution des emplois, les compétences transférables et l’apprentissage continu à l’ère de l’IA.", "A TED discussion on changing jobs, transferable skills and lifelong learning in the age of AI.", "نقاش TED حول تغير الوظائف والمهارات القابلة للنقل والتعلم المستمر في عصر الذكاء الاصطناعي."),
  },
  {
    id: "ar",
    embedUrl: "https://www.youtube.com/embed/tU5YcxMebHA",
    watchUrl: "https://www.youtube.com/watch?v=tU5YcxMebHA",
    channel: "أكاديمية حسوب",
    duration: "7:02",
    title: text("Les domaines professionnels de l’IA", "AI work domains (Arabic video)", "مجالات العمل بالذكاء الاصطناعي"),
    description: text("Vidéo éducative d’Académie Hsoub sur les domaines professionnels de l’IA, du machine learning à l’extraction et la recherche d’information.", "An Hsoub Academy educational video on AI work domains, from machine learning to data extraction and retrieval.", "فيديو تعليمي من أكاديمية حسوب عن مجالات العمل بالذكاء الاصطناعي، من تعلم الآلة إلى استخراج البيانات واسترجاعها."),
  },
] as const;

export function getGoldenJob(slug: string) {
  return goldenJobs.find((job) => job.slug === slug) || null;
}

export function getGoldenJobText(value: Localized, locale: PublicTrainingLocale) {
  return value[locale] || value.fr;
}
