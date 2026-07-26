import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Moon,
  Sun,
  RotateCcw,
  Download,
  Zap,
  Brain,
  BarChart3,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Target,
  TrendingUp,
} from "lucide-react";

/* ─── Types ─── */
interface ProcessDescription {
  name: string;
  domain: string;
  description: string;
  trigger: string;
  expectedResult: string;
  frequency: string;
  volumePerYear: string;
  avgTimeMinutes: string;
  agentsCount: string;
  automationLevel: "manual" | "semi" | "auto";
  humanInterventions: string[];
  dataTypes: string[];
  tools: string[];
  irritants: string[];
}

interface EvaluationResult {
  potentialLevel: "very_high" | "high" | "medium" | "low";
  potentialScore: number;
  applicableTechnologies: { id: string; name: string; relevance: number; reason: string }[];
  expectedGains: string[];
  roiLevel: "very_high" | "high" | "medium" | "low";
  priorityScore: number;
  matrixPosition: "quick_win" | "strategic" | "optional" | "avoid";
  recommendations: string[];
}

/* ─── Constants ─── */
const HUMAN_INTERVENTIONS = [
  { id: "decision", label: { en: "Decision", fr: "Décision" } },
  { id: "control", label: { en: "Control/Verification", fr: "Contrôle/Vérification" } },
  { id: "validation", label: { en: "Validation/Approval", fr: "Validation/Approbation" } },
  { id: "data_entry", label: { en: "Data Entry", fr: "Saisie de données" } },
  { id: "search", label: { en: "Information Search", fr: "Recherche d'information" } },
  { id: "communication", label: { en: "Communication", fr: "Communication" } },
  { id: "calculation", label: { en: "Calculation", fr: "Calcul" } },
];

const DATA_TYPES = [
  { id: "documents", label: { en: "Text Documents", fr: "Documents texte" } },
  { id: "images", label: { en: "Images/Scans", fr: "Images/Scans" } },
  { id: "pdf", label: { en: "PDF Files", fr: "Fichiers PDF" } },
  { id: "emails", label: { en: "Emails", fr: "Emails" } },
  { id: "physical_mail", label: { en: "Physical Mail", fr: "Courriers physiques" } },
  { id: "database", label: { en: "Database Records", fr: "Base de données" } },
  { id: "erp", label: { en: "ERP/CRM Data", fr: "Données ERP/CRM" } },
  { id: "spreadsheets", label: { en: "Spreadsheets", fr: "Tableurs/Excel" } },
  { id: "audio", label: { en: "Audio/Voice", fr: "Audio/Voix" } },
  { id: "web", label: { en: "Web Data/APIs", fr: "Données web/APIs" } },
];

const TOOLS_USED = [
  { id: "erp_software", label: { en: "ERP Software", fr: "Logiciel ERP" } },
  { id: "internal_app", label: { en: "Internal Applications", fr: "Applications internes" } },
  { id: "excel", label: { en: "Excel/Spreadsheets", fr: "Excel/Tableurs" } },
  { id: "web_portal", label: { en: "Web Portals", fr: "Portails web" } },
  { id: "email_client", label: { en: "Email Client", fr: "Client email" } },
  { id: "crm", label: { en: "CRM", fr: "CRM" } },
  { id: "paper", label: { en: "Paper/Manual", fr: "Papier/Manuel" } },
  { id: "api", label: { en: "APIs/Integrations", fr: "APIs/Intégrations" } },
];

const IRRITANTS = [
  { id: "time_waste", label: { en: "Time Wasted", fr: "Temps perdu" } },
  { id: "double_entry", label: { en: "Double Data Entry", fr: "Double saisie" } },
  { id: "frequent_errors", label: { en: "Frequent Errors", fr: "Erreurs fréquentes" } },
  { id: "recurring_delays", label: { en: "Recurring Delays", fr: "Retards récurrents" } },
  { id: "doc_search", label: { en: "Time-consuming Document Search", fr: "Recherche documentaire chronophage" } },
  { id: "slow_validation", label: { en: "Slow Validation", fr: "Validation lente" } },
  { id: "manual_repetition", label: { en: "Repetitive Manual Tasks", fr: "Tâches manuelles répétitives" } },
  { id: "lack_visibility", label: { en: "Lack of Visibility/Tracking", fr: "Manque de visibilité/suivi" } },
];

