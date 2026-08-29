import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourcePath = path.resolve(root, "../ia_appliquee_metiers_tp_bundle/catalogue_ia_appliquee_metiers_tp.json");
const indexPath = path.join(root, "client/src/data/trainingIndex.json");
const coursesDir = path.join(root, "client/public/data/courses");
const supportDir = path.resolve(root, "../webdev-static-assets/ia-appliquee-metiers-tp");
const assetManifestPath = path.join(supportDir, "asset-manifest.json");
const certificationId = "ia_appliquee_metiers_tp";

const subcategories = [
  { id: "sales_crm_prospecting", title: { fr: "Ventes, CRM & Prospection", en: "Sales, CRM & Prospecting" }, start: 1, end: 6 },
  { id: "marketing_content", title: { fr: "Marketing & Contenu", en: "Marketing & Content" }, start: 7, end: 10 },
  { id: "support_ecommerce", title: { fr: "Support client & E-commerce", en: "Customer Support & E-commerce" }, start: 11, end: 16 },
  { id: "finance_accounting_control", title: { fr: "Finance, Comptabilité & Contrôle de gestion", en: "Finance, Accounting & Controlling" }, start: 17, end: 21 },
  { id: "hr_recruitment", title: { fr: "RH & Recrutement", en: "HR & Recruitment" }, start: 22, end: 26 },
  { id: "productivity_operations", title: { fr: "Productivité, secrétariat & opérations", en: "Productivity, Administration & Operations" }, start: 27, end: 31 },
  { id: "data_bi_research", title: { fr: "Data, BI & Recherche", en: "Data, BI & Research" }, start: 32, end: 36 },
  { id: "legal_contracts_compliance", title: { fr: "Juridique, contrats & conformité", en: "Legal, Contracts & Compliance" }, start: 37, end: 40 },
];

const competencyMap = {
  "Ventes, CRM & Prospection": ["ai_business", "ai_orchestration", "prompt_engineering", "ai_governance"],
  "Marketing & Contenu": ["ai_business", "prompt_engineering", "ai_orchestration", "ai_governance"],
  "Support client & E-commerce": ["ai_business", "ai_orchestration", "prompt_engineering", "ai_governance"],
  "Finance, Comptabilité & Contrôle de gestion": ["bi_ai", "ai_orchestration", "ai_governance", "ai_business"],
  "RH & Recrutement": ["ai_business", "ai_orchestration", "ai_governance", "prompt_engineering"],
  "Productivité, secrétariat & opérations": ["ai_orchestration", "prompt_engineering", "ai_governance", "ai_business"],
  "Data, BI & Recherche": ["bi_ai", "ai_orchestration", "ai_governance", "rag_knowledge"],
  "Juridique, contrats & conformité": ["ai_governance", "ai_orchestration", "prompt_engineering", "ai_business"],
};

function parseArgs() {
  const args = process.argv.slice(2);
  const value = (name, fallback) => {
    const at = args.indexOf(name);
    return at >= 0 && args[at + 1] ? Number(args[at + 1]) : fallback;
  };
  return {
    prepareSupports: args.includes("--prepare-supports"),
    integrate: args.includes("--integrate"),
    verify: args.includes("--verify"),
    from: value("--from", 1),
    to: value("--to", 40),
    supportUrl: args.filter((arg) => arg.startsWith("--support-url=")).map((arg) => arg.slice("--support-url=".length)),
  };
}

