import { COMPETENCY_PATHS } from "./competencyProgression";

export type OrientationTargetLevel = "bronze" | "silver" | "gold";
export type OrientationGoal = {
  competencyId: string;
  targetLevel: OrientationTargetLevel;
};

export type OrientationQuestion = {
  id: string;
  competencyId: string;
  prompt: { fr: string; en: string };
  choices: Array<{ id: string; label: { fr: string; en: string } }>;
  correctChoiceId: string;
  rationale: { fr: string; en: string };
};

export const ORIENTATION_TARGETS: Record<OrientationTargetLevel, { points: number; label: { fr: string; en: string } }> = {
  bronze: { points: 10, label: { fr: "Bronze · autonomie de base", en: "Bronze · foundational autonomy" } },
  silver: { points: 35, label: { fr: "Argent · maîtrise opérationnelle", en: "Silver · operational proficiency" } },
  gold: { points: 70, label: { fr: "Or · maîtrise avancée", en: "Gold · advanced mastery" } },
};

export const ORIENTATION_QUESTION_BANK: OrientationQuestion[] = [
  {
    id: "prompt_engineering_01",
    competencyId: "prompt_engineering",
    prompt: { fr: "Pour obtenir une réponse fiable d’un modèle IA sur une tâche métier, quelle instruction apporte le plus de contexte utile ?", en: "To obtain a reliable answer from an AI model for a business task, which instruction provides the most useful context?" },
    choices: [
      { id: "a", label: { fr: "Réponds vite et précisément.", en: "Answer quickly and precisely." } },
      { id: "b", label: { fr: "Adopte le rôle demandé, utilise les données fournies, explicite les contraintes et le format attendu.", en: "Adopt the requested role, use the supplied data, state constraints, and specify the expected format." } },
      { id: "c", label: { fr: "Utilise le meilleur modèle disponible.", en: "Use the best available model." } },
    ],
    correctChoiceId: "b",
    rationale: { fr: "Un prompt robuste précise le contexte, les contraintes et le format de sortie.", en: "A robust prompt specifies context, constraints, and the output format." },
  },
  {
    id: "ai_solution_design_01",
    competencyId: "ai_solution_design",
    prompt: { fr: "Quelle étape doit précéder le choix d’un modèle IA dans un nouveau cas d’usage ?", en: "Which step should precede choosing an AI model for a new use case?" },
    choices: [
      { id: "a", label: { fr: "Cartographier le besoin, les données, les risques et le critère de succès.", en: "Map the need, data, risks, and success criterion." } },
      { id: "b", label: { fr: "Construire immédiatement une interface utilisateur.", en: "Immediately build a user interface." } },
      { id: "c", label: { fr: "Choisir le modèle le plus coûteux.", en: "Choose the most expensive model." } },
    ],
    correctChoiceId: "a",
    rationale: { fr: "Une solution utile part d’un besoin mesurable et de ses contraintes, pas du modèle.", en: "A useful solution starts from a measurable need and its constraints, not the model." },
  },
  {
    id: "ai_development_01",
    competencyId: "ai_development",
    prompt: { fr: "Quelle pratique rend une intégration API de modèle IA plus robuste en production ?", en: "Which practice makes an AI model API integration more robust in production?" },
    choices: [
      { id: "a", label: { fr: "Conserver la clé API dans le navigateur.", en: "Keep the API key in the browser." } },
      { id: "b", label: { fr: "Ajouter un contrôle des erreurs, des délais, des coûts et des réponses structurées côté serveur.", en: "Add server-side error handling, timeouts, cost controls, and structured responses." } },
      { id: "c", label: { fr: "Supprimer les journaux pour aller plus vite.", en: "Remove logs to go faster." } },
    ],
    correctChoiceId: "b",
    rationale: { fr: "Les intégrations production nécessitent un contrôle serveur, des limites et une gestion des échecs.", en: "Production integrations require server-side control, limits, and failure handling." },
  },
  {
    id: "rag_knowledge_01",
    competencyId: "rag_knowledge",
    prompt: { fr: "Dans un système RAG, quel mécanisme limite le risque de réponses non étayées ?", en: "In a RAG system, which mechanism helps limit unsupported answers?" },
    choices: [
      { id: "a", label: { fr: "Forcer le modèle à répondre sans source.", en: "Force the model to answer without sources." } },
      { id: "b", label: { fr: "Récupérer des passages pertinents, les citer et prévoir une réponse d’incertitude si le contexte manque.", en: "Retrieve relevant passages, cite them, and provide an uncertainty response when context is missing." } },
      { id: "c", label: { fr: "Augmenter seulement la longueur de la réponse.", en: "Only increase response length." } },
    ],
    correctChoiceId: "b",
    rationale: { fr: "La qualité RAG dépend du contexte récupéré, de la traçabilité et de la gestion du manque d’information.", en: "RAG quality depends on retrieved context, traceability, and handling missing information." },
  },
  {
    id: "ai_orchestration_01",
    competencyId: "ai_orchestration",
    prompt: { fr: "Quel composant garantit qu’un workflow automatisé ne poursuit pas une action après une donnée invalide ?", en: "Which component ensures an automated workflow does not continue after invalid data?" },
    choices: [
      { id: "a", label: { fr: "Une étape de validation et une branche d’exception avant l’action suivante.", en: "A validation step and an exception branch before the next action." } },
      { id: "b", label: { fr: "Une exécution sans journal.", en: "An execution without logs." } },
      { id: "c", label: { fr: "Un déclencheur lancé plusieurs fois.", en: "A trigger launched multiple times." } },
    ],
    correctChoiceId: "a",
    rationale: { fr: "L’orchestration fiable introduit des contrôles, des branches et des reprises explicites.", en: "Reliable orchestration introduces checks, branches, and explicit recovery paths." },
  },
  {
    id: "ai_devops_01",
    competencyId: "ai_devops",
    prompt: { fr: "Quel indicateur est le plus utile pour détecter une dégradation d’un service IA en production ?", en: "Which indicator is most useful for detecting degradation of an AI service in production?" },
    choices: [
      { id: "a", label: { fr: "Le nombre de diapositives du cours.", en: "The number of course slides." } },
      { id: "b", label: { fr: "La latence, le taux d’erreur et le coût par requête suivis dans le temps.", en: "Latency, error rate, and cost per request tracked over time." } },
      { id: "c", label: { fr: "La couleur de l’interface.", en: "The interface color." } },
    ],
    correctChoiceId: "b",
    rationale: { fr: "La fiabilité se pilote avec des métriques opérationnelles et des seuils d’alerte.", en: "Reliability is managed with operational metrics and alert thresholds." },
  },
  {
    id: "bi_ai_01",
    competencyId: "bi_ai",
    prompt: { fr: "Avant de partager un indicateur de marge avec une direction, quelle vérification est indispensable ?", en: "Before sharing a margin indicator with leadership, which verification is essential?" },
    choices: [
      { id: "a", label: { fr: "Vérifier la définition, la période, la devise et les données sources.", en: "Verify the definition, period, currency, and source data." } },
      { id: "b", label: { fr: "Choisir le graphique le plus coloré.", en: "Choose the most colorful chart." } },
      { id: "c", label: { fr: "Supprimer les valeurs atypiques sans les analyser.", en: "Remove outliers without analyzing them." } },
    ],
    correctChoiceId: "a",
    rationale: { fr: "Un reporting fiable exige des définitions stables et des données traçables.", en: "Reliable reporting requires stable definitions and traceable data." },
  },
  {
    id: "ai_governance_01",
    competencyId: "ai_governance",
    prompt: { fr: "Quel contrôle convient à une décision IA à impact élevé ?", en: "Which control is appropriate for a high-impact AI decision?" },
    choices: [
      { id: "a", label: { fr: "Un contrôle humain documenté, une traçabilité et une possibilité de recours.", en: "Documented human oversight, traceability, and a route for appeal." } },
      { id: "b", label: { fr: "Une décision automatique sans journal.", en: "An automated decision without logs." } },
      { id: "c", label: { fr: "Un modèle choisi uniquement sur sa popularité.", en: "A model chosen only for its popularity." } },
    ],
    correctChoiceId: "a",
    rationale: { fr: "La gouvernance responsable combine supervision humaine, auditabilité et recours.", en: "Responsible governance combines human oversight, auditability, and appeal." },
  },
  {
    id: "ai_business_01",
    competencyId: "ai_business",
    prompt: { fr: "Quel résultat démontre le mieux la valeur d’un cas d’usage IA métier ?", en: "Which outcome best demonstrates the value of a business AI use case?" },
    choices: [
      { id: "a", label: { fr: "Un objectif mesuré, par exemple une réduction vérifiée du délai de traitement avec qualité maintenue.", en: "A measured objective, such as a verified reduction in processing time with maintained quality." } },
      { id: "b", label: { fr: "Un grand nombre de mots dans le prompt.", en: "A large number of words in the prompt." } },
      { id: "c", label: { fr: "Un outil installé sans adoption des équipes.", en: "A tool installed without team adoption." } },
    ],
    correctChoiceId: "a",
    rationale: { fr: "L’adoption IA se mesure par l’impact, la qualité et l’appropriation des équipes.", en: "AI adoption is measured through impact, quality, and team ownership." },
  },
];