const DOMAINS = [
  { id: "operations", label: { en: "Operations", fr: "Opérations" } },
  { id: "finance", label: { en: "Finance & Accounting", fr: "Finance & Comptabilité" } },
  { id: "hr", label: { en: "Human Resources", fr: "Ressources Humaines" } },
  { id: "sales", label: { en: "Sales & Marketing", fr: "Ventes & Marketing" } },
  { id: "it", label: { en: "IT & Technology", fr: "IT & Technologie" } },
  { id: "legal", label: { en: "Legal & Compliance", fr: "Juridique & Conformité" } },
  { id: "customer_service", label: { en: "Customer Service", fr: "Service Client" } },
  { id: "supply_chain", label: { en: "Supply Chain & Logistics", fr: "Supply Chain & Logistique" } },
  { id: "quality", label: { en: "Quality & Control", fr: "Qualité & Contrôle" } },
  { id: "other", label: { en: "Other", fr: "Autre" } },
];

const AI_TECHNOLOGIES = [
  { id: "ocr", name: "OCR", signals: ["images", "pdf", "physical_mail"], interventions: ["data_entry"], description: { en: "Document digitization and text extraction", fr: "Numérisation de documents et extraction de texte" } },
  { id: "llm", name: "LLM (Large Language Model)", signals: ["documents", "emails"], interventions: ["communication", "search"], description: { en: "Text generation, synthesis, writing assistance", fr: "Génération de texte, synthèse, assistance rédactionnelle" } },
  { id: "computer_vision", name: { en: "Computer Vision", fr: "Vision par ordinateur" }, signals: ["images"], interventions: ["control"], description: { en: "Image analysis, defect detection", fr: "Analyse d'images, détection de défauts" } },
  { id: "speech_to_text", name: "Speech-to-Text", signals: ["audio"], interventions: ["communication"], description: { en: "Conversation/call transcription", fr: "Transcription de conversations/appels" } },
  { id: "ai_agent", name: { en: "AI Agent", fr: "Agent IA" }, signals: ["database", "erp", "api"], interventions: ["data_entry", "search", "calculation"], description: { en: "End-to-end automation of multi-step processes", fr: "Automatisation bout en bout de processus multi-étapes" } },
  { id: "ml_classic", name: "Machine Learning", signals: ["database", "spreadsheets"], interventions: ["decision", "calculation"], description: { en: "Predictive models, classification", fr: "Modèles prédictifs, classification" } },
  { id: "optimization", name: { en: "Optimization", fr: "Optimisation" }, signals: ["database", "spreadsheets"], interventions: ["calculation", "decision"], description: { en: "Combinatorial problems (routing, scheduling)", fr: "Problèmes combinatoires (tournées, plannings)" } },
  { id: "anomaly_detection", name: { en: "Anomaly Detection", fr: "Détection d'anomalies" }, signals: ["database", "erp"], interventions: ["control"], description: { en: "Identification of atypical behaviors", fr: "Identification de comportements atypiques" } },
  { id: "doc_extraction", name: { en: "Document Extraction", fr: "Extraction documentaire" }, signals: ["documents", "pdf", "emails"], interventions: ["data_entry", "search"], description: { en: "Structured extraction from unstructured documents", fr: "Extraction structurée depuis documents non structurés" } },
  { id: "classification", name: "Classification", signals: ["emails", "documents", "database"], interventions: ["decision", "control"], description: { en: "Automatic categorization of incoming items", fr: "Catégorisation automatique d'éléments entrants" } },
  { id: "rag", name: "RAG (Recherche sémantique)", signals: ["documents", "database", "web"], interventions: ["search"], description: { en: "Contextualized search on document base", fr: "Recherche contextualisée sur base documentaire" } },
  { id: "recommendation", name: { en: "Recommendation", fr: "Recommandation" }, signals: ["database", "erp"], interventions: ["decision", "communication"], description: { en: "Personalized suggestions", fr: "Suggestions personnalisées" } },
  { id: "voicebot", name: "Voicebot", signals: ["audio"], interventions: ["communication"], description: { en: "Automated voice interactions", fr: "Automatisation d'interactions vocales" } },
];

