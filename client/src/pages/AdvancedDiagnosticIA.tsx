import { useState, useCallback, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Brain,
  Cpu,
  Network,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Layers,
  GitBranch,
  Bot,
  MessageSquare,
  Code2,
  Monitor,
  Database,
  Search,
  Settings,
  DollarSign,
  Clock,
  Users,
  Shield,
  Lightbulb,
  Download,
  ChevronDown,
  ChevronUp,
  Workflow,
  CircleDot,
  ArrowDownRight,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   TYPES — Advanced BPMN Diagnostic
   ═══════════════════════════════════════════════════════════════ */

interface UnitProcess {
  id: string;
  name: string;
  description: string;
  type: "manual" | "semi_auto" | "automated" | "decision" | "communication" | "data_processing" | "document" | "validation";
  inputs: string;
  outputs: string;
  actor: string;
  frequency: "continuous" | "daily" | "weekly" | "monthly" | "on_demand";
  volumePerMonth: string;
  avgDurationMinutes: string;
  dataTypes: string[];
  complexity: "low" | "medium" | "high" | "very_high";
  errorRate: "none" | "low" | "medium" | "high";
  currentTools: string;
  painPoints: string[];
  requiresJudgment: boolean;
  requiresCreativity: boolean;
  requiresEmpathy: boolean;
  hasStructuredRules: boolean;
  dataVolume: "small" | "medium" | "large" | "very_large";
  confidentiality: "public" | "internal" | "confidential" | "highly_sensitive";
}

interface SubProcess {
  id: string;
  name: string;
  description: string;
  unitProcesses: UnitProcess[];
}

interface GlobalProcess {
  name: string;
  description: string;
  domain: string;
  owner: string;
  department: string;
  objective: string;
  currentPerformance: string;
  subProcesses: SubProcess[];
}

interface AIRecommendation {
  processId: string;
  processName: string;
  approach: "no_ai" | "claude_chat" | "api_simple" | "api_chain" | "api_rag" | "api_fine_tuning" | "agent_autonomous" | "computer_use" | "custom_model";
  approachLabel: { en: string; fr: string };
  approachDescription: { en: string; fr: string };
  model: {
    name: string;
    reasoning: boolean;
    extendedThinking: boolean;
    justification: { en: string; fr: string };
  };
  accessMode: {
    primary: string;
    alternatives: string[];
    justification: { en: string; fr: string };
  };
  architecture: {
    type: string;
    components: string[];
    description: { en: string; fr: string };
  };
  autonomyLevel: {
    level: "human_in_loop" | "light_supervision" | "full_autonomous";
    label: { en: string; fr: string };
    justification: { en: string; fr: string };
  };
  ragConfig?: {
    needed: boolean;
    documentVolume: string;
    embeddingModel: string;
    chunkingStrategy: string;
    vectorDB: string;
    estimatedSetupDays: number;
    estimatedCost: string;
  };
  fineTuning?: {
    needed: boolean;
    datasetSize: string;
    estimatedCost: string;
    estimatedTimeline: string;
    justification: { en: string; fr: string };
  };
  costEstimation: {
    tokensPerMonth: string;
    apiCostPerMonth: string;
    infrastructureCost: string;
    totalMonthlyCost: string;
    setupCost: string;
  };
  implementationTimeline: string;
  confidenceLevel: "high" | "medium" | "low";
  risks: string[];
  prerequisites: string[];
}

interface ProjectionResult {
  processId: string;
  processName: string;
  currentState: {
    duration: string;
    cost: string;
    errorRate: string;
    satisfaction: string;
  };
  projectedState: {
    duration: string;
    cost: string;
    errorRate: string;
    satisfaction: string;
  };
  gains: {
    timeReduction: string;
    costReduction: string;
    qualityImprovement: string;
    capacityIncrease: string;
  };
  newRole: "eliminated" | "augmented" | "supervised" | "unchanged";
  newRoleLabel: { en: string; fr: string };
}

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const PROCESS_TYPES = [
  { id: "manual", label: { en: "Manual task", fr: "Tâche manuelle" }, icon: "✋" },
  { id: "semi_auto", label: { en: "Semi-automated", fr: "Semi-automatisé" }, icon: "⚙️" },
  { id: "automated", label: { en: "Automated", fr: "Automatisé" }, icon: "🤖" },
  { id: "decision", label: { en: "Decision point", fr: "Point de décision" }, icon: "◇" },
  { id: "communication", label: { en: "Communication", fr: "Communication" }, icon: "💬" },
  { id: "data_processing", label: { en: "Data processing", fr: "Traitement de données" }, icon: "📊" },
  { id: "document", label: { en: "Document handling", fr: "Gestion documentaire" }, icon: "📄" },
  { id: "validation", label: { en: "Validation/Approval", fr: "Validation/Approbation" }, icon: "✓" },
];

const FREQUENCIES = [
  { id: "continuous", label: { en: "Continuous (multiple/day)", fr: "Continue (plusieurs/jour)" } },
  { id: "daily", label: { en: "Daily", fr: "Quotidienne" } },
  { id: "weekly", label: { en: "Weekly", fr: "Hebdomadaire" } },
  { id: "monthly", label: { en: "Monthly", fr: "Mensuelle" } },
  { id: "on_demand", label: { en: "On demand", fr: "À la demande" } },
];

const DATA_TYPES_OPTIONS = [
  { id: "text_docs", label: { en: "Text documents", fr: "Documents texte" } },
  { id: "emails", label: { en: "Emails", fr: "Emails" } },
  { id: "spreadsheets", label: { en: "Spreadsheets/Tables", fr: "Tableurs/Tableaux" } },
  { id: "database", label: { en: "Database records", fr: "Base de données" } },
  { id: "images", label: { en: "Images/Scans", fr: "Images/Scans" } },
  { id: "pdf", label: { en: "PDF files", fr: "Fichiers PDF" } },
  { id: "audio", label: { en: "Audio/Voice", fr: "Audio/Voix" } },
  { id: "web_data", label: { en: "Web data/APIs", fr: "Données web/APIs" } },
  { id: "forms", label: { en: "Structured forms", fr: "Formulaires structurés" } },
  { id: "code", label: { en: "Source code", fr: "Code source" } },
];

const PAIN_POINTS_OPTIONS = [
  { id: "slow", label: { en: "Too slow", fr: "Trop lent" } },
  { id: "errors", label: { en: "Frequent errors", fr: "Erreurs fréquentes" } },
  { id: "repetitive", label: { en: "Highly repetitive", fr: "Très répétitif" } },
  { id: "bottleneck", label: { en: "Bottleneck", fr: "Goulot d'étranglement" } },
  { id: "costly", label: { en: "High cost", fr: "Coût élevé" } },
  { id: "inconsistent", label: { en: "Inconsistent results", fr: "Résultats incohérents" } },
  { id: "manual_entry", label: { en: "Manual data entry", fr: "Saisie manuelle" } },
  { id: "waiting", label: { en: "Long wait times", fr: "Temps d'attente longs" } },
  { id: "lack_visibility", label: { en: "Lack of visibility", fr: "Manque de visibilité" } },
  { id: "compliance_risk", label: { en: "Compliance risk", fr: "Risque de conformité" } },
];

const DOMAINS = [
  { id: "operations", label: { en: "Operations", fr: "Opérations" } },
  { id: "finance", label: { en: "Finance & Accounting", fr: "Finance & Comptabilité" } },
  { id: "hr", label: { en: "Human Resources", fr: "Ressources Humaines" } },
  { id: "sales", label: { en: "Sales & Marketing", fr: "Ventes & Marketing" } },
  { id: "it", label: { en: "IT & Technology", fr: "IT & Technologie" } },
  { id: "legal", label: { en: "Legal & Compliance", fr: "Juridique & Conformité" } },
  { id: "customer_service", label: { en: "Customer Service", fr: "Service Client" } },
  { id: "supply_chain", label: { en: "Supply Chain", fr: "Supply Chain" } },
  { id: "production", label: { en: "Production", fr: "Production" } },
  { id: "quality", label: { en: "Quality", fr: "Qualité" } },
];

/* ═══════════════════════════════════════════════════════════════
   AI RECOMMENDATION ENGINE
   Based on Anthropic courses methodology + DATAS/DADAS standard
   ═══════════════════════════════════════════════════════════════ */

function generateRecommendation(up: UnitProcess): AIRecommendation {
  // Decision matrix based on process characteristics
  const isHighVolume = parseInt(up.volumePerMonth || "0") > 500 || up.frequency === "continuous" || up.frequency === "daily";
  const isRepetitive = up.hasStructuredRules && !up.requiresCreativity && !up.requiresEmpathy;
  const needsJudgment = up.requiresJudgment;
  const needsCreativity = up.requiresCreativity;
  const needsEmpathy = up.requiresEmpathy;
  const isComplex = up.complexity === "high" || up.complexity === "very_high";
  const hasDocuments = up.dataTypes.some(d => ["text_docs", "pdf", "emails"].includes(d));
  const hasStructuredData = up.dataTypes.some(d => ["database", "spreadsheets", "forms"].includes(d));
  const hasImages = up.dataTypes.includes("images");
  const hasAudio = up.dataTypes.includes("audio");
  const hasCode = up.dataTypes.includes("code");
  const isHighError = up.errorRate === "high" || up.errorRate === "medium";
  const isLargeData = up.dataVolume === "large" || up.dataVolume === "very_large";
  const isSensitive = up.confidentiality === "highly_sensitive" || up.confidentiality === "confidential";
  const isMultiStep = up.type === "data_processing" || up.type === "document" || up.type === "validation";

  // ─── Determine AI Approach ───
  let approach: AIRecommendation["approach"] = "no_ai";
  let approachLabel = { en: "No AI needed", fr: "Pas d'IA nécessaire" };
  let approachDescription = { en: "This task is best handled by existing tools or human expertise.", fr: "Cette tâche est mieux gérée par les outils existants ou l'expertise humaine." };

  if (needsEmpathy && !isRepetitive && up.type === "communication") {
    approach = "claude_chat";
    approachLabel = { en: "Claude Chat (Assisted)", fr: "Claude Chat (Assisté)" };
    approachDescription = { en: "Human uses Claude.ai as a co-pilot for drafting, reviewing, and improving communications while maintaining empathy and personal touch.", fr: "L'humain utilise Claude.ai comme co-pilote pour rédiger, relire et améliorer les communications tout en maintenant l'empathie et la touche personnelle." };
  } else if (isRepetitive && isHighVolume && hasStructuredData && !needsJudgment) {
    approach = "agent_autonomous";
    approachLabel = { en: "Autonomous AI Agent", fr: "Agent IA Autonome" };
    approachDescription = { en: "Fully autonomous multi-step agent that processes tasks end-to-end with minimal human oversight. Ideal for high-volume, rule-based workflows.", fr: "Agent multi-étapes entièrement autonome qui traite les tâches de bout en bout avec une supervision humaine minimale. Idéal pour les workflows à haut volume basés sur des règles." };
  } else if (hasDocuments && isLargeData && (up.type === "data_processing" || up.type === "document")) {
    approach = "api_rag";
    approachLabel = { en: "API + RAG (Retrieval-Augmented Generation)", fr: "API + RAG (Génération Augmentée par Récupération)" };
    approachDescription = { en: "Claude API with a vector database for semantic search over large document collections. Enables contextual answers grounded in your specific knowledge base.", fr: "API Claude avec base vectorielle pour la recherche sémantique sur de grandes collections de documents. Permet des réponses contextuelles ancrées dans votre base de connaissances spécifique." };
  } else if (isRepetitive && isHighVolume && isSensitive && hasStructuredData) {
    approach = "api_fine_tuning";
    approachLabel = { en: "API + Fine-tuning / Custom Model", fr: "API + Fine-tuning / Modèle Personnalisé" };
    approachDescription = { en: "A fine-tuned model trained on your specific data patterns for maximum accuracy on domain-specific tasks. Best when standard prompting isn't sufficient.", fr: "Un modèle fine-tuné entraîné sur vos patterns de données spécifiques pour une précision maximale sur les tâches du domaine. Optimal quand le prompting standard ne suffit pas." };
  } else if (isMultiStep && (hasDocuments || hasStructuredData) && isComplex) {
    approach = "api_chain";
    approachLabel = { en: "API Chain of Prompts", fr: "API Chaîne de Prompts" };
    approachDescription = { en: "Sequential Claude API calls where each step's output feeds the next. Breaks complex tasks into manageable sub-tasks for higher accuracy.", fr: "Appels séquentiels à l'API Claude où la sortie de chaque étape alimente la suivante. Décompose les tâches complexes en sous-tâches gérables pour une meilleure précision." };
  } else if (hasCode || (up.type === "data_processing" && hasStructuredData && !isHighVolume)) {
    approach = "computer_use";
    approachLabel = { en: "Claude Computer Use / Claude Code", fr: "Claude Computer Use / Claude Code" };
    approachDescription = { en: "Claude interacts directly with desktop applications, IDEs, or command-line tools. Ideal for tasks requiring interaction with existing software interfaces.", fr: "Claude interagit directement avec les applications bureau, IDEs ou outils en ligne de commande. Idéal pour les tâches nécessitant une interaction avec les interfaces logicielles existantes." };
  } else if (isRepetitive && hasStructuredData && !isComplex) {
    approach = "api_simple";
    approachLabel = { en: "Simple API Call", fr: "Appel API Simple" };
    approachDescription = { en: "Direct Claude API call with a well-crafted system prompt. Fast, cost-effective for straightforward classification, extraction, or generation tasks.", fr: "Appel direct à l'API Claude avec un system prompt bien conçu. Rapide et économique pour les tâches simples de classification, extraction ou génération." };
  } else if (needsJudgment && !isRepetitive && needsCreativity) {
    approach = "claude_chat";
    approachLabel = { en: "Claude Chat (Interactive)", fr: "Claude Chat (Interactif)" };
    approachDescription = { en: "Human collaborates with Claude.ai in real-time for complex analysis, creative tasks, and decisions requiring nuanced judgment.", fr: "L'humain collabore avec Claude.ai en temps réel pour l'analyse complexe, les tâches créatives et les décisions nécessitant un jugement nuancé." };
  } else if (needsJudgment && hasDocuments) {
    approach = "api_simple";
    approachLabel = { en: "API with Extended Thinking", fr: "API avec Réflexion Étendue" };
    approachDescription = { en: "Claude API with extended thinking enabled for complex reasoning tasks that require deep analysis before producing an answer.", fr: "API Claude avec réflexion étendue activée pour les tâches de raisonnement complexe nécessitant une analyse approfondie avant de produire une réponse." };
  }

  // ─── Determine Model ───
  let modelName = "Claude Sonnet 4";
  let reasoning = false;
  let extendedThinking = false;
  let modelJustification = { en: "", fr: "" };

  if (approach === "no_ai") {
    modelName = "N/A";
    modelJustification = { en: "No AI model needed for this task.", fr: "Aucun modèle IA nécessaire pour cette tâche." };
  } else if (approach === "agent_autonomous" || (isComplex && needsJudgment)) {
    modelName = "Claude Sonnet 4";
    reasoning = true;
    extendedThinking = true;
    modelJustification = {
      en: "Sonnet 4 with extended thinking: best balance of intelligence, speed, and cost for autonomous agents. Extended thinking enables complex multi-step reasoning.",
      fr: "Sonnet 4 avec réflexion étendue : meilleur équilibre intelligence/vitesse/coût pour les agents autonomes. La réflexion étendue permet un raisonnement multi-étapes complexe."
    };
  } else if (approach === "api_fine_tuning") {
    modelName = "Claude Haiku (fine-tuned)";
    reasoning = false;
    extendedThinking = false;
    modelJustification = {
      en: "Haiku fine-tuned: fastest and cheapest model, ideal when fine-tuning compensates for smaller model size. Maximizes throughput for high-volume tasks.",
      fr: "Haiku fine-tuné : modèle le plus rapide et économique, idéal quand le fine-tuning compense la taille réduite. Maximise le débit pour les tâches à haut volume."
    };
  } else if (isComplex && hasDocuments && isLargeData) {
    modelName = "Claude Opus 4";
    reasoning = true;
    extendedThinking = true;
    modelJustification = {
      en: "Opus 4: most powerful model for complex analysis requiring deep understanding of large document collections. Extended thinking for thorough reasoning.",
      fr: "Opus 4 : modèle le plus puissant pour l'analyse complexe nécessitant une compréhension approfondie de grandes collections documentaires. Réflexion étendue pour un raisonnement approfondi."
    };
  } else if (isHighVolume && !isComplex) {
    modelName = "Claude Haiku 3.5";
    reasoning = false;
    extendedThinking = false;
    modelJustification = {
      en: "Haiku 3.5: fastest response time and lowest cost per token. Perfect for high-volume, straightforward tasks where speed matters more than deep reasoning.",
      fr: "Haiku 3.5 : temps de réponse le plus rapide et coût par token le plus bas. Parfait pour les tâches à haut volume et simples où la vitesse prime sur le raisonnement profond."
    };
  } else if (needsCreativity || approach === "claude_chat") {
    modelName = "Claude Sonnet 4";
    reasoning = true;
    extendedThinking = false;
    modelJustification = {
      en: "Sonnet 4: excellent creative capabilities with strong reasoning. Best for interactive collaboration where quality and nuance matter.",
      fr: "Sonnet 4 : excellentes capacités créatives avec un raisonnement solide. Optimal pour la collaboration interactive où la qualité et la nuance comptent."
    };
  } else {
    modelName = "Claude Sonnet 4";
    reasoning = false;
    extendedThinking = false;
    modelJustification = {
      en: "Sonnet 4: best general-purpose model balancing capability, speed, and cost. Handles most business tasks effectively.",
      fr: "Sonnet 4 : meilleur modèle polyvalent équilibrant capacité, vitesse et coût. Gère efficacement la plupart des tâches métier."
    };
  }

  // ─── Determine Access Mode ───
  let primaryAccess = "";
  let alternatives: string[] = [];
  let accessJustification = { en: "", fr: "" };

  if (approach === "claude_chat") {
    primaryAccess = "Claude.ai (Pro/Team)";
    alternatives = ["Claude for Enterprise", "API via custom UI"];
    accessJustification = {
      en: "Direct Claude.ai interface for interactive use. Team plan for collaboration features, Enterprise for SSO and admin controls.",
      fr: "Interface Claude.ai directe pour usage interactif. Plan Team pour les fonctionnalités de collaboration, Enterprise pour SSO et contrôles admin."
    };
  } else if (approach === "computer_use") {
    primaryAccess = "Claude Code (CLI) / Computer Use API";
    alternatives = ["Amazon Bedrock + Computer Use", "Anthropic API direct"];
    accessJustification = {
      en: "Claude Code CLI for development tasks, Computer Use API for desktop automation. Both provide direct interaction with software interfaces.",
      fr: "Claude Code CLI pour les tâches de développement, API Computer Use pour l'automatisation bureau. Les deux permettent l'interaction directe avec les interfaces logicielles."
    };
  } else if (approach === "agent_autonomous") {
    primaryAccess = "Anthropic API (SDK Python/TypeScript)";
    alternatives = ["Amazon Bedrock", "Google Vertex AI", "Custom orchestration framework"];
    accessJustification = {
      en: "Direct SDK for maximum control over agent loops, tool use, and error handling. Bedrock/Vertex for enterprise compliance requirements.",
      fr: "SDK direct pour un contrôle maximal sur les boucles d'agent, l'utilisation d'outils et la gestion d'erreurs. Bedrock/Vertex pour les exigences de conformité entreprise."
    };
  } else if (approach === "api_rag" || approach === "api_chain" || approach === "api_simple") {
    primaryAccess = "Anthropic API (SDK TypeScript/Python)";
    alternatives = ["Amazon Bedrock", "Google Vertex AI"];
    accessJustification = {
      en: "Direct API via official SDK for best performance and latest features. Cloud providers as alternatives for existing infrastructure integration.",
      fr: "API directe via SDK officiel pour les meilleures performances et dernières fonctionnalités. Fournisseurs cloud comme alternatives pour l'intégration d'infrastructure existante."
    };
  } else if (approach === "api_fine_tuning") {
    primaryAccess = "Anthropic Fine-tuning API (Private Beta)";
    alternatives = ["Amazon Bedrock Custom Model", "Google Vertex AI Tuning"];
    accessJustification = {
      en: "Anthropic's fine-tuning program for custom Haiku models. Bedrock Custom Model as alternative with AWS infrastructure integration.",
      fr: "Programme de fine-tuning Anthropic pour modèles Haiku personnalisés. Bedrock Custom Model comme alternative avec intégration infrastructure AWS."
    };
  } else {
    primaryAccess = "N/A";
    alternatives = [];
    accessJustification = { en: "No AI access needed.", fr: "Aucun accès IA nécessaire." };
  }

  // ─── Determine Architecture ───
  let archType = "";
  let archComponents: string[] = [];
  let archDescription = { en: "", fr: "" };

  if (approach === "api_simple") {
    archType = extendedThinking ? "Single call + Extended Thinking" : "Single API call";
    archComponents = ["System prompt", "Input formatting", "Output parsing", extendedThinking ? "Thinking budget: 4096 tokens" : ""].filter(Boolean);
    archDescription = {
      en: extendedThinking
        ? "Single API call with extended thinking enabled. The model reasons internally before responding, improving accuracy on complex analysis."
        : "Direct API call with a well-structured system prompt. Input is formatted, sent to Claude, and the response is parsed into the expected output format.",
      fr: extendedThinking
        ? "Appel API unique avec réflexion étendue activée. Le modèle raisonne en interne avant de répondre, améliorant la précision sur l'analyse complexe."
        : "Appel API direct avec un system prompt bien structuré. L'entrée est formatée, envoyée à Claude, et la réponse est parsée dans le format de sortie attendu."
    };
  } else if (approach === "api_chain") {
    archType = "Prompt Chain (Sequential)";
    archComponents = ["Step 1: Analysis/Extraction", "Step 2: Processing/Transform", "Step 3: Validation/Output", "Error handling between steps", "State management"];
    archDescription = {
      en: "Sequential chain of 2-4 Claude API calls. Each step has a focused prompt, receives the previous step's output, and produces structured intermediate results. Includes validation gates between steps.",
      fr: "Chaîne séquentielle de 2-4 appels API Claude. Chaque étape a un prompt focalisé, reçoit la sortie de l'étape précédente et produit des résultats intermédiaires structurés. Inclut des portes de validation entre les étapes."
    };
  } else if (approach === "api_rag") {
    archType = "RAG Pipeline";
    archComponents = ["Document ingestion pipeline", "Embedding generation", "Vector store (search index)", "Query reformulation", "Context retrieval + ranking", "Claude generation with context", "Citation extraction"];
    archDescription = {
      en: "Full RAG pipeline: documents are chunked, embedded, and stored in a vector database. At query time, relevant chunks are retrieved, ranked, and injected as context into the Claude prompt for grounded generation.",
      fr: "Pipeline RAG complet : les documents sont découpés, vectorisés et stockés dans une base vectorielle. À la requête, les chunks pertinents sont récupérés, classés et injectés comme contexte dans le prompt Claude pour une génération ancrée."
    };
  } else if (approach === "agent_autonomous") {
    archType = "Autonomous Agent (Tool Use)";
    archComponents = ["Agent loop (observe-think-act)", "Tool definitions (APIs, DB, file system)", "Memory/state management", "Error recovery & retry logic", "Human escalation triggers", "Audit logging"];
    archDescription = {
      en: "Autonomous agent using Claude's tool use capability. The agent observes its environment, reasons about next steps, executes actions via tools, and iterates until the task is complete. Includes safety guardrails and escalation paths.",
      fr: "Agent autonome utilisant la capacité d'utilisation d'outils de Claude. L'agent observe son environnement, raisonne sur les prochaines étapes, exécute des actions via des outils et itère jusqu'à complétion. Inclut des garde-fous de sécurité et des chemins d'escalade."
    };
  } else if (approach === "api_fine_tuning") {
    archType = "Fine-tuned Model + Simple API";
    archComponents = ["Training data preparation (min 1000 examples)", "Data validation & cleaning", "Fine-tuning job submission", "Model evaluation & testing", "Production deployment", "Monitoring & retraining schedule"];
    archDescription = {
      en: "Custom fine-tuned model trained on your specific task patterns. After training, deployed as a simple API endpoint. Requires initial dataset preparation and periodic retraining as patterns evolve.",
      fr: "Modèle personnalisé fine-tuné sur vos patterns de tâches spécifiques. Après entraînement, déployé comme endpoint API simple. Nécessite une préparation initiale du dataset et un réentraînement périodique à mesure que les patterns évoluent."
    };
  } else if (approach === "computer_use") {
    archType = "Computer Use / Claude Code";
    archComponents = ["Desktop environment setup", "Screen capture & analysis", "Action execution (click, type, navigate)", "Task verification", "Error detection & recovery"];
    archDescription = {
      en: "Claude interacts with desktop applications through screen observation and action execution. Ideal for tasks requiring interaction with legacy systems or complex UIs that lack APIs.",
      fr: "Claude interagit avec les applications bureau via l'observation d'écran et l'exécution d'actions. Idéal pour les tâches nécessitant une interaction avec des systèmes legacy ou des interfaces complexes sans API."
    };
  } else if (approach === "claude_chat") {
    archType = "Interactive Chat";
    archComponents = ["Custom system prompt (Project)", "Knowledge base (Project files)", "Conversation history", "Artifacts for outputs"];
    archDescription = {
      en: "Human-in-the-loop collaboration via Claude.ai. Custom Projects with system prompts and knowledge files ensure consistent, domain-specific assistance.",
      fr: "Collaboration humain-dans-la-boucle via Claude.ai. Des Projets personnalisés avec system prompts et fichiers de connaissances assurent une assistance cohérente et spécifique au domaine."
    };
  } else {
    archType = "N/A";
    archComponents = [];
    archDescription = { en: "No AI architecture needed.", fr: "Aucune architecture IA nécessaire." };
  }

  // ─── Autonomy Level ───
  let autonomyLevel: AIRecommendation["autonomyLevel"]["level"] = "human_in_loop";
  let autonomyLabel = { en: "Human in the loop", fr: "Humain dans la boucle" };
  let autonomyJustification = { en: "", fr: "" };

  if (approach === "agent_autonomous" && !isSensitive && isRepetitive) {
    autonomyLevel = "full_autonomous";
    autonomyLabel = { en: "Fully autonomous", fr: "Entièrement autonome" };
    autonomyJustification = {
      en: "High-volume, rule-based task with low sensitivity. Agent can operate independently with periodic audits.",
      fr: "Tâche à haut volume, basée sur des règles, avec faible sensibilité. L'agent peut opérer indépendamment avec des audits périodiques."
    };
  } else if (approach === "agent_autonomous" || (approach === "api_chain" && !needsJudgment)) {
    autonomyLevel = "light_supervision";
    autonomyLabel = { en: "Light supervision", fr: "Supervision légère" };
    autonomyJustification = {
      en: "Automated processing with human review of exceptions and periodic quality checks (e.g., 5% sample review).",
      fr: "Traitement automatisé avec revue humaine des exceptions et contrôles qualité périodiques (ex: revue d'échantillon 5%)."
    };
  } else {
    autonomyLevel = "human_in_loop";
    autonomyLabel = { en: "Human in the loop", fr: "Humain dans la boucle" };
    autonomyJustification = {
      en: "Human reviews and validates AI outputs before action. AI augments human capability without replacing judgment.",
      fr: "L'humain revoit et valide les sorties IA avant action. L'IA augmente la capacité humaine sans remplacer le jugement."
    };
  }

  // ─── RAG Configuration ───
  let ragConfig: AIRecommendation["ragConfig"] = undefined;
  if (approach === "api_rag") {
    const docVolume = isLargeData ? "10,000+ documents" : "1,000-10,000 documents";
    ragConfig = {
      needed: true,
      documentVolume: docVolume,
      embeddingModel: "Voyage AI (voyage-3) ou OpenAI text-embedding-3-large",
      chunkingStrategy: hasDocuments && hasStructuredData
        ? "Hybrid: semantic chunking for text + structured extraction for tables (chunk size: 512-1024 tokens)"
        : "Semantic chunking with overlap (chunk size: 512 tokens, overlap: 50 tokens)",
      vectorDB: isSensitive ? "PostgreSQL + pgvector (self-hosted)" : "Pinecone ou Weaviate (managed)",
      estimatedSetupDays: isLargeData ? 15 : 7,
      estimatedCost: isLargeData ? "2,000-5,000€ setup + 200-500€/mois" : "500-1,500€ setup + 50-150€/mois",
    };
  }

  // ─── Fine-tuning Configuration ───
  let fineTuning: AIRecommendation["fineTuning"] = undefined;
  if (approach === "api_fine_tuning") {
    fineTuning = {
      needed: true,
      datasetSize: isHighVolume ? "5,000-10,000 exemples annotés" : "1,000-3,000 exemples annotés",
      estimatedCost: isHighVolume ? "5,000-15,000€ (entraînement) + 500-1,000€/mois (inférence)" : "2,000-5,000€ (entraînement) + 200-500€/mois (inférence)",
      estimatedTimeline: "4-8 semaines (collecte données + entraînement + validation)",
      justification: {
        en: "Fine-tuning recommended because: (1) task is highly domain-specific, (2) standard prompting doesn't achieve required accuracy, (3) high volume justifies the investment, (4) patterns are stable enough for a trained model.",
        fr: "Fine-tuning recommandé car : (1) tâche très spécifique au domaine, (2) le prompting standard n'atteint pas la précision requise, (3) le volume élevé justifie l'investissement, (4) les patterns sont suffisamment stables pour un modèle entraîné."
      },
    };
  }

  // ─── Cost Estimation ───
  const volumeNum = parseInt(up.volumePerMonth || "100");
  let tokensPerCall = 2000; // average
  if (isComplex || hasDocuments) tokensPerCall = 4000;
  if (approach === "api_rag") tokensPerCall = 6000;
  if (approach === "api_chain") tokensPerCall = 8000;
  if (approach === "agent_autonomous") tokensPerCall = 15000;

  const totalTokensMonth = volumeNum * tokensPerCall;
  let costPerMToken = 3; // Sonnet default $/M tokens (input)
  if (modelName.includes("Haiku")) costPerMToken = 0.25;
  if (modelName.includes("Opus")) costPerMToken = 15;
  const apiCost = (totalTokensMonth / 1000000) * costPerMToken * 2; // input + output roughly

  let infraCost = "0€";
  if (approach === "api_rag") infraCost = isLargeData ? "300-500€/mois" : "50-150€/mois";
  if (approach === "agent_autonomous") infraCost = "100-300€/mois (orchestration + monitoring)";

  const costEstimation: AIRecommendation["costEstimation"] = {
    tokensPerMonth: approach === "no_ai" ? "N/A" : `~${(totalTokensMonth / 1000).toFixed(0)}K tokens`,
    apiCostPerMonth: approach === "no_ai" ? "N/A" : `~${Math.max(apiCost, 1).toFixed(0)}-${Math.max(apiCost * 2, 5).toFixed(0)}€`,
    infrastructureCost: approach === "no_ai" ? "N/A" : infraCost,
    totalMonthlyCost: approach === "no_ai" ? "N/A" : `~${Math.max(apiCost + 50, 10).toFixed(0)}-${Math.max(apiCost * 2 + 200, 50).toFixed(0)}€/mois`,
    setupCost: approach === "no_ai" ? "N/A"
      : approach === "api_rag" ? (isLargeData ? "5,000-10,000€" : "2,000-5,000€")
      : approach === "api_fine_tuning" ? "5,000-15,000€"
      : approach === "agent_autonomous" ? "3,000-8,000€"
      : approach === "api_chain" ? "1,000-3,000€"
      : approach === "computer_use" ? "2,000-5,000€"
      : "500-2,000€",
  };

  // ─── Timeline ───
  let timeline = "N/A";
  if (approach === "claude_chat") timeline = "1-2 semaines (configuration Project + formation)";
  else if (approach === "api_simple") timeline = "2-4 semaines (développement + tests)";
  else if (approach === "api_chain") timeline = "4-6 semaines (développement + intégration)";
  else if (approach === "api_rag") timeline = "6-10 semaines (ingestion + développement + tests)";
  else if (approach === "api_fine_tuning") timeline = "8-12 semaines (données + entraînement + déploiement)";
  else if (approach === "agent_autonomous") timeline = "8-14 semaines (architecture + développement + tests sécurité)";
  else if (approach === "computer_use") timeline = "4-8 semaines (setup + scripting + tests)";

  // ─── Risks ───
  const risks: string[] = [];
  if (approach === "agent_autonomous") {
    risks.push(up.confidentiality === "highly_sensitive" ? "Risque de fuite de données sensibles" : "Erreurs en cascade sans supervision");
    risks.push("Coûts imprévisibles si boucles infinies");
  }
  if (approach === "api_rag") risks.push("Qualité dépend de la qualité des documents source");
  if (approach === "api_fine_tuning") risks.push("Nécessite maintenance continue du dataset");
  if (isSensitive) risks.push("Données sensibles : vérifier conformité RGPD/réglementaire");
  if (isHighVolume) risks.push("Surveiller les coûts API à l'échelle");
  if (risks.length === 0 && approach !== "no_ai") risks.push("Risque faible — solution éprouvée");

  // ─── Prerequisites ───
  const prerequisites: string[] = [];
  if (approach !== "no_ai" && approach !== "claude_chat") prerequisites.push("Compte API Anthropic actif");
  if (approach === "api_rag") prerequisites.push("Documents numérisés et accessibles", "Infrastructure vectorielle (Pinecone/pgvector)");
  if (approach === "api_fine_tuning") prerequisites.push("Dataset d'entraînement annoté (min 1000 exemples)", "Accès au programme fine-tuning Anthropic");
  if (approach === "agent_autonomous") prerequisites.push("Définition claire des outils/APIs disponibles", "Politique d'escalade documentée", "Environnement de test isolé");
  if (approach === "computer_use") prerequisites.push("Environnement desktop dédié", "Accès aux applications cibles");

  return {
    processId: up.id,
    processName: up.name,
    approach,
    approachLabel,
    approachDescription,
    model: { name: modelName, reasoning, extendedThinking, justification: modelJustification },
    accessMode: { primary: primaryAccess, alternatives, justification: accessJustification },
    architecture: { type: archType, components: archComponents, description: archDescription },
    autonomyLevel: { level: autonomyLevel, label: autonomyLabel, justification: autonomyJustification },
    ragConfig,
    fineTuning,
    costEstimation,
    implementationTimeline: timeline,
    confidenceLevel: isRepetitive && hasStructuredData ? "high" : isComplex ? "low" : "medium",
    risks,
    prerequisites,
  };
}

/* ═══════════════════════════════════════════════════════════════
   PROJECTION ENGINE — Post-implementation design
   ═══════════════════════════════════════════════════════════════ */

function generateProjection(up: UnitProcess, recommendation: AIRecommendation): ProjectionResult {
  const avgDuration = parseInt(up.avgDurationMinutes || "30");
  const volume = parseInt(up.volumePerMonth || "100");

  // Current state
  const currentDuration = `${avgDuration} min/traitement`;
  const currentMonthlyCost = `${Math.round(avgDuration * volume * 0.5 / 60)}h/mois de travail humain`;
  const errorRateMap: Record<string, string> = { none: "0%", low: "1-2%", medium: "3-5%", high: "8-15%" };
  const currentErrorRate = errorRateMap[up.errorRate] || "N/A";

  // Projected state based on recommendation
  let timeReductionPct = 0;
  let costReductionPct = 0;
  let qualityImprovementPct = 0;
  let capacityIncreasePct = 0;
  let newRole: ProjectionResult["newRole"] = "unchanged";
  let newRoleLabel = { en: "Unchanged", fr: "Inchangé" };

  switch (recommendation.approach) {
    case "no_ai":
      timeReductionPct = 0;
      costReductionPct = 0;
      qualityImprovementPct = 0;
      capacityIncreasePct = 0;
      newRole = "unchanged";
      newRoleLabel = { en: "Unchanged — no AI intervention", fr: "Inchangé — pas d'intervention IA" };
      break;
    case "claude_chat":
      timeReductionPct = 20 + Math.random() * 15;
      costReductionPct = 10 + Math.random() * 10;
      qualityImprovementPct = 15 + Math.random() * 20;
      capacityIncreasePct = 25 + Math.random() * 15;
      newRole = "augmented";
      newRoleLabel = { en: "Augmented — human + AI co-pilot", fr: "Augmenté — humain + co-pilote IA" };
      break;
    case "api_simple":
      timeReductionPct = 50 + Math.random() * 20;
      costReductionPct = 40 + Math.random() * 15;
      qualityImprovementPct = 30 + Math.random() * 20;
      capacityIncreasePct = 100 + Math.random() * 50;
      newRole = "supervised";
      newRoleLabel = { en: "Supervised — AI executes, human validates", fr: "Supervisé — l'IA exécute, l'humain valide" };
      break;
    case "api_chain":
      timeReductionPct = 60 + Math.random() * 15;
      costReductionPct = 45 + Math.random() * 15;
      qualityImprovementPct = 40 + Math.random() * 20;
      capacityIncreasePct = 150 + Math.random() * 100;
      newRole = "supervised";
      newRoleLabel = { en: "Supervised — AI chain processes, human reviews", fr: "Supervisé — chaîne IA traite, l'humain revoit" };
      break;
    case "api_rag":
      timeReductionPct = 65 + Math.random() * 15;
      costReductionPct = 50 + Math.random() * 15;
      qualityImprovementPct = 50 + Math.random() * 20;
      capacityIncreasePct = 200 + Math.random() * 100;
      newRole = "supervised";
      newRoleLabel = { en: "Supervised — RAG retrieves & generates, human validates", fr: "Supervisé — RAG récupère & génère, l'humain valide" };
      break;
    case "api_fine_tuning":
      timeReductionPct = 75 + Math.random() * 10;
      costReductionPct = 60 + Math.random() * 15;
      qualityImprovementPct = 60 + Math.random() * 20;
      capacityIncreasePct = 300 + Math.random() * 200;
      newRole = "eliminated";
      newRoleLabel = { en: "Eliminated — fully automated with custom model", fr: "Éliminé — entièrement automatisé avec modèle personnalisé" };
      break;
    case "agent_autonomous":
      timeReductionPct = 85 + Math.random() * 10;
      costReductionPct = 70 + Math.random() * 15;
      qualityImprovementPct = 50 + Math.random() * 25;
      capacityIncreasePct = 500 + Math.random() * 300;
      newRole = "eliminated";
      newRoleLabel = { en: "Eliminated — autonomous agent handles end-to-end", fr: "Éliminé — agent autonome gère de bout en bout" };
      break;
    case "computer_use":
      timeReductionPct = 55 + Math.random() * 20;
      costReductionPct = 40 + Math.random() * 20;
      qualityImprovementPct = 35 + Math.random() * 15;
      capacityIncreasePct = 100 + Math.random() * 100;
      newRole = "augmented";
      newRoleLabel = { en: "Augmented — Claude operates tools, human oversees", fr: "Augmenté — Claude opère les outils, l'humain supervise" };
      break;
    default:
      break;
  }

  const projectedDuration = `${Math.max(1, Math.round(avgDuration * (1 - timeReductionPct / 100)))} min/traitement`;
  const projectedCost = `${Math.max(1, Math.round(avgDuration * volume * 0.5 / 60 * (1 - costReductionPct / 100)))}h/mois + coût IA`;

  return {
    processId: up.id,
    processName: up.name,
    currentState: {
      duration: currentDuration,
      cost: currentMonthlyCost,
      errorRate: currentErrorRate,
      satisfaction: up.painPoints.length > 3 ? "Faible" : up.painPoints.length > 1 ? "Moyenne" : "Bonne",
    },
    projectedState: {
      duration: projectedDuration,
      cost: projectedCost,
      errorRate: `${Math.max(0, parseFloat(currentErrorRate) * (1 - qualityImprovementPct / 100)).toFixed(1)}%`,
      satisfaction: qualityImprovementPct > 40 ? "Excellente" : qualityImprovementPct > 20 ? "Bonne" : "Améliorée",
    },
    gains: {
      timeReduction: `${Math.round(timeReductionPct)}%`,
      costReduction: `${Math.round(costReductionPct)}%`,
      qualityImprovement: `${Math.round(qualityImprovementPct)}%`,
      capacityIncrease: `+${Math.round(capacityIncreasePct)}%`,
    },
    newRole,
    newRoleLabel,
  };
}

/* ═══════════════════════════════════════════════════════════════
   HELPER — Generate unique IDs
   ═══════════════════════════════════════════════════════════════ */
let idCounter = 0;
function genId() { return `up_${Date.now()}_${++idCounter}`; }
function genSubId() { return `sp_${Date.now()}_${++idCounter}`; }

function createEmptyUnitProcess(): UnitProcess {
  return {
    id: genId(),
    name: "",
    description: "",
    type: "manual",
    inputs: "",
    outputs: "",
    actor: "",
    frequency: "daily",
    volumePerMonth: "100",
    avgDurationMinutes: "15",
    dataTypes: [],
    complexity: "medium",
    errorRate: "low",
    currentTools: "",
    painPoints: [],
    requiresJudgment: false,
    requiresCreativity: false,
    requiresEmpathy: false,
    hasStructuredRules: true,
    dataVolume: "medium",
    confidentiality: "internal",
  };
}

function createEmptySubProcess(): SubProcess {
  return {
    id: genSubId(),
    name: "",
    description: "",
    unitProcesses: [createEmptyUnitProcess()],
  };
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function AdvancedDiagnosticIA() {
  const { t, lang } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  // ─── State ───
  const [step, setStep] = useState(0); // 0: process definition, 1: sub-process detail, 2: unit process evaluation, 3: results, 4: projection
  const [globalProcess, setGlobalProcess] = useState<GlobalProcess>({
    name: "",
    description: "",
    domain: "",
    owner: "",
    department: "",
    objective: "",
    currentPerformance: "",
    subProcesses: [createEmptySubProcess()],
  });

  const [activeSubProcessIndex, setActiveSubProcessIndex] = useState(0);
  const [activeUnitProcessIndex, setActiveUnitProcessIndex] = useState(0);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [projections, setProjections] = useState<ProjectionResult[]>([]);
  const [expandedRec, setExpandedRec] = useState<Set<string>>(new Set());

  // ─── Auth gate ───
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">{t({ en: "Loading...", fr: "Chargement..." })}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-semibold">{t({ en: "Authentication required", fr: "Authentification requise" })}</h2>
          <p className="text-muted-foreground">{t({ en: "Please log in to access the Advanced AI Diagnostic.", fr: "Veuillez vous connecter pour accéder au Diagnostic IA Avancé." })}</p>
          <Link href="/login"><Button>{t({ en: "Log in", fr: "Se connecter" })}</Button></Link>
        </div>
      </div>
    );
  }

  // ─── Computed ───
  const allUnitProcesses = globalProcess.subProcesses.flatMap(sp => sp.unitProcesses);
  const totalSteps = 5;
  const progressPct = ((step + 1) / totalSteps) * 100;

  // ─── Handlers ───
  const runAnalysis = () => {
    const recs = allUnitProcesses.filter(up => up.name.trim()).map(up => generateRecommendation(up));
    setRecommendations(recs);
    const projs = allUnitProcesses.filter(up => up.name.trim()).map((up, i) => generateProjection(up, recs[i]));
    setProjections(projs);
    setStep(3);
  };

  const toggleRecExpand = (id: string) => {
    setExpandedRec(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ─── Step Labels ───
  const stepLabels = [
    { icon: <Workflow className="w-4 h-4" />, label: t({ en: "Global Process", fr: "Processus Global" }) },
    { icon: <GitBranch className="w-4 h-4" />, label: t({ en: "Sub-Processes", fr: "Sous-Processus" }) },
    { icon: <CircleDot className="w-4 h-4" />, label: t({ en: "Unit Tasks", fr: "Tâches Unitaires" }) },
    { icon: <Brain className="w-4 h-4" />, label: t({ en: "AI Recommendations", fr: "Recommandations IA" }) },
    { icon: <TrendingUp className="w-4 h-4" />, label: t({ en: "Projection", fr: "Projection" }) },
  ];

  /* ═══════════════════════════════════════════════════════════════
     RENDER — Step 0: Global Process Definition
     ═══════════════════════════════════════════════════════════════ */
  const renderStep0 = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-2">
          <Workflow className="w-5 h-5 text-primary" />
          {t({ en: "Define your global business process", fr: "Définissez votre processus métier global" })}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t({ en: "Describe the end-to-end process you want to evaluate for AI transformation. This will be decomposed into sub-processes and unit tasks.", fr: "Décrivez le processus de bout en bout que vous souhaitez évaluer pour la transformation IA. Il sera décomposé en sous-processus et tâches unitaires." })}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">{t({ en: "Process name", fr: "Nom du processus" })} *</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            placeholder={t({ en: "e.g., Customer onboarding", fr: "ex: Onboarding client" })}
            value={globalProcess.name}
            onChange={e => setGlobalProcess(p => ({ ...p, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">{t({ en: "Domain", fr: "Domaine" })} *</label>
          <select
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            value={globalProcess.domain}
            onChange={e => setGlobalProcess(p => ({ ...p, domain: e.target.value }))}
          >
            <option value="">{t({ en: "Select domain...", fr: "Sélectionner le domaine..." })}</option>
            {DOMAINS.map(d => <option key={d.id} value={d.id}>{t(d.label)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">{t({ en: "Process owner", fr: "Propriétaire du processus" })}</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            placeholder={t({ en: "e.g., Sales Director", fr: "ex: Directeur Commercial" })}
            value={globalProcess.owner}
            onChange={e => setGlobalProcess(p => ({ ...p, owner: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">{t({ en: "Department", fr: "Département" })}</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            placeholder={t({ en: "e.g., Sales & Marketing", fr: "ex: Ventes & Marketing" })}
            value={globalProcess.department}
            onChange={e => setGlobalProcess(p => ({ ...p, department: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">{t({ en: "Process description", fr: "Description du processus" })} *</label>
        <textarea
          className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none min-h-[80px]"
          placeholder={t({ en: "Describe the process from start to finish: what triggers it, what happens, what's the expected output...", fr: "Décrivez le processus du début à la fin : ce qui le déclenche, ce qui se passe, quel est le résultat attendu..." })}
          value={globalProcess.description}
          onChange={e => setGlobalProcess(p => ({ ...p, description: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">{t({ en: "Objective / Expected outcome", fr: "Objectif / Résultat attendu" })}</label>
        <input
          type="text"
          className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
          placeholder={t({ en: "e.g., Reduce onboarding time from 5 days to 1 day", fr: "ex: Réduire le temps d'onboarding de 5 jours à 1 jour" })}
          value={globalProcess.objective}
          onChange={e => setGlobalProcess(p => ({ ...p, objective: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">{t({ en: "Current performance issues", fr: "Problèmes de performance actuels" })}</label>
        <textarea
          className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none min-h-[60px]"
          placeholder={t({ en: "e.g., Takes too long, too many errors, high cost...", fr: "ex: Prend trop de temps, trop d'erreurs, coût élevé..." })}
          value={globalProcess.currentPerformance}
          onChange={e => setGlobalProcess(p => ({ ...p, currentPerformance: e.target.value }))}
        />
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
     RENDER — Step 1: Sub-Processes
     ═══════════════════════════════════════════════════════════════ */
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500/5 to-blue-500/10 border border-blue-500/20 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-2">
          <GitBranch className="w-5 h-5 text-blue-600" />
          {t({ en: "Decompose into sub-processes", fr: "Décomposer en sous-processus" })}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t({ en: "Break down your global process into logical sub-processes (BPMN standard). Each sub-process groups related unit tasks.", fr: "Décomposez votre processus global en sous-processus logiques (standard BPMN). Chaque sous-processus regroupe des tâches unitaires liées." })}
        </p>
      </div>

      {/* BPMN Visual Flow */}
      <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-white" />
          </div>
          {globalProcess.subProcesses.map((sp, idx) => (
            <div key={sp.id} className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <button
                onClick={() => setActiveSubProcessIndex(idx)}
                className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all flex-shrink-0 ${
                  activeSubProcessIndex === idx
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground hover:border-primary/40"
                }`}
              >
                {sp.name || t({ en: `Sub-process ${idx + 1}`, fr: `Sous-processus ${idx + 1}` })}
                <span className="ml-1 text-xs text-muted-foreground">({sp.unitProcesses.length})</span>
              </button>
            </div>
          ))}
          <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div className="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center flex-shrink-0">
            <div className="w-4 h-4 rounded-full bg-red-500" />
          </div>
        </div>
      </div>

      {/* Active sub-process editor */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground">
            {t({ en: `Sub-process ${activeSubProcessIndex + 1}`, fr: `Sous-processus ${activeSubProcessIndex + 1}` })}
          </h4>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setGlobalProcess(p => ({
                  ...p,
                  subProcesses: [...p.subProcesses, createEmptySubProcess()],
                }));
              }}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> {t({ en: "Add sub-process", fr: "Ajouter sous-processus" })}
            </Button>
            {globalProcess.subProcesses.length > 1 && (
              <Button
                size="sm"
                variant="outline"
                className="text-red-500 hover:text-red-600"
                onClick={() => {
                  setGlobalProcess(p => ({
                    ...p,
                    subProcesses: p.subProcesses.filter((_, i) => i !== activeSubProcessIndex),
                  }));
                  setActiveSubProcessIndex(Math.max(0, activeSubProcessIndex - 1));
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">{t({ en: "Sub-process name", fr: "Nom du sous-processus" })} *</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              placeholder={t({ en: "e.g., Document collection", fr: "ex: Collecte de documents" })}
              value={globalProcess.subProcesses[activeSubProcessIndex]?.name || ""}
              onChange={e => {
                const sps = [...globalProcess.subProcesses];
                sps[activeSubProcessIndex] = { ...sps[activeSubProcessIndex], name: e.target.value };
                setGlobalProcess(p => ({ ...p, subProcesses: sps }));
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{t({ en: "Description", fr: "Description" })}</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              placeholder={t({ en: "Brief description of this sub-process", fr: "Brève description de ce sous-processus" })}
              value={globalProcess.subProcesses[activeSubProcessIndex]?.description || ""}
              onChange={e => {
                const sps = [...globalProcess.subProcesses];
                sps[activeSubProcessIndex] = { ...sps[activeSubProcessIndex], description: e.target.value };
                setGlobalProcess(p => ({ ...p, subProcesses: sps }));
              }}
            />
          </div>
        </div>

        {/* Unit processes within this sub-process */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-medium text-muted-foreground">
              {t({ en: "Unit tasks in this sub-process", fr: "Tâches unitaires dans ce sous-processus" })}
            </h5>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const sps = [...globalProcess.subProcesses];
                sps[activeSubProcessIndex] = {
                  ...sps[activeSubProcessIndex],
                  unitProcesses: [...sps[activeSubProcessIndex].unitProcesses, createEmptyUnitProcess()],
                };
                setGlobalProcess(p => ({ ...p, subProcesses: sps }));
              }}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> {t({ en: "Add task", fr: "Ajouter tâche" })}
            </Button>
          </div>
          <div className="space-y-2">
            {globalProcess.subProcesses[activeSubProcessIndex]?.unitProcesses.map((up, idx) => (
              <div
                key={up.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                  activeUnitProcessIndex === idx && step === 2
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <span className="text-xs font-mono text-muted-foreground w-6">{idx + 1}.</span>
                <span className="text-sm">{PROCESS_TYPES.find(pt => pt.id === up.type)?.icon || "📋"}</span>
                <input
                  type="text"
                  className="flex-1 px-2 py-1 rounded border border-transparent bg-transparent text-sm focus:border-border focus:bg-background outline-none"
                  placeholder={t({ en: `Task ${idx + 1} name...`, fr: `Nom de la tâche ${idx + 1}...` })}
                  value={up.name}
                  onChange={e => {
                    const sps = [...globalProcess.subProcesses];
                    const ups = [...sps[activeSubProcessIndex].unitProcesses];
                    ups[idx] = { ...ups[idx], name: e.target.value };
                    sps[activeSubProcessIndex] = { ...sps[activeSubProcessIndex], unitProcesses: ups };
                    setGlobalProcess(p => ({ ...p, subProcesses: sps }));
                  }}
                />
                {globalProcess.subProcesses[activeSubProcessIndex].unitProcesses.length > 1 && (
                  <button
                    className="text-red-400 hover:text-red-500"
                    onClick={() => {
                      const sps = [...globalProcess.subProcesses];
                      sps[activeSubProcessIndex] = {
                        ...sps[activeSubProcessIndex],
                        unitProcesses: sps[activeSubProcessIndex].unitProcesses.filter((_, i) => i !== idx),
                      };
                      setGlobalProcess(p => ({ ...p, subProcesses: sps }));
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
     RENDER — Step 2: Unit Process Detail
     ═══════════════════════════════════════════════════════════════ */
  const renderStep2 = () => {
    const currentSp = globalProcess.subProcesses[activeSubProcessIndex];
    const currentUp = currentSp?.unitProcesses[activeUnitProcessIndex];
    if (!currentUp) return null;

    const updateUp = (field: keyof UnitProcess, value: any) => {
      const sps = [...globalProcess.subProcesses];
      const ups = [...sps[activeSubProcessIndex].unitProcesses];
      ups[activeUnitProcessIndex] = { ...ups[activeUnitProcessIndex], [field]: value };
      sps[activeSubProcessIndex] = { ...sps[activeSubProcessIndex], unitProcesses: ups };
      setGlobalProcess(p => ({ ...p, subProcesses: sps }));
    };

    const flatIndex = globalProcess.subProcesses.slice(0, activeSubProcessIndex).reduce((acc, sp) => acc + sp.unitProcesses.length, 0) + activeUnitProcessIndex;
    const totalUps = allUnitProcesses.length;

    return (
      <div className="space-y-6">
        {/* Navigation bar */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              {t({ en: `Task ${flatIndex + 1} of ${totalUps}`, fr: `Tâche ${flatIndex + 1} sur ${totalUps}` })}
              {" — "}<span className="text-foreground">{currentSp.name || t({ en: "Sub-process", fr: "Sous-processus" })}</span>
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={flatIndex === 0}
                onClick={() => {
                  if (activeUnitProcessIndex > 0) {
                    setActiveUnitProcessIndex(activeUnitProcessIndex - 1);
                  } else {
                    const prevSpIdx = activeSubProcessIndex - 1;
                    setActiveSubProcessIndex(prevSpIdx);
                    setActiveUnitProcessIndex(globalProcess.subProcesses[prevSpIdx].unitProcesses.length - 1);
                  }
                }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={flatIndex === totalUps - 1}
                onClick={() => {
                  if (activeUnitProcessIndex < currentSp.unitProcesses.length - 1) {
                    setActiveUnitProcessIndex(activeUnitProcessIndex + 1);
                  } else {
                    setActiveSubProcessIndex(activeSubProcessIndex + 1);
                    setActiveUnitProcessIndex(0);
                  }
                }}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <Progress value={((flatIndex + 1) / totalUps) * 100} className="h-1.5" />
        </div>

        {/* Task detail form */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-5">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <CircleDot className="w-4 h-4 text-primary" />
            {currentUp.name || t({ en: "Unit task details", fr: "Détails de la tâche unitaire" })}
          </h4>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t({ en: "Task name", fr: "Nom de la tâche" })} *</label>
              <input type="text" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30" value={currentUp.name} onChange={e => updateUp("name", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t({ en: "Task type (BPMN)", fr: "Type de tâche (BPMN)" })} *</label>
              <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30" value={currentUp.type} onChange={e => updateUp("type", e.target.value)}>
                {PROCESS_TYPES.map(pt => <option key={pt.id} value={pt.id}>{pt.icon} {t(pt.label)}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t({ en: "Description", fr: "Description" })}</label>
            <textarea className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 min-h-[60px]" value={currentUp.description} onChange={e => updateUp("description", e.target.value)} placeholder={t({ en: "What does this task do exactly?", fr: "Que fait exactement cette tâche ?" })} />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t({ en: "Actor/Role", fr: "Acteur/Rôle" })}</label>
              <input type="text" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30" value={currentUp.actor} onChange={e => updateUp("actor", e.target.value)} placeholder={t({ en: "e.g., Accountant", fr: "ex: Comptable" })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t({ en: "Frequency", fr: "Fréquence" })}</label>
              <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30" value={currentUp.frequency} onChange={e => updateUp("frequency", e.target.value)}>
                {FREQUENCIES.map(f => <option key={f.id} value={f.id}>{t(f.label)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t({ en: "Volume/month", fr: "Volume/mois" })}</label>
              <input type="number" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30" value={currentUp.volumePerMonth} onChange={e => updateUp("volumePerMonth", e.target.value)} />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t({ en: "Avg duration (min)", fr: "Durée moy. (min)" })}</label>
              <input type="number" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30" value={currentUp.avgDurationMinutes} onChange={e => updateUp("avgDurationMinutes", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t({ en: "Complexity", fr: "Complexité" })}</label>
              <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30" value={currentUp.complexity} onChange={e => updateUp("complexity", e.target.value)}>
                <option value="low">{t({ en: "Low", fr: "Faible" })}</option>
                <option value="medium">{t({ en: "Medium", fr: "Moyenne" })}</option>
                <option value="high">{t({ en: "High", fr: "Élevée" })}</option>
                <option value="very_high">{t({ en: "Very high", fr: "Très élevée" })}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t({ en: "Error rate", fr: "Taux d'erreur" })}</label>
              <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30" value={currentUp.errorRate} onChange={e => updateUp("errorRate", e.target.value)}>
                <option value="none">{t({ en: "None", fr: "Aucun" })}</option>
                <option value="low">{t({ en: "Low (1-2%)", fr: "Faible (1-2%)" })}</option>
                <option value="medium">{t({ en: "Medium (3-5%)", fr: "Moyen (3-5%)" })}</option>
                <option value="high">{t({ en: "High (>5%)", fr: "Élevé (>5%)" })}</option>
              </select>
            </div>
          </div>

          {/* Data types */}
          <div>
            <label className="block text-sm font-medium mb-2">{t({ en: "Data types handled", fr: "Types de données manipulées" })}</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {DATA_TYPES_OPTIONS.map(dt => (
                <button
                  key={dt.id}
                  type="button"
                  onClick={() => {
                    const current = currentUp.dataTypes;
                    updateUp("dataTypes", current.includes(dt.id) ? current.filter(d => d !== dt.id) : [...current, dt.id]);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                    currentUp.dataTypes.includes(dt.id)
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {t(dt.label)}
                </button>
              ))}
            </div>
          </div>

          {/* Pain points */}
          <div>
            <label className="block text-sm font-medium mb-2">{t({ en: "Pain points", fr: "Points de douleur" })}</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {PAIN_POINTS_OPTIONS.map(pp => (
                <button
                  key={pp.id}
                  type="button"
                  onClick={() => {
                    const current = currentUp.painPoints;
                    updateUp("painPoints", current.includes(pp.id) ? current.filter(p => p !== pp.id) : [...current, pp.id]);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                    currentUp.painPoints.includes(pp.id)
                      ? "border-orange-500 bg-orange-500/10 text-orange-700 font-medium"
                      : "border-border text-muted-foreground hover:border-orange-500/30"
                  }`}
                >
                  {t(pp.label)}
                </button>
              ))}
            </div>
          </div>

          {/* Cognitive requirements */}
          <div>
            <label className="block text-sm font-medium mb-2">{t({ en: "Cognitive requirements", fr: "Exigences cognitives" })}</label>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { key: "requiresJudgment", label: { en: "Requires human judgment/expertise", fr: "Nécessite jugement/expertise humaine" } },
                { key: "requiresCreativity", label: { en: "Requires creativity/innovation", fr: "Nécessite créativité/innovation" } },
                { key: "requiresEmpathy", label: { en: "Requires empathy/emotional intelligence", fr: "Nécessite empathie/intelligence émotionnelle" } },
                { key: "hasStructuredRules", label: { en: "Follows structured/documented rules", fr: "Suit des règles structurées/documentées" } },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-secondary/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(currentUp as any)[item.key]}
                    onChange={e => updateUp(item.key as keyof UnitProcess, e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm">{t(item.label)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Data volume & confidentiality */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t({ en: "Data volume", fr: "Volume de données" })}</label>
              <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30" value={currentUp.dataVolume} onChange={e => updateUp("dataVolume", e.target.value)}>
                <option value="small">{t({ en: "Small (< 100 docs)", fr: "Petit (< 100 docs)" })}</option>
                <option value="medium">{t({ en: "Medium (100-1000 docs)", fr: "Moyen (100-1000 docs)" })}</option>
                <option value="large">{t({ en: "Large (1000-10000 docs)", fr: "Grand (1000-10000 docs)" })}</option>
                <option value="very_large">{t({ en: "Very large (> 10000 docs)", fr: "Très grand (> 10000 docs)" })}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t({ en: "Confidentiality level", fr: "Niveau de confidentialité" })}</label>
              <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30" value={currentUp.confidentiality} onChange={e => updateUp("confidentiality", e.target.value)}>
                <option value="public">{t({ en: "Public", fr: "Public" })}</option>
                <option value="internal">{t({ en: "Internal", fr: "Interne" })}</option>
                <option value="confidential">{t({ en: "Confidential", fr: "Confidentiel" })}</option>
                <option value="highly_sensitive">{t({ en: "Highly sensitive", fr: "Très sensible" })}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════
     RENDER — Step 3: AI Recommendations
     ═══════════════════════════════════════════════════════════════ */
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500/5 to-purple-500/10 border border-purple-500/20 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-purple-600" />
          {t({ en: "Detailed AI Recommendations per Unit Task", fr: "Recommandations IA Détaillées par Tâche Unitaire" })}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t({ en: "Each task has been analyzed based on Anthropic's methodology and DATAS/DADAS standards. Click a recommendation to see the full technical prescription.", fr: "Chaque tâche a été analysée selon la méthodologie Anthropic et les standards DATAS/DADAS. Cliquez sur une recommandation pour voir la prescription technique complète." })}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: t({ en: "No AI", fr: "Pas d'IA" }), count: recommendations.filter(r => r.approach === "no_ai").length, color: "bg-gray-100 text-gray-700" },
          { label: t({ en: "Claude Chat", fr: "Claude Chat" }), count: recommendations.filter(r => r.approach === "claude_chat").length, color: "bg-blue-50 text-blue-700" },
          { label: t({ en: "API", fr: "API" }), count: recommendations.filter(r => ["api_simple", "api_chain", "api_rag", "api_fine_tuning"].includes(r.approach)).length, color: "bg-green-50 text-green-700" },
          { label: t({ en: "Agent", fr: "Agent" }), count: recommendations.filter(r => r.approach === "agent_autonomous").length, color: "bg-purple-50 text-purple-700" },
          { label: t({ en: "Computer Use", fr: "Computer Use" }), count: recommendations.filter(r => r.approach === "computer_use").length, color: "bg-orange-50 text-orange-700" },
        ].map((stat, i) => (
          <div key={i} className={`rounded-lg px-3 py-2 text-center ${stat.color}`}>
            <div className="text-xl font-bold">{stat.count}</div>
            <div className="text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recommendation cards */}
      <div className="space-y-3">
        {recommendations.map((rec) => {
          const isExpanded = expandedRec.has(rec.processId);
          const approachColors: Record<string, string> = {
            no_ai: "border-gray-200 bg-gray-50",
            claude_chat: "border-blue-200 bg-blue-50/50",
            api_simple: "border-green-200 bg-green-50/50",
            api_chain: "border-emerald-200 bg-emerald-50/50",
            api_rag: "border-teal-200 bg-teal-50/50",
            api_fine_tuning: "border-indigo-200 bg-indigo-50/50",
            agent_autonomous: "border-purple-200 bg-purple-50/50",
            computer_use: "border-orange-200 bg-orange-50/50",
            custom_model: "border-red-200 bg-red-50/50",
          };

          return (
            <div key={rec.processId} className={`rounded-xl border-2 overflow-hidden transition-all ${approachColors[rec.approach] || "border-border"}`}>
              {/* Header */}
              <button
                className="w-full px-5 py-4 flex items-center justify-between text-left"
                onClick={() => toggleRecExpand(rec.processId)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center text-sm">
                    {rec.approach === "no_ai" ? "—" : rec.approach === "claude_chat" ? <MessageSquare className="w-4 h-4" /> : rec.approach === "agent_autonomous" ? <Bot className="w-4 h-4" /> : rec.approach === "computer_use" ? <Monitor className="w-4 h-4" /> : <Code2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-sm">{rec.processName}</div>
                    <div className="text-xs text-muted-foreground">{t(rec.approachLabel)} — {rec.model.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    rec.confidenceLevel === "high" ? "bg-green-100 text-green-700" :
                    rec.confidenceLevel === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                  }`}>
                    {rec.confidenceLevel === "high" ? "●" : rec.confidenceLevel === "medium" ? "●" : "●"} {t({ en: rec.confidenceLevel, fr: rec.confidenceLevel === "high" ? "élevée" : rec.confidenceLevel === "medium" ? "moyenne" : "faible" })}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-5 pb-5 space-y-4 border-t border-border/50">
                  {/* Approach description */}
                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground italic">{t(rec.approachDescription)}</p>
                  </div>

                  {/* Model detail */}
                  <div className="bg-white rounded-lg border border-border p-4">
                    <h5 className="text-sm font-semibold flex items-center gap-2 mb-2">
                      <Cpu className="w-4 h-4 text-primary" />
                      {t({ en: "Recommended Model", fr: "Modèle Recommandé" })}
                    </h5>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-muted-foreground">{t({ en: "Model", fr: "Modèle" })}</span>
                        <div className="font-medium text-sm">{rec.model.name}</div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">{t({ en: "Capabilities", fr: "Capacités" })}</span>
                        <div className="flex gap-1.5 mt-0.5">
                          {rec.model.reasoning && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Reasoning</span>}
                          {rec.model.extendedThinking && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">Extended Thinking</span>}
                          {!rec.model.reasoning && !rec.model.extendedThinking && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">Standard</span>}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{t(rec.model.justification)}</p>
                  </div>

                  {/* Access mode */}
                  <div className="bg-white rounded-lg border border-border p-4">
                    <h5 className="text-sm font-semibold flex items-center gap-2 mb-2">
                      <Network className="w-4 h-4 text-primary" />
                      {t({ en: "Access Mode", fr: "Mode d'Accès" })}
                    </h5>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-muted-foreground">{t({ en: "Primary", fr: "Principal" })}</span>
                        <div className="font-medium text-sm">{rec.accessMode.primary}</div>
                      </div>
                      {rec.accessMode.alternatives.length > 0 && (
                        <div>
                          <span className="text-xs text-muted-foreground">{t({ en: "Alternatives", fr: "Alternatives" })}</span>
                          <div className="flex flex-wrap gap-1.5 mt-0.5">
                            {rec.accessMode.alternatives.map((alt, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{alt}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">{t(rec.accessMode.justification)}</p>
                    </div>
                  </div>

                  {/* Architecture */}
                  <div className="bg-white rounded-lg border border-border p-4">
                    <h5 className="text-sm font-semibold flex items-center gap-2 mb-2">
                      <Layers className="w-4 h-4 text-primary" />
                      {t({ en: "Architecture", fr: "Architecture" })}
                    </h5>
                    <div className="font-medium text-sm mb-2">{rec.architecture.type}</div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {rec.architecture.components.map((comp, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-lg bg-primary/5 border border-primary/20 text-foreground">{comp}</span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{t(rec.architecture.description)}</p>
                  </div>

                  {/* Autonomy */}
                  <div className="bg-white rounded-lg border border-border p-4">
                    <h5 className="text-sm font-semibold flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-primary" />
                      {t({ en: "Autonomy Level", fr: "Niveau d'Autonomie" })}
                    </h5>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      rec.autonomyLevel.level === "full_autonomous" ? "bg-purple-100 text-purple-700" :
                      rec.autonomyLevel.level === "light_supervision" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                    }`}>
                      {rec.autonomyLevel.level === "full_autonomous" ? <Bot className="w-3 h-3" /> : rec.autonomyLevel.level === "light_supervision" ? <Shield className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                      {t(rec.autonomyLevel.label)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{t(rec.autonomyLevel.justification)}</p>
                  </div>

                  {/* RAG config if applicable */}
                  {rec.ragConfig && (
                    <div className="bg-white rounded-lg border border-teal-200 p-4">
                      <h5 className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <Database className="w-4 h-4 text-teal-600" />
                        {t({ en: "RAG Configuration", fr: "Configuration RAG" })}
                      </h5>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div><span className="text-xs text-muted-foreground block">{t({ en: "Document volume", fr: "Volume documentaire" })}</span>{rec.ragConfig.documentVolume}</div>
                        <div><span className="text-xs text-muted-foreground block">{t({ en: "Embedding model", fr: "Modèle d'embedding" })}</span>{rec.ragConfig.embeddingModel}</div>
                        <div><span className="text-xs text-muted-foreground block">{t({ en: "Chunking strategy", fr: "Stratégie de chunking" })}</span>{rec.ragConfig.chunkingStrategy}</div>
                        <div><span className="text-xs text-muted-foreground block">{t({ en: "Vector database", fr: "Base vectorielle" })}</span>{rec.ragConfig.vectorDB}</div>
                        <div><span className="text-xs text-muted-foreground block">{t({ en: "Setup time", fr: "Temps de mise en place" })}</span>{rec.ragConfig.estimatedSetupDays} {t({ en: "days", fr: "jours" })}</div>
                        <div><span className="text-xs text-muted-foreground block">{t({ en: "Estimated cost", fr: "Coût estimé" })}</span>{rec.ragConfig.estimatedCost}</div>
                      </div>
                    </div>
                  )}

                  {/* Fine-tuning config if applicable */}
                  {rec.fineTuning && (
                    <div className="bg-white rounded-lg border border-indigo-200 p-4">
                      <h5 className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <Settings className="w-4 h-4 text-indigo-600" />
                        {t({ en: "Fine-tuning / Model Customization", fr: "Fine-tuning / Personnalisation du Modèle" })}
                      </h5>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div><span className="text-xs text-muted-foreground block">{t({ en: "Dataset required", fr: "Dataset requis" })}</span>{rec.fineTuning.datasetSize}</div>
                        <div><span className="text-xs text-muted-foreground block">{t({ en: "Estimated cost", fr: "Coût estimé" })}</span>{rec.fineTuning.estimatedCost}</div>
                        <div><span className="text-xs text-muted-foreground block">{t({ en: "Timeline", fr: "Délai" })}</span>{rec.fineTuning.estimatedTimeline}</div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{t(rec.fineTuning.justification)}</p>
                    </div>
                  )}

                  {/* Cost estimation */}
                  <div className="bg-white rounded-lg border border-border p-4">
                    <h5 className="text-sm font-semibold flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      {t({ en: "Cost Estimation", fr: "Estimation des Coûts" })}
                    </h5>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div><span className="text-xs text-muted-foreground block">{t({ en: "Tokens/month", fr: "Tokens/mois" })}</span>{rec.costEstimation.tokensPerMonth}</div>
                      <div><span className="text-xs text-muted-foreground block">{t({ en: "API cost/month", fr: "Coût API/mois" })}</span>{rec.costEstimation.apiCostPerMonth}</div>
                      <div><span className="text-xs text-muted-foreground block">{t({ en: "Infrastructure", fr: "Infrastructure" })}</span>{rec.costEstimation.infrastructureCost}</div>
                      <div><span className="text-xs text-muted-foreground block font-medium">{t({ en: "Total monthly", fr: "Total mensuel" })}</span><span className="font-semibold text-primary">{rec.costEstimation.totalMonthlyCost}</span></div>
                      <div><span className="text-xs text-muted-foreground block">{t({ en: "Setup cost (one-time)", fr: "Coût de mise en place (unique)" })}</span>{rec.costEstimation.setupCost}</div>
                      <div><span className="text-xs text-muted-foreground block">{t({ en: "Implementation timeline", fr: "Délai d'implémentation" })}</span>{rec.implementationTimeline}</div>
                    </div>
                  </div>

                  {/* Risks & Prerequisites */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {rec.risks.length > 0 && (
                      <div className="bg-white rounded-lg border border-orange-200 p-4">
                        <h5 className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          {t({ en: "Risks", fr: "Risques" })}
                        </h5>
                        <ul className="space-y-1">
                          {rec.risks.map((risk, i) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5"><span className="text-orange-400 mt-0.5">•</span>{risk}</li>)}
                        </ul>
                      </div>
                    )}
                    {rec.prerequisites.length > 0 && (
                      <div className="bg-white rounded-lg border border-blue-200 p-4">
                        <h5 className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-500" />
                          {t({ en: "Prerequisites", fr: "Prérequis" })}
                        </h5>
                        <ul className="space-y-1">
                          {rec.prerequisites.map((pre, i) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5"><span className="text-blue-400 mt-0.5">•</span>{pre}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
     RENDER — Step 4: Post-Implementation Projection
     ═══════════════════════════════════════════════════════════════ */
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500/5 to-green-500/10 border border-green-500/20 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          {t({ en: "Post-Implementation Projection", fr: "Projection Post-Implémentation" })}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t({ en: "Projected state of your process after AI implementation. Shows the probable redesign and estimated gains for each unit task.", fr: "État projeté de votre processus après implémentation IA. Montre le redesign probable et les gains estimés pour chaque tâche unitaire." })}
        </p>
      </div>

      {/* Global gains summary */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          {t({ en: "Overall Projected Gains", fr: "Gains Projetés Globaux" })}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(() => {
            const avgTimeRed = projections.filter(p => p.gains.timeReduction !== "0%").reduce((acc, p) => acc + parseInt(p.gains.timeReduction), 0) / Math.max(projections.filter(p => p.gains.timeReduction !== "0%").length, 1);
            const avgCostRed = projections.filter(p => p.gains.costReduction !== "0%").reduce((acc, p) => acc + parseInt(p.gains.costReduction), 0) / Math.max(projections.filter(p => p.gains.costReduction !== "0%").length, 1);
            const avgQuality = projections.filter(p => p.gains.qualityImprovement !== "0%").reduce((acc, p) => acc + parseInt(p.gains.qualityImprovement), 0) / Math.max(projections.filter(p => p.gains.qualityImprovement !== "0%").length, 1);
            const eliminated = projections.filter(p => p.newRole === "eliminated").length;
            return [
              { label: t({ en: "Avg. time reduction", fr: "Réduction temps moy." }), value: `${Math.round(avgTimeRed)}%`, icon: <Clock className="w-5 h-5 text-blue-500" /> },
              { label: t({ en: "Avg. cost reduction", fr: "Réduction coût moy." }), value: `${Math.round(avgCostRed)}%`, icon: <DollarSign className="w-5 h-5 text-green-500" /> },
              { label: t({ en: "Avg. quality gain", fr: "Gain qualité moy." }), value: `+${Math.round(avgQuality)}%`, icon: <Target className="w-5 h-5 text-purple-500" /> },
              { label: t({ en: "Fully automated tasks", fr: "Tâches entièrement automatisées" }), value: `${eliminated}/${projections.length}`, icon: <Bot className="w-5 h-5 text-orange-500" /> },
            ].map((stat, i) => (
              <div key={i} className="text-center p-3 rounded-lg bg-secondary/30">
                <div className="flex justify-center mb-1">{stat.icon}</div>
                <div className="text-xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Redesigned process flow */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Workflow className="w-4 h-4 text-primary" />
          {t({ en: "Redesigned Process Flow", fr: "Flux du Processus Redesigné" })}
        </h4>
        <div className="overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max pb-2">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
            {projections.map((proj, idx) => (
              <div key={proj.processId} className="flex items-center gap-1">
                <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <div className={`px-2.5 py-1.5 rounded-lg border text-xs flex-shrink-0 ${
                  proj.newRole === "eliminated" ? "border-purple-300 bg-purple-50 text-purple-700" :
                  proj.newRole === "augmented" ? "border-blue-300 bg-blue-50 text-blue-700" :
                  proj.newRole === "supervised" ? "border-green-300 bg-green-50 text-green-700" :
                  "border-gray-300 bg-gray-50 text-gray-700"
                }`}>
                  <span className="font-medium">{proj.processName.substring(0, 20)}</span>
                  <span className="block text-[10px] opacity-75">
                    {proj.newRole === "eliminated" ? "🤖 Auto" : proj.newRole === "augmented" ? "🧑‍💻+🤖" : proj.newRole === "supervised" ? "👁️+🤖" : "🧑‍💻"}
                  </span>
                </div>
              </div>
            ))}
            <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <div className="w-6 h-6 rounded-full border-2 border-red-500 flex items-center justify-center flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-500" />
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-200" /> {t({ en: "Fully automated", fr: "Entièrement automatisé" })}</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-200" /> {t({ en: "Augmented", fr: "Augmenté" })}</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200" /> {t({ en: "Supervised", fr: "Supervisé" })}</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-200" /> {t({ en: "Unchanged", fr: "Inchangé" })}</span>
        </div>
      </div>

      {/* Detailed projections per task */}
      <div className="space-y-3">
        {projections.map((proj) => (
          <div key={proj.processId} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-sm">{proj.processName}</h5>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                proj.newRole === "eliminated" ? "bg-purple-100 text-purple-700" :
                proj.newRole === "augmented" ? "bg-blue-100 text-blue-700" :
                proj.newRole === "supervised" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
              }`}>
                {t(proj.newRoleLabel)}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Before */}
              <div className="bg-red-50/50 rounded-lg p-3 border border-red-100">
                <div className="text-xs font-semibold text-red-700 mb-2">{t({ en: "BEFORE (Current)", fr: "AVANT (Actuel)" })}</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">{t({ en: "Duration", fr: "Durée" })}</span><span>{proj.currentState.duration}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t({ en: "Cost", fr: "Coût" })}</span><span>{proj.currentState.cost}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t({ en: "Error rate", fr: "Taux erreur" })}</span><span>{proj.currentState.errorRate}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t({ en: "Satisfaction", fr: "Satisfaction" })}</span><span>{proj.currentState.satisfaction}</span></div>
                </div>
              </div>
              {/* After */}
              <div className="bg-green-50/50 rounded-lg p-3 border border-green-100">
                <div className="text-xs font-semibold text-green-700 mb-2">{t({ en: "AFTER (Projected)", fr: "APRÈS (Projeté)" })}</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">{t({ en: "Duration", fr: "Durée" })}</span><span className="text-green-700 font-medium">{proj.projectedState.duration}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t({ en: "Cost", fr: "Coût" })}</span><span className="text-green-700 font-medium">{proj.projectedState.cost}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t({ en: "Error rate", fr: "Taux erreur" })}</span><span className="text-green-700 font-medium">{proj.projectedState.errorRate}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t({ en: "Satisfaction", fr: "Satisfaction" })}</span><span className="text-green-700 font-medium">{proj.projectedState.satisfaction}</span></div>
                </div>
              </div>
            </div>
            {/* Gains bar */}
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[
                { label: t({ en: "Time", fr: "Temps" }), value: proj.gains.timeReduction, color: "text-blue-600" },
                { label: t({ en: "Cost", fr: "Coût" }), value: proj.gains.costReduction, color: "text-green-600" },
                { label: t({ en: "Quality", fr: "Qualité" }), value: proj.gains.qualityImprovement, color: "text-purple-600" },
                { label: t({ en: "Capacity", fr: "Capacité" }), value: proj.gains.capacityIncrease, color: "text-orange-600" },
              ].map((g, i) => (
                <div key={i} className="text-center">
                  <div className={`text-sm font-bold ${g.color}`}>{g.value}</div>
                  <div className="text-[10px] text-muted-foreground">{g.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
     MAIN RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/training">
              <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> {t({ en: "Back", fr: "Retour" })}</Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-foreground">{t({ en: "Advanced AI Diagnostic", fr: "Diagnostic IA Avancé" })}</h1>
              <p className="text-xs text-muted-foreground">{t({ en: "BPMN Process Analysis · Anthropic + DATAS Methodology", fr: "Analyse de Processus BPMN · Méthodologie Anthropic + DATAS" })}</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Progress stepper */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          {stepLabels.map((s, i) => (
            <button
              key={i}
              onClick={() => { if (i <= step || (i === 3 && recommendations.length > 0) || (i === 4 && projections.length > 0)) setStep(i); }}
              className={`flex items-center gap-1.5 text-xs font-medium transition-all ${
                i === step ? "text-primary" : i < step ? "text-green-600" : "text-muted-foreground"
              } ${i <= step || (i === 3 && recommendations.length > 0) ? "cursor-pointer hover:text-primary" : "cursor-default"}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                i === step ? "border-primary bg-primary/10 text-primary" :
                i < step ? "border-green-500 bg-green-500 text-white" : "border-border text-muted-foreground"
              }`}>
                {i < step ? "✓" : i + 1}
              </span>
              <span className="hidden md:inline">{s.label}</span>
            </button>
          ))}
        </div>
        <Progress value={progressPct} className="h-1" />
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 pb-24">
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </main>

      {/* Navigation footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border py-3">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <Button
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep(Math.max(0, step - 1))}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> {t({ en: "Previous", fr: "Précédent" })}
          </Button>

          <div className="text-xs text-muted-foreground">
            {t({ en: `Step ${step + 1} of ${totalSteps}`, fr: `Étape ${step + 1} sur ${totalSteps}` })}
          </div>

          {step < 2 && (
            <Button onClick={() => setStep(step + 1)}>
              {t({ en: "Next", fr: "Suivant" })} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          {step === 2 && (
            <Button onClick={runAnalysis} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
              <Brain className="w-4 h-4 mr-1" /> {t({ en: "Run AI Analysis", fr: "Lancer l'Analyse IA" })}
            </Button>
          )}
          {step === 3 && (
            <Button onClick={() => setStep(4)}>
              {t({ en: "View Projection", fr: "Voir la Projection" })} <TrendingUp className="w-4 h-4 ml-1" />
            </Button>
          )}
          {step === 4 && (
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-1" /> {t({ en: "Export", fr: "Exporter" })}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
