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
        { type: "inline_myth_reality", id: `${prefix}_myth`, prompt: i18n(`Mythe ou réalité : pour ${topic}, un outil IA fiable dispense de contrôle humain.`), correctAnswer: "mythe", explanation: i18n(keyPoint), competencyPoints: 1 },
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
        { type: "inline_scenario_question_feedback", id: `${prefix}_scenario`, scenario: i18n(`Vous déployez une automatisation liée à ${topic}. Quelle approche est la plus sûre ?`), options: options("Tester sur un périmètre contrôlé, traiter les exceptions et faire valider les résultats."), correctAnswer: "b", explanation: i18n("Un déploiement progressif avec contrôles et traçabilité limite les risques opérationnels."), competencyPoints: 2 },
      ] },
      { id: `${prefix}_screen_06`, title: i18n("Notes et passage à la suite"), type: "teaching", requiredBeforeAdvance: false, blocks: [
        { type: "notes_highlights_bookmarks_panel", id: `${prefix}_notes` },
        { type: "competency_progress_hud", id: `${prefix}_competency_progress`, competencyPoints: 3 },
        { type: "course_completion_next_unit_panel", id: `${prefix}_next` },
      ] },
    ],
  };
};
const content = (id, body) => ({ type: "content", id, body: i18n(body) });
const unitOneLesson = (unit) => {
  const prefix = "novasavo_u01";
  const steps = [
    ["Identifier et analyser les transactions", "Collectez les pièces justificatives et analysez la nature économique de chaque opération."],
    ["Enregistrer les transactions dans le journal", "Inscrivez les écritures selon le principe de la partie double."],
    ["Reporter au grand livre", "Regroupez les mouvements par compte afin de suivre leurs soldes."],
    ["Établir la balance de vérification non ajustée", "Contrôlez l’égalité entre le total des débits et le total des crédits."],
    ["Analyser la feuille de travail (optionnelle)", "Préparez les ajustements et facilitez la préparation des états financiers."],
    ["Enregistrer les écritures d’ajustement", "Passez les corrections nécessaires pour refléter la réalité économique de la période."],
    ["Produire les états financiers", "Préparez les documents qui présentent la situation et la performance de l’entreprise."],
    ["Clôturer les comptes", "Préparez le passage à la période comptable suivante."],
  ];
  return {
    id: `${prefix}_lesson`, title: i18n(unit.title), description: i18n("Comprendre le cycle comptable manuel pour mieux automatiser."), competencyTags: ["finance", "comptabilite", "automatisation", "ia", "controle_interne", "audit_trail", "data_quality", "governance"], recommendedVideos: [], recommendedVideosManaged: false,
    chapters: [
      { id: `${prefix}_screen_01`, title: i18n("Fondamentaux et objectifs"), type: "teaching", requiredBeforeAdvance: false, blocks: [
        { type: "unit_hero_blue", id: `${prefix}_hero`, title: i18n("Fondamentaux de la comptabilité et de la tenue de livres"), body: i18n("Comprendre le cycle manuel pour mieux automatiser"), unitNumber: 1, duration: "19 min" },
        { type: "learning_objectives_panel", id: `${prefix}_objectives`, items: [i18n("Comprendre le principe de la partie double et son rôle dans l’équilibre comptable."), i18n("Reconnaître les huit étapes du cycle comptable manuel et leur enchaînement."), i18n("Apprendre à identifier les tâches répétitives du cycle propices à l’automatisation.")] },
      ] },
      { id: `${prefix}_screen_02`, title: i18n("Mythe ou réalité"), type: "teaching", requiredBeforeAdvance: true, blocks: [
        { type: "inline_myth_reality", id: `${prefix}_myth`, prompt: i18n("La comptabilité en partie double est une invention récente, apparue avec les logiciels de comptabilité."), correctAnswer: "mythe", explanation: i18n("Le principe de la partie double a été formalisé dès le 15e siècle, bien avant l’ère numérique. Il reste la clé de voûte d’une comptabilité fiable, même manuelle."), competencyPoints: 1 },
      ] },
      { id: `${prefix}_screen_03`, title: i18n("Le cycle comptable manuel"), type: "teaching", requiredBeforeAdvance: false, blocks: [
        content(`${prefix}_manual_cycle`, "## Le cycle comptable manuel : la carte routière de votre automatisation\n\nLa saisie manuelle des écritures est une source majeure d’erreurs et de volume de travail. Comprendre cette mécanique est indispensable pour savoir exactement **quoi** automatiser et **pourquoi**."),
      ] },
      { id: `${prefix}_screen_04`, title: i18n("Partie double et équation comptable"), type: "teaching", requiredBeforeAdvance: true, blocks: [
        content(`${prefix}_double_entry`, "## La partie double : l’équilibre qui garantit la fiabilité\n\nL’équation comptable fondamentale est **Actif = Passif + Capitaux propres**. Chaque écriture affecte au moins deux comptes et préserve cet équilibre."),
        { type: "inline_multiple_choice_feedback", id: `${prefix}_equation_check`, prompt: i18n("L’équation comptable fondamentale est Actif = Passif + Capitaux propres."), options: [{ id: "vrai", text: i18n("Vrai") }, { id: "faux", text: i18n("Faux") }], correctAnswer: "vrai", explanation: i18n("Correct : cette équation exprime l’équilibre permanent de la partie double."), competencyPoints: 1 },
      ] },
      { id: `${prefix}_screen_05`, title: i18n("Exemple concret débit et crédit"), type: "teaching", requiredBeforeAdvance: false, blocks: [
        content(`${prefix}_debit_credit`, "## Exemple concret\n\nUne écriture comptable décrit simultanément l’emploi et la ressource. **Débit** et **crédit** ne signifient pas respectivement dépense et recette : leur effet dépend du type de compte concerné."),
      ] },
      { id: `${prefix}_screen_06`, title: i18n("Cycle comptable en un coup d’œil"), type: "teaching", requiredBeforeAdvance: false, blocks: [
        { type: "process_flow_diagram", id: `${prefix}_flow`, title: i18n("Le cycle comptable en un coup d’œil"), nodes: steps.map(([title]) => i18n(title)) },
      ] },
      { id: `${prefix}_screen_07`, title: i18n("Les étapes 1 à 4"), type: "teaching", requiredBeforeAdvance: false, blocks: [
        { type: "timeline_step_cards", id: `${prefix}_timeline_1`, title: i18n("Les 8 étapes du cycle comptable manuel · 1 à 4"), steps: steps.slice(0, 4).map(([title, description]) => ({ title: i18n(title), description: i18n(description) })) },
      ] },
      { id: `${prefix}_screen_08`, title: i18n("Les étapes 5 à 8"), type: "teaching", requiredBeforeAdvance: false, blocks: [
        { type: "timeline_step_cards", id: `${prefix}_timeline_2`, title: i18n("Les 8 étapes du cycle comptable manuel · 5 à 8"), steps: steps.slice(4).map(([title, description]) => ({ title: i18n(title), description: i18n(description) })) },
      ] },
      { id: `${prefix}_screen_09`, title: i18n("Première étape du cycle"), type: "checkpoint", requiredBeforeAdvance: true, blocks: [
        { type: "inline_multiple_choice_feedback", id: `${prefix}_first_step`, prompt: i18n("Quelle est la première étape du cycle comptable manuel ?"), options: ["Identifier et analyser les transactions", "Enregistrer les transactions dans le journal", "Reporter au grand livre", "Établir la balance de vérification"].map((text, index) => ({ id: ["a", "b", "c", "d"][index], text: i18n(text) })), correctAnswer: "a", explanation: i18n("La première étape consiste à identifier et analyser les transactions à partir des pièces justificatives."), competencyPoints: 2 },
      ] },
      { id: `${prefix}_screen_10`, title: i18n("Erreurs fréquentes"), type: "teaching", requiredBeforeAdvance: false, blocks: [
        { type: "mistake_correction_pairs", id: `${prefix}_mistakes`, title: i18n("Erreurs fréquentes"), pairs: [{ mistake: i18n("Oublier de reporter une écriture du journal vers le grand livre."), correction: i18n("Reportez chaque écriture du journal vers le grand livre afin de conserver des soldes de comptes fiables.") }] },
      ] },
      { id: `${prefix}_screen_11`, title: i18n("Pièces justificatives"), type: "teaching", requiredBeforeAdvance: false, blocks: [
        content(`${prefix}_documents`, "## Les pièces justificatives : la matière première de la comptabilité\n\nFactures, reçus, relevés et contrats constituent la preuve des transactions. Leur qualité détermine la qualité des écritures et des contrôles à automatiser."),
      ] },
      { id: `${prefix}_screen_12`, title: i18n("Assistant comptable"), type: "teaching", requiredBeforeAdvance: false, blocks: [
        { type: "ai_assistant_prompt_panel", id: `${prefix}_assistant`, title: i18n("Demande à ton assistant"), prompt: i18n("Comment puis-je automatiser la vérification de ma balance de vérification manuelle dans ma petite entreprise ?"), suggestedQuestions: [i18n("Donne-moi un exemple de contrôle de balance."), i18n("Quelles pièces dois-je vérifier avant une automatisation ?"), i18n("Comment traiter une écriture inhabituelle ?")] },
      ] },
      { id: `${prefix}_screen_13`, title: i18n("Anatomie d’une écriture"), type: "teaching", requiredBeforeAdvance: false, blocks: [
        content(`${prefix}_entry_anatomy`, "## Anatomie d’une écriture comptable en partie double\n\n**Débit** : enregistre le mouvement selon la nature du compte.\n\n**Crédit** : enregistre la contrepartie.\n\nLe total des débits doit toujours être égal au total des crédits."),
      ] },
      { id: `${prefix}_screen_14`, title: i18n("Pratiques de saisie"), type: "teaching", requiredBeforeAdvance: false, blocks: [
        { type: "accounting_comparison_visual", id: `${prefix}_comparison`, title: i18n("Tâches manuelles et opportunités d’automatisation"), left: { title: i18n("Saisie des écritures une par une au fil de la journée"), points: [i18n("Correction immédiate possible avant la suite"), i18n("Risque d’interruption du flux de travail")] }, right: { title: i18n("Saisie par lots à la fin de la journée"), points: [i18n("Correction plus complexe car les erreurs s’accumulent"), i18n("Préparation plus facile à automatiser avec des contrôles")] } },
      ] },
      { id: `${prefix}_screen_15`, title: i18n("Scénario PME"), type: "teaching", requiredBeforeAdvance: false, blocks: [
        content(`${prefix}_pme_case`, "## Scénario : la comptabilité d’une petite entreprise de services\n\nSuivez la situation, analysez la transaction, puis choisissez l’écriture qui préserve l’équilibre de la partie double."),
      ] },
      { id: `${prefix}_screen_16`, title: i18n("Exercice scénario"), type: "checkpoint", requiredBeforeAdvance: true, blocks: [
        { type: "inline_scenario_question_feedback", id: `${prefix}_scenario`, scenario: i18n("Vous êtes comptable dans une PME. Vous recevez une facture d’achat de fournitures de bureau pour 300 €, payable à crédit. Quelle écriture devez-vous passer dans le journal ?"), options: ["Débiter le compte Fournitures et créditer le compte Fournisseurs", "Débiter le compte Fournisseurs et créditer le compte Fournitures", "Débiter le compte Banque et créditer le compte Fournitures", "Débiter le compte Fournitures et créditer le compte Banque"].map((text, index) => ({ id: ["a", "b", "c", "d"][index], text: i18n(text) })), correctAnswer: "a", explanation: i18n("Une facture de fournitures payable à crédit augmente les charges ou fournitures et crée une dette envers le fournisseur."), competencyPoints: 2 },
      ] },
      { id: `${prefix}_screen_17`, title: i18n("Points clés"), type: "teaching", requiredBeforeAdvance: false, blocks: [
        { type: "key_points_summary", id: `${prefix}_key_points`, title: i18n("Points clés"), items: [i18n("La partie double garantit l’équilibre de chaque écriture."), i18n("Le cycle comptable suit huit étapes interdépendantes."), i18n("Les pièces justificatives et les contrôles constituent la base d’une automatisation fiable.")] },
        { type: "notes_highlights_bookmarks_panel", id: `${prefix}_notes` },
        { type: "competency_progress_hud", id: `${prefix}_competency_progress`, competencyPoints: 6 },
        { type: "course_completion_next_unit_panel", id: `${prefix}_next` },
      ] },
    ],
  };
};
const finalExam = {
  id: "novasavo_final_exam", title: i18n("Examen final — Automatisation comptable par l’IA"), description: i18n("Examen disponible après les douze unités."), competencyTags: ["finance", "comptabilite", "ia", "automatisation", "controle_interne"], recommendedVideos: [], recommendedVideosManaged: false,
  chapters: Array.from({ length: 5 }, (_, index) => ({ id: `novasavo_exam_${index + 1}`, title: i18n(`Examen final · Question ${index + 1}`), type: "quiz", requiredBeforeAdvance: true, blocks: [{ type: "inline_multiple_choice_feedback", id: `novasavo_exam_q${index + 1}`, prompt: i18n("Quel principe reste indispensable dans une automatisation comptable responsable ?"), options: options("La validation humaine, la traçabilité et la gestion des exceptions."), correctAnswer: "b", explanation: i18n("L’automatisation soutient le travail comptable ; elle ne supprime ni la responsabilité ni la supervision."), competencyPoints: 3 }] })),
};
const lessons = manifest.units.map((unit, position) => position === 0 ? unitOneLesson(unit) : lessonFor(unit, position));
const totalScreens = lessons.reduce((count, lesson) => count + lesson.chapters.length, 0) + finalExam.chapters.length;
const course = { courseId, sourceCourseTitle: manifest.course.title, sourceProvider: "Novasavo", sourceCourseUrl: manifest.course.source_url, sourceLanguage: "fr", integration: { schemaVersion: "neopolis.novasavo_paginated.v2", sourceManifest: "COURSE_MANIFEST.json", unitsExpected: 12, unitsImported: 12, reader: "screen_paginated_reader_not_long_scroll" }, lessons: lessons.concat(finalExam) };
mkdirSync("client/public/data/courses", { recursive: true });
writeFileSync(`client/public/data/courses/${courseId}.json`, `${JSON.stringify(course, null, 2)}\n`);