/* ─── Scoring Engine ─── */
function evaluateProcess(process: ProcessDescription): EvaluationResult {
  // Factor 1: Volume (1-4)
  const volume = parseInt(process.volumePerYear) || 0;
  let volumeScore = 1;
  if (volume >= 10000) volumeScore = 4;
  else if (volume >= 1000) volumeScore = 3;
  else if (volume >= 100) volumeScore = 2;

  // Factor 2: Data structuration (1-4)
  const structuredData = process.dataTypes.filter(d => ["database", "erp", "spreadsheets", "web"].includes(d)).length;
  const unstructuredData = process.dataTypes.filter(d => ["documents", "images", "pdf", "emails", "physical_mail", "audio"].includes(d)).length;
  let dataScore = 1;
  if (structuredData >= 2 && unstructuredData <= 1) dataScore = 4;
  else if (structuredData >= 1) dataScore = 3;
  else if (unstructuredData >= 2) dataScore = 2;

  // Factor 3: Repetitiveness (1-4)
  const repetitiveInterventions = process.humanInterventions.filter(i => ["data_entry", "search", "calculation", "control"].includes(i)).length;
  let repetitivityScore = 1;
  if (repetitiveInterventions >= 3) repetitivityScore = 4;
  else if (repetitiveInterventions >= 2) repetitivityScore = 3;
  else if (repetitiveInterventions >= 1) repetitivityScore = 2;

  // Factor 4: Irritants (1-4)
  let irritantScore = 1;
  if (process.irritants.length >= 4) irritantScore = 4;
  else if (process.irritants.length >= 3) irritantScore = 3;
  else if (process.irritants.length >= 1) irritantScore = 2;

  // Global potential score (average)
  const potentialScore = (volumeScore + dataScore + repetitivityScore + irritantScore) / 4;
  let potentialLevel: EvaluationResult["potentialLevel"] = "low";
  if (potentialScore >= 3.5) potentialLevel = "very_high";
  else if (potentialScore >= 2.5) potentialLevel = "high";
  else if (potentialScore >= 1.5) potentialLevel = "medium";

  // Applicable technologies
  const applicableTechnologies = AI_TECHNOLOGIES.map(tech => {
    let relevance = 0;
    let reasons: string[] = [];

    // Check data type signals
    const matchingSignals = tech.signals.filter(s => process.dataTypes.includes(s));
    if (matchingSignals.length > 0) {
      relevance += matchingSignals.length * 25;
      reasons.push(`data: ${matchingSignals.join(", ")}`);
    }

    // Check intervention signals
    const matchingInterventions = tech.interventions.filter(i => process.humanInterventions.includes(i));
    if (matchingInterventions.length > 0) {
      relevance += matchingInterventions.length * 30;
      reasons.push(`interventions: ${matchingInterventions.join(", ")}`);
    }

    // Bonus for irritants
    if (tech.id === "rag" && process.irritants.includes("doc_search")) relevance += 30;
    if (tech.id === "ai_agent" && process.automationLevel === "semi" && process.tools.includes("api")) relevance += 25;
    if (tech.id === "ocr" && process.irritants.includes("double_entry") && process.dataTypes.includes("physical_mail")) relevance += 20;
    if (tech.id === "classification" && process.irritants.includes("manual_repetition")) relevance += 20;
    if (tech.id === "anomaly_detection" && process.irritants.includes("frequent_errors")) relevance += 25;

    return {
      id: tech.id,
      name: typeof tech.name === "string" ? tech.name : tech.name.fr,
      relevance: Math.min(relevance, 100),
      reason: reasons.join(" | "),
    };
  }).filter(t => t.relevance > 20).sort((a, b) => b.relevance - a.relevance);

  // Expected gains
  const expectedGains: string[] = [];
  if (process.irritants.includes("time_waste") || process.irritants.includes("manual_repetition")) expectedGains.push("time");
  if (process.irritants.includes("frequent_errors")) expectedGains.push("quality");
  if (parseInt(process.agentsCount) >= 3) expectedGains.push("cost");
  if (process.irritants.includes("recurring_delays") || process.irritants.includes("slow_validation")) expectedGains.push("delays");
  if (process.humanInterventions.includes("communication")) expectedGains.push("satisfaction");
  if (expectedGains.length === 0) expectedGains.push("time");

  // ROI estimation
  const valueScore = potentialScore * (expectedGains.length / 3);
  const complexityFactors = [
    process.automationLevel === "manual" ? 1 : 0,
    process.dataTypes.includes("physical_mail") ? 1 : 0,
    process.humanInterventions.includes("decision") ? 1 : 0,
    process.tools.includes("paper") ? 1 : 0,
  ].reduce((a, b) => a + b, 0);
  const complexityScore = 1 + complexityFactors;

  let roiLevel: EvaluationResult["roiLevel"] = "low";
  if (valueScore >= 3 && complexityScore <= 2) roiLevel = "very_high";
  else if (valueScore >= 2) roiLevel = "high";
  else if (valueScore >= 1.5) roiLevel = "medium";

  // Matrix position
  let matrixPosition: EvaluationResult["matrixPosition"] = "optional";
  if (valueScore >= 2.5 && complexityScore <= 2) matrixPosition = "quick_win";
  else if (valueScore >= 2.5 && complexityScore > 2) matrixPosition = "strategic";
  else if (valueScore < 2.5 && complexityScore > 2) matrixPosition = "avoid";

  // Priority score
  const priorityScore = Math.round((valueScore * 60 - complexityScore * 20) * 10) / 10;

  // Recommendations
  const recommendations: string[] = [];
  if (matrixPosition === "quick_win") {
    recommendations.push("quick_win_priority");
  }
  if (applicableTechnologies.length > 0 && applicableTechnologies[0].id === "ai_agent") {
    recommendations.push("agent_candidate");
  }
  if (process.automationLevel === "manual" && potentialLevel !== "low") {
    recommendations.push("start_with_pilot");
  }
  if (process.irritants.includes("doc_search")) {
    recommendations.push("rag_quick_win");
  }
  if (complexityScore >= 3) {
    recommendations.push("phased_approach");
  }

  return {
    potentialLevel,
    potentialScore: Math.round(potentialScore * 25), // Convert to 0-100
    applicableTechnologies: applicableTechnologies.slice(0, 6),
    expectedGains,
    roiLevel,
    priorityScore,
    matrixPosition,
    recommendations,
  };
}

