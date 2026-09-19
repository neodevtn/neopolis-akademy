export type CompetencyRank = {
  id: "starting" | "emerging" | "bronze" | "silver" | "gold";
  label: string;
  min: number;
  max: number;
  color: string;
};

export const COMPETENCY_RANKS: CompetencyRank[] = [
  { id: "starting", label: "À démarrer", min: 0, max: 4.9, color: "slate" },
  { id: "emerging", label: "Émergent", min: 5, max: 19.9, color: "sky" },
  { id: "bronze", label: "Bronze", min: 20, max: 49.9, color: "amber" },
  { id: "silver", label: "Argent", min: 50, max: 79.9, color: "slate" },
  { id: "gold", label: "Or", min: 80, max: 100, color: "yellow" },
];

export type CompetencyPath = { certificationId: string; label: string; description: string };

export const COMPETENCY_RECOMMENDATION_PATHS: Record<string, string[]> = {
  prompt_engineering: ["claude_certified_associate_foundations", "datacamp_claude_101", "datacamp_prompt_engineering_with_the_openai_api"],
  ai_solution_design: ["claude_certified_architect_foundations", "transformation_processus_ia", "ai_product_management_human_centered_ux_specialist"],
  ai_development: ["claude_certified_developer_foundations", "full_stack_ai_application_developer", "datacamp_developing_ai_systems_with_the_openai_api"],
  rag_knowledge: ["ai_data_engineering_rag_practitioner", "advanced_rag_evaluation_specialist", "datacamp_end_to_end_rag_with_weaviate"],
  ai_orchestration: ["initiation_automatisation_workflows_n8n", "datacamp_intermediate_workflow_automation_with_n8n", "datacamp_building_scalable_agentic_systems"],
  ai_devops: ["llmops_ai_observability_engineer", "ai_production_infrastructure_model_serving_engineer", "datacamp_deploying_ai_into_production_with_fastapi"],
  bi_ai: ["analyse_donnees_reporting_bi_codex", "datacamp_ai_for_data_analysts", "ia_appliquee_metiers_tp__formation_32"],
  ai_governance: ["ai_governance_compliance_responsible_ai_leader", "claude_certified_architect_professional", "llm_application_security_red_teaming_specialist"],
  ai_business: ["ia_pour_les_nuls", "datacamp_ai_for_consulting", "datacamp_introduction_to_ai_for_work"],
};

export const COMPETENCY_PATHS: Record<string, CompetencyPath> = {
  prompt_engineering: { certificationId: "claude_certified_associate_foundations", label: "Fondations Claude", description: "Renforcez les bases du prompting, du contexte et de l’évaluation." },
  ai_solution_design: { certificationId: "claude_certified_architect_foundations", label: "Architect Foundations", description: "Passez à la conception de solutions et d’architectures IA robustes." },
  ai_development: { certificationId: "claude_certified_developer_foundations", label: "Developer Foundations", description: "Approfondissez l’API, les outils et les applications IA." },
  rag_knowledge: { certificationId: "ai_data_engineering_rag_practitioner", label: "RAG Data Engineering", description: "Construisez des bases de connaissances et une recherche fiable." },
  ai_orchestration: { certificationId: "initiation_automatisation_workflows_n8n", label: "Automatisation avec n8n", description: "Apprenez à relier workflows, outils et agents IA." },
  ai_devops: { certificationId: "claude_certified_developer_foundations", label: "Developer Foundations", description: "Travaillez le déploiement, l’observabilité et la fiabilité." },
  bi_ai: { certificationId: "analyse_donnees_reporting_bi_codex", label: "Analyse de données, reporting et BI", description: "Développez l’analyse, le reporting et l’automatisation des données." },
  ai_governance: { certificationId: "claude_certified_architect_professional", label: "Architect Professional", description: "Approfondissez la sécurité, le contrôle et la gouvernance IA." },
  ai_business: { certificationId: "ia_pour_les_nuls", label: "IA pour les nuls – Initiation", description: "Consolidez la valeur métier et l’adoption responsable de l’IA." },
};

export function getCompetencyRank(level: number): CompetencyRank {
  return [...COMPETENCY_RANKS].reverse().find((rank) => level >= rank.min) || COMPETENCY_RANKS[0];
}

export function getNextCompetencyRank(level: number): CompetencyRank | null {
  return COMPETENCY_RANKS.find((rank) => rank.min > level) || null;
}
