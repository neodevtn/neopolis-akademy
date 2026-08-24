import { describe, expect, it } from "vitest";
import { normalizeTrainingSearchText, searchTrainingContent, type TrainingSearchEntry } from "./trainingSearch";
import searchIndex from "../../public/data/training-search-index.json";

const entries: TrainingSearchEntry[] = [
  { id: "cert-claude", kind: "certification", title: "Claude Certified Developer", subtitle: "API, agents et sécurité", keywords: ["claude", "api", "agents"], certId: "claude", href: "/training/claude" },
  { id: "course-n8n", kind: "course", title: "Initiation à l’automatisation de workflows avec n8n", subtitle: "Automatiser des tâches répétitives", keywords: ["n8n", "workflow", "orchestration"], group: "bi_data_analytics", certId: "n8n", href: "/training/n8n/n8n__01" },
  { id: "chapter-rag", kind: "chapter", title: "Recherche vectorielle et RAG", subtitle: "Embeddings, retrieval et citations", keywords: ["rag", "vector", "retrieval"], group: "fullstack_ai_engineering", certId: "rag", href: "/training/rag/rag__01?lesson=0&chapter=1" },
];

describe("trainingSearch", () => {
  it("normalise les accents et la ponctuation", () => {
    expect(normalizeTrainingSearchText("Initiation à l’IA !")).toBe("initiation a l ia");
  });

  it("trouve une correspondance partielle et classe le titre pertinent en premier", () => {
    const results = searchTrainingContent(entries, "automat workflow");
    expect(results.map((entry) => entry.id)).toEqual(["course-n8n"]);
  });

  it("respecte les filtres de type et de groupe", () => {
    expect(searchTrainingContent(entries, "rag", { kind: "course" })).toEqual([]);
    expect(searchTrainingContent(entries, "rag", { group: "fullstack_ai_engineering" }).map((entry) => entry.id)).toEqual(["chapter-rag"]);
  });

  it("retrouve les contenus réels n8n et RAG dans l’index généré", () => {
    const n8n = searchTrainingContent(searchIndex as TrainingSearchEntry[], "automatisation workflow", { limit: 20 });
    const rag = searchTrainingContent(searchIndex as TrainingSearchEntry[], "recherche vectorielle rag", { limit: 20 });
    const n8nCourse = n8n.find((entry) => entry.kind === "course" && entry.href.includes("initiation_automatisation_workflows_n8n"));
    const n8nChapter = n8n.find((entry) => entry.kind === "chapter" && entry.href.includes("initiation_automatisation_workflows_n8n"));
    expect(n8nCourse?.href).toBe("/training/initiation_automatisation_workflows_n8n/initiation_automatisation_workflows_n8n__01");
    expect(n8nChapter?.href).toMatch(/^\/training\/initiation_automatisation_workflows_n8n\/initiation_automatisation_workflows_n8n__01\?lesson=\d+&chapter=\d+$/);
    expect(rag.some((entry) => entry.title.toLowerCase().includes("rag") || entry.snippet?.toLowerCase().includes("rag"))).toBe(true);
  });

  it("retrouve le cours DataCamp sur les systèmes agentiques évolutifs", () => {
    const courseResults = searchTrainingContent(searchIndex as TrainingSearchEntry[], "systèmes agentiques", { limit: 20 });
    const protocolResults = searchTrainingContent(searchIndex as TrainingSearchEntry[], "MCP", { limit: 20 });
    const course = courseResults.find((entry) => entry.kind === "course" && entry.href.includes("building_scalable_agentic_systems"));
    const chapter = protocolResults.find((entry) => entry.kind === "chapter" && entry.title.includes("MCP") && entry.href.includes("building_scalable_agentic_systems"));
    expect(course?.href).toBe("/training/datacamp_building_scalable_agentic_systems/building_scalable_agentic_systems__01");
    expect(chapter?.href).toMatch(/^\/training\/datacamp_building_scalable_agentic_systems\/building_scalable_agentic_systems__01\?lesson=\d+&chapter=\d+$/);
  });
});