export type OrientationAssessmentAnswer = { questionId: string; choiceId: string };
export type OrientationRecommendation = {
  order: number;
  competencyId: string;
  currentPoints: number;
  diagnosticPoints: number;
  targetPoints: number;
  certificationId: string;
  reason: string;
  type: "foundation" | "target" | "advanced";
};

export function getOrientationQuestions(goals: OrientationGoal[]) {
  const ids = new Set(goals.map((goal) => goal.competencyId));
  return ORIENTATION_QUESTION_BANK.filter((question) => ids.has(question.competencyId));
}

export function getDiagnosticPoints(goals: OrientationGoal[], answers: OrientationAssessmentAnswer[]) {
  const answersByQuestion = new Map(answers.map((answer) => [answer.questionId, answer.choiceId]));
  return Object.fromEntries(goals.map((goal) => {
    const questions = ORIENTATION_QUESTION_BANK.filter((question) => question.competencyId === goal.competencyId);
    const correct = questions.filter((question) => answersByQuestion.get(question.id) === question.correctChoiceId).length;
    const ratio = questions.length ? correct / questions.length : 0;
    return [goal.competencyId, ratio >= 1 ? 35 : ratio >= 0.5 ? 10 : 0];
  }));
}

export function buildOrientationRecommendations(input: {
  goals: OrientationGoal[];
  competencyPoints: Record<string, number>;
  diagnosticPoints: Record<string, number>;
  wantsOfficialCertification: boolean;
  officialCertificationIds?: string[];
}) {
  const recommendations: OrientationRecommendation[] = [];
  const seen = new Set<string>();
  const add = (recommendation: Omit<OrientationRecommendation, "order">) => {
    if (seen.has(recommendation.certificationId)) return;
    seen.add(recommendation.certificationId);
    recommendations.push({ ...recommendation, order: recommendations.length + 1 });
  };

  for (const goal of input.goals) {
    const path = COMPETENCY_PATHS[goal.competencyId];
    if (!path) continue;
    const currentPoints = Math.max(0, Number(input.competencyPoints[goal.competencyId] || 0));
    const diagnosticPoints = Math.max(0, Number(input.diagnosticPoints[goal.competencyId] || 0));
    const assessedPoints = Math.max(currentPoints, diagnosticPoints);
    const targetPoints = ORIENTATION_TARGETS[goal.targetLevel].points;

    if (assessedPoints < 10 && path.certificationId !== "ia_pour_les_nuls") {
      add({
        competencyId: goal.competencyId,
        currentPoints,
        diagnosticPoints,
        targetPoints,
        certificationId: "ia_pour_les_nuls",
        type: "foundation",
        reason: "Consolider les fondamentaux avant la spécialisation choisie.",
      });
    }

    if (assessedPoints < targetPoints || input.wantsOfficialCertification || input.officialCertificationIds?.includes(path.certificationId)) {
      add({
        competencyId: goal.competencyId,
        currentPoints,
        diagnosticPoints,
        targetPoints,
        certificationId: path.certificationId,
        type: "target",
        reason: assessedPoints >= targetPoints
          ? "Préparer la certification ou approfondir la compétence choisie."
          : "Réduire l’écart entre le niveau actuel et l’objectif déclaré.",
      });
    }

    if (goal.targetLevel === "gold" && assessedPoints >= 35 && path.certificationId !== "claude_certified_architect_professional") {
      add({
        competencyId: goal.competencyId,
        currentPoints,
        diagnosticPoints,
        targetPoints,
        certificationId: "claude_certified_architect_professional",
        type: "advanced",
        reason: "Approfondir la conception, la gouvernance et les pratiques de niveau professionnel.",
      });
    }
  }

  return recommendations;
}
