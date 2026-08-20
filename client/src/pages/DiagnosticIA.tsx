import { useState, useMemo, useCallback } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import { Progress } from "@/components/ui/progress";
import { BrandLogo } from "@/components/BrandLogo";
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
  Building2,
  Users,
  Clock,
  Database,
  Wrench,
  AlertCircle,
  Layers,
  Shield,
  Gauge,
  Lightbulb,
  PieChart,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

interface ProcessSheet {
  // Section A: Identification
  code: string;
  name: string;
  domain: string;
  valueStreamCategory: "governance" | "core_business" | "support" | "control" | "";
  owner: string;
  department: string;

  // Section B: Description
  objective: string;
  trigger: string;
  expectedOutput: string;

  // Section D: Resources
  agentsFTE: string;
  frequency: string;
  volumePerYear: string;
  avgTimeMinutes: string;

  // Section E: Costs (structured ranges)
  humanCostLevel: "" | "very_low" | "low" | "medium" | "high" | "very_high";
  itCostLevel: "" | "very_low" | "low" | "medium" | "high" | "very_high";

  // Section F: Performance
  errorRateLevel: "" | "none" | "low" | "medium" | "high" | "very_high";
  slaCompliance: "" | "always" | "mostly" | "sometimes" | "rarely";
  avgWaitDays: string;

  // Section G: Current Automation Level
  automationLevel: "" | "manual" | "semi" | "auto";

  // Section H: Type of Human Intervention
  humanInterventions: string[];

  // Section I: Data Handled
  dataTypes: string[];

  // Section J: Tools Used
  tools: string[];

  // Section K: Difficulties (Pain Points)
  irritants: string[];

  // Phase 3 Criterion 4 - Complexity factors
  dataReadiness: "" | "ready" | "partial" | "unavailable";
  systemsToIntegrate: "" | "none" | "one_two" | "three_plus";
  changeManagement: "" | "minimal" | "moderate" | "significant";
  regulatoryConstraints: "" | "none" | "some" | "heavy";
  technicalMaturity: "" | "proven" | "emerging" | "experimental";

  // Optional free-text fields (context & description)
  organizationalContext: string;
  processDescription: string;
  additionalNotes: string;
}

interface EvaluationResult {
  // Criterion 1
  volumeScore: number;
  dataStructureScore: number;
  repetitivenessScore: number;
  painPointsScore: number;
  overallPotentialScore: number;
  potentialLevel: "very_high" | "high" | "medium" | "low";

  // Criterion 2
  applicableTechnologies: { id: string; name: string; relevance: number; signals: string[] }[];

  // Criterion 3
  expectedGains: { type: string; description: string; quantification: string }[];

  // Criterion 4
  complexityScore: number;
  complexityLevel: "low" | "medium" | "high" | "very_high";
  roiLevel: "very_high" | "high" | "medium" | "low";

  // Matrix
  valueScore: number;
  matrixPosition: "quick_win" | "strategic" | "optional" | "avoid";
  priorityScore: number;

  // Use Case Sheet fields
  recommendations: string[];
}

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS — All structured options from DATAS-STD-BPM-AI-001
   ═══════════════════════════════════════════════════════════════ */

const VALUE_STREAM_CATEGORIES = [
  { id: "governance", label: { en: "Governance (Strategy, Risk, Compliance, Audit)", fr: "Pilotage (Stratégie, Risques, Conformité, Audit)" } },
  { id: "core_business", label: { en: "Core Business (Direct value creation)", fr: "Cœur de métier (Création de valeur directe)" } },
  { id: "support", label: { en: "Support (HR, Finance, IT, Legal, Procurement)", fr: "Support (RH, Finance, IT, Juridique, Achats)" } },
  { id: "control", label: { en: "Control (Quality, Fraud, Security, Incidents)", fr: "Contrôle (Qualité, Fraude, Sécurité, Incidents)" } },
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
  { id: "risk", label: { en: "Risk Management", fr: "Gestion des Risques" } },
  { id: "procurement", label: { en: "Procurement", fr: "Achats" } },
  { id: "production", label: { en: "Production & Manufacturing", fr: "Production & Fabrication" } },
];

const TRIGGERS = [
  { id: "customer_request", label: { en: "Customer request", fr: "Demande client" } },
  { id: "internal_request", label: { en: "Internal request", fr: "Demande interne" } },
  { id: "scheduled", label: { en: "Scheduled/periodic", fr: "Planifié/périodique" } },
  { id: "event_driven", label: { en: "Event-driven (alert, threshold)", fr: "Événementiel (alerte, seuil)" } },
  { id: "document_receipt", label: { en: "Document receipt", fr: "Réception de document" } },
  { id: "regulatory", label: { en: "Regulatory deadline", fr: "Échéance réglementaire" } },
  { id: "exception", label: { en: "Exception/incident", fr: "Exception/incident" } },
];

const EXPECTED_OUTPUTS = [
  { id: "document_produced", label: { en: "Document produced", fr: "Document produit" } },
  { id: "decision_made", label: { en: "Decision made", fr: "Décision prise" } },
  { id: "data_updated", label: { en: "Data updated in system", fr: "Données mises à jour" } },
  { id: "service_delivered", label: { en: "Service delivered", fr: "Service délivré" } },
  { id: "approval_granted", label: { en: "Approval granted/denied", fr: "Approbation accordée/refusée" } },
  { id: "report_generated", label: { en: "Report generated", fr: "Rapport généré" } },
  { id: "notification_sent", label: { en: "Notification sent", fr: "Notification envoyée" } },
  { id: "payment_processed", label: { en: "Payment processed", fr: "Paiement traité" } },
];

const OBJECTIVES = [
  { id: "process_request", label: { en: "Process a request/demand", fr: "Traiter une demande" } },
  { id: "produce_deliverable", label: { en: "Produce a deliverable", fr: "Produire un livrable" } },
  { id: "verify_compliance", label: { en: "Verify compliance", fr: "Vérifier la conformité" } },
  { id: "manage_relationship", label: { en: "Manage a relationship", fr: "Gérer une relation" } },
  { id: "monitor_performance", label: { en: "Monitor performance", fr: "Suivre la performance" } },
  { id: "resolve_issue", label: { en: "Resolve an issue", fr: "Résoudre un problème" } },
  { id: "plan_allocate", label: { en: "Plan/allocate resources", fr: "Planifier/allouer des ressources" } },
  { id: "control_quality", label: { en: "Control quality", fr: "Contrôler la qualité" } },
];

const FREQUENCIES = [
  { id: "continuous", label: { en: "Continuous (multiple times/day)", fr: "Continue (plusieurs fois/jour)" } },
  { id: "daily", label: { en: "Daily", fr: "Quotidienne" } },
  { id: "weekly", label: { en: "Weekly", fr: "Hebdomadaire" } },
  { id: "monthly", label: { en: "Monthly", fr: "Mensuelle" } },
  { id: "quarterly", label: { en: "Quarterly", fr: "Trimestrielle" } },
  { id: "annual", label: { en: "Annual", fr: "Annuelle" } },
  { id: "on_demand", label: { en: "On demand", fr: "À la demande" } },
];

const VOLUME_RANGES = [
  { id: "under_100", label: { en: "< 100 /year", fr: "< 100 /an" }, score: 1 },
  { id: "100_1000", label: { en: "100 – 1,000 /year", fr: "100 – 1 000 /an" }, score: 2 },
  { id: "1000_10000", label: { en: "1,000 – 10,000 /year", fr: "1 000 – 10 000 /an" }, score: 3 },
  { id: "over_10000", label: { en: "> 10,000 /year", fr: "> 10 000 /an" }, score: 4 },
];

const AVG_TIME_RANGES = [
  { id: "under_5", label: { en: "< 5 min", fr: "< 5 min" } },
  { id: "5_15", label: { en: "5 – 15 min", fr: "5 – 15 min" } },
  { id: "15_60", label: { en: "15 – 60 min", fr: "15 – 60 min" } },
  { id: "1_4h", label: { en: "1 – 4 hours", fr: "1 – 4 heures" } },
  { id: "4h_1d", label: { en: "4h – 1 day", fr: "4h – 1 jour" } },
  { id: "over_1d", label: { en: "> 1 day", fr: "> 1 jour" } },
];

const AGENTS_RANGES = [
  { id: "1", label: { en: "1 person", fr: "1 personne" } },
  { id: "2_3", label: { en: "2-3 people", fr: "2-3 personnes" } },
  { id: "4_10", label: { en: "4-10 people", fr: "4-10 personnes" } },
  { id: "11_50", label: { en: "11-50 people", fr: "11-50 personnes" } },
  { id: "over_50", label: { en: "> 50 people", fr: "> 50 personnes" } },
];

const COST_LEVELS = [
  { id: "very_low", label: { en: "Very low (< 10k€/year)", fr: "Très faible (< 10k€/an)" } },
  { id: "low", label: { en: "Low (10-50k€/year)", fr: "Faible (10-50k€/an)" } },
  { id: "medium", label: { en: "Medium (50-200k€/year)", fr: "Moyen (50-200k€/an)" } },
  { id: "high", label: { en: "High (200-500k€/year)", fr: "Élevé (200-500k€/an)" } },
  { id: "very_high", label: { en: "Very high (> 500k€/year)", fr: "Très élevé (> 500k€/an)" } },
];

const ERROR_RATES = [
  { id: "none", label: { en: "None (0%)", fr: "Aucune (0%)" } },
  { id: "low", label: { en: "Low (< 2%)", fr: "Faible (< 2%)" } },
  { id: "medium", label: { en: "Medium (2-5%)", fr: "Moyen (2-5%)" } },
  { id: "high", label: { en: "High (5-15%)", fr: "Élevé (5-15%)" } },
  { id: "very_high", label: { en: "Very high (> 15%)", fr: "Très élevé (> 15%)" } },
];

const SLA_COMPLIANCE = [
  { id: "always", label: { en: "Always met (> 95%)", fr: "Toujours respecté (> 95%)" } },
  { id: "mostly", label: { en: "Mostly met (80-95%)", fr: "Souvent respecté (80-95%)" } },
  { id: "sometimes", label: { en: "Sometimes met (50-80%)", fr: "Parfois respecté (50-80%)" } },
  { id: "rarely", label: { en: "Rarely met (< 50%)", fr: "Rarement respecté (< 50%)" } },
];