function readJson(file) { return JSON.parse(fs.readFileSync(file, "utf8")); }
function writeJson(file, value) { fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`); }
function i18n(fr, en = fr) { return { fr, en }; }
function sourceData() {
  const source = readJson(sourcePath);
  const tutorials = source?.tutorials;
  if (!Array.isArray(tutorials) || tutorials.length !== 40) throw new Error("Le JSON canonique doit contenir exactement 40 tutoriels.");
  const orders = tutorials.map((tutorial) => tutorial.order);
  if (new Set(orders).size !== 40 || !orders.every((order) => Number.isInteger(order) && order >= 1 && order <= 40)) throw new Error("Les ordres canoniques doivent être uniques et compris entre 1 et 40.");
  return tutorials.slice().sort((a, b) => a.order - b.order);
}
function selected(tutorials, from, to) {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to > 40 || from > to || to - from >= 5) {
    throw new Error("Utilisez un lot de un à cinq TP, par exemple --from 1 --to 5.");
  }
  return tutorials.filter((tutorial) => tutorial.order >= from && tutorial.order <= to);
}
function subcategoryFor(tutorial) {
  const subcategory = subcategories.find((entry) => tutorial.order >= entry.start && tutorial.order <= entry.end);
  if (!subcategory || subcategory.title.fr !== tutorial.category) throw new Error(`Catégorie inattendue pour le TP ${tutorial.order}.`);
  return subcategory;
}
function courseIdFor(tutorial) { return `${certificationId}__${String(tutorial.order).padStart(2, "0")}`; }
function standaloneCertificationIdFor(tutorial) { return `${certificationId}__formation_${String(tutorial.order).padStart(2, "0")}`; }
function supportFileFor(tutorial) { return `${String(tutorial.order).padStart(2, "0")}-${tutorial.id}-support-fictif.md`; }
function localizedList(items) { return (items || []).map((value) => `- ${value}`).join("\n"); }

function supportContent(tutorial) {
  return `# Support fictif — ${tutorial.title}\n\nCe fichier est un **support d’entraînement fictif** créé pour le TP ${tutorial.order}. Il ne contient ni donnée client, ni identifiant, ni clé API, ni information confidentielle.\n\n## Contexte métier simulé\n\n- Métier cible : ${tutorial.targetJob}\n- Outils à simuler : ${(tutorial.tools || []).join(", ")}\n- Niveau : ${tutorial.level}\n- Durée indicative : ${tutorial.duration}\n\n## Jeu de données de démonstration\n\n| Champ | Valeur fictive |\n|---|---|\n| Dossier | DEMO-${String(tutorial.order).padStart(2, "0")}-A |\n| Statut | à vérifier |\n| Priorité | normale |\n| Responsable | Équipe démonstration |\n| Action sensible | validation humaine obligatoire |\n\n## Résultat attendu\n\n${tutorial.miniProject}\n\n## Référentiel de départ\n\n${localizedList(tutorial.acquiredSkills)}\n\n> Ne réutilisez pas ce support dans un système réel sans validation humaine, contrôle des accès et revue des règles métier.\n`;
}

function readAssetManifest() {
  try { return readJson(assetManifestPath); } catch { return {}; }
}
function saveSupportUrls(entries) {
  const assets = readAssetManifest();
  for (const entry of entries) {
    const [order, url] = entry.split("=");
    if (!/^\d+$/.test(order) || !url?.startsWith("/manus-storage/")) throw new Error(`URL de support invalide : ${entry}`);
    assets[Number(order)] = url;
  }
  writeJson(assetManifestPath, assets);
}

function preparationText(tutorial) {
  return `## Préparation d’environnement\n\nTravaillez dans une **sandbox personnelle**, un brouillon local ou des comptes de démonstration. Préparez uniquement des données fictives et des accès de test.\n\n- Outils prévus : ${(tutorial.tools || []).join(", ")}.\n- Ne saisissez aucune clé, aucun mot de passe ni donnée personnelle réelle dans le TP ou dans sa preuve.\n- Pour tout envoi, publication, planification, modification de données ou décision à impact humain, conservez une **validation humaine explicite** avant l’action finale.\n\nCe parcours ne requiert aucun laboratoire hébergé par un fournisseur : adaptez les étapes à votre environnement local ou de démonstration.`;
}

