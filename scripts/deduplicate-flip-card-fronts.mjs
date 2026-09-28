#!/usr/bin/env node
import fs from "node:fs";

const changes = [
  ["claude_certified_architect_foundations__05.json", [3, 1, 1], 1, { en: "Chat — try it out", fr: "Discussion — à essayer" }],
  ["claude_certified_architect_foundations__05.json", [3, 1, 1], 3, { en: "Cowork — try it out", fr: "Cowork — à essayer" }],

  ["claude_certified_architect_professional__01.json", [0, 7, 1], 1, { en: "Context window — limitation", fr: "Fenêtre de contexte — limite" }],
  ["claude_certified_architect_professional__01.json", [0, 7, 1], 2, { en: "Retrieval — limitation", fr: "Récupération — limite" }],
  ["claude_certified_architect_professional__01.json", [0, 7, 1], 4, { en: "Compaction — limitation", fr: "Compression — limite" }],

  ["claude_certified_architect_professional__02.json", [0, 8, 1], 1, { en: "Integration problem 1", fr: "Problème d’intégration 1" }],
  ["claude_certified_architect_professional__02.json", [0, 8, 1], 2, { en: "Integration problem 2", fr: "Problème d’intégration 2" }],
  ["claude_certified_architect_professional__02.json", [0, 8, 1], 3, { en: "Integration problem 3", fr: "Problème d’intégration 3" }],
  ["claude_certified_architect_professional__02.json", [0, 8, 1], 4, { en: "Integration problem 4", fr: "Problème d’intégration 4" }],
  ["claude_certified_architect_professional__02.json", [0, 11, 1], 0, { en: "Safety — summary faithfulness", fr: "Sûreté — fidélité du résumé" }],
  ["claude_certified_architect_professional__02.json", [0, 11, 1], 1, { en: "Security — data isolation", fr: "Sécurité — isolation des données" }],

  ["claude_certified_architect_professional__03.json", [0, 7, 1], 1, { en: "Transparency gap 1", fr: "Lacune de transparence 1" }],
  ["claude_certified_architect_professional__03.json", [0, 7, 1], 2, { en: "Transparency gap 2", fr: "Lacune de transparence 2" }],
  ["claude_certified_architect_professional__03.json", [0, 7, 1], 3, { en: "Adequate control 1", fr: "Contrôle adéquat 1" }],
  ["claude_certified_architect_professional__03.json", [0, 7, 1], 4, { en: "Adequate control 2", fr: "Contrôle adéquat 2" }],
  ["claude_certified_architect_professional__03.json", [0, 7, 1], 5, { en: "Transparency gap 3", fr: "Lacune de transparence 3" }],

  ["claude_certified_architect_professional__05.json", [0, 1, 0], 2, { en: "Skill rollout — watch out for", fr: "Déploiement des Skills — attention" }],
  ["claude_certified_architect_professional__05.json", [0, 1, 0], 3, { en: "Skill rollout — cost · complexity · risk", fr: "Déploiement des Skills — coût · complexité · risque" }],
  ["claude_certified_architect_professional__05.json", [0, 1, 0], 4, { en: "AI-assisted coding — watch out for", fr: "Code assisté par IA — attention" }],
  ["claude_certified_architect_professional__05.json", [0, 1, 0], 5, { en: "AI-assisted coding — cost · complexity · risk", fr: "Code assisté par IA — coût · complexité · risque" }],

  ["claude_certified_associate_foundations__04.json", [0, 4, 1], 5, { en: "Contract clause extraction", fr: "Extraction des clauses du contrat" }],
  ["claude_certified_associate_foundations__04.json", [0, 4, 1], 6, { en: "HRIS details extraction", fr: "Extraction des données SIRH" }],

  ["claude_certified_developer_foundations__04.json", [0, 6, 1], 0, { en: "Dev A — 1", fr: "Développeur A — 1" }],
  ["claude_certified_developer_foundations__04.json", [0, 6, 1], 1, { en: "Dev B — 1", fr: "Développeur B — 1" }],
  ["claude_certified_developer_foundations__04.json", [0, 6, 1], 2, { en: "Dev A — 2", fr: "Développeur A — 2" }],
  ["claude_certified_developer_foundations__04.json", [0, 6, 1], 3, { en: "Dev B — 2", fr: "Développeur B — 2" }],
];

const byFile = new Map();
for (const change of changes) {
  const [file] = change;
  if (!byFile.has(file)) byFile.set(file, []);
  byFile.get(file).push(change);
}

let updated = 0;
for (const [name, fileChanges] of byFile) {
  const file = `client/public/data/courses/${name}`;
  const course = JSON.parse(fs.readFileSync(file, "utf8"));
  let fileUpdated = false;
  for (const [, [lessonIndex, chapterIndex, blockIndex], cardIndex, front] of fileChanges) {
    const block = course.lessons?.[lessonIndex]?.chapters?.[chapterIndex]?.blocks?.[blockIndex];
    const card = block?.cards?.[cardIndex];
    if (block?.type !== "flip_cards" || !card) {
      throw new Error(`Unexpected flip-card path: ${name}:${lessonIndex}/${chapterIndex}/${blockIndex}/${cardIndex}`);
    }
    if (JSON.stringify(card.front) !== JSON.stringify(front)) {
      card.front = front;
      updated += 1;
      fileUpdated = true;
    }
  }
  if (fileUpdated) fs.writeFileSync(file, `${JSON.stringify(course, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify({ updated, files: byFile.size }, null, 2));