const WAIT_DAYS = [
  { id: "0", label: { en: "No wait", fr: "Pas d'attente" } },
  { id: "1", label: { en: "< 1 day", fr: "< 1 jour" } },
  { id: "2_5", label: { en: "2-5 days", fr: "2-5 jours" } },
  { id: "5_15", label: { en: "5-15 days", fr: "5-15 jours" } },
  { id: "over_15", label: { en: "> 15 days", fr: "> 15 jours" } },
];

const AUTOMATION_LEVELS = [
  { id: "manual", label: { en: "100% Manual", fr: "100% Manuel" }, description: { en: "No system support, paper-based or fully human", fr: "Aucun support système, papier ou entièrement humain" } },
  { id: "semi", label: { en: "Semi-automatic", fr: "Semi-automatique" }, description: { en: "Some steps automated, human intervention required", fr: "Certaines étapes automatisées, intervention humaine requise" } },
  { id: "auto", label: { en: "Automatic", fr: "Automatique" }, description: { en: "Mostly automated, human only for exceptions", fr: "Principalement automatisé, humain uniquement pour les exceptions" } },
];

// Section H - Human Interventions (CRUCIAL for Phase 3)
const HUMAN_INTERVENTIONS = [
  { id: "decision", label: { en: "Decision", fr: "Décision" }, description: { en: "Requires significant human judgment", fr: "Nécessite un jugement humain significatif" }, repetitivenessScore: 1 },
  { id: "validation", label: { en: "Validation/Approval", fr: "Validation/Approbation" }, description: { en: "Requires some judgment for approval", fr: "Nécessite un certain jugement pour approbation" }, repetitivenessScore: 2 },
  { id: "control", label: { en: "Control/Verification", fr: "Contrôle/Vérification" }, description: { en: "Pattern-based, semi-repetitive", fr: "Basé sur des patterns, semi-répétitif" }, repetitivenessScore: 3 },
  { id: "search", label: { en: "Information Search", fr: "Recherche d'information" }, description: { en: "Pattern-based, semi-repetitive", fr: "Basé sur des patterns, semi-répétitif" }, repetitivenessScore: 3 },
  { id: "data_entry", label: { en: "Data Entry", fr: "Saisie de données" }, description: { en: "Highly repetitive, rule-based", fr: "Très répétitif, basé sur des règles" }, repetitivenessScore: 4 },
  { id: "calculation", label: { en: "Calculation", fr: "Calcul" }, description: { en: "Highly repetitive, rule-based", fr: "Très répétitif, basé sur des règles" }, repetitivenessScore: 4 },
  { id: "communication", label: { en: "Communication", fr: "Communication" }, description: { en: "Interaction with stakeholders", fr: "Interaction avec les parties prenantes" }, repetitivenessScore: 3 },
];

// Section I - Data Types (CRUCIAL for Phase 3)
const DATA_TYPES = [
  { id: "documents", label: { en: "Text Documents", fr: "Documents texte" }, structureLevel: "unstructured" as const },
  { id: "images", label: { en: "Images/Scans", fr: "Images/Scans" }, structureLevel: "unstructured" as const },
  { id: "pdf", label: { en: "PDF Files", fr: "Fichiers PDF" }, structureLevel: "semi_structured" as const },
  { id: "emails", label: { en: "Emails", fr: "Emails" }, structureLevel: "semi_structured" as const },
  { id: "physical_mail", label: { en: "Physical Mail", fr: "Courriers physiques" }, structureLevel: "unstructured" as const },
  { id: "database", label: { en: "Database Records", fr: "Base de données" }, structureLevel: "structured" as const },
  { id: "erp", label: { en: "ERP/CRM Data", fr: "Données ERP/CRM" }, structureLevel: "structured" as const },
  { id: "spreadsheets", label: { en: "Spreadsheets", fr: "Tableurs/Excel" }, structureLevel: "structured" as const },
  { id: "audio", label: { en: "Audio/Voice", fr: "Audio/Voix" }, structureLevel: "unstructured" as const },
  { id: "web", label: { en: "Web Data/APIs", fr: "Données web/APIs" }, structureLevel: "fully_digital" as const },
  { id: "sensor", label: { en: "Sensor/IoT Data", fr: "Données capteurs/IoT" }, structureLevel: "fully_digital" as const },
  { id: "forms", label: { en: "Structured Forms", fr: "Formulaires structurés" }, structureLevel: "structured" as const },
];

// Section J - Tools
const TOOLS_USED = [
  { id: "erp_software", label: { en: "ERP Software", fr: "Logiciel ERP" } },
  { id: "internal_app", label: { en: "Internal Applications", fr: "Applications internes" } },
  { id: "excel", label: { en: "Excel/Spreadsheets", fr: "Excel/Tableurs" } },
  { id: "web_portal", label: { en: "Web Portals", fr: "Portails web" } },
  { id: "email_client", label: { en: "Email Client", fr: "Client email" } },
  { id: "crm", label: { en: "CRM", fr: "CRM" } },
  { id: "paper", label: { en: "Paper/Manual", fr: "Papier/Manuel" } },
  { id: "api", label: { en: "APIs/Integrations", fr: "APIs/Intégrations" } },
  { id: "bpm_workflow", label: { en: "BPM/Workflow tool", fr: "Outil BPM/Workflow" } },
  { id: "dms", label: { en: "Document Management (GED)", fr: "Gestion documentaire (GED)" } },
  { id: "bi_reporting", label: { en: "BI/Reporting tool", fr: "Outil BI/Reporting" } },
];

// Section K - Irritants/Pain Points (CRUCIAL for Phase 3)
const IRRITANTS = [
  { id: "time_waste", label: { en: "Time wasted on low-value tasks", fr: "Temps perdu sur tâches à faible valeur" } },
  { id: "double_entry", label: { en: "Double/triple data entry", fr: "Double/triple saisie" } },
  { id: "frequent_errors", label: { en: "Frequent errors", fr: "Erreurs fréquentes" } },
  { id: "recurring_delays", label: { en: "Recurring delays", fr: "Retards récurrents" } },
  { id: "doc_search", label: { en: "Time-consuming document search", fr: "Recherche documentaire chronophage" } },
  { id: "slow_validation", label: { en: "Slow validation/approval chain", fr: "Chaîne de validation lente" } },
  { id: "manual_repetition", label: { en: "Repetitive manual tasks", fr: "Tâches manuelles répétitives" } },
  { id: "lack_visibility", label: { en: "Lack of visibility/tracking", fr: "Manque de visibilité/suivi" } },
  { id: "inconsistency", label: { en: "Inconsistent outputs", fr: "Résultats incohérents" } },
  { id: "information_silos", label: { en: "Information silos", fr: "Silos d'information" } },
  { id: "compliance_risk", label: { en: "Compliance/regulatory risk", fr: "Risque de conformité/réglementaire" } },
  { id: "customer_complaints", label: { en: "Customer complaints", fr: "Réclamations clients" } },
];

// Complexity factors for Phase 3 Criterion 4
const DATA_READINESS = [
  { id: "ready", label: { en: "Data available and quality-checked", fr: "Données disponibles et qualifiées" }, score: 1 },
  { id: "partial", label: { en: "Partially available, needs cleaning", fr: "Partiellement disponibles, nettoyage nécessaire" }, score: 2 },
  { id: "unavailable", label: { en: "Not available, needs collection", fr: "Non disponibles, collecte nécessaire" }, score: 3 },
];

const SYSTEMS_TO_INTEGRATE = [
  { id: "none", label: { en: "None (standalone)", fr: "Aucun (autonome)" }, score: 1 },
  { id: "one_two", label: { en: "1-2 systems", fr: "1-2 systèmes" }, score: 2 },
  { id: "three_plus", label: { en: "3+ systems", fr: "3+ systèmes" }, score: 3 },
];

const CHANGE_MANAGEMENT = [
  { id: "minimal", label: { en: "Minimal (same team, similar process)", fr: "Minimal (même équipe, processus similaire)" }, score: 1 },
  { id: "moderate", label: { en: "Moderate (new skills needed)", fr: "Modéré (nouvelles compétences requises)" }, score: 2 },
  { id: "significant", label: { en: "Significant (organizational change)", fr: "Significatif (changement organisationnel)" }, score: 3 },
];

const REGULATORY_CONSTRAINTS = [
  { id: "none", label: { en: "None", fr: "Aucune" }, score: 1 },
  { id: "some", label: { en: "Some (data privacy, audit trail)", fr: "Quelques (données personnelles, traçabilité)" }, score: 2 },
  { id: "heavy", label: { en: "Heavy (regulated sector, certification)", fr: "Fortes (secteur régulé, certification)" }, score: 3 },
];

const TECHNICAL_MATURITY = [
  { id: "proven", label: { en: "Proven technology (off-the-shelf)", fr: "Technologie éprouvée (sur étagère)" }, score: 1 },
  { id: "emerging", label: { en: "Emerging (requires customization)", fr: "Émergente (nécessite personnalisation)" }, score: 2 },
  { id: "experimental", label: { en: "Experimental (R&D needed)", fr: "Expérimentale (R&D nécessaire)" }, score: 3 },
];