function checkpoint(tutorial, courseId) {
  return {
    id: `${courseId}-checkpoint-preparation`,
    type: "knowledge_check",
    mode: "multiple_choice",
    prompt: i18n(`Avant de relier ${(tutorial.tools || ["un outil"])[0]} au workflow de « ${tutorial.title} », quelle pratique est attendue ?`),
    options: [
      { id: "a", text: i18n("Utiliser une sandbox, des données fictives et prévoir une validation humaine pour toute action sensible.") },
      { id: "b", text: i18n("Copier les données réelles de production pour obtenir un résultat plus représentatif.") },
      { id: "c", text: i18n("Mettre une clé API dans le workflow partagé pour que les autres puissent la réutiliser.") },
      { id: "d", text: i18n("Activer directement les envois et modifications définitives avant les essais.") },
    ],
    correctAnswer: "a",
    explanation: i18n("Le TP doit être testé dans un environnement maîtrisé, avec données fictives et contrôle humain des actions à impact."),
    competencyPoints: 1.5,
    required: true,
  };
}

function finalQuiz(tutorial, courseId) {
  const project = tutorial.miniProject;
  const tools = (tutorial.tools || []).join(", ");
  const skills = tutorial.acquiredSkills || [];
  const question = (suffix, prompt, options, correctAnswer = "a") => ({
    id: `${courseId}-quiz-${suffix}`,
    type: "single_choice_exercise",
    question: i18n(prompt),
    options: options.map(([id, text]) => ({ id, text: i18n(text) })),
    correctAnswer,
    explanation: i18n("La correction rappelle le cadre du TP : données fictives, contrôle humain et vérification avant toute action réelle."),
  });
  return [
    question("01", `Quel élément doit être conservé dans le mini-projet « ${project} » ?`, [
      ["a", "Une preuve de test avec des données fictives et un résultat vérifiable."],
      ["b", "Un mot de passe de production directement dans le workflow."],
      ["c", "Une action finale déclenchée sans relecture."],
      ["d", "Un export de données personnelles non anonymisées."],
    ]),
    question("02", "Vrai ou faux : un brouillon ou une validation humaine doit précéder toute action sensible générée par le workflow.", [
      ["a", "Vrai : les actions sensibles exigent un contrôle humain explicite."],
      ["b", "Faux : l’automatisation dispense toujours de tout contrôle."],
    ]),
    question("03", `Quel contrôle aide à vérifier l’objectif « ${(skills[0] || "résultat métier attendu")} » ?`, [
      ["a", "Comparer le résultat du test au critère métier défini puis documenter l’écart."],
      ["b", "Considérer toute sortie du modèle comme correcte sans la relire."],
      ["c", "Supprimer les journaux et les traces de test avant la vérification."],
      ["d", "Remplacer le jeu de données fictif par une exportation client."],
    ]),
    question("04", `Question de vigilance : parmi ces outils prévus — ${tools} — quelle donnée ne doit jamais être saisie dans le support ou le commentaire de preuve ?`, [
      ["a", "Une clé API, un mot de passe ou un identifiant réel."],
      ["b", "Le nom fictif du dossier de démonstration."],
      ["c", "Le statut de test « à vérifier »."],
      ["d", "Une note indiquant qu’une validation humaine est requise."],
    ]),
    {
      id: `${courseId}-quiz-order`,
      type: "bucket_sort",
      title: i18n("Ordonnez la démarche de réalisation"),
      instructions: i18n("Placez chaque action dans son étape. La correction est disponible après une tentative complète."),
      buckets: [
        { id: "1", label: i18n("1. Cadrer") },
        { id: "2", label: i18n("2. Construire") },
        { id: "3", label: i18n("3. Tester") },
        { id: "4", label: i18n("4. Valider") },
      ],
      cards: [
        { id: "cadrer", text: i18n("Définir le résultat métier, les données fictives et les limites d’action."), correctBucket: "1" },
        { id: "construire", text: i18n("Configurer le workflow dans un environnement de démonstration."), correctBucket: "2" },
        { id: "tester", text: i18n("Exécuter des cas fictifs, journaliser les sorties et relever les écarts."), correctBucket: "3" },
        { id: "valider", text: i18n("Faire relire les actions sensibles avant toute utilisation réelle."), correctBucket: "4" },
      ],
      feedback: i18n("La démarche correcte va du cadrage sûr à la validation humaine, après des tests documentés."),
    },
  ];
}

