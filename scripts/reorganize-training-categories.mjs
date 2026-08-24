import fs from "node:fs";
import path from "node:path";

const indexPath = path.resolve("client/src/data/trainingIndex.json");
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));

const taxonomy = {
  business_ai_literacy: {
    title: { fr: "Fondamentaux, stratégie & gouvernance IA", en: "AI Foundations, Strategy & Governance" },
    subtitle: { fr: "Culture IA, stratégie, gouvernance et management pour les professionnels", en: "Core AI literacy, strategy, governance and management for professionals" }, order: 1,
  },
  anthropic_certification_preparation: {
    title: { fr: "Préparations aux certifications officielles Anthropic", en: "Anthropic Official Certification Preparation" },
    subtitle: { fr: "Préparation structurée aux examens Claude ; la certification officielle reste délivrée par Anthropic", en: "Structured Claude exam preparation; official certification remains issued by Anthropic" }, order: 2,
  },
  claude_ai_agents: {
    title: { fr: "Agents IA, Claude & orchestration", en: "AI Agents, Claude & Orchestration" },
    subtitle: { fr: "Claude, Claude Code, sous-agents et Model Context Protocol", en: "Claude, Claude Code, subagents and Model Context Protocol" }, order: 3,
  },
  fullstack_ai_engineering: {
    title: { fr: "Ingénierie IA, RAG & MLOps", en: "AI Engineering, RAG & MLOps" },
    subtitle: { fr: "IA de production, RAG, LLMOps, infrastructure et modèles open source", en: "Production AI, RAG, LLMOps, infrastructure and open-source models" }, order: 4,
  },
  generative_ai_api_development: {
    title: { fr: "API et applications d’IA générative", en: "Generative AI APIs & Applications" },
    subtitle: { fr: "OpenAI, modèles multimodaux, embeddings, prompting et systèmes IA", en: "OpenAI, multimodal models, embeddings, prompting and AI systems" }, order: 5,
  },
  bi_data_analytics: {
    title: { fr: "Data, BI & analytics IA", en: "Data, BI & AI Analytics" },
    subtitle: { fr: "Données, reporting, BI, automatisation et analyse assistée par IA", en: "Data, reporting, BI, automation and AI-assisted analysis" }, order: 6,
  },
  workplace_ai_productivity: {
    title: { fr: "IA au travail & productivité", en: "AI for Work & Productivity" },
    subtitle: { fr: "Assistants IA, collaboration et usages professionnels par métier", en: "AI assistants, collaboration and professional workflows by role" }, order: 7,
  },
  divers: {
    title: { fr: "Parcours spécialisés", en: "Specialized Tracks" },
    subtitle: { fr: "Parcours transversaux et IA appliquée", en: "Cross-functional and applied AI tracks" }, order: 8,
  },
};

index.categories = (index.categories || [])
  .filter((category) => category.id !== "datacamp_partner")
  .map((category) => taxonomy[category.id] ? { ...category, ...taxonomy[category.id] } : category)
  .sort((a, b) => a.order - b.order);

fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
console.log(`Catégories réorganisées : ${index.categories.length}`);
