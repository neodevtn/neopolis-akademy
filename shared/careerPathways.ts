export type LocalizedCareerLabel = { fr: string; en: string };

export type CareerFamilyDefinition = {
  id: string;
  title: LocalizedCareerLabel;
  description: LocalizedCareerLabel;
  keywords: string[];
  foundationCertificationIds: string[];
  recommendedCertificationIds: string[];
  primaryCompetencyIds: string[];
};

/**
 * Stable, learner-facing career families. Raw job titles remain in source course
 * metadata; this curated layer keeps filters and orientation recommendations
 * compact, explainable and synchronized with the current catalogue.
 */
export const CAREER_FAMILY_DEFINITIONS: CareerFamilyDefinition[] = [
  {
    id: "strategy",
    title: { fr: "Direction, conseil & transformation", en: "Leadership, consulting & transformation" },
    description: { fr: "Piloter l’adoption, la valeur, la gouvernance et la transformation par l’IA.", en: "Lead AI adoption, value, governance and transformation." },
    keywords: ["direction", "dirigeant", "consult", "conseil", "strategy", "strategie", "transformation", "product manager", "produit", "manager", "management", "roi", "business case"],
    foundationCertificationIds: ["ia_pour_les_nuls", "datacamp_introduction_to_ai_for_work", "claude_certified_associate_foundations"],
    recommendedCertificationIds: ["transformation_processus_ia", "ai_governance_compliance_responsible_ai_leader", "ai_product_management_human_centered_ux_specialist", "datacamp_ai_for_consulting", "claude_certified_architect_foundations", "claude_certified_architect_professional"],
    primaryCompetencyIds: ["ai_business", "ai_solution_design", "ai_governance"],
  },
  {
    id: "data_research",
    title: { fr: "Data, BI & recherche", en: "Data, BI & research" },
    description: { fr: "Analyser, fiabiliser et expliquer les données, de la BI à la recherche avancée.", en: "Analyze, validate and explain data, from BI to advanced research." },
    keywords: ["data", "analyst", "analytics", "analyse", "bi", "reporting", "database", "sql", "scientist", "research", "recherche", "veille", "statistic", "statistique"],
    foundationCertificationIds: ["datacamp_gemini_in_google_sheets", "datacamp_ai_for_data_analysts", "huggingface_llm_course"],
    recommendedCertificationIds: ["analyse_donnees_reporting_bi_codex", "ai_data_engineering_rag_practitioner", "advanced_rag_evaluation_specialist", "ia_appliquee_metiers_tp__formation_32", "ia_appliquee_metiers_tp__formation_33", "ia_appliquee_metiers_tp__formation_34", "ia_appliquee_metiers_tp__formation_35", "ia_appliquee_metiers_tp__formation_36"],
    primaryCompetencyIds: ["bi_ai", "rag_knowledge", "ai_governance"],
  },
  {
    id: "ai_engineering",
    title: { fr: "Développement logiciel & ingénierie IA", en: "Software development & AI engineering" },
    description: { fr: "Construire, sécuriser, déployer et observer des applications et agents IA.", en: "Build, secure, deploy and observe AI applications and agents." },
    keywords: ["engineer", "ingenieur", "develop", "developer", "software", "architect", "cloud", "devops", "mlops", "llmops", "api", "code", "python", "typescript", "rag", "fine tuning"],
    foundationCertificationIds: ["claude_certified_developer_foundations", "huggingface_llm_course", "datacamp_claude_code_101"],
    recommendedCertificationIds: ["full_stack_ai_application_developer", "ai_data_engineering_rag_practitioner", "advanced_rag_evaluation_specialist", "ai_production_infrastructure_model_serving_engineer", "llmops_ai_observability_engineer", "open_source_llms_fine_tuning_engineer", "llm_application_security_red_teaming_specialist", "datacamp_deploying_ai_into_production_with_fastapi", "datacamp_building_scalable_agentic_systems"],
    primaryCompetencyIds: ["ai_development", "ai_devops", "rag_knowledge"],
  },
  {
    id: "marketing_sales",
    title: { fr: "Marketing, vente & croissance", en: "Marketing, sales & growth" },
    description: { fr: "Prospecter, personnaliser, produire et piloter la croissance avec l’IA.", en: "Use AI for prospecting, personalization, content and growth." },
    keywords: ["sales", "vente", "commercial", "marketing", "crm", "prospection", "growth", "seo", "content", "contenu", "acquisition", "linkedin", "social media"],
    foundationCertificationIds: ["datacamp_ai_for_marketing", "datacamp_ai_for_sales"],
    recommendedCertificationIds: ["ia_appliquee_metiers_tp__formation_01", "ia_appliquee_metiers_tp__formation_02", "ia_appliquee_metiers_tp__formation_03", "ia_appliquee_metiers_tp__formation_04", "ia_appliquee_metiers_tp__formation_05", "ia_appliquee_metiers_tp__formation_06", "ia_appliquee_metiers_tp__formation_07", "ia_appliquee_metiers_tp__formation_08", "ia_appliquee_metiers_tp__formation_09", "ia_appliquee_metiers_tp__formation_10"],
    primaryCompetencyIds: ["ai_business", "prompt_engineering", "ai_orchestration"],
  },
  {
    id: "finance",
    title: { fr: "Finance, comptabilité & audit", en: "Finance, accounting & audit" },
    description: { fr: "Automatiser les opérations financières tout en renforçant contrôle, traçabilité et analyse.", en: "Automate financial operations while strengthening control, traceability and analysis." },
    keywords: ["finance", "financial", "financier", "account", "comptab", "audit", "controle", "budget", "finops", "factur", "fp&a", "cfo"],
    foundationCertificationIds: ["datacamp_ai_for_finance", "analyse_donnees_reporting_bi_codex", "initiation_automatisation_workflows_n8n"],
    recommendedCertificationIds: ["novasavo_automatisation_comptable_ia", "ia_appliquee_metiers_tp__formation_17", "ia_appliquee_metiers_tp__formation_18", "ia_appliquee_metiers_tp__formation_19", "ia_appliquee_metiers_tp__formation_20", "ia_appliquee_metiers_tp__formation_21", "ai_finops_cost_engineering_specialist"],
    primaryCompetencyIds: ["bi_ai", "ai_orchestration", "ai_governance"],
  },
  {
    id: "hr",
    title: { fr: "Ressources humaines & recrutement", en: "Human resources & recruitment" },
    description: { fr: "Augmenter le recrutement et les opérations RH avec contrôle humain et équité.", en: "Augment recruiting and HR operations with human oversight and fairness." },
    keywords: ["human resource", "ressource humaine", "rh", "recruit", "recrut", "talent", "onboarding", "candidat", "cv", "entretien"],
    foundationCertificationIds: ["datacamp_ai_for_human_resources", "datacamp_introduction_to_ai_for_work"],
    recommendedCertificationIds: ["ia_appliquee_metiers_tp__formation_22", "ia_appliquee_metiers_tp__formation_23", "ia_appliquee_metiers_tp__formation_24", "ia_appliquee_metiers_tp__formation_25", "ia_appliquee_metiers_tp__formation_26", "ai_governance_compliance_responsible_ai_leader"],
    primaryCompetencyIds: ["ai_business", "ai_governance", "ai_orchestration"],
  },
  {
    id: "legal_compliance",
    title: { fr: "Juridique, conformité & risques", en: "Legal, compliance & risk" },
    description: { fr: "Analyser les contrats, encadrer les risques et documenter la conformité IA.", en: "Analyze contracts, manage risk and document AI compliance." },
    keywords: ["legal", "juridi", "contract", "contrat", "compliance", "conformite", "regulat", "risk", "risque", "clause"],
    foundationCertificationIds: ["claude_certified_associate_foundations", "datacamp_introduction_to_ai_for_work"],
    recommendedCertificationIds: ["ia_appliquee_metiers_tp__formation_37", "ia_appliquee_metiers_tp__formation_38", "ia_appliquee_metiers_tp__formation_39", "ia_appliquee_metiers_tp__formation_40", "ai_governance_compliance_responsible_ai_leader", "claude_certified_architect_professional"],
    primaryCompetencyIds: ["ai_governance", "rag_knowledge", "ai_solution_design"],
  },
  {
    id: "operations_projects",
    title: { fr: "Opérations, administration & gestion de projet", en: "Operations, administration & project management" },
    description: { fr: "Fluidifier les processus, la coordination, la documentation et l’exécution des projets.", en: "Improve workflows, coordination, documentation and project execution." },
    keywords: ["operation", "administrat", "office manager", "assistant", "secretariat", "project", "projet", "pmo", "chief of staff", "coordination", "processus", "workflow", "reunion"],
    foundationCertificationIds: ["initiation_automatisation_workflows_n8n", "datacamp_introduction_to_ai_for_work", "datacamp_practical_ai_with_google_gemini_and_notebooklm"],
    recommendedCertificationIds: ["transformation_processus_ia", "datacamp_intermediate_workflow_automation_with_n8n", "ai_product_management_human_centered_ux_specialist", "ia_appliquee_metiers_tp__formation_26", "ia_appliquee_metiers_tp__formation_27", "ia_appliquee_metiers_tp__formation_28", "ia_appliquee_metiers_tp__formation_29", "ia_appliquee_metiers_tp__formation_30", "ia_appliquee_metiers_tp__formation_31", "ia_appliquee_metiers_tp__formation_36"],
    primaryCompetencyIds: ["ai_orchestration", "ai_business", "ai_solution_design"],
  },
  {
    id: "customer_ecommerce",
    title: { fr: "Service client, e-commerce & relation client", en: "Customer service, e-commerce & customer experience" },
    description: { fr: "Concevoir des assistants fiables pour le support, les commandes et l’expérience client.", en: "Build reliable assistants for support, orders and customer experience." },
    keywords: ["customer", "client", "support", "helpdesk", "zendesk", "gorgias", "freshdesk", "ecommerce", "e-commerce", "shopify", "commande", "stock"],
    foundationCertificationIds: ["datacamp_claude_101", "initiation_automatisation_workflows_n8n"],
    recommendedCertificationIds: ["ia_appliquee_metiers_tp__formation_11", "ia_appliquee_metiers_tp__formation_12", "ia_appliquee_metiers_tp__formation_13", "ia_appliquee_metiers_tp__formation_14", "ia_appliquee_metiers_tp__formation_15", "ia_appliquee_metiers_tp__formation_16"],
    primaryCompetencyIds: ["ai_orchestration", "rag_knowledge", "ai_business"],
  },
  {
    id: "health_research",
    title: { fr: "Santé, médecine & recherche clinique", en: "Health, medicine & clinical research" },
    description: { fr: "Assister la recherche en santé avec données synthétiques, traçabilité et validation humaine.", en: "Support health research with synthetic data, traceability and human validation." },
    keywords: ["health", "sante", "medical", "medec", "clinical", "clinique", "epidem", "biostat", "patient", "hopital", "hospital", "pharma", "biomedical"],
    foundationCertificationIds: ["claude_certified_associate_foundations", "datacamp_ai_for_data_analysts"],
    recommendedCertificationIds: ["claude_science_recherche_sante_v3", "ai_governance_compliance_responsible_ai_leader", "advanced_rag_evaluation_specialist", "ai_data_engineering_rag_practitioner", "analyse_donnees_reporting_bi_codex"],
    primaryCompetencyIds: ["bi_ai", "ai_governance", "rag_knowledge"],
  },
  {
    id: "education_training",
    title: { fr: "Éducation, formation & transmission", en: "Education, training & knowledge sharing" },
    description: { fr: "Préparer des ressources, animer l’apprentissage et concevoir des expériences pédagogiques assistées.", en: "Prepare resources, facilitate learning and design AI-assisted educational experiences." },
    keywords: ["education", "enseign", "teacher", "teaching", "formateur", "formation professionnelle", "pedagog", "learning", "apprentissage", "lms", "curriculum", "cours"],
    foundationCertificationIds: ["ia_pour_les_nuls", "datacamp_introduction_to_ai_for_work", "datacamp_introduction_to_google_workspace_with_gemini"],
    recommendedCertificationIds: ["datacamp_practical_ai_with_google_gemini_and_notebooklm", "datacamp_microsoft_copilot_in_word", "datacamp_microsoft_copilot_in_powerpoint", "datacamp_gemini_in_google_docs", "datacamp_gemini_in_google_slides", "datacamp_gemini_in_google_meet", "ai_product_management_human_centered_ux_specialist"],
    primaryCompetencyIds: ["prompt_engineering", "ai_business", "ai_solution_design"],
  },
  {
    id: "industry_logistics",
    title: { fr: "Industrie, ingénierie métier & logistique", en: "Industry, domain engineering & logistics" },
    description: { fr: "Appliquer l’IA aux opérations, aux flux, aux stocks et à l’amélioration continue.", en: "Apply AI to operations, flows, inventory and continuous improvement." },
    keywords: ["industry", "industrie", "manufact", "supply", "logistic", "maintenance", "production", "qualite", "quality", "stock", "approvisionnement", "transport", "entrepot", "ingenierie"],
    foundationCertificationIds: ["ia_pour_les_nuls", "datacamp_ai_for_data_analysts", "initiation_automatisation_workflows_n8n"],
    recommendedCertificationIds: ["analyse_donnees_reporting_bi_codex", "datacamp_intermediate_workflow_automation_with_n8n", "ia_appliquee_metiers_tp__formation_15", "ia_appliquee_metiers_tp__formation_29", "ai_data_engineering_rag_practitioner", "ai_product_management_human_centered_ux_specialist", "ai_governance_compliance_responsible_ai_leader", "ai_finops_cost_engineering_specialist"],
    primaryCompetencyIds: ["bi_ai", "ai_orchestration", "ai_solution_design"],
  },
];

export type CareerFamilyId = (typeof CAREER_FAMILY_DEFINITIONS)[number]["id"];

export const normalizeCareerText = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("fr")
  .replace(/[’']/g, " ")
  .replace(/[^a-z0-9+&\s-]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

export function inferCareerFamilyIds(text: string): CareerFamilyId[] {
  const normalized = normalizeCareerText(text);
  if (!normalized) return [];
  return CAREER_FAMILY_DEFINITIONS
    .map((family) => ({ family, score: family.keywords.reduce((score, keyword) => score + (normalized.includes(normalizeCareerText(keyword)) ? 1 : 0), 0) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .map(({ family }) => family.id);
}

export function getCareerFamily(id: string) {
  return CAREER_FAMILY_DEFINITIONS.find((family) => family.id === id);
}

export function parseCareerFamilyIds(value: unknown): CareerFamilyId[] {
  if (!Array.isArray(value)) return [];
  const valid = new Set(CAREER_FAMILY_DEFINITIONS.map((family) => family.id));
  return Array.from(new Set(value.filter((item): item is CareerFamilyId => typeof item === "string" && valid.has(item as CareerFamilyId))));
}