/* ─── Step Components ─── */
function StepIdentification({ data, onChange, t }: { data: ProcessDescription; onChange: (d: Partial<ProcessDescription>) => void; t: (v: { en: string; fr: string }) => string }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">{t({ en: "Process Identification", fr: "Identification du processus" })}</h3>
        <p className="text-sm text-muted-foreground">{t({ en: "Describe the process you want to evaluate for AI potential.", fr: "Décrivez le processus que vous souhaitez évaluer pour son potentiel IA." })}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t({ en: "Process Name", fr: "Nom du processus" })} *</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t({ en: "e.g. Invoice Processing", fr: "ex: Traitement des factures" })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t({ en: "Domain", fr: "Domaine" })} *</label>
          <select
            value={data.domain}
            onChange={(e) => onChange({ domain: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">{t({ en: "Select a domain", fr: "Sélectionnez un domaine" })}</option>
            {DOMAINS.map((d) => (
              <option key={d.id} value={d.id}>{t(d.label)}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">{t({ en: "Description (3-5 sentences)", fr: "Description (3-5 phrases)" })} *</label>
        <textarea
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          placeholder={t({ en: "Describe what this process does, its purpose, and main steps...", fr: "Décrivez ce que fait ce processus, son objectif et ses étapes principales..." })}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t({ en: "Trigger", fr: "Déclencheur" })}</label>
          <input
            type="text"
            value={data.trigger}
            onChange={(e) => onChange({ trigger: e.target.value })}
            placeholder={t({ en: "e.g. Reception of an invoice", fr: "ex: Réception d'une facture" })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t({ en: "Expected Result", fr: "Résultat attendu" })}</label>
          <input
            type="text"
            value={data.expectedResult}
            onChange={(e) => onChange({ expectedResult: e.target.value })}
            placeholder={t({ en: "e.g. Invoice paid and archived", fr: "ex: Facture payée et archivée" })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>
    </div>
  );
}

function StepMetrics({ data, onChange, t }: { data: ProcessDescription; onChange: (d: Partial<ProcessDescription>) => void; t: (v: { en: string; fr: string }) => string }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">{t({ en: "Volumes & Resources", fr: "Volumes & Ressources" })}</h3>
        <p className="text-sm text-muted-foreground">{t({ en: "Quantify the process to assess its automation potential.", fr: "Quantifiez le processus pour évaluer son potentiel d'automatisation." })}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t({ en: "Frequency", fr: "Fréquence" })} *</label>
          <select
            value={data.frequency}
            onChange={(e) => onChange({ frequency: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">{t({ en: "Select", fr: "Sélectionnez" })}</option>
            <option value="continuous">{t({ en: "Continuous (multiple times/day)", fr: "Continu (plusieurs fois/jour)" })}</option>
            <option value="daily">{t({ en: "Daily", fr: "Quotidien" })}</option>
            <option value="weekly">{t({ en: "Weekly", fr: "Hebdomadaire" })}</option>
            <option value="monthly">{t({ en: "Monthly", fr: "Mensuel" })}</option>
            <option value="quarterly">{t({ en: "Quarterly", fr: "Trimestriel" })}</option>
            <option value="annual">{t({ en: "Annual", fr: "Annuel" })}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t({ en: "Volume per Year", fr: "Volume annuel" })} *</label>
          <input
            type="number"
            value={data.volumePerYear}
            onChange={(e) => onChange({ volumePerYear: e.target.value })}
            placeholder={t({ en: "e.g. 5000", fr: "ex: 5000" })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t({ en: "Average Time (minutes)", fr: "Temps moyen (minutes)" })} *</label>
          <input
            type="number"
            value={data.avgTimeMinutes}
            onChange={(e) => onChange({ avgTimeMinutes: e.target.value })}
            placeholder={t({ en: "e.g. 15", fr: "ex: 15" })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t({ en: "Number of Agents (FTE)", fr: "Nombre d'agents (ETP)" })} *</label>
          <input
            type="number"
            value={data.agentsCount}
            onChange={(e) => onChange({ agentsCount: e.target.value })}
            placeholder={t({ en: "e.g. 3", fr: "ex: 3" })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">{t({ en: "Current Automation Level", fr: "Niveau d'automatisation actuel" })} *</label>
        <div className="grid grid-cols-3 gap-3">
          {(["manual", "semi", "auto"] as const).map((level) => (
            <button
              key={level}
              onClick={() => onChange({ automationLevel: level })}
              className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                data.automationLevel === level
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-foreground hover:border-primary/50"
              }`}
            >
              {t({
                en: level === "manual" ? "100% Manual" : level === "semi" ? "Semi-automatic" : "Automatic",
                fr: level === "manual" ? "100% Manuel" : level === "semi" ? "Semi-automatique" : "Automatique",
              })}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepCharacteristics({ data, onChange, t }: { data: ProcessDescription; onChange: (d: Partial<ProcessDescription>) => void; t: (v: { en: string; fr: string }) => string }) {
  const toggleItem = (field: "humanInterventions" | "dataTypes" | "tools" | "irritants", id: string) => {
    const current = data[field];
    const updated = current.includes(id) ? current.filter((i) => i !== id) : [...current, id];
    onChange({ [field]: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">{t({ en: "Process Characteristics", fr: "Caractéristiques du processus" })}</h3>
        <p className="text-sm text-muted-foreground">{t({ en: "Select all that apply to your process.", fr: "Sélectionnez tout ce qui s'applique à votre processus." })}</p>
      </div>

      {/* Human Interventions */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">{t({ en: "Types of Human Intervention", fr: "Types d'intervention humaine" })} *</label>
        <div className="flex flex-wrap gap-2">
          {HUMAN_INTERVENTIONS.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleItem("humanInterventions", item.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                data.humanInterventions.includes(item.id)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {t(item.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Data Types */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">{t({ en: "Data Types Handled", fr: "Types de données manipulées" })} *</label>
        <div className="flex flex-wrap gap-2">
          {DATA_TYPES.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleItem("dataTypes", item.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                data.dataTypes.includes(item.id)
                  ? "bg-blue-600 text-white"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {t(item.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">{t({ en: "Tools Used", fr: "Outils utilisés" })}</label>
        <div className="flex flex-wrap gap-2">
          {TOOLS_USED.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleItem("tools", item.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                data.tools.includes(item.id)
                  ? "bg-purple-600 text-white"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {t(item.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Irritants */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">{t({ en: "Pain Points / Irritants", fr: "Points de douleur / Irritants" })} *</label>
        <div className="flex flex-wrap gap-2">
          {IRRITANTS.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleItem("irritants", item.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                data.irritants.includes(item.id)
                  ? "bg-amber-600 text-white"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {t(item.label)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepResults({ result, process, t }: { result: EvaluationResult; process: ProcessDescription; t: (v: { en: string; fr: string }) => string }) {
  const potentialLabels = {
    very_high: { en: "Very High", fr: "Très élevé", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" },
    high: { en: "High", fr: "Élevé", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" },
    medium: { en: "Medium", fr: "Moyen", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" },
    low: { en: "Low", fr: "Faible", color: "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400" },
  };

  const matrixLabels = {
    quick_win: { en: "Quick Win — Prioritize", fr: "Quick Win — À prioriser", icon: <Zap className="w-5 h-5" />, color: "text-emerald-600" },
    strategic: { en: "Strategic Project — Plan carefully", fr: "Projet stratégique — Planifier avec soin", icon: <Target className="w-5 h-5" />, color: "text-blue-600" },
    optional: { en: "Optional — If resources available", fr: "Optionnel — Si ressources disponibles", icon: <TrendingUp className="w-5 h-5" />, color: "text-amber-600" },
    avoid: { en: "Avoid — Do not engage", fr: "À éviter — Ne pas engager", icon: <AlertTriangle className="w-5 h-5" />, color: "text-red-600" },
  };

  const gainLabels: Record<string, { en: string; fr: string }> = {
    time: { en: "Time savings", fr: "Gain de temps" },
    quality: { en: "Quality improvement", fr: "Amélioration qualité" },
    cost: { en: "Cost reduction", fr: "Réduction des coûts" },
    delays: { en: "Delay reduction", fr: "Réduction des délais" },
    satisfaction: { en: "Customer satisfaction", fr: "Satisfaction client" },
  };

  const recommendationLabels: Record<string, { en: string; fr: string }> = {
    quick_win_priority: { en: "This process is a Quick Win: high value, low complexity. Prioritize it.", fr: "Ce processus est un Quick Win : valeur élevée, complexité faible. Priorisez-le." },
    agent_candidate: { en: "Strong candidate for AI Agent automation (multi-step orchestration).", fr: "Candidat fort pour l'automatisation par Agent IA (orchestration multi-étapes)." },
    start_with_pilot: { en: "Start with a pilot on a subset of the volume before full deployment.", fr: "Commencez par un pilote sur un sous-ensemble du volume avant déploiement complet." },
    rag_quick_win: { en: "Implement semantic search (RAG) as a quick first step to reduce document search time.", fr: "Implémentez la recherche sémantique (RAG) comme première étape rapide pour réduire le temps de recherche documentaire." },
    phased_approach: { en: "High complexity: adopt a phased approach with incremental milestones.", fr: "Complexité élevée : adoptez une approche par phases avec des jalons incrémentaux." },
  };

  const potential = potentialLabels[result.potentialLevel];
  const matrix = matrixLabels[result.matrixPosition];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">{t({ en: "AI Evaluation Results", fr: "Résultats de l'évaluation IA" })}</h3>
        <p className="text-sm text-muted-foreground">
          {t({ en: `Analysis of "${process.name}" based on DATAS-STD-BPM-AI-001 methodology.`, fr: `Analyse de « ${process.name} » selon la méthodologie DATAS-STD-BPM-AI-001.` })}
        </p>
      </div>

      {/* Score Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <div className="text-3xl font-bold text-foreground mb-1">{result.potentialScore}%</div>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${potential.color}`}>
            {t(potential)}
          </span>
          <div className="text-xs text-muted-foreground mt-1">{t({ en: "AI Potential", fr: "Potentiel IA" })}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <div className={`flex items-center justify-center gap-2 mb-1 ${matrix.color}`}>
            {matrix.icon}
          </div>
          <div className="text-sm font-semibold text-foreground">{t(matrix)}</div>
          <div className="text-xs text-muted-foreground mt-1">{t({ en: "Matrix Position", fr: "Position matrice" })}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <div className={`text-2xl font-bold mb-1 ${potentialLabels[result.roiLevel].color.split(" ")[0]}`}>
            {t(potentialLabels[result.roiLevel])}
          </div>
          <div className="text-xs text-muted-foreground mt-1">{t({ en: "Estimated ROI", fr: "ROI estimé" })}</div>
        </div>
      </div>

      {/* Applicable Technologies */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          {t({ en: "Applicable AI Technologies", fr: "Technologies IA applicables" })}
        </h4>
        {result.applicableTechnologies.length > 0 ? (
          <div className="space-y-2.5">
            {result.applicableTechnologies.map((tech) => (
              <div key={tech.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-foreground">{tech.name}</span>
                    <span className="text-xs text-muted-foreground">{tech.relevance}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${tech.relevance}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t({ en: "No strong technology match found. Consider reviewing the process characteristics.", fr: "Aucune correspondance technologique forte trouvée. Considérez revoir les caractéristiques du processus." })}</p>
        )}
      </div>

      {/* Expected Gains */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          {t({ en: "Expected Gains", fr: "Gains attendus" })}
        </h4>
        <div className="flex flex-wrap gap-2">
          {result.expectedGains.map((gain) => (
            <span key={gain} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-3 h-3" />
              {t(gainLabels[gain] || { en: gain, fr: gain })}
            </span>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            {t({ en: "Recommendations", fr: "Recommandations" })}
          </h4>
          <ul className="space-y-2">
            {result.recommendations.map((rec) => (
              <li key={rec} className="flex items-start gap-2 text-sm text-foreground">
                <ArrowRight className="w-3.5 h-3.5 mt-0.5 text-primary flex-shrink-0" />
                {t(recommendationLabels[rec] || { en: rec, fr: rec })}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Credit */}
      <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
        {t({ en: "Methodology based on DATAS-STD-BPM-AI-001 v2.0 by Data Services (Datas).", fr: "Méthodologie basée sur DATAS-STD-BPM-AI-001 v2.0 de Data Services (Datas)." })}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function DiagnosticIA() {
  const { t, lang, toggleLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [step, setStep] = useState(0);
  const [process, setProcess] = useState<ProcessDescription>({
    name: "",
    domain: "",
    description: "",
    trigger: "",
    expectedResult: "",
    frequency: "",
    volumePerYear: "",
    avgTimeMinutes: "",
    agentsCount: "",
    automationLevel: "manual",
    humanInterventions: [],
    dataTypes: [],
    tools: [],
    irritants: [],
  });

  const updateProcess = (partial: Partial<ProcessDescription>) => {
    setProcess((prev) => ({ ...prev, ...partial }));
  };

  const result = useMemo(() => {
    if (step === 3) return evaluateProcess(process);
    return null;
  }, [step, process]);

  const steps = [
    { title: t({ en: "Identification", fr: "Identification" }), icon: <FileText className="w-4 h-4" /> },
    { title: t({ en: "Metrics", fr: "Métriques" }), icon: <BarChart3 className="w-4 h-4" /> },
    { title: t({ en: "Characteristics", fr: "Caractéristiques" }), icon: <Brain className="w-4 h-4" /> },
    { title: t({ en: "Results", fr: "Résultats" }), icon: <Zap className="w-4 h-4" /> },
  ];

  const canAdvance = () => {
    if (step === 0) return process.name.trim() !== "" && process.domain !== "" && process.description.trim() !== "";
    if (step === 1) return process.frequency !== "" && process.volumePerYear !== "" && process.avgTimeMinutes !== "" && process.agentsCount !== "";
    if (step === 2) return process.humanInterventions.length > 0 && process.dataTypes.length > 0 && process.irritants.length > 0;
    return true;
  };

  const reset = () => {
    setStep(0);
    setProcess({
      name: "", domain: "", description: "", trigger: "", expectedResult: "",
      frequency: "", volumePerYear: "", avgTimeMinutes: "", agentsCount: "",
      automationLevel: "manual", humanInterventions: [], dataTypes: [], tools: [], irritants: [],
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold text-foreground">Neopolis</span>
              <span className="text-xs bg-blue-500/15 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full font-semibold tracking-wide uppercase">{t({ en: "Diagnostic", fr: "Diagnostic" })}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={toggleLang} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">
              <span>{lang === "en" ? "🇬🇧" : "🇫🇷"}</span>
              {lang === "en" ? "EN" : "FR"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {t({ en: "AI Automatability Diagnostic", fr: "Diagnostic d'automatisabilité IA" })}
          </h1>
          <p className="text-muted-foreground">
            {t({ en: "Evaluate the AI potential of your business processes using the DATAS-STD-BPM-AI-001 methodology.", fr: "Évaluez le potentiel IA de vos processus métier selon la méthodologie DATAS-STD-BPM-AI-001 de Data Services." })}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {steps.map((s, i) => (
              <div key={i} className={`flex items-center gap-1.5 text-xs font-medium ${i <= step ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary/10 text-primary border-2 border-primary" : "bg-secondary text-muted-foreground"}`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : s.icon}
                </div>
                <span className="hidden sm:inline">{s.title}</span>
              </div>
            ))}
          </div>
          <Progress value={((step + 1) / steps.length) * 100} className="h-1.5" />
        </div>

        {/* Step Content */}
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm mb-6">
          {step === 0 && <StepIdentification data={process} onChange={updateProcess} t={t} />}
          {step === 1 && <StepMetrics data={process} onChange={updateProcess} t={t} />}
          {step === 2 && <StepCharacteristics data={process} onChange={updateProcess} t={t} />}
          {step === 3 && result && <StepResults result={result} process={process} t={t} />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div>
            {step > 0 && step < 3 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t({ en: "Previous", fr: "Précédent" })}
              </Button>
            )}
            {step === 3 && (
              <Button variant="outline" onClick={reset} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                {t({ en: "New Diagnostic", fr: "Nouveau diagnostic" })}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {step === 3 && (
              <Link href="/training/transformation_processus_ia">
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  {t({ en: "Follow the Training", fr: "Suivre la formation" })}
                </Button>
              </Link>
            )}
            {step < 3 && (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canAdvance()}
                className="gap-2"
              >
                {step === 2 ? t({ en: "Evaluate", fr: "Évaluer" }) : t({ en: "Next", fr: "Suivant" })}
                {step === 2 ? <Zap className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