function buildCourse(tutorial, supportUrl) {
  const courseId = courseIdFor(tutorial);
  const subcategory = subcategoryFor(tutorial);
  const competencies = competencyMap[tutorial.category];
  if (!competencies?.length) throw new Error(`Aucune compétence Neopolis mappée pour ${tutorial.category}.`);
  return {
    courseId,
    id: courseId,
    title: i18n(tutorial.title),
    description: i18n(`TP guidé pour ${tutorial.targetJob}. Outils : ${(tutorial.stack || []).join(", ")}.`),
    sourceReference: { sourceType: tutorial.sourceType, sourceUrl: tutorial.sourceUrl, language: tutorial.language },
    metadata: {
      canonicalTutorialId: tutorial.id,
      canonicalOrder: tutorial.order,
      targetJob: tutorial.targetJob,
      level: tutorial.level,
      duration: tutorial.duration,
      tools: tutorial.tools,
      acquiredSkills: tutorial.acquiredSkills,
      skillTags: tutorial.skillTags,
    },
    lessons: [{
      id: `${courseId}-lesson-01`,
      title: i18n(tutorial.title),
      competencyTags: competencies,
      recommendedVideosManaged: false,
      recommendedVideos: [],
      chapters: [
        {
          id: `${courseId}-screen-01`, type: "teaching", title: i18n("Objectif du TP"), requiredBeforeAdvance: true,
          blocks: [
            { type: "learning_section", sectionKind: "hero", eyebrow: i18n(`${subcategory.title.fr} · TP ${tutorial.order}/40`), title: i18n(tutorial.title), body: i18n(`Métier cible : ${tutorial.targetJob}. Niveau : ${tutorial.level}. Durée indicative : ${tutorial.duration}.`), items: tutorial.acquiredSkills.map((skill) => i18n(skill)) },
            { type: "callout", variant: "info", title: i18n("Cadre pratique"), body: i18n("Vous reproduisez un cas d’usage dans votre propre environnement de démonstration. La ressource source reste consultable ; elle ne remplace pas les contrôles métier et de sécurité.") },
          ],
        },
        {
          id: `${courseId}-screen-02`, type: "teaching", title: i18n("Préparer l’environnement"), requiredBeforeAdvance: true,
          blocks: [
            { type: "content", body: i18n(preparationText(tutorial)) },
            { type: "resource_review", id: `${courseId}-source-review`, title: i18n("Ressource source"), instructions: i18n(`Ouvrez la ressource source dans un nouvel onglet. Repérez le résultat métier, les entrées, les sorties et les étapes de contrôle. Ensuite, revenez ici pour confirmer votre consultation.\n\n[Ouvrir la ressource source](${tutorial.sourceUrl})`), resourceUrl: tutorial.sourceUrl, resourceLabel: i18n("Ouvrir la ressource source") },
          ],
        },
        {
          id: `${courseId}-screen-03`, type: "teaching", title: i18n("Construire progressivement"), requiredBeforeAdvance: true,
          blocks: [
            { type: "sequence_visual", title: i18n("Démarche de réalisation"), layout: "timeline", items: [
              { title: i18n("Cadrer"), description: i18n(`Définissez le cas d’usage pour ${tutorial.targetJob} et les limites d’automatisation.`) },
              { title: i18n("Préparer"), description: i18n(`Créez des données fictives adaptées aux outils : ${(tutorial.tools || []).slice(0, 3).join(", ")}.`) },
              { title: i18n("Tester"), description: i18n("Exécutez des scénarios de test, relisez les sorties et consignez les écarts.") },
              { title: i18n("Contrôler"), description: i18n("Prévoyez une revue humaine avant toute action irréversible, coûteuse ou concernant une personne.") },
            ] },
            { type: "comparison_panel", title: i18n("Vérifications avant utilisation"), columns: [
              { title: i18n("À faire"), items: [i18n("Utiliser des données fictives."), i18n("Définir un contrôle humain."), i18n("Tester les cas limites.")] },
              { title: i18n("À éviter"), items: [i18n("Exposer un secret ou une donnée personnelle."), i18n("Déclencher une action finale sans validation."), i18n("Déduire une décision sans vérification métier.")] },
            ] },
          ],
        },
        {
          id: `${courseId}-checkpoint-01`, type: "checkpoint", title: i18n("Checkpoint : environnement et sécurité"), requiredBeforeAdvance: true, passThreshold: 1,
          blocks: [checkpoint(tutorial, courseId)],
        },
        {
          id: `${courseId}-mini-project`, type: "exercise", title: i18n("Mini-projet et preuve de réalisation"), requiredBeforeAdvance: true,
          blocks: [{
            id: `${courseId}-mini-project-proof`, type: "cloud_exercise", title: i18n("Mini-projet pratique"), assignment: tutorial.miniProject,
            instructions: `Réalisez le mini-projet dans un environnement personnel de démonstration. Utilisez le support fictif fourni, puis décrivez dans la zone de preuve : le scénario testé, le résultat obtenu, un contrôle effectué et l’étape qui reste soumise à validation humaine.\n\n${localizedList(tutorial.acquiredSkills)}`,
            environmentGuide: i18n(preparationText(tutorial)),
            resources: [{ title: i18n(`Support fictif de TP ${tutorial.order}`), description: i18n("Données de démonstration sans secret ni information réelle."), url: supportUrl }],
            hint: "Commencez par un seul cas fictif et conservez l’action finale en brouillon ou derrière une validation humaine.",
            solution: `## Correction et auto-vérification\n\nUne preuve complète décrit le scénario fictif, le workflow ou la procédure réalisée, le résultat observé et le contrôle humain prévu.\n\n### Erreurs fréquentes\n\n- Introduire des données réelles, identifiants ou clés dans l’exercice.\n- Déclencher un envoi, une publication ou une décision sans étape de validation.\n- Confondre une sortie IA avec une validation métier.\n\n### Vérification\n\nRelisez votre preuve : elle doit être cohérente avec l’objectif « ${tutorial.miniProject} » et montrer au moins un test avec données fictives.\n\n### Extension\n\nAjoutez un journal d’exécution, un cas limite supplémentaire et une règle d’escalade humaine.`,
            successMessage: "Preuve enregistrée. Vous pouvez maintenant consulter la correction et terminer le quiz final.",
          }],
        },
        {
          id: `${courseId}-final-quiz`, type: "quiz", title: i18n("Quiz final : valider la démarche"), requiredBeforeAdvance: true, passThreshold: 4,
          blocks: finalQuiz(tutorial, courseId),
        },
      ],
    }],
  };
}

