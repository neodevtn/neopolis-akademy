import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync("/home/ubuntu/novasavo_import_2026_08_25/package/COURSE_MANIFEST.json", "utf8"));
const courseId = "automatisation_comptable_ia__01";
const certId = "novasavo_automatisation_comptable_ia";
const i18n = (fr) => ({ fr, en: fr });
const topics = [
  ["partie double", "Documenter chaque transaction et préserver la piste d’audit avant toute automatisation."],
  ["usage responsable de l’IA", "L’IA assiste le contrôle et la préparation ; la validation comptable reste sous responsabilité humaine."],
  ["saisie des données", "La qualité des pièces justificatives et des règles de contrôle conditionne la fiabilité de l’automatisation."],
  ["catégorisation", "Les règles doivent être explicables, révisées et soumises à validation en cas d’incertitude."],
  ["rapprochement bancaire", "Les correspondances suggérées nécessitent une piste de contrôle et un traitement des exceptions."],
  ["factures et dépenses", "Le workflow doit séparer extraction, approbation, imputation et paiement."],
  ["prévisions", "Une prévision dépend d’hypothèses documentées et ne remplace pas le jugement professionnel."],
  ["anomalies et fraude", "Un signal d’anomalie est une alerte à investiguer, pas une décision automatique."],
  ["paie et fiscalité", "Les contrôles humains, délais et règles locales sont indispensables avant toute transmission."],
  ["intégration des outils", "Les accès, rôles, journaux et interfaces doivent être gouvernés avant la mise en production."],
  ["gouvernance de l’IA", "La confidentialité, l’explicabilité et la supervision doivent être intégrées dès la conception."],
  ["évolution du métier", "L’automatisation déplace le travail vers l’analyse, le contrôle et l’accompagnement des décisions."],
];
const options = (correct) => [
  { id: "a", text: i18n("Automatiser sans règle de contrôle ni validation") },
  { id: "b", text: i18n(correct) },
  { id: "c", text: i18n("Supprimer toute intervention humaine dès le premier test") },
  { id: "d", text: i18n("Utiliser des données sensibles sans politique de protection") },
];
const lessonFor = (unit, position) => {
  const [topic, keyPoint] = topics[position];
  const prefix = `novasavo_u${String(position + 1).padStart(2, "0")}`;
  return {
    id: `${prefix}_lesson`, title: i18n(unit.title), description: i18n(`Unité ${position + 1} sur l’automatisation comptable par l’IA : ${topic}.`), competencyTags: ["finance", "comptabilite", "ia", "automatisation", "controle_interne"], recommendedVideos: [], recommendedVideosManaged: false,
    chapters: [
      { id: `${prefix}_screen_01`, title: i18n("Objectifs de l’unité"), type: "teaching", requiredBeforeAdvance: false, blocks: [
        { type: "unit_hero_blue", id: `${prefix}_hero`, title: i18n(unit.title), body: i18n(`Comprendre les principes de ${topic} pour automatiser sans perdre le contrôle.`), unitNumber: position + 1, duration: "≈ 20 min" },
        { type: "learning_objectives_panel", id: `${prefix}_objectives`, items: [i18n(`Identifier les règles et contrôles liés à ${topic}.`), i18n("Distinguer automatisation, assistance et décision humaine."), i18n("Préparer une pratique responsable et traçable.")] },
      ] },
      { id: `${prefix}_screen_02`, title: i18n("Vérification rapide"), type: "teaching", requiredBeforeAdvance: true, blocks: [
        { type: "inline_myth_reality", id: `${prefix}_myth`, prompt: i18n(`Mythe ou réalité : pour ${topic}, un outil IA fiable dispense de contrôle humain.`), correctAnswer: "mythe", explanation: i18n(keyPoint), xp: 5 },
      ] },
      { id: `${prefix}_screen_03`, title: i18n("Processus à structurer"), type: "teaching", requiredBeforeAdvance: false, blocks: [
        { type: "timeline_step_cards", id: `${prefix}_timeline`, title: i18n(`Étapes clés : ${topic}`), steps: [i18n("Collecter et vérifier les données source"), i18n("Appliquer des règles documentées"), i18n("Traiter les exceptions"), i18n("Valider et journaliser la décision")] },
        { type: "process_flow_diagram", id: `${prefix}_flow`, title: i18n("Flux de contrôle"), nodes: [i18n("Données"), i18n("Règles"), i18n("Revue humaine"), i18n("Journal d’audit")] },
      ] },
      { id: `${prefix}_screen_04`, title: i18n("Erreurs à éviter"), type: "teaching", requiredBeforeAdvance: false, blocks: [
        { type: "mistake_correction_pairs", id: `${prefix}_mistakes`, title: i18n("Pratiques à corriger"), pairs: [{ mistake: i18n("Faire confiance à une suggestion sans vérifier la pièce source."), correction: i18n("Prévoir une revue, une exception et une trace de validation.") }, { mistake: i18n("Utiliser une règle non documentée."), correction: i18n("Versionner la règle, son responsable et son périmètre.") }] },
        { type: "ai_assistant_prompt_panel", id: `${prefix}_assistant`, title: i18n("Explorer avec l’assistant"), prompt: i18n(`Explique-moi comment préparer un contrôle humain pour ${topic}, sans utiliser de données sensibles.`) },
      ] },
      { id: `${prefix}_screen_05`, title: i18n("Scénario de validation"), type: "checkpoint", requiredBeforeAdvance: true, blocks: [
        { type: "inline_scenario_question_feedback", id: `${prefix}_scenario`, scenario: i18n(`Vous déployez une automatisation liée à ${topic}. Quelle approche est la plus sûre ?`), options: options("Tester sur un périmètre contrôlé, traiter les exceptions et faire valider les résultats."), correctAnswer: "b", explanation: i18n("Un déploiement progressif avec contrôles et traçabilité limite les risques opérationnels."), xp: 10 },
      ] },
      { id: `${prefix}_screen_06`, title: i18n("Notes et passage à la suite"), type: "teaching", requiredBeforeAdvance: false, blocks: [
        { type: "notes_highlights_bookmarks_panel", id: `${prefix}_notes` },
        { type: "xp_progress_hud", id: `${prefix}_xp`, xp: 15 },
        { type: "course_completion_next_unit_panel", id: `${prefix}_next` },
      ] },
    ],
  };
};
const finalExam = {
  id: "novasavo_final_exam", title: i18n("Examen final — Automatisation comptable par l’IA"), description: i18n("Examen disponible après les douze unités."), competencyTags: ["finance", "comptabilite", "ia", "automatisation", "controle_interne"], recommendedVideos: [], recommendedVideosManaged: false,
  chapters: Array.from({ length: 5 }, (_, index) => ({ id: `novasavo_exam_${index + 1}`, title: i18n(`Examen final · Question ${index + 1}`), type: "quiz", requiredBeforeAdvance: true, blocks: [{ type: "inline_multiple_choice_feedback", id: `novasavo_exam_q${index + 1}`, prompt: i18n("Quel principe reste indispensable dans une automatisation comptable responsable ?"), options: options("La validation humaine, la traçabilité et la gestion des exceptions."), correctAnswer: "b", explanation: i18n("L’automatisation soutient le travail comptable ; elle ne supprime ni la responsabilité ni la supervision."), xp: 15 }] })),
};
const course = { courseId, sourceCourseTitle: manifest.course.title, sourceProvider: "Novasavo", sourceCourseUrl: manifest.course.source_url, sourceLanguage: "fr", integration: { schemaVersion: "neopolis.novasavo_paginated.v1", sourceManifest: "COURSE_MANIFEST.json", unitsExpected: 12, unitsImported: 12, reader: "screen_paginated_reader_not_long_scroll" }, lessons: manifest.units.map(lessonFor).concat(finalExam) };
mkdirSync("client/public/data/courses", { recursive: true });
writeFileSync(`client/public/data/courses/${courseId}.json`, `${JSON.stringify(course, null, 2)}\n`);

