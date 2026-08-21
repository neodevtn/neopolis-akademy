import fs from "node:fs";
import path from "node:path";

const file = path.resolve("client/src/data/trainingIndex.json");
const index = JSON.parse(fs.readFileSync(file, "utf8"));

const additions = [
  {
    id: "claude_ai_agents",
    title: { fr: "Agents IA & Claude", en: "AI Agents & Claude" },
    subtitle: { fr: "Claude, Claude Code, sous-agents et Model Context Protocol", en: "Claude, Claude Code, subagents and Model Context Protocol" },
    order: 6,
  },
  {
    id: "generative_ai_api_development",
    title: { fr: "Développement avec les API d’IA générative", en: "Generative AI API Development" },
    subtitle: { fr: "OpenAI, modèles multimodaux, embeddings, prompting et systèmes IA", en: "OpenAI, multimodal models, embeddings, prompting and AI systems" },
    order: 7,
  },
  {
    id: "workplace_ai_productivity",
    title: { fr: "IA de productivité & collaboration", en: "AI Productivity & Collaboration" },
    subtitle: { fr: "Gemini dans Google Workspace et usages professionnels assistés par IA", en: "Gemini in Google Workspace and AI-assisted professional workflows" },
    order: 8,
  },
];

const categoryIds = new Set(index.categories.map((category) => category.id));
for (const category of additions) {
  if (!categoryIds.has(category.id)) index.categories.push(category);
}

const claude = new Set([
  "datacamp_introduction_to_claude_models",
  "datacamp_software_development_with_claude_code",
  "datacamp_claude_101",
  "datacamp_claude_code_in_action",
  "datacamp_introduction_to_agent_skills",
  "datacamp_model_context_protocol_advanced_topics",
  "datacamp_introduction_to_subagents",
  "datacamp_claude_code_101",
]);
const workspace = new Set([
  "datacamp_introduction_to_google_workspace_with_gemini",
  "datacamp_gemini_in_gmail",
  "datacamp_gemini_in_google_meet",
  "datacamp_gemini_in_google_sheets",
  "datacamp_gemini_in_google_docs",
  "datacamp_gemini_in_google_drive",
  "datacamp_gemini_in_google_slides",
  "datacamp_practical_ai_with_google_gemini_and_notebooklm",
]);
const openai = new Set([
  "datacamp_multi_modal_systems_with_the_openai_api",
  "datacamp_introduction_to_embeddings_with_the_openai_api",
  "datacamp_developing_ai_systems_with_the_openai_api",
  "datacamp_working_with_the_openai_api",
  "datacamp_working_with_the_openai_responses_api",
  "datacamp_prompt_engineering_with_the_openai_api",
]);

for (const certification of index.certifications) {
  if (!certification.id.startsWith("datacamp_")) continue;
  certification.provider = "datacamp";
  if (claude.has(certification.id)) certification.group = "claude_ai_agents";
  else if (workspace.has(certification.id)) certification.group = "workplace_ai_productivity";
  else if (openai.has(certification.id)) certification.group = "generative_ai_api_development";
  else certification.group = "bi_data_analytics";
}

index.categories.sort((left, right) => left.order - right.order);
fs.writeFileSync(file, `${JSON.stringify(index, null, 2)}\n`);
console.log("Catégories et provenance DataCamp mises à jour.");