function ensureCatalog(index, tutorials) {
  index.categories ||= [];
  const category = {
    id: "ia_appliquee_metiers_tp",
    title: i18n("IA appliquée aux métiers - TP", "Applied AI for Business Roles – Labs"),
    subtitle: i18n("40 travaux pratiques guidés par métier, avec préparation d’environnement, contrôles et validation humaine.", "40 guided practical exercises by business role, with environment setup, controls and human validation."),
    order: 8,
    subcategories: subcategories.map((entry) => ({ id: entry.id, title: entry.title, orderRange: `${entry.start}–${entry.end}` })),
  };
  const categoryIndex = index.categories.findIndex((entry) => entry.id === category.id);
  if (categoryIndex >= 0) index.categories[categoryIndex] = category; else index.categories.push(category);

  index.certifications ||= [];
  index.certifications = index.certifications.filter((entry) => entry.id !== certificationId);
  for (const tutorial of tutorials) {
    const subcategory = subcategoryFor(tutorial);
    const certification = {
      id: standaloneCertificationIdFor(tutorial),
      title: i18n(tutorial.title),
      description: i18n(`TP guidé pour ${tutorial.targetJob}. Préparation sûre, données fictives, contrôles et validation humaine.`, `Guided practical exercise for ${tutorial.targetJob}. Safe setup, fictional data, controls and human validation.`),
      level: i18n(tutorial.level),
      icon: "◈",
      group: certificationId,
      provider: "curated_practical_sources",
      catalogTag: i18n(`TP ${tutorial.order} · ${subcategory.title.fr}`, `Lab ${tutorial.order} · ${subcategory.title.en}`),
      subCategoryId: subcategory.id,
      subCategory: subcategory.title,
      canonicalOrder: tutorial.order,
      isStandaloneTP: true,
      courses: [courseIdFor(tutorial)],
    };
    const certificationIndex = index.certifications.findIndex((entry) => entry.id === certification.id);
    if (certificationIndex >= 0) index.certifications[certificationIndex] = { ...index.certifications[certificationIndex], ...certification }; else index.certifications.push(certification);
  }
  index.certifications.sort((a, b) => `${a.group || ""}:${String(a.canonicalOrder || 0).padStart(3, "0")}:${a.id}`.localeCompare(`${b.group || ""}:${String(b.canonicalOrder || 0).padStart(3, "0")}:${b.id}`));
}