const indexPath = "client/src/data/trainingIndex.json";
const index = JSON.parse(readFileSync(indexPath, "utf8"));
const upsert = (array, item) => { const at = array.findIndex((entry) => entry.id === item.id); if (at === -1) array.push(item); else array[at] = item; };
if (!index.categories.some((category) => category.id === "finance_accounting")) index.categories.push({ id: "finance_accounting", title: i18n("Finance & Comptabilité"), subtitle: i18n("Automatisation financière, comptabilité, contrôles et IA appliquée"), order: 99 });
upsert(index.certifications, { id: certId, title: i18n("Novasavo · Automatisation comptable par l’IA"), description: i18n("Parcours paginé sur l’automatisation comptable responsable : contrôles, données, conformité et IA appliquée."), level: i18n("Intermédiaire"), icon: "▣", courseCount: 1, totalLessons: 12, totalExercises: 24, totalVideos: 0, totalDownloads: 0, totalActivities: 77, courses: [courseId], group: "finance_accounting", breakdown: { fr: "12 unités · 77 écrans · 24 interactions · examen final verrouillé", en: "12 units · 77 screens · 24 interactions · locked final exam", chapters: 12 }, exerciseLabel: i18n("écrans"), provider: "novasavo" });
upsert(index.courses, { id: courseId, certId, title: i18n("Automatisation comptable par l’IA"), order: 1, lessonCount: 12, exerciseCount: 24, videoCount: 0, downloadCount: 0, chapterCount: 77, totalActivities: 77, exerciseLabel: i18n("écrans"), breakdown: { fr: "12 unités · 77 écrans · 24 interactions", en: "12 units · 77 screens · 24 interactions", chapters: 12 }, videos: [], searchKeywords: ["finance", "comptabilité", "automatisation", "IA", "factures", "rapprochement bancaire", "contrôle interne", "fraude", "prévisions"] });
index.catalogRevision = "2026-08-25-novasavo-accounting-r1";
writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
console.log(JSON.stringify({ courseId, units: manifest.units.length, lessons: course.lessons.length, screens: course.lessons.reduce((count, lesson) => count + lesson.chapters.length, 0) }));
