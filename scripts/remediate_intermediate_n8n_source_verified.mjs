import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const coursePath = path.join(root, "client", "public", "data", "courses", "intermediate_workflow_automation_with_n8n__01.json");
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));

const sourceRefs = [
  {
    label: "DataCamp — Intermediate Workflow Automation with n8n (consulté le 17 septembre 2026)",
    url: "https://app.datacamp.com/learn/courses/intermediate-workflow-automation-with-n8n",
  },
  {
    label: "DataCamp — Building Event-Driven and Scheduled Automations, exercices 1 à 3 (consultés le 17 septembre 2026)",
    url: "https://campus.datacamp.com/fr/courses/intermediate-workflow-automation-with-n8n/building-event-driven-and-scheduled-automations?ex=2&skip_variants_modal=true",
  },
];

const i18n = (fr, en) => ({ fr, en });
const step = (fr, en) => ({ instruction_text: i18n(fr, en) });
const findChapter = (id) => {
  for (const lesson of course.lessons ?? []) {
    const chapter = (lesson.chapters ?? []).find((candidate) => candidate.id === id);
    if (chapter) return chapter;
  }
  throw new Error(`Chapter not found: ${id}`);
};
const findPractical = (chapterId) => {
  const chapter = findChapter(chapterId);
  const block = (chapter.blocks ?? []).find((candidate) => candidate.type === "cloud_exercise");
  if (!block) throw new Error(`Cloud exercise not found: ${chapterId}`);
  return block;
};

const preflight = {
  type: "callout",
  id: "n8n_personal_environment_preflight",
  variant: "info",
  title: i18n("Avant le premier TP : préparer votre environnement n8n", "Before the first practical: prepare your n8n environment"),
  body: i18n(
    "Utilisez une instance de test **n8n Cloud** ou une instance **Docker locale** qui vous appartient. Créez un workflow de test vide et vérifiez que vous pouvez ajouter puis exécuter un nœud. Dans ce module, utilisez uniquement les charges utiles synthétiques fournies dans les consignes : ne connectez pas de données, URL de production, identifiants ou secrets réels.\n\nUn Webhook Trigger propose une URL de test et une URL de production : commencez par l’URL de test et les données épinglées ; n’activez un workflow que lorsque vous comprenez son effet.",
    "Use your own **n8n Cloud** test workspace or a **local Docker** instance. Create an empty test workflow and confirm that you can add and execute a node. In this module, use only the synthetic payloads provided in the instructions: do not connect production data, URLs, credentials, or secrets.\n\nA Webhook Trigger has a test URL and a production URL: start with the test URL and pinned data; activate a workflow only when you understand its effect.",
  ),
  source_refs: sourceRefs,
};

const firstChapter = findChapter("dc_ch01_act01");
if (!(firstChapter.blocks ?? []).some((block) => block.id === preflight.id)) {
  firstChapter.blocks.push(preflight);
}

const sharedEnvironment = i18n(
  "**Espace requis :** une instance n8n Cloud personnelle ou une instance Docker locale de test.\n\n1. Créez un workflow vide dans votre espace.\n2. Travaillez exclusivement avec les données synthétiques indiquées ici.\n3. Commencez par l’URL de test du Webhook Trigger et n’utilisez aucune URL de production.\n4. Ne collez jamais de clé, mot de passe ou donnée client dans la preuve de réalisation.\n\nSi votre instance ne démarre pas ou si vous ne pouvez pas créer de workflow, vérifiez votre accès n8n avant de continuer.",
  "**Required workspace:** your own n8n Cloud workspace or a local Docker test instance.\n\n1. Create an empty workflow in your workspace.\n2. Use only the synthetic data provided here.\n3. Start with the Webhook Trigger test URL and do not use a production URL.\n4. Never paste a key, password, or customer data into your completion proof.\n\nIf your instance does not start or you cannot create a workflow, verify your n8n access before continuing.",
);