function upsertCourseIndex(index, tutorial) {
  const courseId = courseIdFor(tutorial);
  const subcategory = subcategoryFor(tutorial);
  const entry = {
    id: courseId,
    certId: standaloneCertificationIdFor(tutorial),
    title: i18n(tutorial.title),
    description: i18n(`TP ${tutorial.order}/40 · ${tutorial.targetJob}. Outils : ${(tutorial.stack || []).join(", ")}.`),
    order: tutorial.order,
    subCategoryId: subcategory.id,
    subCategory: subcategory.title,
    tags: tutorial.skillTags,
    targetJob: tutorial.targetJob,
    tools: tutorial.tools,
    acquiredSkills: tutorial.acquiredSkills,
    sourceUrl: tutorial.sourceUrl,
    sourceType: tutorial.sourceType,
    level: i18n(tutorial.level),
  };
  index.courses ||= [];
  const courseIndex = index.courses.findIndex((course) => course.id === courseId);
  if (courseIndex >= 0) index.courses[courseIndex] = { ...index.courses[courseIndex], ...entry }; else index.courses.push(entry);
}

function verifyBatch(tutorials, batch) {
  const assets = readAssetManifest();
  const index = readJson(indexPath);
  const category = index.categories?.find((entry) => entry.id === certificationId);
  if (!category) throw new Error("La rubrique catalogue est absente.");
  if (category.title?.fr !== "IA appliquée aux métiers - TP") throw new Error("Le libellé de rubrique ne correspond pas à la demande.");
  if (!Array.isArray(category.subcategories) || category.subcategories.length !== 8) throw new Error("Les huit sous-catégories métier sont requises.");
  for (const tutorial of batch) {
    const courseId = courseIdFor(tutorial);
    const coursePath = path.join(coursesDir, `${courseId}.json`);
    const indexEntry = index.courses?.find((entry) => entry.id === courseId);
    const standaloneCertification = index.certifications?.find((entry) => entry.id === standaloneCertificationIdFor(tutorial));
    if (!fs.existsSync(coursePath) || !indexEntry || !standaloneCertification) throw new Error(`TP ${tutorial.order} absent du cours, de l’index ou des formations.`);
    const course = readJson(coursePath);
    const raw = JSON.stringify(course);
    if (course.title?.fr !== tutorial.title || course.metadata?.canonicalTutorialId !== tutorial.id || course.metadata?.canonicalOrder !== tutorial.order) throw new Error(`Métadonnées canoniques invalides pour le TP ${tutorial.order}.`);
    if (indexEntry.title?.fr !== tutorial.title || indexEntry.targetJob !== tutorial.targetJob || JSON.stringify(indexEntry.tools) !== JSON.stringify(tutorial.tools) || JSON.stringify(indexEntry.acquiredSkills) !== JSON.stringify(tutorial.acquiredSkills)) throw new Error(`Index métier incomplet pour le TP ${tutorial.order}.`);
    if (indexEntry.certId !== standaloneCertification.id || standaloneCertification.courses?.[0] !== courseId || standaloneCertification.subCategoryId !== subcategoryFor(tutorial).id) throw new Error(`Formation autonome invalide pour le TP ${tutorial.order}.`);
    if (!tutorial.sourceUrl.startsWith("https://") || course.sourceReference?.sourceUrl !== tutorial.sourceUrl) throw new Error(`URL source non sécurisée ou non canonique pour le TP ${tutorial.order}.`);
    if (!assets[tutorial.order]?.startsWith("/manus-storage/") || !raw.includes(assets[tutorial.order])) throw new Error(`Support fictif non relié au TP ${tutorial.order}.`);
    const chapters = course.lessons?.[0]?.chapters || [];
    const types = chapters.flatMap((chapter) => chapter.blocks || []).map((block) => block.type);
    if (chapters.length !== 6 || !["resource_review", "knowledge_check", "cloud_exercise", "bucket_sort"].every((type) => types.includes(type))) throw new Error(`Parcours incomplet pour le TP ${tutorial.order}.`);
    const finalQuiz = chapters.at(-1)?.blocks || [];
    if (finalQuiz.length < 5 || finalQuiz.filter((block) => block.type === "single_choice_exercise").length < 4) throw new Error(`Quiz final insuffisant pour le TP ${tutorial.order}.`);
    if (/\b(?:XP|DataCamp|DataLab)\b/i.test(raw)) throw new Error(`Mécanique externe interdite détectée pour le TP ${tutorial.order}.`);
    if (!(course.lessons?.[0]?.competencyTags || []).length) throw new Error(`Tags de compétences absents pour le TP ${tutorial.order}.`);
  }
  const ids = tutorials.map((tutorial) => tutorial.id);
  if (new Set(ids).size !== 40 || new Set(tutorials.map((tutorial) => tutorial.order)).size !== 40) throw new Error("Le catalogue canonique comporte des identifiants ou ordres non uniques.");
  console.log(`Contrôle du lot ${batch[0].order}–${batch.at(-1).order} réussi : ${batch.length} TP canoniques, indexés, équipés de supports, checkpoints et quiz.`);
}

