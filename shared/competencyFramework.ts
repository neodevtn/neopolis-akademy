export const COMPETENCY_SOURCE_TYPES = [
  "lesson_completed",
  "exercise_passed",
  "quiz_passed",
  "checkpoint_passed",
  "course_completed",
  "skill_badge",
  "certification",
] as const;

export type CompetencySourceType = typeof COMPETENCY_SOURCE_TYPES[number];

export const DEFAULT_COMPETENCIES = [
  { id: "prompt_engineering", title: { fr: "Prompt engineering", en: "Prompt engineering" }, description: { fr: "Formuler, structurer et itérer des instructions efficaces pour l’IA.", en: "Craft, structure and iterate effective AI instructions." }, category: "Fondamentaux IA", icon: "message-square-code", color: "blue", sortOrder: 10 },
  { id: "ai_solution_design", title: { fr: "Conception de solutions IA", en: "AI solution design" }, description: { fr: "Concevoir des cas d’usage, parcours et systèmes IA utiles et sûrs.", en: "Design useful, safe AI use cases, workflows and systems." }, category: "Conception", icon: "lightbulb", color: "violet", sortOrder: 20 },
  { id: "ai_development", title: { fr: "Développement IA", en: "AI development" }, description: { fr: "Construire et intégrer des applications utilisant des modèles IA.", en: "Build and integrate applications using AI models." }, category: "Ingénierie", icon: "code-2", color: "indigo", sortOrder: 30 },
  { id: "rag_knowledge", title: { fr: "RAG et bases de connaissances", en: "RAG & knowledge bases" }, description: { fr: "Concevoir des systèmes de recherche, contexte et connaissances fiables.", en: "Design reliable retrieval, context and knowledge systems." }, category: "Ingénierie", icon: "database-zap", color: "cyan", sortOrder: 40 },
  { id: "ai_orchestration", title: { fr: "Orchestration IA", en: "AI orchestration" }, description: { fr: "Automatiser et coordonner des workflows, outils et agents IA.", en: "Automate and coordinate AI workflows, tools and agents." }, category: "Automatisation", icon: "workflow", color: "purple", sortOrder: 50 },
  { id: "ai_devops", title: { fr: "DevOps et fiabilité IA", en: "AI DevOps & reliability" }, description: { fr: "Déployer, observer, sécuriser et améliorer des systèmes IA en production.", en: "Deploy, observe, secure and improve production AI systems." }, category: "Opérations", icon: "shield-check", color: "slate", sortOrder: 60 },
  { id: "bi_ai", title: { fr: "BI et analyse de données par IA", en: "AI-powered BI & analytics" }, description: { fr: "Analyser, interpréter et communiquer des données avec des outils IA.", en: "Analyze, interpret and communicate data using AI tools." }, category: "Données", icon: "chart-no-axes-combined", color: "emerald", sortOrder: 70 },
  { id: "ai_governance", title: { fr: "Gouvernance et sécurité IA", en: "AI governance & safety" }, description: { fr: "Appliquer qualité, contrôle humain, sécurité et gouvernance responsables.", en: "Apply quality, human oversight, safety and responsible governance." }, category: "Gouvernance", icon: "scale", color: "amber", sortOrder: 80 },
  { id: "ai_business", title: { fr: "Stratégie et adoption IA", en: "AI strategy & adoption" }, description: { fr: "Identifier la valeur, conduire l’adoption et accompagner les métiers.", en: "Identify value, lead adoption and support business teams." }, category: "Impact métier", icon: "briefcase-business", color: "rose", sortOrder: 90 },
] as const;

export const DEFAULT_COMPETENCY_RULES = [
  { competencyId: "prompt_engineering", sourceType: "lesson_completed", sourceKey: "*", label: "Leçon validée : bases du prompting", points: 0.5, minScore: null, sortOrder: 10 },
  { competencyId: "ai_solution_design", sourceType: "checkpoint_passed", sourceKey: "*", label: "Checkpoint validé : conception de solution", points: 1.5, minScore: 60, sortOrder: 20 },
  { competencyId: "ai_development", sourceType: "exercise_passed", sourceKey: "*", label: "Exercice pratique validé", points: 1.0, minScore: 70, sortOrder: 30 },
  { competencyId: "rag_knowledge", sourceType: "quiz_passed", sourceKey: "*", label: "Quiz de connaissances validé", points: 1.0, minScore: 66.67, sortOrder: 40 },
  { competencyId: "ai_orchestration", sourceType: "course_completed", sourceKey: "*", label: "Cours complété : orchestration de parcours", points: 2.0, minScore: null, sortOrder: 50 },
  { competencyId: "ai_devops", sourceType: "skill_badge", sourceKey: "*", label: "Badge de parcours obtenu", points: 1.5, minScore: null, sortOrder: 60 },
  { competencyId: "bi_ai", sourceType: "exercise_passed", sourceKey: "*", label: "Exercice de données validé", points: 1.0, minScore: 70, sortOrder: 70 },
  { competencyId: "ai_governance", sourceType: "certification", sourceKey: "*", label: "Certification obtenue", points: 2.0, minScore: null, sortOrder: 80 },
  { competencyId: "ai_business", sourceType: "certification", sourceKey: "*", label: "Certification obtenue : adoption et impact", points: 2.0, minScore: null, sortOrder: 90 },
] as const;

export function clampCompetencyLevel(points: number, maxPoints = 100) {
  return Math.max(0, Math.min(maxPoints, Math.round(points * 10) / 10));
}