// 13 AI Technologies from the standard
const AI_TECHNOLOGIES = [
  { id: "ocr", name: "OCR", dataSignals: ["documents", "images", "pdf", "physical_mail"], interventionSignals: ["data_entry"], irritantSignals: ["double_entry"], description: { en: "Document digitization and text extraction", fr: "Numérisation de documents et extraction de texte" } },
  { id: "llm", name: "LLM", dataSignals: ["documents", "emails"], interventionSignals: ["communication", "search"], irritantSignals: ["time_waste"], description: { en: "Text generation, synthesis, writing assistance", fr: "Génération de texte, synthèse, assistance rédactionnelle" } },
  { id: "computer_vision", name: { en: "Computer Vision", fr: "Vision par ordinateur" }, dataSignals: ["images", "sensor"], interventionSignals: ["control"], irritantSignals: ["frequent_errors"], description: { en: "Image analysis, defect detection", fr: "Analyse d'images, détection de défauts" } },
  { id: "speech_to_text", name: "Speech-to-Text", dataSignals: ["audio"], interventionSignals: ["communication"], irritantSignals: [], description: { en: "Conversation/call transcription", fr: "Transcription de conversations/appels" } },
  { id: "voicebot", name: "Voicebot", dataSignals: ["audio"], interventionSignals: ["communication"], irritantSignals: ["time_waste", "recurring_delays"], description: { en: "Automated voice interactions", fr: "Automatisation d'interactions vocales" } },
  { id: "ai_agent", name: { en: "AI Agent", fr: "Agent IA" }, dataSignals: ["database", "erp", "web"], interventionSignals: ["data_entry", "search", "calculation"], irritantSignals: ["manual_repetition", "double_entry", "recurring_delays"], description: { en: "End-to-end automation of multi-step processes", fr: "Automatisation bout en bout de processus multi-étapes" } },
  { id: "ml_classic", name: "Machine Learning", dataSignals: ["database", "spreadsheets", "erp"], interventionSignals: ["decision", "calculation"], irritantSignals: [], description: { en: "Predictive models, classification", fr: "Modèles prédictifs, classification" } },
  { id: "optimization", name: { en: "Optimization", fr: "Optimisation" }, dataSignals: ["database", "spreadsheets"], interventionSignals: ["calculation", "decision"], irritantSignals: ["time_waste"], description: { en: "Combinatorial problems (routing, scheduling)", fr: "Problèmes combinatoires (tournées, plannings)" } },
  { id: "prediction", name: { en: "Prediction", fr: "Prédiction" }, dataSignals: ["database", "erp", "sensor"], interventionSignals: ["decision"], irritantSignals: ["recurring_delays"], description: { en: "Anticipating future events from historical data", fr: "Anticipation d'événements futurs à partir de données historiques" } },
  { id: "anomaly_detection", name: { en: "Anomaly Detection", fr: "Détection d'anomalies" }, dataSignals: ["database", "erp", "sensor"], interventionSignals: ["control"], irritantSignals: ["frequent_errors", "compliance_risk"], description: { en: "Identification of atypical behaviors", fr: "Identification de comportements atypiques" } },
  { id: "recommendation", name: { en: "Recommendation", fr: "Recommandation" }, dataSignals: ["database", "erp"], interventionSignals: ["decision", "communication"], irritantSignals: ["customer_complaints"], description: { en: "Personalized suggestions", fr: "Suggestions personnalisées" } },
  { id: "doc_extraction", name: { en: "Document Extraction", fr: "Extraction documentaire" }, dataSignals: ["documents", "pdf", "emails", "forms"], interventionSignals: ["data_entry", "search"], irritantSignals: ["double_entry", "doc_search"], description: { en: "Structured extraction from unstructured documents", fr: "Extraction structurée depuis documents non structurés" } },
  { id: "rag", name: "RAG (Recherche sémantique)", dataSignals: ["documents", "database", "web"], interventionSignals: ["search"], irritantSignals: ["doc_search", "information_silos"], description: { en: "Contextualized search on document base", fr: "Recherche contextualisée sur base documentaire" } },
];

/* ═══════════════════════════════════════════════════════════════
   SCORING ENGINE — Faithful to DATAS-STD-BPM-AI-001
   ═══════════════════════════════════════════════════════════════ */

function evaluateProcess(process: ProcessSheet): EvaluationResult {
  // ── Criterion 1: Overall AI Potential ──

  // Factor 1: Volume (1-4) from structured selector
  const volumeItem = VOLUME_RANGES.find(v => v.id === process.volumePerYear);
  const volumeScore = volumeItem?.score ?? 1;

  // Factor 2: Data Structure (1-4) from Section I data types
  const structureLevels = process.dataTypes.map(dt => DATA_TYPES.find(d => d.id === dt)?.structureLevel).filter(Boolean);
  let dataStructureScore = 1;
  const hasFullyDigital = structureLevels.includes("fully_digital");
  const hasStructured = structureLevels.includes("structured");
  const hasSemiStructured = structureLevels.includes("semi_structured");
  if (hasFullyDigital) dataStructureScore = 4;
  else if (hasStructured && !structureLevels.includes("unstructured")) dataStructureScore = 3;
  else if (hasSemiStructured || hasStructured) dataStructureScore = 2;
  else dataStructureScore = 1;

  // Factor 3: Repetitiveness (1-4) from Section H - highest repetitiveness score
  const interventionScores = process.humanInterventions.map(hi => HUMAN_INTERVENTIONS.find(h => h.id === hi)?.repetitivenessScore ?? 1);
  const repetitivenessScore = interventionScores.length > 0 ? Math.max(...interventionScores) : 1;

  // Factor 4: Pain Points (1-4) from Section K count
  let painPointsScore = 1;
  const irritantCount = process.irritants.length;
  if (irritantCount >= 5) painPointsScore = 4;
  else if (irritantCount >= 3) painPointsScore = 3;
  else if (irritantCount >= 2) painPointsScore = 2;

  // Overall = Average
  const overallPotentialScore = (volumeScore + dataStructureScore + repetitivenessScore + painPointsScore) / 4;
  let potentialLevel: EvaluationResult["potentialLevel"] = "low";
  if (overallPotentialScore >= 3.5) potentialLevel = "very_high";
  else if (overallPotentialScore >= 2.5) potentialLevel = "high";
  else if (overallPotentialScore >= 1.5) potentialLevel = "medium";

  // ── Criterion 2: Applicable AI Technologies ──
  const applicableTechnologies = AI_TECHNOLOGIES.map(tech => {
    let relevance = 0;
    const signals: string[] = [];

    const matchingData = tech.dataSignals.filter(s => process.dataTypes.includes(s));
    if (matchingData.length > 0) {
      relevance += matchingData.length * 20;
      signals.push(`Data: ${matchingData.join(", ")}`);
    }

    const matchingInterventions = tech.interventionSignals.filter(i => process.humanInterventions.includes(i));
    if (matchingInterventions.length > 0) {
      relevance += matchingInterventions.length * 25;
      signals.push(`H: ${matchingInterventions.join(", ")}`);
    }

    const matchingIrritants = tech.irritantSignals.filter(ir => process.irritants.includes(ir));
    if (matchingIrritants.length > 0) {
      relevance += matchingIrritants.length * 20;
      signals.push(`K: ${matchingIrritants.join(", ")}`);
    }

    // Bonus for semi-auto + AI Agent
    if (tech.id === "ai_agent" && process.automationLevel === "semi" && process.tools.includes("api")) relevance += 15;

    return {
      id: tech.id,
      name: typeof tech.name === "string" ? tech.name : tech.name.fr,
      relevance: Math.min(relevance, 100),
      signals,
    };
  }).filter(t => t.relevance > 15).sort((a, b) => b.relevance - a.relevance).slice(0, 8);

  // ── Criterion 3: Expected Gains ──
  const expectedGains: { type: string; description: string; quantification: string }[] = [];
  if (process.irritants.includes("time_waste") || process.irritants.includes("manual_repetition"))
    expectedGains.push({ type: "time", description: "Réduction du temps de traitement", quantification: "Estimation basée sur le volume et le temps moyen" });
  if (process.irritants.includes("frequent_errors") || process.irritants.includes("inconsistency"))
    expectedGains.push({ type: "quality", description: "Amélioration de la qualité / réduction des erreurs", quantification: `Taux d'erreur actuel: ${ERROR_RATES.find(e => e.id === process.errorRateLevel)?.label.fr ?? "N/A"}` });
  if (process.humanCostLevel === "high" || process.humanCostLevel === "very_high" || process.agentsFTE === "4_10" || process.agentsFTE === "11_50" || process.agentsFTE === "over_50")
    expectedGains.push({ type: "cost", description: "Réduction des coûts opérationnels", quantification: `Coût humain actuel: ${COST_LEVELS.find(c => c.id === process.humanCostLevel)?.label.fr ?? "N/A"}` });
  if (process.irritants.includes("recurring_delays") || process.irritants.includes("slow_validation"))
    expectedGains.push({ type: "delays", description: "Réduction des délais", quantification: `Temps d'attente actuel: ${WAIT_DAYS.find(w => w.id === process.avgWaitDays)?.label.fr ?? "N/A"}` });
  if (process.irritants.includes("customer_complaints") || process.humanInterventions.includes("communication"))
    expectedGains.push({ type: "satisfaction", description: "Amélioration de la satisfaction client", quantification: "Réduction des réclamations et délais de réponse" });
  if (process.irritants.includes("compliance_risk"))
    expectedGains.push({ type: "compliance", description: "Réduction du risque de conformité", quantification: "Automatisation des contrôles réglementaires" });
  if (expectedGains.length === 0)
    expectedGains.push({ type: "time", description: "Gain de temps général", quantification: "Automatisation des tâches répétitives" });

  // ── Criterion 4: Complexity & ROI ──
  const dataReadinessScore = DATA_READINESS.find(d => d.id === process.dataReadiness)?.score ?? 2;
  const systemsScore = SYSTEMS_TO_INTEGRATE.find(s => s.id === process.systemsToIntegrate)?.score ?? 2;
  const changeScore = CHANGE_MANAGEMENT.find(c => c.id === process.changeManagement)?.score ?? 2;
  const regulatoryScore = REGULATORY_CONSTRAINTS.find(r => r.id === process.regulatoryConstraints)?.score ?? 1;
  const maturityScore = TECHNICAL_MATURITY.find(t => t.id === process.technicalMaturity)?.score ?? 2;

  const complexityScore = (dataReadinessScore + systemsScore + changeScore + regulatoryScore + maturityScore) / 5;
  let complexityLevel: EvaluationResult["complexityLevel"] = "low";
  if (complexityScore >= 2.5) complexityLevel = "very_high";
  else if (complexityScore >= 2.0) complexityLevel = "high";
  else if (complexityScore >= 1.5) complexityLevel = "medium";

  // ROI = Value vs Complexity
  const valueScore = overallPotentialScore;
  let roiLevel: EvaluationResult["roiLevel"] = "low";
  if (valueScore >= 2.5 && complexityScore <= 1.5) roiLevel = "very_high";
  else if (valueScore >= 2.5 && complexityScore <= 2.0) roiLevel = "high";
  else if (valueScore >= 1.5 && complexityScore <= 2.0) roiLevel = "medium";

  // Matrix position
  let matrixPosition: EvaluationResult["matrixPosition"] = "optional";
  if (valueScore >= 2.5 && complexityScore <= 2.0) matrixPosition = "quick_win";
  else if (valueScore >= 2.5 && complexityScore > 2.0) matrixPosition = "strategic";
  else if (valueScore < 2.5 && complexityScore > 2.0) matrixPosition = "avoid";

  // Priority Score = (Value × 0.6) − (Complexity × 0.4) normalized to 0-100
  const priorityScore = Math.round(((valueScore * 0.6 - complexityScore * 0.4) + 1) * 33.3);

  // Recommendations
  const recommendations: string[] = [];
  if (matrixPosition === "quick_win") recommendations.push("quick_win");
  if (matrixPosition === "strategic") recommendations.push("strategic");
  if (matrixPosition === "avoid") recommendations.push("avoid");
  if (applicableTechnologies.length > 0 && applicableTechnologies[0].id === "ai_agent") recommendations.push("agent_candidate");
  if (process.automationLevel === "manual" && potentialLevel !== "low") recommendations.push("pilot_first");
  if (process.irritants.includes("doc_search")) recommendations.push("rag_quick_win");
  if (complexityLevel === "very_high") recommendations.push("phased_approach");
  if (process.valueStreamCategory === "support" || process.valueStreamCategory === "control") recommendations.push("support_control_roi");

  return {
    volumeScore,
    dataStructureScore,
    repetitivenessScore,
    painPointsScore,
    overallPotentialScore,
    potentialLevel,
    applicableTechnologies,
    expectedGains,
    complexityScore,
    complexityLevel,
    roiLevel,
    valueScore,
    matrixPosition,
    priorityScore,
    recommendations,
  };
}