const indexPath = "client/src/data/trainingIndex.json";
const index = JSON.parse(readFileSync(indexPath, "utf8"));
const upsert = (array, item) => { const at = array.findIndex((entry) => entry.id === item.id); if (at === -1) array.push(item); else array[at] = item; };
if (!index.categories.some((category) => category.id === "finance_accounting")) index.categories.push({ id: "finance_accounting", title: i18n("Finance & Comptabilité"), subtitle: i18n("Automatisation financière, comptabilité, contrôles et IA appliquée"), order: 99 });
upsert(index.certifications, { id: certId, title: i18n("Novasavo · Automatisation comptable par l’IA"), description: i18n("Parcours paginé sur l’automatisation comptable responsable : contrôles, données, conformité et IA appliquée."), level: i18n("Intermédiaire"), icon: "▣", courseCount: 1, totalLessons: 12, totalExercises: 27, totalVideos: 0, totalDownloads: 0, totalActivities: totalScreens, courses: [courseId], group: "finance_accounting", breakdown: { fr: `12 unités · ${totalScreens} écrans · interactions inline · examen final verrouillé`, en: `12 units · ${totalScreens} screens · inline interactions · locked final exam`, chapters: 12 }, exerciseLabel: i18n("écrans"), provider: "novasavo" });
upsert(index.courses, { id: courseId, certId, title: i18n("Automatisation comptable par l’IA"), order: 1, lessonCount: 12, exerciseCount: 27, videoCount: 0, downloadCount: 0, chapterCount: totalScreens, totalActivities: totalScreens, exerciseLabel: i18n("écrans"), breakdown: { fr: `12 unités · ${totalScreens} écrans · interactions inline`, en: `12 units · ${totalScreens} screens · inline interactions`, chapters: 12 }, videos: [], searchKeywords: ["finance", "comptabilité", "automatisation", "IA", "factures", "rapprochement bancaire", "contrôle interne", "fraude", "prévisions"] });
index.catalogRevision = "2026-08-25-novasavo-accounting-r2";
writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
console.log(JSON.stringify({ courseId, units: manifest.units.length, lessons: course.lessons.length, screens: course.lessons.reduce((count, lesson) => count + lesson.chapters.length, 0) }));
