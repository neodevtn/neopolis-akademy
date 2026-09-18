import crypto from "node:crypto";
import { TRPCError } from "@trpc/server";
import { applyCompetencyEvent, getContentCompetencyTags } from "./competencyService";
import { getLearnerLearningEvents, recordLearningEvent, saveAiResponseEvaluation } from "./db";
import { getN8nFoundationsCorrectionBlockIdByKey, getN8nFoundationsWorkflowResource } from "./n8nFoundationsWorkflowRegistry";

export const N8N_FOUNDATIONS_COURSE_ID = "initiation_automatisation_workflows_n8n__01";

const STARTER_SIGNATURES: Record<string, string> = {
  "ch01_ex02_tp": "8d32f9ec336d537448767badd465fddeb5b23efc5313f10ecf4a574b18bf9947",
  "ch01_ex04_tp": "93dcbee9a6d1d24ea1ba46a91a618a370d0a30d4020834eb9a6d0ef0e51000bc",
  "ch01_ex05_tp": "28ee222cbc170923b75d0f6796d6095ad2680985582c35599170bb083ba883fe",
  "ch01_ex08_tp": "c6e23a4ca2dfce87824ccfa1f1764aead820212f4c13dcc44dda6ea3cb7c27cc",
  "ch02_ex08_tp": "715f0c768f5fc2a4030ef0f063df26612e97be1edc62fbe242cec99267a120b4",
  "ch02_ex10_tp": "76c1239e5832754c23cbab14f75abd9ddb9d1789add112b94df4abe0105afe4a",
  "ch03_ex04_tp": "e704b3c304bf5d040a87c291175516ddbd855d77fc85b2881acd8354866c6c1f",
  "ch03_ex06_tp": "e704b3c304bf5d040a87c291175516ddbd855d77fc85b2881acd8354866c6c1f",
  "ch03_ex07_tp": "7ea37778c588ed655b7d4efedd9262ad2c63c8b68234ff80716148e653ae1207",
  "ch03_ex11_tp": "143cdc2a8902009a3f44bb5ea03b41d33a739aa0b944c47b63eb4e6b5fb2cb1d",
};

type N8nNode = { name?: unknown; type?: unknown; parameters?: unknown };
type N8nWorkflow = { name?: unknown; nodes?: unknown; connections?: unknown; [key: string]: unknown };
type Criterion = { id: string; label: string; check: (workflow: ValidWorkflow) => boolean };
type ValidWorkflow = { workflow: N8nWorkflow; nodes: Array<N8nNode & { name: string; type: string }>; connections: Record<string, unknown>; strings: string };
type Assessment = { title: string; criteria: Criterion[] };

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => [key, canonicalize(entry)]));
  }
  return value;
}