/* ═══════════════════════════════════════════════════════════════
   UI COMPONENTS — Reusable selectors
   ═══════════════════════════════════════════════════════════════ */

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function SingleSelect({ label, options, value, onChange, required }: {
  label: string;
  options: { id: string; label: { en: string; fr: string }; description?: { en: string; fr: string } }[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="grid gap-2">
        {options.map(opt => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`text-left px-3.5 py-2.5 rounded-lg border text-sm transition-all ${
              value === opt.id
                ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/30"
                : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary/50"
            }`}
          >
            <span className="font-medium">{t(opt.label)}</span>
            {opt.description && <span className="block text-xs text-muted-foreground mt-0.5">{t(opt.description)}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function MultiSelect({ label, options, selected, onChange, required, maxCols }: {
  label: string;
  options: { id: string; label: { en: string; fr: string }; description?: { en: string; fr: string } }[];
  selected: string[];
  onChange: (v: string[]) => void;
  required?: boolean;
  maxCols?: number;
}) {
  const { t } = useLanguage();
  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  };
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        {label} {required && <span className="text-red-500">*</span>}
        {selected.length > 0 && <span className="ml-2 text-xs text-primary font-normal">({selected.length})</span>}
      </label>
      <div className={`grid gap-2 ${maxCols === 3 ? "md:grid-cols-3" : maxCols === 2 ? "md:grid-cols-2" : "md:grid-cols-2"}`}>
        {options.map(opt => (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt.id)}
            className={`text-left px-3 py-2 rounded-lg border text-sm transition-all ${
              selected.includes(opt.id)
                ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/30"
                : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary/50"
            }`}
          >
            <span className="font-medium">{t(opt.label)}</span>
            {opt.description && <span className="block text-xs text-muted-foreground mt-0.5">{t(opt.description)}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP COMPONENTS — 7 Steps covering all 12 sections + Phase 3/4
   ═══════════════════════════════════════════════════════════════ */

function Step1Identification({ data, onChange }: { data: ProcessSheet; onChange: (d: Partial<ProcessSheet>) => void }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Building2 className="w-5 h-5 text-primary" />}
        title={t({ en: "Phase 2 — Sections A & B: Identification", fr: "Phase 2 — Sections A & B : Identification" })}
        subtitle={t({ en: "Anchor the process in the reference framework (Phase 1)", fr: "Ancrer le processus dans le référentiel (Phase 1)" })}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t({ en: "Process Code", fr: "Code processus" })}</label>
          <select value={data.code} onChange={e => onChange({ code: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm">
            <option value="">{t({ en: "Select a code pattern...", fr: "Sélectionner un pattern..." })}</option>
            <option value="PIL">PIL — {t({ en: "Governance", fr: "Pilotage" })}</option>
            <option value="MET">MET — {t({ en: "Core Business", fr: "Cœur de métier" })}</option>
            <option value="SUP">SUP — {t({ en: "Support", fr: "Support" })}</option>
            <option value="CTR">CTR — {t({ en: "Control", fr: "Contrôle" })}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t({ en: "Process Name", fr: "Nom du processus" })} <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={data.name}
            onChange={e => onChange({ name: e.target.value })}
            placeholder={t({ en: "e.g., Invoice Processing", fr: "ex: Traitement des factures" })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <SingleSelect
        label={t({ en: "Value Stream Category (APQC)", fr: "Catégorie de chaîne de valeur (APQC)" })}
        options={VALUE_STREAM_CATEGORIES}
        value={data.valueStreamCategory}
        onChange={v => onChange({ valueStreamCategory: v as ProcessSheet["valueStreamCategory"] })}
        required
      />

      <SingleSelect
        label={t({ en: "Domain", fr: "Domaine" })}
        options={DOMAINS}
        value={data.domain}
        onChange={v => onChange({ domain: v })}
        required
      />

      <SingleSelect
        label={t({ en: "Process Objective (Section B)", fr: "Objectif du processus (Section B)" })}
        options={OBJECTIVES}
        value={data.objective}
        onChange={v => onChange({ objective: v })}
        required
      />

      <MultiSelect
        label={t({ en: "Trigger (what starts the process)", fr: "Déclencheur (ce qui lance le processus)" })}
        options={TRIGGERS}
        selected={data.trigger ? [data.trigger] : []}
        onChange={v => onChange({ trigger: v[v.length - 1] || "" })}
        required
      />

      <MultiSelect
        label={t({ en: "Expected Output", fr: "Résultat attendu" })}
        options={EXPECTED_OUTPUTS}
        selected={data.expectedOutput ? [data.expectedOutput] : []}
        onChange={v => onChange({ expectedOutput: v[v.length - 1] || "" })}
        required
      />

      {/* Optional free-text fields */}
      <div className="border-t border-border pt-5 mt-2">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          {t({ en: "Optional — Context & Description", fr: "Optionnel — Contexte & Description" })}
        </h4>
        <p className="text-xs text-muted-foreground mb-4">{t({ en: "These fields are optional and allow you to provide additional context for the report.", fr: "Ces champs sont optionnels et permettent d'enrichir le rapport avec du contexte supplémentaire." })}</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t({ en: "Organizational Context", fr: "Contexte organisationnel" })}</label>
            <textarea
              value={data.organizationalContext}
              onChange={e => onChange({ organizationalContext: e.target.value })}
              placeholder={t({ en: "Describe the organization, sector, size, strategic context...", fr: "Décrivez l'organisation, le secteur, la taille, le contexte stratégique..." })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground resize-y min-h-[72px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t({ en: "Process Description", fr: "Description du processus" })}</label>
            <textarea
              value={data.processDescription}
              onChange={e => onChange({ processDescription: e.target.value })}
              placeholder={t({ en: "Describe the process steps, actors involved, key interactions...", fr: "Décrivez les étapes du processus, les acteurs impliqués, les interactions clés..." })}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground resize-y min-h-[96px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t({ en: "Additional Notes", fr: "Notes complémentaires" })}</label>
            <textarea
              value={data.additionalNotes}
              onChange={e => onChange({ additionalNotes: e.target.value })}
              placeholder={t({ en: "Any other relevant information, constraints, expectations...", fr: "Toute autre information pertinente, contraintes, attentes..." })}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground resize-y min-h-[56px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Step2Resources({ data, onChange }: { data: ProcessSheet; onChange: (d: Partial<ProcessSheet>) => void }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Users className="w-5 h-5 text-primary" />}
        title={t({ en: "Phase 2 — Sections D, E, F: Resources & Performance", fr: "Phase 2 — Sections D, E, F : Ressources & Performance" })}
        subtitle={t({ en: "Quantify human investment, costs, and current performance", fr: "Quantifier l'investissement humain, les coûts et la performance actuelle" })}
      />

      <div className="space-y-5">
        <SingleSelect
          label={t({ en: "Frequency of execution", fr: "Fréquence d'exécution" })}
          options={FREQUENCIES}
          value={data.frequency}
          onChange={v => onChange({ frequency: v })}
          required
        />

        <SingleSelect
          label={t({ en: "Annual volume (executions/year)", fr: "Volume annuel (exécutions/an)" })}
          options={VOLUME_RANGES}
          value={data.volumePerYear}
          onChange={v => onChange({ volumePerYear: v })}
          required
        />

        <SingleSelect
          label={t({ en: "Average processing time per execution", fr: "Temps moyen de traitement par exécution" })}
          options={AVG_TIME_RANGES}
          value={data.avgTimeMinutes}
          onChange={v => onChange({ avgTimeMinutes: v })}
          required
        />

        <SingleSelect
          label={t({ en: "Number of agents involved (FTE)", fr: "Nombre d'agents impliqués (ETP)" })}
          options={AGENTS_RANGES}
          value={data.agentsFTE}
          onChange={v => onChange({ agentsFTE: v })}
          required
        />

        <div className="border-t border-border pt-5">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-primary" />
            {t({ en: "Section E — Costs", fr: "Section E — Coûts" })}
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <SingleSelect
              label={t({ en: "Human cost level", fr: "Niveau de coût humain" })}
              options={COST_LEVELS}
              value={data.humanCostLevel}
              onChange={v => onChange({ humanCostLevel: v as ProcessSheet["humanCostLevel"] })}
            />
            <SingleSelect
              label={t({ en: "IT cost level", fr: "Niveau de coût IT" })}
              options={COST_LEVELS}
              value={data.itCostLevel}
              onChange={v => onChange({ itCostLevel: v as ProcessSheet["itCostLevel"] })}
            />
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary" />
            {t({ en: "Section F — Performance", fr: "Section F — Performance" })}
          </h4>
          <div className="space-y-4">
            <SingleSelect
              label={t({ en: "Error rate", fr: "Taux d'erreur" })}
              options={ERROR_RATES}
              value={data.errorRateLevel}
              onChange={v => onChange({ errorRateLevel: v as ProcessSheet["errorRateLevel"] })}
            />
            <SingleSelect
              label={t({ en: "SLA compliance", fr: "Respect des SLA" })}
              options={SLA_COMPLIANCE}
              value={data.slaCompliance}
              onChange={v => onChange({ slaCompliance: v as ProcessSheet["slaCompliance"] })}
            />
            <SingleSelect
              label={t({ en: "Average wait/delay time", fr: "Temps d'attente/délai moyen" })}
              options={WAIT_DAYS}
              value={data.avgWaitDays}
              onChange={v => onChange({ avgWaitDays: v })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3Automation({ data, onChange }: { data: ProcessSheet; onChange: (d: Partial<ProcessSheet>) => void }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Wrench className="w-5 h-5 text-primary" />}
        title={t({ en: "Phase 2 — Sections G, J: Automation & Tools", fr: "Phase 2 — Sections G, J : Automatisation & Outils" })}
        subtitle={t({ en: "Current automation level and tools used", fr: "Niveau d'automatisation actuel et outils utilisés" })}
      />

      <SingleSelect
        label={t({ en: "Section G — Current automation level", fr: "Section G — Niveau d'automatisation actuel" })}
        options={AUTOMATION_LEVELS}
        value={data.automationLevel}
        onChange={v => onChange({ automationLevel: v as ProcessSheet["automationLevel"] })}
        required
      />

      <MultiSelect
        label={t({ en: "Section J — Tools and systems used", fr: "Section J — Outils et systèmes utilisés" })}
        options={TOOLS_USED}
        selected={data.tools}
        onChange={v => onChange({ tools: v })}
        required
      />
    </div>
  );
}

function Step4Interventions({ data, onChange }: { data: ProcessSheet; onChange: (d: Partial<ProcessSheet>) => void }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Brain className="w-5 h-5 text-primary" />}
        title={t({ en: "Phase 2 — Section H: Human Interventions", fr: "Phase 2 — Section H : Interventions humaines" })}
        subtitle={t({ en: "CRUCIAL — What humans do in this process (maps to AI technologies)", fr: "CRUCIAL — Ce que font les humains dans ce processus (détermine les technologies IA)" })}
      />

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-300">
        <AlertCircle className="w-4 h-4 inline mr-1.5" />
        {t({ en: "This section directly determines which AI technologies are applicable (Phase 3, Criterion 2). Select ALL that apply.", fr: "Cette section détermine directement les technologies IA applicables (Phase 3, Critère 2). Sélectionnez TOUTES celles qui s'appliquent." })}
      </div>

      <MultiSelect
        label={t({ en: "Types of human intervention in this process", fr: "Types d'intervention humaine dans ce processus" })}
        options={HUMAN_INTERVENTIONS}
        selected={data.humanInterventions}
        onChange={v => onChange({ humanInterventions: v })}
        required
      />
    </div>
  );
}

function Step5Data({ data, onChange }: { data: ProcessSheet; onChange: (d: Partial<ProcessSheet>) => void }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Database className="w-5 h-5 text-primary" />}
        title={t({ en: "Phase 2 — Section I: Data Handled", fr: "Phase 2 — Section I : Données manipulées" })}
        subtitle={t({ en: "CRUCIAL — Nature of data determines applicable AI technologies", fr: "CRUCIAL — La nature des données détermine les technologies IA applicables" })}
      />

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-300">
        <AlertCircle className="w-4 h-4 inline mr-1.5" />
        {t({ en: "Data structure level impacts the AI Potential score (Factor 2). Structured data = higher score.", fr: "Le niveau de structuration des données impacte le score de potentiel IA (Facteur 2). Données structurées = score plus élevé." })}
      </div>

      <MultiSelect
        label={t({ en: "Types of data handled in this process", fr: "Types de données manipulées dans ce processus" })}
        options={DATA_TYPES}
        selected={data.dataTypes}
        onChange={v => onChange({ dataTypes: v })}
        required
      />
    </div>
  );
}

function Step6Irritants({ data, onChange }: { data: ProcessSheet; onChange: (d: Partial<ProcessSheet>) => void }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<AlertTriangle className="w-5 h-5 text-primary" />}
        title={t({ en: "Phase 2 — Section K: Pain Points (Irritants)", fr: "Phase 2 — Section K : Difficultés (Irritants)" })}
        subtitle={t({ en: "CRUCIAL — Where value is being lost. Strongest signals for AI value.", fr: "CRUCIAL — Où la valeur est perdue. Signaux les plus forts pour la valeur IA." })}
      />

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-300">
        <AlertCircle className="w-4 h-4 inline mr-1.5" />
        {t({ en: "Each irritant traces to specific AI use cases. More irritants = higher AI potential (Factor 4).", fr: "Chaque irritant trace vers des cas d'usage IA spécifiques. Plus d'irritants = potentiel IA plus élevé (Facteur 4)." })}
      </div>

      <MultiSelect
        label={t({ en: "Identified pain points", fr: "Points de douleur identifiés" })}
        options={IRRITANTS}
        selected={data.irritants}
        onChange={v => onChange({ irritants: v })}
        required
      />
    </div>
  );
}

function Step7Complexity({ data, onChange }: { data: ProcessSheet; onChange: (d: Partial<ProcessSheet>) => void }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Shield className="w-5 h-5 text-primary" />}
        title={t({ en: "Phase 3 — Criterion 4: Implementation Complexity", fr: "Phase 3 — Critère 4 : Complexité de mise en œuvre" })}
        subtitle={t({ en: "Factors that determine implementation difficulty and ROI", fr: "Facteurs qui déterminent la difficulté de mise en œuvre et le ROI" })}
      />

      <div className="space-y-5">
        <SingleSelect
          label={t({ en: "Data readiness", fr: "Disponibilité des données" })}
          options={DATA_READINESS}
          value={data.dataReadiness}
          onChange={v => onChange({ dataReadiness: v as ProcessSheet["dataReadiness"] })}
          required
        />

        <SingleSelect
          label={t({ en: "Number of systems to integrate", fr: "Nombre de systèmes à intégrer" })}
          options={SYSTEMS_TO_INTEGRATE}
          value={data.systemsToIntegrate}
          onChange={v => onChange({ systemsToIntegrate: v as ProcessSheet["systemsToIntegrate"] })}
          required
        />

        <SingleSelect
          label={t({ en: "Change management effort", fr: "Effort de conduite du changement" })}
          options={CHANGE_MANAGEMENT}
          value={data.changeManagement}
          onChange={v => onChange({ changeManagement: v as ProcessSheet["changeManagement"] })}
          required
        />

        <SingleSelect
          label={t({ en: "Regulatory constraints", fr: "Contraintes réglementaires" })}
          options={REGULATORY_CONSTRAINTS}
          value={data.regulatoryConstraints}
          onChange={v => onChange({ regulatoryConstraints: v as ProcessSheet["regulatoryConstraints"] })}
          required
        />

        <SingleSelect
          label={t({ en: "Technical maturity of AI solution", fr: "Maturité technique de la solution IA" })}
          options={TECHNICAL_MATURITY}
          value={data.technicalMaturity}
          onChange={v => onChange({ technicalMaturity: v as ProcessSheet["technicalMaturity"] })}
          required
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RESULTS COMPONENT — Phase 3 + Phase 4 Use Case Sheet
   ═══════════════════════════════════════════════════════════════ */

function StepResults({ result, process }: { result: EvaluationResult; process: ProcessSheet }) {
  const { t } = useLanguage();

  const potentialLabels = {
    very_high: { label: { en: "Very High", fr: "Très élevé" }, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" },
    high: { label: { en: "High", fr: "Élevé" }, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" },
    medium: { label: { en: "Medium", fr: "Moyen" }, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" },
    low: { label: { en: "Low", fr: "Faible" }, color: "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400" },
  };

  const matrixLabels = {
    quick_win: { label: { en: "QUICK WIN — Prioritize immediately", fr: "QUICK WIN — Prioriser immédiatement" }, icon: <Zap className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800" },
    strategic: { label: { en: "Strategic Project — Plan carefully", fr: "Projet stratégique — Planifier avec soin" }, icon: <Target className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800" },
    optional: { label: { en: "Optional — If resources available", fr: "Optionnel — Si ressources disponibles" }, icon: <TrendingUp className="w-5 h-5" />, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800" },
    avoid: { label: { en: "AVOID — Do not engage", fr: "À ÉVITER — Ne pas engager" }, icon: <AlertTriangle className="w-5 h-5" />, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800" },
  };

  const recommendationLabels: Record<string, { en: string; fr: string }> = {
    quick_win: { en: "This process is a Quick Win: high value, low complexity. Prioritize for immediate implementation.", fr: "Ce processus est un Quick Win : valeur élevée, complexité faible. Prioriser pour implémentation immédiate." },
    strategic: { en: "Strategic project: high value but significant complexity. Secure dedicated resources and plan in phases.", fr: "Projet stratégique : valeur élevée mais complexité significative. Sécuriser des ressources dédiées et planifier par phases." },
    avoid: { en: "Not recommended: low value relative to implementation complexity. Revisit when conditions change.", fr: "Non recommandé : valeur faible par rapport à la complexité. Réévaluer quand les conditions changent." },
    agent_candidate: { en: "Strong candidate for AI Agent automation (multi-step orchestration across systems).", fr: "Candidat fort pour l'automatisation par Agent IA (orchestration multi-étapes inter-systèmes)." },
    pilot_first: { en: "Currently 100% manual: start with a pilot on a subset before full deployment.", fr: "Actuellement 100% manuel : commencer par un pilote sur un sous-ensemble avant déploiement complet." },
    rag_quick_win: { en: "Implement semantic search (RAG) as a quick first step to reduce document search time.", fr: "Implémenter la recherche sémantique (RAG) comme première étape rapide pour réduire le temps de recherche documentaire." },
    phased_approach: { en: "Very high complexity: adopt a phased approach with incremental milestones and validation gates.", fr: "Complexité très élevée : adopter une approche par phases avec des jalons incrémentaux et des portes de validation." },
    support_control_roi: { en: "Support/Control processes often offer the fastest ROI due to their standardized nature.", fr: "Les processus Support/Contrôle offrent souvent le ROI le plus rapide grâce à leur nature standardisée." },
  };

  const gainLabels: Record<string, { en: string; fr: string; icon: React.ReactNode }> = {
    time: { en: "Time savings", fr: "Gain de temps", icon: <Clock className="w-3.5 h-3.5" /> },
    quality: { en: "Quality improvement", fr: "Amélioration qualité", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    cost: { en: "Cost reduction", fr: "Réduction des coûts", icon: <PieChart className="w-3.5 h-3.5" /> },
    delays: { en: "Delay reduction", fr: "Réduction des délais", icon: <TrendingUp className="w-3.5 h-3.5" /> },
    satisfaction: { en: "Customer satisfaction", fr: "Satisfaction client", icon: <Users className="w-3.5 h-3.5" /> },
    compliance: { en: "Compliance improvement", fr: "Amélioration conformité", icon: <Shield className="w-3.5 h-3.5" /> },
  };

  const potential = potentialLabels[result.potentialLevel];
  const matrix = matrixLabels[result.matrixPosition];

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Zap className="w-5 h-5 text-primary" />}
        title={t({ en: "Phase 3 — AI Evaluation Results", fr: "Phase 3 — Résultats de l'évaluation IA" })}
        subtitle={t({ en: `Complete analysis of "${process.name}" per DATAS-STD-BPM-AI-001`, fr: `Analyse complète de « ${process.name} » selon DATAS-STD-BPM-AI-001` })}
      />

      {/* Matrix Position - Hero */}
      <div className={`rounded-xl border p-5 ${matrix.bg}`}>
        <div className="flex items-center gap-3">
          <div className={matrix.color}>{matrix.icon}</div>
          <div>
            <div className={`text-lg font-bold ${matrix.color}`}>{t(matrix.label)}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{t({ en: "Value × Complexity Matrix Position", fr: "Position dans la matrice Valeur × Complexité" })}</div>
          </div>
        </div>
      </div>

      {/* Criterion 1: Scoring Grid */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          {t({ en: "Criterion 1 — Overall AI Potential", fr: "Critère 1 — Potentiel IA global" })}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: { en: "Volume", fr: "Volume" }, score: result.volumeScore },
            { label: { en: "Data Structure", fr: "Structure données" }, score: result.dataStructureScore },
            { label: { en: "Repetitiveness", fr: "Répétitivité" }, score: result.repetitivenessScore },
            { label: { en: "Pain Points", fr: "Points douleur" }, score: result.painPointsScore },
          ].map((factor, i) => (
            <div key={i} className="text-center p-3 rounded-lg bg-secondary/50">
              <div className="text-2xl font-bold text-foreground">{factor.score}<span className="text-sm text-muted-foreground">/4</span></div>
              <div className="text-xs text-muted-foreground mt-1">{t(factor.label)}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
          <span className="text-sm font-medium text-foreground">{t({ en: "Overall Score", fr: "Score global" })}</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">{result.overallPotentialScore.toFixed(2)}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${potential.color}`}>{t(potential.label)}</span>
          </div>
        </div>
      </div>

      {/* Criterion 2: Technologies */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          {t({ en: "Criterion 2 — Applicable AI Technologies (13 types)", fr: "Critère 2 — Technologies IA applicables (13 types)" })}
        </h4>
        {result.applicableTechnologies.length > 0 ? (
          <div className="space-y-3">
            {result.applicableTechnologies.map((tech) => (
              <div key={tech.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{tech.name}</span>
                    <span className="text-xs font-semibold text-primary">{tech.relevance}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${tech.relevance}%` }} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{tech.signals.join(" · ")}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t({ en: "No strong technology match. Review process characteristics.", fr: "Aucune correspondance forte. Revoir les caractéristiques du processus." })}</p>
        )}
      </div>

      {/* Criterion 3: Expected Gains */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          {t({ en: "Criterion 3 — Expected Gains", fr: "Critère 3 — Gains attendus" })}
        </h4>
        <div className="space-y-2.5">
          {result.expectedGains.map((gain, i) => {
            const gl = gainLabels[gain.type];
            return (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/30">
                <div className="text-emerald-600 dark:text-emerald-400 mt-0.5">{gl?.icon}</div>
                <div>
                  <div className="text-sm font-medium text-foreground">{gl ? t(gl) : gain.type}</div>
                  <div className="text-xs text-muted-foreground">{gain.quantification}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Criterion 4: Complexity & ROI */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          {t({ en: "Criterion 4 — Complexity & ROI", fr: "Critère 4 — Complexité & ROI" })}
        </h4>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <div className="text-lg font-bold text-foreground">{result.complexityScore.toFixed(2)}<span className="text-xs text-muted-foreground">/3</span></div>
            <div className={`text-xs font-semibold mt-1 ${potentialLabels[result.complexityLevel === "very_high" ? "low" : result.complexityLevel === "high" ? "medium" : result.complexityLevel === "medium" ? "high" : "very_high"].color}`}>
              {t({ en: result.complexityLevel.replace("_", " "), fr: result.complexityLevel === "very_high" ? "Très élevée" : result.complexityLevel === "high" ? "Élevée" : result.complexityLevel === "medium" ? "Moyenne" : "Faible" })}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{t({ en: "Complexity", fr: "Complexité" })}</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <div className={`text-lg font-bold ${potentialLabels[result.roiLevel].color.split(" ")[0]}`}>
              {t(potentialLabels[result.roiLevel].label)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{t({ en: "Estimated ROI", fr: "ROI estimé" })}</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <div className="text-lg font-bold text-foreground">{result.priorityScore}</div>
            <div className="text-xs text-muted-foreground mt-1">{t({ en: "Priority Score", fr: "Score de priorité" })}</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            {t({ en: "Recommendations", fr: "Recommandations" })}
          </h4>
          <ul className="space-y-2.5">
            {result.recommendations.map((rec) => (
              <li key={rec} className="flex items-start gap-2.5 text-sm text-foreground">
                <ArrowRight className="w-3.5 h-3.5 mt-0.5 text-primary flex-shrink-0" />
                {t(recommendationLabels[rec] || { en: rec, fr: rec })}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Credit */}
      <div className="text-xs text-muted-foreground text-center pt-3 border-t border-border">
        {t({ en: "Methodology: DATAS-STD-BPM-AI-001 v2.0 — \"Business Process Reference & AI Transformation\" by Data Services (Datas).", fr: "Méthodologie : DATAS-STD-BPM-AI-001 v2.0 — « Référentiel de Processus d'Entreprise & Transformation par l'IA » de Data Services (Datas)." })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

const INITIAL_STATE: ProcessSheet = {
  code: "", name: "", domain: "", valueStreamCategory: "", owner: "", department: "",
  objective: "", trigger: "", expectedOutput: "",
  agentsFTE: "", frequency: "", volumePerYear: "", avgTimeMinutes: "",
  humanCostLevel: "", itCostLevel: "",
  errorRateLevel: "", slaCompliance: "", avgWaitDays: "",
  automationLevel: "",
  humanInterventions: [], dataTypes: [], tools: [], irritants: [],
  dataReadiness: "", systemsToIntegrate: "", changeManagement: "", regulatoryConstraints: "", technicalMaturity: "",
  organizationalContext: "", processDescription: "", additionalNotes: "",
};

export default function DiagnosticIA() {
  const { t, lang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [step, setStep] = useState(0);
  const [process, setProcess] = useState<ProcessSheet>(INITIAL_STATE);

  const updateProcess = useCallback((partial: Partial<ProcessSheet>) => {
    setProcess((prev) => ({ ...prev, ...partial }));
  }, []);

  const result = useMemo(() => {
    if (step === 8) return evaluateProcess(process);
    return null;
  }, [step, process]);

  const steps = [
    { title: t({ en: "Identification", fr: "Identification" }), icon: <Building2 className="w-4 h-4" />, sections: "A, B" },
    { title: t({ en: "Resources", fr: "Ressources" }), icon: <Users className="w-4 h-4" />, sections: "D, E, F" },
    { title: t({ en: "Automation", fr: "Automatisation" }), icon: <Wrench className="w-4 h-4" />, sections: "G, J" },
    { title: t({ en: "Interventions", fr: "Interventions" }), icon: <Brain className="w-4 h-4" />, sections: "H" },
    { title: t({ en: "Data", fr: "Données" }), icon: <Database className="w-4 h-4" />, sections: "I" },
    { title: t({ en: "Pain Points", fr: "Irritants" }), icon: <AlertTriangle className="w-4 h-4" />, sections: "K" },
    { title: t({ en: "Complexity", fr: "Complexité" }), icon: <Shield className="w-4 h-4" />, sections: "C4" },
    { title: t({ en: "Summary", fr: "Synthèse" }), icon: <FileText className="w-4 h-4" />, sections: "" },
    { title: t({ en: "Results", fr: "Résultats" }), icon: <Zap className="w-4 h-4" />, sections: "" },
  ];

  const canAdvance = () => {
    switch (step) {
      case 0: return process.name.trim() !== "" && process.valueStreamCategory !== "" && process.domain !== "" && process.objective !== "";
      case 1: return process.frequency !== "" && process.volumePerYear !== "" && process.avgTimeMinutes !== "" && process.agentsFTE !== "";
      case 2: return process.automationLevel !== "" && process.tools.length > 0;
      case 3: return process.humanInterventions.length > 0;
      case 4: return process.dataTypes.length > 0;
      case 5: return process.irritants.length > 0;
      case 6: return process.dataReadiness !== "" && process.systemsToIntegrate !== "" && process.changeManagement !== "" && process.regulatoryConstraints !== "" && process.technicalMaturity !== "";
      case 7: return true; // Summary step - always can advance
      default: return true;
    }
  };

  const reset = () => {
    setStep(0);
    setProcess(INITIAL_STATE);
  };

  const generatePDF = () => {
    if (!result) return;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentW = pageW - margin * 2;
    let y = 15;

    // Brand colors
    const primaryR = 34, primaryG = 197, primaryB = 94; // #22c55e
    const darkR = 26, darkG = 26, darkB = 46; // #1a1a2e
    const grayR = 100, grayG = 116, grayB = 139; // #64748b

    const addPage = () => { doc.addPage(); y = 15; };
    const checkPage = (needed: number) => { if (y + needed > 275) addPage(); };

    const findLabel = (arr: { id: string; label: { fr: string } }[], id: string) => arr.find(x => x.id === id)?.label?.fr || id;

    // ─── Header ───
    doc.setFillColor(primaryR, primaryG, primaryB);
    doc.rect(0, 0, pageW, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Neopolis Development", margin, 12);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Rapport de Diagnostic d'Automatisabilit\u00e9 IA", margin, 19);
    doc.text("DATAS-STD-BPM-AI-001 v2.0", margin, 25);
    doc.setFontSize(8);
    doc.text(new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }), pageW - margin - 40, 25);
    y = 35;

    // ─── Section title helper ───
    const sectionTitle = (title: string) => {
      checkPage(14);
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(margin, y, contentW, 8, 1, 1, "F");
      doc.setTextColor(primaryR, primaryG, primaryB);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(title, margin + 3, y + 5.5);
      y += 12;
      doc.setTextColor(darkR, darkG, darkB);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
    };

    const labelValue = (label: string, value: string) => {
      checkPage(6);
      doc.setTextColor(grayR, grayG, grayB);
      doc.setFont("helvetica", "normal");
      doc.text(label, margin + 2, y);
      doc.setTextColor(darkR, darkG, darkB);
      doc.setFont("helvetica", "bold");
      doc.text(value, margin + 55, y);
      doc.setFont("helvetica", "normal");
      y += 5.5;
    };

    // ─── 1. Identification ───
    sectionTitle("1. Identification du processus");
    labelValue("Nom :", process.name || "-");
    labelValue("Code :", process.code || "-");
    labelValue("Domaine :", findLabel(DOMAINS as any, process.domain));
    labelValue("Cat\u00e9gorie :", findLabel(VALUE_STREAM_CATEGORIES as any, process.valueStreamCategory));
    labelValue("Responsable :", process.owner || "-");
    labelValue("D\u00e9partement :", process.department || "-");
    labelValue("Objectif :", findLabel(OBJECTIVES as any, process.objective));
    labelValue("D\u00e9clencheur :", findLabel(TRIGGERS as any, process.trigger));
    labelValue("Sortie attendue :", findLabel(EXPECTED_OUTPUTS as any, process.expectedOutput));
    y += 3;

    // ─── Context (optional) ───
    if (process.organizationalContext || process.processDescription || process.additionalNotes) {
      sectionTitle("2. Contexte (optionnel)");
      if (process.organizationalContext) {
        doc.setTextColor(grayR, grayG, grayB);
        doc.text("Contexte organisationnel :", margin + 2, y);
        y += 4.5;
        doc.setTextColor(darkR, darkG, darkB);
        const lines = doc.splitTextToSize(process.organizationalContext, contentW - 4);
        checkPage(lines.length * 4);
        doc.text(lines, margin + 2, y);
        y += lines.length * 4 + 3;
      }
      if (process.processDescription) {
        doc.setTextColor(grayR, grayG, grayB);
        doc.text("Description du processus :", margin + 2, y);
        y += 4.5;
        doc.setTextColor(darkR, darkG, darkB);
        const lines = doc.splitTextToSize(process.processDescription, contentW - 4);
        checkPage(lines.length * 4);
        doc.text(lines, margin + 2, y);
        y += lines.length * 4 + 3;
      }
      if (process.additionalNotes) {
        doc.setTextColor(grayR, grayG, grayB);
        doc.text("Notes compl\u00e9mentaires :", margin + 2, y);
        y += 4.5;
        doc.setTextColor(darkR, darkG, darkB);
        const lines = doc.splitTextToSize(process.additionalNotes, contentW - 4);
        checkPage(lines.length * 4);
        doc.text(lines, margin + 2, y);
        y += lines.length * 4 + 3;
      }
      y += 2;
    }

    // ─── 3. Ressources & M\u00e9triques ───
    sectionTitle("3. Ressources & M\u00e9triques");
    labelValue("Fr\u00e9quence :", findLabel(FREQUENCIES as any, process.frequency));
    labelValue("Volume :", findLabel(VOLUME_RANGES as any, process.volumePerYear));
    labelValue("Agents (ETP) :", findLabel(AGENTS_RANGES as any, process.agentsFTE));
    labelValue("Temps moyen :", findLabel(AVG_TIME_RANGES as any, process.avgTimeMinutes));
    labelValue("Co\u00fbt humain :", findLabel(COST_LEVELS as any, process.humanCostLevel));
    labelValue("Co\u00fbt IT :", findLabel(COST_LEVELS as any, process.itCostLevel));
    labelValue("Taux d'erreur :", findLabel(ERROR_RATES as any, process.errorRateLevel));
    labelValue("Respect SLA :", findLabel(SLA_COMPLIANCE as any, process.slaCompliance));
    labelValue("D\u00e9lai moyen :", findLabel(WAIT_DAYS as any, process.avgWaitDays));
    y += 3;

    // ─── 4. Automatisation & Outils ───
    sectionTitle("4. Automatisation & Outils");
    labelValue("Niveau :", findLabel(AUTOMATION_LEVELS as any, process.automationLevel));
    doc.setTextColor(grayR, grayG, grayB);
    doc.text("Outils utilis\u00e9s :", margin + 2, y);
    y += 4.5;
    doc.setTextColor(darkR, darkG, darkB);
    const toolsText = process.tools.map(t => findLabel(TOOLS_USED as any, t)).join(", ");
    const toolLines = doc.splitTextToSize(toolsText, contentW - 4);
    checkPage(toolLines.length * 4);
    doc.text(toolLines, margin + 2, y);
    y += toolLines.length * 4 + 4;

    // ─── 5. Interventions humaines ───
    sectionTitle("5. Interventions humaines");
    process.humanInterventions.forEach(hi => {
      checkPage(5);
      const label = findLabel(HUMAN_INTERVENTIONS as any, hi);
      doc.text(`\u2022 ${label}`, margin + 2, y);
      y += 4.5;
    });
    y += 3;

    // ─── 6. Donn\u00e9es manipul\u00e9es ───
    sectionTitle("6. Donn\u00e9es manipul\u00e9es");
    process.dataTypes.forEach(dt => {
      checkPage(5);
      const item = DATA_TYPES.find(d => d.id === dt);
      const structLabel = item?.structureLevel === "structured" ? "[Structur\u00e9]" : item?.structureLevel === "semi_structured" ? "[Semi-structur\u00e9]" : item?.structureLevel === "fully_digital" ? "[Num\u00e9rique]" : "[Non structur\u00e9]";
      doc.text(`\u2022 ${item?.label?.fr || dt} ${structLabel}`, margin + 2, y);
      y += 4.5;
    });
    y += 3;

    // ─── 7. Irritants ───
    sectionTitle("7. Irritants / Points de douleur");
    process.irritants.forEach(ir => {
      checkPage(5);
      doc.text(`\u2022 ${findLabel(IRRITANTS as any, ir)}`, margin + 2, y);
      y += 4.5;
    });
    y += 3;

    // ─── 8. Facteurs de complexit\u00e9 ───
    sectionTitle("8. Facteurs de complexit\u00e9");
    labelValue("Disponibilit\u00e9 donn\u00e9es :", findLabel(DATA_READINESS as any, process.dataReadiness));
    labelValue("Syst\u00e8mes \u00e0 int\u00e9grer :", findLabel(SYSTEMS_TO_INTEGRATE as any, process.systemsToIntegrate));
    labelValue("Conduite changement :", findLabel(CHANGE_MANAGEMENT as any, process.changeManagement));
    labelValue("Contraintes r\u00e9glement. :", findLabel(REGULATORY_CONSTRAINTS as any, process.regulatoryConstraints));
    labelValue("Maturit\u00e9 technique :", findLabel(TECHNICAL_MATURITY as any, process.technicalMaturity));
    y += 3;

    // ═══ RESULTS PAGE ═══
    addPage();
    doc.setFillColor(primaryR, primaryG, primaryB);
    doc.rect(0, 0, pageW, 12, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("R\u00c9SULTATS DE L'\u00c9VALUATION", pageW / 2, 8, { align: "center" });
    y = 20;

    // ─── Matrix Position (Hero) ───
    const matrixLabelsLocal: Record<string, string> = {
      quick_win: "QUICK WIN \u2014 Prioriser imm\u00e9diatement",
      strategic: "Projet strat\u00e9gique \u2014 Planifier avec soin",
      optional: "Optionnel \u2014 Si ressources disponibles",
      avoid: "\u00c0 \u00c9VITER \u2014 Ne pas engager",
    };
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, y, contentW, 18, 2, 2, "F");
    doc.setTextColor(primaryR, primaryG, primaryB);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(matrixLabelsLocal[result.matrixPosition] || result.matrixPosition, pageW / 2, y + 8, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(grayR, grayG, grayB);
    doc.text(`Score de priorit\u00e9 : ${result.priorityScore} | Valeur : ${result.valueScore.toFixed(2)} | Complexit\u00e9 : ${result.complexityScore.toFixed(2)}`, pageW / 2, y + 14, { align: "center" });
    y += 25;

    // ─── Criterion 1: AI Potential ───
    sectionTitle("Crit\u00e8re 1 \u2014 Potentiel d'automatisation IA");
    const potentialLabelsLocal: Record<string, string> = { very_high: "Tr\u00e8s \u00e9lev\u00e9", high: "\u00c9lev\u00e9", medium: "Moyen", low: "Faible" };
    labelValue("Score global :", `${result.overallPotentialScore.toFixed(2)} / 4 (${potentialLabelsLocal[result.potentialLevel]})`);
    labelValue("Volume :", `${result.volumeScore} / 4`);
    labelValue("Structure donn\u00e9es :", `${result.dataStructureScore} / 4`);
    labelValue("R\u00e9p\u00e9titivit\u00e9 :", `${result.repetitivenessScore} / 4`);
    labelValue("Points douleur :", `${result.painPointsScore} / 4`);
    y += 3;

    // ─── Criterion 2: Technologies ───
    sectionTitle("Crit\u00e8re 2 \u2014 Technologies IA applicables");
    result.applicableTechnologies.slice(0, 8).forEach(tech => {
      checkPage(5);
      const techName = typeof tech.name === "string" ? tech.name : (tech.name as any)?.fr || tech.id;
      doc.text(`\u2022 ${techName} (pertinence: ${tech.relevance}%)`, margin + 2, y);
      y += 4.5;
    });
    y += 3;

    // ─── Criterion 3: Expected Gains ───
    sectionTitle("Crit\u00e8re 3 \u2014 Gains attendus");
    const gainLabelsLocal: Record<string, string> = { time: "Gain de temps", quality: "Am\u00e9lioration qualit\u00e9", cost: "R\u00e9duction co\u00fbts", delays: "R\u00e9duction d\u00e9lais", satisfaction: "Satisfaction client", compliance: "Am\u00e9lioration conformit\u00e9" };
    result.expectedGains.forEach(gain => {
      checkPage(5);
      doc.text(`\u2022 ${gainLabelsLocal[gain.type] || gain.type} : ${gain.quantification}`, margin + 2, y);
      y += 4.5;
    });
    y += 3;

    // ─── Criterion 4: Complexity & ROI ───
    sectionTitle("Crit\u00e8re 4 \u2014 Complexit\u00e9 & ROI");
    const complexityLabelsLocal: Record<string, string> = { low: "Faible", medium: "Moyenne", high: "\u00c9lev\u00e9e", very_high: "Tr\u00e8s \u00e9lev\u00e9e" };
    labelValue("Complexit\u00e9 :", `${result.complexityScore.toFixed(2)} / 3 (${complexityLabelsLocal[result.complexityLevel]})`);
    labelValue("ROI estim\u00e9 :", potentialLabelsLocal[result.roiLevel]);
    y += 3;

    // ─── Recommendations ───
    if (result.recommendations.length > 0) {
      sectionTitle("Recommandations");
      const recLabelsLocal: Record<string, string> = {
        quick_win: "Ce processus est un Quick Win : valeur \u00e9lev\u00e9e, complexit\u00e9 faible. Prioriser pour impl\u00e9mentation imm\u00e9diate.",
        strategic: "Projet strat\u00e9gique : valeur \u00e9lev\u00e9e mais complexit\u00e9 significative. S\u00e9curiser des ressources d\u00e9di\u00e9es.",
        avoid: "Non recommand\u00e9 : valeur faible par rapport \u00e0 la complexit\u00e9. R\u00e9\u00e9valuer quand les conditions changent.",
        agent_candidate: "Candidat fort pour l'automatisation par Agent IA (orchestration multi-\u00e9tapes inter-syst\u00e8mes).",
        pilot_first: "Actuellement 100% manuel : commencer par un pilote sur un sous-ensemble.",
        rag_quick_win: "Impl\u00e9menter la recherche s\u00e9mantique (RAG) comme premi\u00e8re \u00e9tape rapide.",
        phased_approach: "Complexit\u00e9 tr\u00e8s \u00e9lev\u00e9e : adopter une approche par phases avec jalons incr\u00e9mentaux.",
        support_control_roi: "Les processus Support/Contr\u00f4le offrent souvent le ROI le plus rapide.",
      };
      result.recommendations.forEach(rec => {
        checkPage(8);
        const recText = recLabelsLocal[rec] || rec;
        const recLines = doc.splitTextToSize(`\u2192 ${recText}`, contentW - 4);
        doc.text(recLines, margin + 2, y);
        y += recLines.length * 4 + 2;
      });
    }

    // ─── Footer ───
    checkPage(20);
    y += 8;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageW - margin, y);
    y += 6;
    doc.setFontSize(7);
    doc.setTextColor(grayR, grayG, grayB);
    doc.text("M\u00e9thodologie : DATAS-STD-BPM-AI-001 v2.0 \u2014 \u00ab R\u00e9f\u00e9rentiel de Processus d'Entreprise & Transformation par l'IA \u00bb de Data Services (Datas)", margin, y);
    y += 3.5;
    doc.text(`G\u00e9n\u00e9r\u00e9 par Neopolis Akademy | Auteur : Achraf Khelil | ${new Date().toLocaleDateString("fr-FR")}`, margin, y);
    y += 3.5;
    doc.text("www.neopolis-dev.com", margin, y);

    // Save
    const filename = `diagnostic_ia_${process.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase() || "rapport"}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  };

  // Summary step (step 7) - shows what was entered before final evaluation
  const renderSummary = () => {
    const domain = DOMAINS.find(d => d.id === process.domain);
    const category = VALUE_STREAM_CATEGORIES.find(c => c.id === process.valueStreamCategory);
    const volume = VOLUME_RANGES.find(v => v.id === process.volumePerYear);
    const automation = AUTOMATION_LEVELS.find(a => a.id === process.automationLevel);

    return (
      <div className="space-y-6">
        <SectionHeader
          icon={<FileText className="w-5 h-5 text-primary" />}
          title={t({ en: "Summary — Review before evaluation", fr: "Synthèse — Vérifier avant évaluation" })}
          subtitle={t({ en: "Review your inputs. Go back to correct if needed.", fr: "Vérifiez vos saisies. Revenez en arrière pour corriger si nécessaire." })}
        />

        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">{t({ en: "Process", fr: "Processus" })}</h4>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">{t({ en: "Name:", fr: "Nom :" })}</span> <span className="font-medium">{process.name}</span></div>
              <div><span className="text-muted-foreground">{t({ en: "Category:", fr: "Catégorie :" })}</span> <span className="font-medium">{category ? t(category.label) : "-"}</span></div>
              <div><span className="text-muted-foreground">{t({ en: "Domain:", fr: "Domaine :" })}</span> <span className="font-medium">{domain ? t(domain.label) : "-"}</span></div>
              <div><span className="text-muted-foreground">{t({ en: "Automation:", fr: "Automatisation :" })}</span> <span className="font-medium">{automation ? t(automation.label) : "-"}</span></div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">{t({ en: "Key Metrics (Section D)", fr: "Métriques clés (Section D)" })}</h4>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">{t({ en: "Volume:", fr: "Volume :" })}</span> <span className="font-medium">{volume ? t(volume.label) : "-"}</span></div>
              <div><span className="text-muted-foreground">{t({ en: "Agents:", fr: "Agents :" })}</span> <span className="font-medium">{AGENTS_RANGES.find(a => a.id === process.agentsFTE)?.label.fr ?? "-"}</span></div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">{t({ en: "AI Signals (Sections H, I, K)", fr: "Signaux IA (Sections H, I, K)" })}</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">{t({ en: "Interventions (H):", fr: "Interventions (H) :" })}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {process.humanInterventions.map(hi => {
                    const item = HUMAN_INTERVENTIONS.find(h => h.id === hi);
                    return <span key={hi} className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">{item ? t(item.label) : hi}</span>;
                  })}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">{t({ en: "Data (I):", fr: "Données (I) :" })}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {process.dataTypes.map(dt => {
                    const item = DATA_TYPES.find(d => d.id === dt);
                    return <span key={dt} className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs">{item ? t(item.label) : dt}</span>;
                  })}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">{t({ en: "Pain Points (K):", fr: "Irritants (K) :" })}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {process.irritants.map(ir => {
                    const item = IRRITANTS.find(i => i.id === ir);
                    return <span key={ir} className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs">{item ? t(item.label) : ir}</span>;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
              <BrandLogo className="h-8 max-w-[160px]" />
              <span className="text-xs bg-blue-500/15 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full font-semibold tracking-wide uppercase">{t({ en: "Diagnostic", fr: "Diagnostic" })}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {t({ en: "AI Automatability Diagnostic", fr: "Diagnostic d'automatisabilité IA" })}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t({ en: "Complete evaluation based on DATAS-STD-BPM-AI-001 v2.0 — Phases 2, 3 & 4 of the methodology.", fr: "Évaluation complète selon DATAS-STD-BPM-AI-001 v2.0 — Phases 2, 3 & 4 de la méthodologie." })}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-2">
            {steps.map((s, i) => (
              <div key={i} className={`flex items-center gap-1 text-xs font-medium whitespace-nowrap ${i <= step ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary/10 text-primary border-2 border-primary" : "bg-secondary text-muted-foreground"}`}>
                  {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="text-[10px]">{i + 1}</span>}
                </div>
                <span className="hidden lg:inline">{s.title}</span>
                {i < steps.length - 1 && <div className={`w-4 h-px mx-0.5 ${i < step ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>
          <Progress value={((step + 1) / steps.length) * 100} className="h-1.5" />
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-muted-foreground">
              {t({ en: `Step ${step + 1} of ${steps.length}`, fr: `Étape ${step + 1} sur ${steps.length}` })}
              {steps[step].sections && ` — Sections ${steps[step].sections}`}
            </span>
            <span className="text-xs text-muted-foreground">{Math.round(((step + 1) / steps.length) * 100)}%</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm mb-6">
          {step === 0 && <Step1Identification data={process} onChange={updateProcess} />}
          {step === 1 && <Step2Resources data={process} onChange={updateProcess} />}
          {step === 2 && <Step3Automation data={process} onChange={updateProcess} />}
          {step === 3 && <Step4Interventions data={process} onChange={updateProcess} />}
          {step === 4 && <Step5Data data={process} onChange={updateProcess} />}
          {step === 5 && <Step6Irritants data={process} onChange={updateProcess} />}
          {step === 6 && <Step7Complexity data={process} onChange={updateProcess} />}
          {step === 7 && renderSummary()}
          {step === 8 && result && <StepResults result={result} process={process} />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div>
            {step > 0 && step < 8 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t({ en: "Previous", fr: "Précédent" })}
              </Button>
            )}
            {step === 8 && (
              <Button variant="outline" onClick={reset} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                {t({ en: "New Diagnostic", fr: "Nouveau diagnostic" })}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {step === 8 && (
              <>
                <Button onClick={generatePDF} className="gap-2 bg-primary hover:bg-primary/90">
                  <Download className="w-4 h-4" />
                  {t({ en: "Export PDF", fr: "Exporter PDF" })}
                </Button>
                <Link href="/training/transformation_processus_ia/transformation_processus_ia__01">
                  <Button variant="outline" className="gap-2">
                    <FileText className="w-4 h-4" />
                    {t({ en: "Follow the Training", fr: "Suivre la formation" })}
                  </Button>
                </Link>
              </>
            )}
            {step < 8 && (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canAdvance()}
                className="gap-2"
              >
                {step === 7 ? t({ en: "Evaluate", fr: "Évaluer" }) : t({ en: "Next", fr: "Suivant" })}
                {step === 7 ? <Zap className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