const webhookPractice = findPractical("dc_ch01_act02");
Object.assign(webhookPractice, {
  assignment: i18n(
    "Construisez un workflow de test qui reçoit une requête HTTP POST et renvoie une confirmation JSON. Décrivez à la fin les réglages utilisés et le résultat de l’exécution.",
    "Build a test workflow that receives an HTTP POST request and returns a JSON confirmation. At the end, describe the settings you used and the execution result.",
  ),
  instructions: i18n(
    "Ce TP adapte une activité pratique DataCamp à votre instance n8n personnelle. Les réglages et les données de test ci-dessous ont été vérifiés sur l’écran source ; aucune VM ni aucun fichier DataCamp n’est nécessaire.",
    "This practical adapts a DataCamp hands-on activity to your personal n8n instance. The settings and test data below were verified on the source screen; no DataCamp VM or file is required.",
  ),
  environmentGuide: sharedEnvironment,
  steps: [
    step("Créez un workflow et ajoutez un nœud **Webhook Trigger**. Choisissez la méthode HTTP `POST`, puis configurez la réponse pour utiliser un nœud **Respond to Webhook**.", "Create a workflow and add a **Webhook Trigger** node. Choose HTTP method `POST`, then configure its response to use a **Respond to Webhook** node."),
    step("Ajoutez **Respond to Webhook** après le déclencheur. Choisissez une réponse JSON, avec par exemple `status: received` et `message: Payload accepted`, puis définissez le code de réponse sur `200`.", "Add **Respond to Webhook** after the trigger. Choose a JSON response, for example `status: received` and `message: Payload accepted`, then set response code `200`."),
    step("Épinglez une charge de test synthétique sur le Webhook Trigger, par exemple `[{ \"email\": \"test@acme.com\" }]`. Exécutez le workflow, vérifiez que les deux nœuds réussissent, puis enregistrez-le.", "Pin a synthetic test payload on the Webhook Trigger, for example `[{ \"email\": \"test@acme.com\" }]`. Run the workflow, confirm both nodes succeed, then save it."),
  ],
  resources: [],
  nonDownloadableFiles: [],
  hint: i18n(
    "Si le nœud de réponse ne se déclenche pas, vérifiez que le Webhook Trigger attend bien **Respond to Webhook** au lieu d’envoyer sa réponse immédiatement.",
    "If the response node does not run, verify that the Webhook Trigger waits for **Respond to Webhook** instead of responding immediately.",
  ),
  learnerCriteria: [
    "Décrire un Webhook Trigger configuré en POST et sa réponse.",
    "Indiquer le format de réponse et le résultat HTTP attendu.",
    "Rapporter une exécution de test avec des données synthétiques.",
  ],
  serverGradedAssessment: "intermediate_n8n_source_verified",
  maxScore: 3,
  passingScore: 3,
  minimumAnswerLength: 120,
  successMessage: i18n("Vous avez construit et vérifié une première réponse webhook dans votre environnement n8n.", "You built and verified a first webhook response in your n8n environment."),
  source_refs: sourceRefs,
  practiceStatus: "source_screen_verified",
});
delete webhookPractice.rubricCriteria;
delete webhookPractice.evaluationPrompt;
delete webhookPractice.solution;

const validationPractice = findPractical("dc_ch01_act03");
Object.assign(validationPractice, {
  assignment: i18n(
    "Ajoutez un contrôle d’e-mail à votre workflow webhook. Les requêtes contenant un e-mail doivent obtenir une réponse de succès ; celles qui n’en contiennent pas doivent obtenir une réponse d’erreur. Décrivez les deux essais réalisés.",
    "Add an email check to your webhook workflow. Requests containing an email should receive a success response; requests without one should receive an error response. Describe both tests you ran.",
  ),
  instructions: i18n(
    "Reprenez le workflow du TP précédent. Le fichier VM indiqué dans la source n’est pas distribué dans Neopolis : ne cherchez pas à le télécharger. Si votre workflow précédent n’est plus disponible, reconstruisez le TP précédent à partir de ses étapes avant d’ajouter la validation.",
    "Reuse the workflow from the preceding practical. The VM file mentioned in the source is not distributed by Neopolis: do not look for a download. If your previous workflow is not available, rebuild the preceding practical from its steps before adding validation.",
  ),
  environmentGuide: sharedEnvironment,
  steps: [
    step("Partez du workflow précédent. Si vous le recréez, commencez par le Webhook Trigger et le nœud Respond to Webhook du TP précédent — aucun fichier de départ n’est requis.", "Start from the previous workflow. If you rebuild it, begin with the Webhook Trigger and Respond to Webhook node from the preceding practical — no starter file is required."),
    step("Déconnectez provisoirement Respond to Webhook, puis placez un nœud **If** après le Webhook Trigger. Testez l’existence du champ `email`.", "Temporarily disconnect Respond to Webhook, then place an **If** node after the Webhook Trigger. Test whether the `email` field exists."),
    step("Sur la branche vraie, ajoutez un nœud **Edit Fields** avec `status=success`, un message de confirmation et `responseCode=200`. Sur la branche fausse, ajoutez un autre nœud avec `status=error`, un message indiquant l’absence d’e-mail et `responseCode=400`.", "On the true branch, add an **Edit Fields** node with `status=success`, a confirmation message, and `responseCode=200`. On the false branch, add another node with `status=error`, a message indicating a missing email, and `responseCode=400`."),
    step("Reliez les deux branches à Respond to Webhook, en utilisant le premier élément entrant et le champ `responseCode`. Testez successivement une charge avec e-mail puis une charge sans e-mail, et vérifiez que les branches vraie et fausse s’exécutent respectivement.", "Connect both branches to Respond to Webhook, using the first incoming item and the `responseCode` field. Test first with an email payload, then without one, and confirm that the true and false branches respectively run."),
  ],
  resources: [],
  nonDownloadableFiles: ["1.1.2_starter_webhook-validation.json"],
  hint: i18n(
    "Le but est de vérifier la logique de branchement avec deux charges **synthétiques**. Ne connectez pas de formulaire ou de service de production.",
    "The goal is to verify branching logic with two **synthetic** payloads. Do not connect a production form or service.",
  ),
  learnerCriteria: [
    "Décrire la condition qui sépare les requêtes valides et invalides.",
    "Indiquer les réponses distinctes prévues pour chaque branche.",
    "Rapporter un test synthétique valide et un test sans e-mail.",
  ],
  serverGradedAssessment: "intermediate_n8n_source_verified",
  maxScore: 3,
  passingScore: 3,
  minimumAnswerLength: 150,
  successMessage: i18n("Vous avez vérifié une règle de validation et deux réponses webhook distinctes.", "You verified a validation rule and two distinct webhook responses."),
  source_refs: sourceRefs,
  practiceStatus: "source_screen_verified",
});
delete validationPractice.rubricCriteria;
delete validationPractice.evaluationPrompt;
delete validationPractice.solution;

fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
console.log(`Updated ${coursePath}`);