function canonicalHash(value: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

function normalized(value: unknown): string {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function includesAny(value: string, candidates: string[]): boolean {
  const haystack = normalized(value);
  return candidates.some((candidate) => haystack.includes(normalized(candidate)));
}

function nodeHasType(workflow: ValidWorkflow, candidates: string[]) {
  return workflow.nodes.some((node) => includesAny(node.type, candidates));
}

function nodeHasName(workflow: ValidWorkflow, candidates: string[]) {
  return workflow.nodes.some((node) => includesAny(node.name, candidates));
}

function fieldMentioned(workflow: ValidWorkflow, candidates: string[]) {
  return includesAny(workflow.strings, candidates);
}

function hasConnection(workflow: ValidWorkflow, fromNames: string[], toNames: string[]) {
  return workflow.nodes.some((from) => {
    if (!includesAny(from.name, fromNames)) return false;
    const serialized = JSON.stringify(workflow.connections[from.name] ?? "");
    return includesAny(serialized, toNames);
  });
}

function containsEmbeddedSecret(value: unknown, parentKey = ""): boolean {
  if (Array.isArray(value)) return value.some((entry) => containsEmbeddedSecret(entry));
  if (!value || typeof value !== "object") return false;
  return Object.entries(value as Record<string, unknown>).some(([key, entry]) => {
    const sensitiveKey = /(?:api[_-]?key|access[_-]?token|secret|password|token)$/i.test(key);
    if (sensitiveKey && typeof entry === "string") {
      const safeExpression = /^\s*(?:\{\{.*\}\}|=\s*\{\{.*\}\})\s*$/.test(entry) || entry.trim().length < 12;
      if (!safeExpression) return true;
    }
    return containsEmbeddedSecret(entry, key || parentKey);
  });
}

function validateWorkflow(value: unknown): ValidWorkflow {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TRPCError({ code: "BAD_REQUEST", message: "Le fichier remis doit être un export JSON n8n." });
  const workflow = value as N8nWorkflow;
  if (!Array.isArray(workflow.nodes) || workflow.nodes.length === 0 || !workflow.connections || typeof workflow.connections !== "object" || Array.isArray(workflow.connections)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Ce JSON ne contient pas la structure attendue d’un workflow n8n (nodes et connections)." });
  }
  if (containsEmbeddedSecret(workflow)) throw new TRPCError({ code: "BAD_REQUEST", message: "Retirez toute clé API, mot de passe ou jeton du workflow avant de le remettre." });
  const nodes = workflow.nodes.map((node) => {
    if (!node || typeof node !== "object" || typeof (node as N8nNode).name !== "string" || typeof (node as N8nNode).type !== "string") {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Chaque nœud du workflow doit posséder un nom et un type n8n." });
    }
    return node as N8nNode & { name: string; type: string };
  });
  return { workflow, nodes, connections: workflow.connections as Record<string, unknown>, strings: JSON.stringify(workflow) };
}

const assessments: Record<string, Assessment> = {
  ch01_ex02_tp: { title: "Explorez votre premier workflow n8n", criteria: [
    { id: "form", label: "un Form Trigger", check: (workflow) => nodeHasType(workflow, ["formtrigger"]) },
    { id: "rates", label: "un nœud HTTP Request relié au formulaire", check: (workflow) => nodeHasType(workflow, ["httprequest"]) && hasConnection(workflow, ["form"], ["exchange", "rate", "http"]) },
    { id: "format", label: "un nœud Edit Fields / Set atteignable après l’appel", check: (workflow) => nodeHasType(workflow, [".set"]) && hasConnection(workflow, ["exchange", "rate", "http"], ["format", "set"]) },
  ] },
  ch01_ex04_tp: { title: "Le premier domino de la chaîne", criteria: [
    { id: "trigger", label: "un déclencheur manuel", check: (workflow) => nodeHasType(workflow, ["manualtrigger"]) },
    { id: "request", label: "un HTTP Request connecté depuis le déclencheur", check: (workflow) => nodeHasType(workflow, ["httprequest"]) && hasConnection(workflow, ["click", "manual", "trigger"], ["rate", "http", "request"]) },
    { id: "format", label: "un Edit Fields / Set atteignable après l’appel", check: (workflow) => nodeHasType(workflow, [".set"]) && hasConnection(workflow, ["rate", "http", "request"], ["format", "set"]) },
  ] },
  ch01_ex05_tp: { title: "Capturer des inscriptions avec Form Triggers", criteria: [
    { id: "form", label: "un Form Trigger", check: (workflow) => nodeHasType(workflow, ["formtrigger"]) },
    { id: "fields", label: "les champs prénom, nom et e-mail", check: (workflow) => fieldMentioned(workflow, ["first name", "prenom", "last name", "nom", "email"]) && fieldMentioned(workflow, ["email"]) },
    { id: "record", label: "un Edit Fields / Set connecté au formulaire", check: (workflow) => nodeHasType(workflow, [".set"]) && hasConnection(workflow, ["form"], ["record", "set", "registration"]) },
  ] },
  ch01_ex08_tp: { title: "Filtrer le superflu avec Edit Fields", criteria: [
    { id: "trigger", label: "un déclencheur manuel connecté", check: (workflow) => nodeHasType(workflow, ["manualtrigger"]) && Object.keys(workflow.connections).length > 0 },
    { id: "set", label: "un nœud Edit Fields / Set final", check: (workflow) => nodeHasType(workflow, [".set"]) },
    { id: "fields", label: "les seuls champs de sortie contact_name et email", check: (workflow) => fieldMentioned(workflow, ["contact_name"]) && fieldMentioned(workflow, ["email"]) },
  ] },
  ch02_ex08_tp: { title: "Aplatir des données imbriquées", criteria: [
    { id: "trigger", label: "un déclencheur manuel", check: (workflow) => nodeHasType(workflow, ["manualtrigger"]) },
    { id: "set", label: "un nœud Edit Fields / Set de transformation", check: (workflow) => nodeHasType(workflow, [".set"]) },
    { id: "fields", label: "name et email exposés au premier niveau", check: (workflow) => fieldMentioned(workflow, ["name"]) && fieldMentioned(workflow, ["email"]) },
  ] },
  ch02_ex10_tp: { title: "Fusionner des jeux de données", criteria: [
    { id: "inputs", label: "deux jeux de données préparés", check: (workflow) => workflow.nodes.filter((node) => includesAny(node.type, [".code"])).length >= 2 },
    { id: "merge", label: "un nœud Merge", check: (workflow) => nodeHasType(workflow, [".merge"]) },
    { id: "key", label: "une fusion basée sur userId", check: (workflow) => fieldMentioned(workflow, ["userid", "userId"]) },
  ] },
  ch03_ex04_tp: { title: "Réutiliser la sortie de l’Agent", criteria: [
    { id: "agent", label: "un Agent connecté au flux", check: (workflow) => nodeHasType(workflow, ["langchain.agent"]) },
    { id: "model", label: "un modèle de chat connecté à l’Agent", check: (workflow) => nodeHasType(workflow, ["lmchatopenai"]) && hasConnection(workflow, ["chat model", "openai"], ["agent"]) },
    { id: "report", label: "un Edit Fields / Set de rapport après l’Agent", check: (workflow) => nodeHasType(workflow, [".set"]) && hasConnection(workflow, ["agent"], ["report", "set"]) && fieldMentioned(workflow, ["report"]) },
  ] },
  ch03_ex06_tp: { title: "Classifier et acheminer les retours", criteria: [
    { id: "agent", label: "un Agent de classification", check: (workflow) => nodeHasType(workflow, ["langchain.agent"]) },
    { id: "model", label: "un modèle de chat attaché", check: (workflow) => nodeHasType(workflow, ["lmchatopenai"]) && hasConnection(workflow, ["chat model", "openai"], ["agent"]) },
    { id: "routing", label: "un Switch connecté à la sortie de l’Agent", check: (workflow) => nodeHasType(workflow, [".switch"]) && hasConnection(workflow, ["agent"], ["switch", "route"]) },
  ] },
  ch03_ex07_tp: { title: "Rédiger une réponse personnalisée", criteria: [
    { id: "routing", label: "un Switch de routage", check: (workflow) => nodeHasType(workflow, [".switch"]) },
    { id: "responseAgent", label: "un Agent de réponse sur une branche", check: (workflow) => workflow.nodes.filter((node) => includesAny(node.type, ["langchain.agent"])).length >= 2 && nodeHasName(workflow, ["draft", "response", "reponse"]) },
    { id: "model", label: "un modèle de chat relié à l’Agent de réponse", check: (workflow) => workflow.nodes.filter((node) => includesAny(node.type, ["lmchatopenai"])).length >= 2 },
  ] },
  ch03_ex11_tp: { title: "Personnaliser le pipeline", criteria: [
    { id: "form", label: "un Form Trigger et un classifieur", check: (workflow) => nodeHasType(workflow, ["formtrigger"]) && nodeHasType(workflow, ["langchain.agent"]) },
    { id: "route", label: "un Switch de routage par niveau", check: (workflow) => nodeHasType(workflow, [".switch"]) && fieldMentioned(workflow, ["enterprise", "tier"]) },
    { id: "welcome", label: "une branche d’accueil personnalisée avec Agent et modèle", check: (workflow) => workflow.nodes.filter((node) => includesAny(node.type, ["langchain.agent"])).length >= 2 && workflow.nodes.filter((node) => includesAny(node.type, ["lmchatopenai"])).length >= 2 && fieldMentioned(workflow, ["instruction", "dedicated account manager"]) },
  ] },
};

function assessmentFor(blockId: string) {
  const assessment = assessments[blockId];
  if (!assessment) throw new TRPCError({ code: "NOT_FOUND", message: "TP n8n introuvable." });
  return assessment;
}

function correctionResource(blockId: string) {
  const resources = getN8nFoundationsWorkflowResource(blockId);
  if (!resources) return [];
  return [{ title: `Correction expliquée — ${resources.correction.filename}`, url: resources.correction.url, filename: resources.correction.filename, sha256: resources.correction.sha256, size: resources.correction.size }];
}

export async function submitN8nFoundationsWorkflow(input: { userId: number; courseId: string; blockId: string; lessonIndex: number; chapterIndex: number; workflowJson: string }) {
  if (input.courseId !== N8N_FOUNDATIONS_COURSE_ID) throw new TRPCError({ code: "NOT_FOUND", message: "Cours n8n introuvable." });
  const assessment = assessmentFor(input.blockId);
  let parsed: unknown;
  try { parsed = JSON.parse(input.workflowJson); } catch { throw new TRPCError({ code: "BAD_REQUEST", message: "Le fichier sélectionné n’est pas un JSON valide." }); }
  const workflow = validateWorkflow(parsed);
  if (canonicalHash(parsed) === STARTER_SIGNATURES[input.blockId]) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Le workflow de départ n’a pas été modifié. Réalisez les étapes du TP, exportez votre copie puis remettez ce JSON." });
  }
  const met = assessment.criteria.filter((criterion) => criterion.check(workflow));
  const missed = assessment.criteria.filter((criterion) => !met.includes(criterion));
  const score = met.length;
  const passed = score === assessment.criteria.length;
  const feedback = passed
    ? "Workflow validé : sa structure répond aux critères de ce TP. La correction expliquée est désormais disponible."
    : `Workflow incomplet : ajoutez ou corrigez ${missed.map((criterion) => criterion.label).join(" ; ")}. Exportez à nouveau le workflow puis réessayez.`;
  const persistence = await saveAiResponseEvaluation({
    userId: input.userId, courseId: input.courseId, lessonIndex: input.lessonIndex, chapterIndex: input.chapterIndex, blockId: input.blockId,
    answer: JSON.stringify({ name: workflow.workflow.name, nodeCount: workflow.nodes.length, nodeTypes: workflow.nodes.map((node) => node.type) }),
    rubric: assessment.criteria.map((criterion) => ({ id: criterion.id, label: criterion.label, description: criterion.label, weight: 1 })),
    score, maxScore: assessment.criteria.length, passingScore: assessment.criteria.length, passed, feedback,
    strengths: met.map((criterion) => criterion.label), improvements: missed.map((criterion) => criterion.label), model: "deterministic-n8n-workflow-validator-v1",
  });
  await recordLearningEvent({ userId: input.userId, eventType: "practical_lab_submitted", courseId: input.courseId, lessonIndex: input.lessonIndex, chapterIndex: input.chapterIndex, exerciseId: input.blockId, score, success: passed ? 1 : 0, attemptNumber: persistence.attemptNumber, metadata: { assessment: "n8n_workflow_json", deterministic: true, containsWorkflowSource: false } });
  if (passed) await applyCompetencyEvent({ userId: input.userId, sourceType: "exercise_passed", sourceKey: input.courseId, eventKey: `n8n-foundations-workflow:${input.blockId}`, score: 100, competencyTags: getContentCompetencyTags({ courseId: input.courseId }), evidence: { blockId: input.blockId, attemptNumber: persistence.attemptNumber, assessment: "n8n_workflow_json" } });
  return { score, maxScore: assessment.criteria.length, feedback, strengths: met.map((criterion) => criterion.label), improvements: missed.map((criterion) => criterion.label), passed, attemptNumber: persistence.attemptNumber, correctionResources: passed ? correctionResource(input.blockId) : [] };
}

export async function getN8nFoundationsActivityStatus(input: { userId: number; courseId: string }) {
  if (input.courseId !== N8N_FOUNDATIONS_COURSE_ID) throw new TRPCError({ code: "NOT_FOUND", message: "Cours n8n introuvable." });
  const events = await getLearnerLearningEvents(input.userId);
  return { completedPracticalIds: Array.from(new Set(events.filter((event) => event.courseId === input.courseId && event.eventType === "practical_lab_submitted" && event.success === 1 && Boolean(event.exerciseId && assessments[event.exerciseId])).map((event) => event.exerciseId!))) };
}

export async function mayAccessN8nFoundationsCorrection(input: { userId: number; key: string }) {
  const blockId = getN8nFoundationsCorrectionBlockIdByKey(input.key);
  if (!blockId) return false;
  const events = await getLearnerLearningEvents(input.userId);
  return events.some((event) => event.courseId === N8N_FOUNDATIONS_COURSE_ID && event.eventType === "practical_lab_submitted" && event.exerciseId === blockId && event.success === 1);
}