function main() {
  const args = parseArgs();
  const tutorials = sourceData();
  if (args.supportUrl.length) saveSupportUrls(args.supportUrl);
  const batch = selected(tutorials, args.from, args.to);
  if (args.prepareSupports) {
    fs.mkdirSync(supportDir, { recursive: true });
    for (const tutorial of batch) fs.writeFileSync(path.join(supportDir, supportFileFor(tutorial)), supportContent(tutorial));
    console.log(`Supports fictifs créés pour les TP ${args.from} à ${args.to}.`);
  }
  if (args.integrate) {
    const assets = readAssetManifest();
    const missing = batch.filter((tutorial) => !assets[tutorial.order]);
    if (missing.length) throw new Error(`Supports non téléversés pour les TP : ${missing.map((tutorial) => tutorial.order).join(", ")}.`);
    const index = readJson(indexPath);
    ensureCatalog(index, tutorials);
    for (const tutorial of batch) {
      writeJson(path.join(coursesDir, `${courseIdFor(tutorial)}.json`), buildCourse(tutorial, assets[tutorial.order]));
      upsertCourseIndex(index, tutorial);
    }
    index.courses.sort((a, b) => `${a.certId}:${String(a.order).padStart(3, "0")}`.localeCompare(`${b.certId}:${String(b.order).padStart(3, "0")}`));
    index.catalogRevision = "2026-08-29-ia-appliquee-metiers-tp";
    writeJson(indexPath, index);
    console.log(`TP ${args.from} à ${args.to} intégrés depuis le JSON canonique.`);
  }
  if (args.verify) verifyBatch(tutorials, batch);
}

main();
